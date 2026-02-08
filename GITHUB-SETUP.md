# GitHub setup (first time)

Follow these steps in order. You’ll end up with your game code on GitHub so you can deploy it to get a public URL.

---

## Step 1: Create a GitHub account

1. Go to **https://github.com**
2. Click **Sign up**
3. Enter your email, a password, and a username (e.g. `nancy` or `nancy-dev`)
4. Verify your email if GitHub asks you to

---

## Step 2: Create a new repository (empty for now)

1. Log in to GitHub
2. Click the **+** icon (top right) → **New repository**
3. **Repository name:** type something like `price-is-right-baby` (no spaces)
4. Leave **Public** selected
5. **Do not** check “Add a README” or “Add .gitignore” — leave the repo empty
6. Click **Create repository**

You’ll see a page that says “Quick setup” and shows a URL like  
`https://github.com/YOUR_USERNAME/price-is-right-baby.git`  
Keep this page open; you’ll need that URL in Step 5.

---

## Step 3: Install Git (if you don’t have it)

On a Mac, open **Terminal** and run:

```bash
git --version
```

- If you see something like `git version 2.x.x`, you’re good — go to Step 4.
- If it says “command not found,” install Git:
  - Go to **https://git-scm.com/download/mac** and download / install, or
  - If you have Homebrew, run: `brew install git`

---

## Step 4: Tell Git who you are (one-time)

In Terminal, run these two commands (use your real name and the **same email** you used for GitHub):

```bash
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

---

## Step 5: Push your game to GitHub

1. Open **Terminal**
2. Go into your project folder:

   ```bash
   cd /Users/nancy/price-is-right-baby
   ```

3. Turn the folder into a Git repo and make the first commit:

   ```bash
   git init
   git add .
   git commit -m "Initial commit - Price is Right Baby Edition"
   git branch -M main
   ```

4. Connect to GitHub and push (replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your real GitHub username and repo name from Step 2):

   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

   Example: if your username is `nancy` and the repo is `price-is-right-baby`:

   ```bash
   git remote add origin https://github.com/nancy/price-is-right-baby.git
   git push -u origin main
   ```

5. When it asks for your credentials:
   - **Username:** your GitHub username
   - **Password:** use a **Personal Access Token**, not your normal GitHub password:
     - On GitHub: click your profile picture (top right) → **Settings** → **Developer settings** (left) → **Personal access tokens** → **Tokens (classic)** → **Generate new token (classic)**
     - Name it e.g. “Render deploy,” check **repo**, then **Generate token**
     - Copy the token and paste it when Terminal asks for a password

After `git push` finishes, refresh your repo page on GitHub. You should see all your project files there.

---

## Step 6: Deploy to get your public URL

1. Go to **https://render.com** and sign up (you can use “Sign up with GitHub”).
2. **New** → **Web Service**
3. Under “Connect a repository,” find **price-is-right-baby** (or your repo name) and click **Connect**
4. Use:
   - **Build command:** `npm install`
   - **Start command:** `npm start`
5. Click **Create Web Service**
6. Wait for the first deploy to finish (a few minutes). Render will show a URL like `https://price-is-right-baby-xxxx.onrender.com`

That URL is your **public game link**. Share it with players; open **that URL + `/host`** on your phone to host.

---

## If something goes wrong

- **“remote origin already exists”**  
  Run: `git remote remove origin`  
  Then run the `git remote add origin ...` and `git push` commands again.

- **“Permission denied” or “Authentication failed”**  
  Use a Personal Access Token as the password (Step 5.5), not your GitHub login password.

- **“Repository not found”**  
  Check that the URL in `git remote add origin` has the correct username and repo name (same as on github.com).
