const express = require('express');
const path = require('path');
const https = require('https'); // Import https module
const fs = require('fs');     // Import file system module

const app = express();
const port = 6987; // The user wants it on this port.

// Path to SSL certificate files (assumed to be in the project root)
const privateKeyPath = path.join(__dirname, 'key.pem');
const certificatePath = path.join(__dirname, 'cert.pem');

// Check if certificate files exist
if (!fs.existsSync(privateKeyPath) || !fs.existsSync(certificatePath)) {
    console.error('Error: SSL certificate files (key.pem and cert.pem) not found in the project root.');
    console.error('HTTPS server cannot start without these files.');
    // Exit the process or start an HTTP server as a fallback (for now, just log and exit)
    process.exit(1);
}

// Read SSL certificate files
const sslOptions = {
    key: fs.readFileSync(privateKeyPath),
    cert: fs.readFileSync(certificatePath)
};

// Trust no proxy since Nginx is explicitly NOT being used
app.set('trust proxy', false); // Explicitly disable trusting proxies

// Middleware for basic request logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} (from ${req.ip})`); // Log client IP
    next();
});

// Security headers (still good practice)
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Serve static files from the 'assets' directory
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Serve main static files like script.js and style.css
app.use(express.static(path.join(__dirname)));

// --- Page Routes ---

// GET / - Home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// GET /join - Join page
app.get('/join', (req, res) => {
    res.sendFile(path.join(__dirname, 'join.html'));
});

// GET /ranks - Ranks page
app.get('/ranks', (req, res) => {
    res.sendFile(path.join(__dirname, 'ranks.html'));
});

// GET /vote - Vote page
app.get('/vote', (req, res) => {
    res.sendFile(path.join(__dirname, 'vote.html'));
});

// GET /discord - Discord page
app.get('/discord', (req, res) => {
    res.sendFile(path.join(__dirname, 'discord.html'));
});

// --- 404 Handler ---
app.use((req, res, next) => {
    res.status(404).send("<h1>404 Not Found</h1><p>Sorry, the page you are looking for does not exist.</p>");
});

// --- Error Handler ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("<h1>500 Internal Server Error</h1><p>Something went wrong on our server. Please try again later.</p>");
});

// Create HTTPS server
const server = https.createServer(sslOptions, app);

server.listen(port, () => {
    console.log(`HTTPS Server running at https://localhost:${port}`);
    console.log('Ensure "key.pem" and "cert.pem" are in the project root for HTTPS to work.');
});
