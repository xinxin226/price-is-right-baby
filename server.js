const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const items = require('./data/items');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

const TOLERANCE_PERCENT = 10;
const AUTO_ADVANCE_DELAY_MS = 5000; // show correct answer before next item

// Game state
let state = {
  phase: 'lobby', // lobby | playing | reveal
  currentItemIndex: 0,
  players: {},   // socketId -> { name, score }
  submissions: [], // { socketId, guess, timestamp } for current item, in order
  firstExact: null,
  firstWithinRange: null,
};
let autoAdvanceTimeout = null;

function getPublicItem(item) {
  return {
    id: item.id,
    name: item.name,
    usage: item.usage,
    image: item.image,
  };
}

function getLeaderboard() {
  return Object.entries(state.players)
    .map(([id, p]) => ({ id, name: p.name, score: p.score }))
    .sort((a, b) => b.score - a.score);
}

function resetRound() {
  state.submissions = [];
  state.firstExact = null;
  state.firstWithinRange = null;
}

function scoreGuess(guess, correctPrice) {
  const low = correctPrice * (1 - TOLERANCE_PERCENT / 100);
  const high = correctPrice * (1 + TOLERANCE_PERCENT / 100);
  if (guess >= low && guess <= high) {
    const isExact = Math.round(guess) === Math.round(correctPrice);
    return { withinRange: true, exact: isExact };
  }
  return { withinRange: false, exact: false };
}

function emitReveal() {
  const item = items[state.currentItemIndex];
  const correctPrice = item ? item.price : null;
  io.emit('reveal', {
    itemName: item ? item.name : null,
    itemImage: item ? item.image : null,
    correctPrice,
    firstExact: state.firstExact,
    firstWithinRange: state.firstWithinRange,
  });
  state.phase = 'reveal';
  state.currentItemIndex += 1;
}

function doAdvanceAfterReveal() {
  if (state.currentItemIndex >= items.length) {
    state.phase = 'lobby';
    state.currentItemIndex = 0;
    io.emit('game_over', { leaderboard: getLeaderboard() });
    return;
  }
  resetRound();
  state.phase = 'playing';
  const nextItem = items[state.currentItemIndex];
  io.emit('next_item', { item: getPublicItem(nextItem) });
}

function scheduleAutoAdvance() {
  if (autoAdvanceTimeout) clearTimeout(autoAdvanceTimeout);
  emitReveal();
  autoAdvanceTimeout = setTimeout(() => {
    autoAdvanceTimeout = null;
    doAdvanceAfterReveal();
  }, AUTO_ADVANCE_DELAY_MS);
}

io.on('connection', (socket) => {
  socket.on('join', (name) => {
    const trimmed = (name || '').trim().slice(0, 30) || 'Player';
    state.players[socket.id] = { name: trimmed, score: 0 };
    socket.emit('joined', { name: trimmed, leaderboard: getLeaderboard() });
    socket.broadcast.emit('leaderboard', getLeaderboard());
  });

  socket.on('guess', (value) => {
    if (state.phase !== 'playing') return;
    const player = state.players[socket.id];
    if (!player) return;

    const num = Number(value);
    if (!Number.isFinite(num) || num < 0) return;

    const item = items[state.currentItemIndex];
    if (!item) return;

    const result = scoreGuess(num, item.price);
    state.submissions.push({ socketId: socket.id, guess: num, timestamp: Date.now(), ...result });

    // First exact answer: 2 points
    if (result.exact && state.firstExact === null) {
      state.firstExact = socket.id;
      state.players[socket.id].score += 2;
    }
    // First answer within ±10% (and not already first exact): 1 point
    if (result.withinRange && state.firstWithinRange === null && state.firstExact !== socket.id) {
      state.firstWithinRange = socket.id;
      state.players[socket.id].score += 1;
    }

    io.emit('leaderboard', getLeaderboard());

    // Auto-advance when everyone in the game has submitted a guess (at least one each)
    const playerCount = Object.keys(state.players).length;
    const uniqueSubmitters = new Set(state.submissions.map((s) => s.socketId)).size;
    if (state.phase === 'playing' && playerCount > 0 && uniqueSubmitters >= playerCount) {
      scheduleAutoAdvance();
    }
  });

  socket.on('disconnect', () => {
    delete state.players[socket.id];
    io.emit('leaderboard', getLeaderboard());
  });
});

// Host controls (simple: one client can advance the game via query or we add a host page)
// For multi-user "first to answer" we need a host to advance items. Use URL /host for host view.
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/host', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'host.html'));
});

// REST API for host to control game (no auth for simplicity; add in production)
app.get('/api/state', (req, res) => {
  const item = items[state.currentItemIndex];
  res.json({
    phase: state.phase,
    currentItemIndex: state.currentItemIndex,
    currentItem: item ? getPublicItem(item) : null,
    leaderboard: getLeaderboard(),
    submissionsCount: state.submissions.length,
  });
});

app.post('/api/start', (req, res) => {
  if (autoAdvanceTimeout) clearTimeout(autoAdvanceTimeout);
  autoAdvanceTimeout = null;
  state.phase = 'playing';
  state.currentItemIndex = 0;
  state.players = Object.fromEntries(
    Object.entries(state.players).map(([id, p]) => [id, { ...p, score: 0 }])
  );
  resetRound();
  const item = items[0];
  io.emit('game_start', { item: item ? getPublicItem(item) : null });
  res.json({ ok: true });
});

// Host override: skip to next question (e.g. if a participant is out)
app.post('/api/next', (req, res) => {
  if (autoAdvanceTimeout) clearTimeout(autoAdvanceTimeout);
  autoAdvanceTimeout = null;
  if (state.phase === 'playing') {
    emitReveal();
  }
  if (state.phase === 'reveal') {
    doAdvanceAfterReveal();
  }
  res.json({ ok: true });
});

app.post('/api/reset', (req, res) => {
  if (autoAdvanceTimeout) clearTimeout(autoAdvanceTimeout);
  autoAdvanceTimeout = null;
  state.phase = 'lobby';
  state.currentItemIndex = 0;
  resetRound();
  io.emit('reset');
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Price is Right: Baby Edition at http://localhost:${PORT}`);
  console.log(`Host control: http://localhost:${PORT}/host`);
});
