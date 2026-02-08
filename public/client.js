const socket = io();

const screens = {
  join: document.getElementById('join-screen'),
  lobby: document.getElementById('lobby-screen'),
  play: document.getElementById('play-screen'),
  reveal: document.getElementById('reveal-screen'),
  gameover: document.getElementById('gameover-screen'),
};

const nameInput = document.getElementById('name');
const joinBtn = document.getElementById('join-btn');
const playerNameEl = document.getElementById('player-name');
const lobbyLeaderboard = document.getElementById('lobby-leaderboard');
const playLeaderboard = document.getElementById('play-leaderboard');
const itemImage = document.getElementById('item-image');
const itemName = document.getElementById('item-name');
const itemUsage = document.getElementById('item-usage');
const guessInput = document.getElementById('guess');
const submitGuessBtn = document.getElementById('submit-guess');
const guessFeedback = document.getElementById('guess-feedback');
const revealItemNameEl = document.getElementById('reveal-item-name');
const correctPriceEl = document.getElementById('correct-price');
const revealWinnersEl = document.getElementById('reveal-winners');
const finalLeaderboard = document.getElementById('final-leaderboard');

let myName = '';
let leaderboardNames = {};

function showScreen(id) {
  Object.values(screens).forEach((el) => el.classList.add('hidden'));
  const screen = screens[id];
  if (screen) screen.classList.remove('hidden');
}

function renderLeaderboard(list, container, showScores = true) {
  container.innerHTML = list
    .map((p, i) => {
      const name = p.name || 'Player';
      const score = showScores ? ` ${p.score} pt${p.score !== 1 ? 's' : ''}` : '';
      return `<li><span>${i + 1}. ${escapeHtml(name)}</span>${showScores ? `<strong>${p.score}</strong>` : ''}</li>`;
    })
    .join('');
}

function escapeHtml(s) {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

joinBtn.addEventListener('click', () => {
  const name = nameInput.value.trim() || 'Player';
  socket.emit('join', name);
});

socket.on('joined', (data) => {
  myName = data.name;
  playerNameEl.textContent = data.name;
  renderLeaderboard(data.leaderboard || [], lobbyLeaderboard);
  showScreen('lobby');
});

socket.on('leaderboard', (list) => {
  renderLeaderboard(list || [], lobbyLeaderboard);
  renderLeaderboard(list || [], playLeaderboard);
});

socket.on('game_start', (data) => {
  showScreen('play');
  guessInput.value = '';
  guessFeedback.classList.add('hidden');
  if (data.item) {
    itemImage.src = data.item.image;
    itemImage.alt = data.item.name;
    itemName.textContent = data.item.name;
    itemUsage.textContent = data.item.usage;
  }
  guessInput.focus();
});

socket.on('next_item', (data) => {
  showScreen('play');
  guessInput.value = '';
  guessFeedback.classList.add('hidden');
  if (data.item) {
    itemImage.src = data.item.image;
    itemImage.alt = data.item.name;
    itemName.textContent = data.item.name;
    itemUsage.textContent = data.item.usage;
  }
  guessInput.focus();
});

socket.on('reveal', (data) => {
  showScreen('reveal');
  revealItemNameEl.textContent = data.itemName || 'Item';
  correctPriceEl.textContent = data.correctPrice != null ? `$${Number(data.correctPrice).toLocaleString()}` : '—';
  const parts = [];
  if (data.firstExact) parts.push('First exact: 2 pts');
  if (data.firstWithinRange) parts.push('First within ±10%: 1 pt');
  revealWinnersEl.textContent = parts.length ? parts.join(' · ') : 'No one in range this round.';
});

socket.on('game_over', (data) => {
  showScreen('gameover');
  renderLeaderboard(data.leaderboard || [], finalLeaderboard);
});

socket.on('reset', () => {
  showScreen('lobby');
  renderLeaderboard([], lobbyLeaderboard);
});

submitGuessBtn.addEventListener('click', submitGuess);
guessInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') submitGuess();
});

function submitGuess() {
  const raw = guessInput.value.trim();
  const num = parseFloat(raw);
  if (raw === '' || !Number.isFinite(num) || num < 0) {
    guessFeedback.textContent = 'Enter a valid price (e.g. 99).';
    guessFeedback.classList.remove('hidden', 'success');
    guessFeedback.classList.add('error');
    return;
  }
  socket.emit('guess', num);
  guessFeedback.textContent = 'Guess submitted!';
  guessFeedback.classList.remove('error');
  guessFeedback.classList.add('success', 'hidden');
  guessFeedback.classList.remove('hidden');
  submitGuessBtn.disabled = true;
  setTimeout(() => {
    submitGuessBtn.disabled = false;
  }, 500);
}
