const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Catch-all route to serve index.html for single-page routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`   FrameInGoa — HH Goa 2026 Card Generator        `);
  console.log(`   Server successfully running on port: ${PORT}   `);
  console.log(`   Local URL: http://localhost:${PORT}            `);
  console.log(`==================================================`);
});
