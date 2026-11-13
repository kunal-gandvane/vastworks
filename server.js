const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from /public
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1d',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

// Single page — all routes serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n  ╔══════════════════════════════════════════════╗`);
  console.log(`  ║                                              ║`);
  console.log(`  ║   ▄▄   ▄▄ ▄▄    ▄▄  VASTWORKS               ║`);
  console.log(`  ║   ██   ██ ██    ██  Autonomous Intelligence  ║`);
  console.log(`  ║    ██ ██   ██ █▀   ───────────────────────── ║`);
  console.log(`  ║     ███     ██     http://localhost:${PORT}      ║`);
  console.log(`  ║                                              ║`);
  console.log(`  ╚══════════════════════════════════════════════╝\n`);
});
