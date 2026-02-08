# Price is Right: Baby Edition

A multi-player timed price-guessing quiz in the browser. Players enter their name, then guess the price of baby products. First exact answer gets 2 points; first answer within ±10% gets 1 point.

## Get a public URL (play from anywhere)

To run the game so **everyone** (including you as host on your phone) can use it from anywhere (Wi‑Fi or cellular), deploy to **Render** (free):

1. **Put the project on GitHub**
   - Create a new repo at [github.com/new](https://github.com/new), then in your project folder run:
   ```bash
   cd /Users/nancy/price-is-right-baby
   git init
   git add .
   git commit -m "Price is Right Baby Edition"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

2. **Deploy on Render**
   - Go to [render.com](https://render.com) and sign up (free).
   - **Dashboard** → **New** → **Web Service**.
   - Connect your **GitHub** account and select the repo you pushed.
   - Render will detect the app (or use: **Build command** `npm install`, **Start command** `npm start`).
   - Click **Create Web Service**.

3. **Use your public URL**
   - After the first deploy finishes, Render gives you a URL like `https://price-is-right-baby-xxxx.onrender.com`.
   - **Participants:** open that URL and join with their name.
   - **Host (you on your phone):** open **that same URL + `/host`**, e.g. `https://price-is-right-baby-xxxx.onrender.com/host`, and use **Start game** / **Override: next question** / **Reset to lobby**.

Share the main URL with players; keep the `/host` URL for yourself (or anyone hosting). Works on any device and network (cellular, different Wi‑Fi, etc.).

**Note:** On Render’s free tier the app may sleep after ~15 minutes of no use. The first visit after that can take 30–60 seconds to wake; then it’s fast.

---

## Run locally

```bash
cd price-is-right-baby
npm install
npm start
```

- **Players:** open http://localhost:3000 — enter name and join; when the host starts, one item appears at a time with name, usage age, and image. Submit your price guess; points add up and leaderboard updates in real time.
- **Host:** open http://localhost:3000/host — Start game, then **Reveal & next item** after each round to show the correct price and move to the next item.

## How it works

- One item is shown at a time: **name** (e.g. Artipoppe Argus Allure), **usage** (e.g. newborn to 2 years), and **image**.
- First **exact** price wins **2 points**; first guess **within ±10%** (and not already exact) wins **1 point**.
- Host advances rounds with “Reveal & next item”; when all items are done, the game ends and final scores are shown.

## Customize

- Edit `data/items.js` to add or change products (name, usage, image URL, price in dollars).
- Default port is 3000; set `PORT=3001 npm start` to use another port.
