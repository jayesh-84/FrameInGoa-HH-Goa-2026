# FrameInGoa — HH Goa 2026 Builder Card Generator

A premium, developer-focused, mobile-first web tool to generate custom, high-resolution Hacker House Goa 2026 Builder ID Cards (Format B). Users can upload their photos (supporting JPG, PNG, and HEIC), input their credentials, optionally generate funny builder titles, and immediately generate a real downloadable and shareable PNG.

This application is designed to run 100% client-side (local image resizing, browser-side HEIC conversion, and canvas card compilation). This makes it highly performant, completely private, and deployable on static hosting or lightweight Node servers for free.

## Features

- **Stunning Cyber-Goa Aesthetics:** Premium dark-mode UI with vibrant neon gradients, glassmorphism, background grids, glowing card previews, and dynamic micro-animations.
- **Pure Client-Side Canvas Render:** Real PNG image generation using the HTML5 Canvas API, running at social-sharing 4:5 resolution (`1200x1500` pixels) for crisp downloads.
- **Smart Image Layout:** Automatically detects aspect ratios (portrait, landscape, square) and performs cover crops to center and fit photo positions.
- **Dynamic HEIC Converter:** Lazy-loads `heic2any` asynchronously from a CDN *only* if the user uploads a `.HEIC`/`.HEIF` file, saving 1MB of bandwidth for non-iOS users.
- **Local Offscreen Compressor:** Scales large source images (5MB+) down to `1200px` max bounding dimensions using an offscreen canvas. This avoids mobile memory limits and speeds up card compilation.
- **Optimized for Mobile:** Clamped viewport padding, touch-friendly tap targets (min 48px), and keyboard-adaptive layouts.
- **Quick Share on X (Twitter):** Hybrid share button that triggers the native OS Share Sheet on mobile (attaching the raw PNG file) and copies the image to the clipboard on desktop (so users can simply Ctrl+V to attach).

---

## Running Locally

Ensure you have [Node.js](https://nodejs.org) installed on your system.

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment (Optional):**
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   Modify `PORT` inside `.env` if you want to run on a port other than `3000`.

3. **Start the Web Server:**
   ```bash
   npm start
   ```

4. **Open in Browser:**
   Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## Deployment Instructions for Render

Render is an excellent platform for deploying this Node.js web application. Follow these instructions:

1. **Push Code to GitHub:** Create a repository on GitHub and push the project files.
2. **Sign up on Render:** Visit [Render](https://render.com) and log in.
3. **Create a Web Service:**
   - Click the **New** button in the dashboard and select **Web Service**.
   - Connect your GitHub account and select your repository.
4. **Configure Settings:**
   - **Name:** `frame-in-goa` (or your preferred name)
   - **Region:** Select the region closest to your target users (e.g., Singapore for India-based builders).
   - **Branch:** `main` (or your active branch)
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. **Configure Environment Variables (Optional):**
   Render automatically assigns a `PORT` variable. If you want to specify a custom override, add it in the **Environment** tab:
   - Key: `PORT`
   - Value: `3000` (or another port)
6. **Deploy:** Click **Deploy Web Service**. Render will install Express, start the server, and provision a free `https://*.onrender.com` domain with SSL.
