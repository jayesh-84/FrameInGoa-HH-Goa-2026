const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const app = express();

const PORT = process.env.PORT || 3000;

// Enable JSON parsing with a higher limit for base64 image data URLs
app.use(express.json({ limit: '15mb' }));

// Ensure output directories exist
const cardsDir = path.join(__dirname, 'public', 'cards');
if (!fs.existsSync(cardsDir)) {
  fs.mkdirSync(cardsDir, { recursive: true });
}

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// API Endpoint to upload a generated card client-side
app.post('/api/share', (req, res) => {
  try {
    const { image, name, role } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Missing image data.' });
    }

    // Extract base64 binary content
    const base64Data = image.replace(/^data:image\/png;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');

    // Generate unique card ID
    const cardId = crypto.randomBytes(8).toString('hex');
    
    // Save PNG image file to local public/cards folder
    const imagePath = path.join(cardsDir, `${cardId}.png`);
    fs.writeFileSync(imagePath, buffer);

    // Save metadata JSON
    const metadataPath = path.join(cardsDir, `${cardId}.json`);
    const metadata = {
      name: name || 'Builder',
      role: role || 'Hacker',
      createdAt: new Date().toISOString()
    };
    fs.writeFileSync(metadataPath, JSON.stringify(metadata));

    res.json({ id: cardId });
  } catch (err) {
    console.error('Error saving shared card:', err);
    res.status(500).json({ error: 'Failed to process card share request.' });
  }
});

// Dynamic route to serve shared cards with custom Open Graph tags
app.get('/share/:id', (req, res) => {
  const cardId = req.params.id;
  const imagePath = path.join(cardsDir, `${cardId}.png`);
  const metadataPath = path.join(cardsDir, `${cardId}.json`);

  // Check if card files exist
  if (!fs.existsSync(imagePath) || !fs.existsSync(metadataPath)) {
    return res.redirect('/');
  }

  try {
    // Read card details
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
    const builderName = metadata.name;
    const builderRole = metadata.role;

    // Get dynamic public host URL
    const host = req.get('host');
    const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
    const publicUrl = `${isLocal ? 'http' : 'https'}://${host}`;

    const imageUrl = `${publicUrl}/cards/${cardId}.png`;
    const sharePageUrl = `${publicUrl}/share/${cardId}`;

    const titleText = `${builderName} — HH Goa 2026 Builder Card`;
    const descriptionText = `HH Goa 2026 Builder Card created with FrameInGoa.`;

    // Dynamic share HTML response (matches cyberpunk layout of generator landing page)
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${titleText}</title>
  <meta name="description" content="${descriptionText}">

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${sharePageUrl}">
  <meta property="og:title" content="${titleText}">
  <meta property="og:description" content="${descriptionText}">
  <meta property="og:image" content="${imageUrl}">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${sharePageUrl}">
  <meta name="twitter:title" content="${titleText}">
  <meta name="twitter:description" content="${descriptionText}">
  <meta name="twitter:image" content="${imageUrl}">

  <!-- Custom Styles -->
  <link rel="stylesheet" href="/style.css">
</head>
<body class="share-page-body">
  <div class="grid-overlay" aria-hidden="true"></div>
  <div class="glow-sphere orange" aria-hidden="true"></div>
  <div class="glow-sphere blue" aria-hidden="true"></div>

  <main class="app-container" style="justify-content: center; align-items: center; min-height: 100vh; padding: 20px;">
    <!-- Logo -->
    <div class="logo-wrapper" style="margin-bottom: 24px;">
      <span class="logo-accent" aria-hidden="true">⚡</span>
      <span class="logo-text">FrameInGoa</span>
    </div>

    <!-- Card Display -->
    <div class="result-container" style="display: flex; flex-direction: column; align-items: center; width: 100%; max-width: 420px; animation: scaleUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);">
      <div class="image-wrapper-card" style="margin-bottom: 24px; border-color: rgba(0, 240, 255, 0.45); box-shadow: 0 25px 60px rgba(0, 0, 0, 0.85), 0 0 45px rgba(0, 240, 255, 0.25);">
        <img src="/cards/${cardId}.png" alt="${titleText}">
        <div class="cyber-corner top-left" aria-hidden="true"></div>
        <div class="cyber-corner top-right" aria-hidden="true"></div>
        <div class="cyber-corner bottom-left" aria-hidden="true"></div>
        <div class="cyber-corner bottom-right" aria-hidden="true"></div>
      </div>

      <!-- Action buttons -->
      <div class="result-actions" style="grid-template-columns: 1fr; width: 100%; gap: 14px;">
        <a href="/cards/${cardId}.png" download="HH_Goa_2026_Builder_Card_${builderName.replace(/\s+/g, '_')}.png" class="btn btn-success" style="text-decoration: none; width: 100%;">
          <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
          Download PNG
        </a>
        <a href="/" class="btn btn-primary" style="text-decoration: none; width: 100%;">
          <span>Create Your Own Card</span>
          <span class="btn-scanlines" aria-hidden="true"></span>
        </a>
      </div>
    </div>

    <!-- Footer -->
    <footer class="app-footer" style="margin-top: 40px; border: none; padding: 0;">
      <p class="footer-sub">#FrameInGoa — Not affiliated officially, made for the builder community.</p>
    </footer>
  </main>
</body>
</html>`;

    res.send(html);
  } catch (err) {
    console.error('Error generating dynamic share page:', err);
    res.redirect('/');
  }
});

// Catch-all route to serve index.html for single-page routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`==================================================`);
  console.log(`   FrameInGoa — HH Goa 2026 Card Generator        `);
  console.log(`   Server successfully running on port: ${PORT}   `);
  console.log(`   Local URL: http://localhost:${PORT}            `);
  console.log(`==================================================`);
});
