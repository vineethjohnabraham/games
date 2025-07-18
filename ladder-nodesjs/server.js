// Simple HTTP server to serve the Garage Race Adventure game
const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    let filePath = '.' + req.url;
    
    // Default to index.html
    if (filePath === './') {
        filePath = './index.html';
    }
    
    // Get file extension
    const extname = String(path.extname(filePath)).toLowerCase();
    
    // Set content type based on file extension
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.wav': 'audio/wav',
        '.mp4': 'video/mp4',
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-otf',
        '.wasm': 'application/wasm'
    };
    
    const contentType = mimeTypes[extname] || 'application/octet-stream';
    
    // Read and serve the file
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                // File not found
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end(`
                    <html>
                        <body style="font-family: Arial; text-align: center; padding: 50px;">
                            <h1>🚗 404 - Page Not Found</h1>
                            <p>The requested page could not be found.</p>
                            <a href="/" style="color: #ff6b6b; text-decoration: none; font-weight: bold;">🏁 Return to Game</a>
                        </body>
                    </html>
                `);
            } else {
                // Server error
                res.writeHead(500);
                res.end(`Sorry, there was an error: ${error.code}`);
            }
        } else {
            // Success
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log('🏁'.repeat(50));
    console.log('🏎️  GARAGE RACE ADVENTURE SERVER STARTED!  🏎️');
    console.log('🏁'.repeat(50));
    console.log('');
    console.log(`🚗 Server running at: http://localhost:${PORT}`);
    console.log('⚡ Ready to race! Open the URL in your browser.');
    console.log('🛢️ Press Ctrl+C to stop the server.');
    console.log('');
});
