import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import Database from 'better-sqlite3';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import hpp from 'hpp';
import sanitizeHtml from 'sanitize-html';

dotenv.config();

const db = new Database('ttrawatch.db');

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS playlists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    playlist_id INTEGER,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    thumbnail TEXT,
    status TEXT DEFAULT 'active', -- 'active' or 'completed'
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (playlist_id) REFERENCES playlists (id)
  );
`);

// Seed default playlists if empty
const playlistCount = db.prepare('SELECT COUNT(*) as count FROM playlists').get();
if (playlistCount.count === 0) {
  const insert = db.prepare('INSERT INTO playlists (name, description) VALUES (?, ?)');
  insert.run('Math', 'Algebra, calculus, problem solving');
  insert.run('Physics', 'Mechanics, electricity, waves');
  insert.run('Chemistry', 'Reactions, organic, lab skills');
  insert.run('Others', 'General tutorials and skills');
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Trust the reverse proxy to get the correct client IP
  app.set('trust proxy', 1);

  // Security Headers
  app.use(helmet({
    contentSecurityPolicy: false, // Disabled for dev/Vite compatibility, enable carefully in prod
    crossOriginEmbedderPolicy: false, // Allow YouTube iframes
    crossOriginResourcePolicy: false, // Allow cross-origin resources
    crossOriginOpenerPolicy: false, // Allow popups/iframes to communicate if needed
    xFrameOptions: false, // Allow embedding in AI Studio preview
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' } // YouTube sometimes requires referrer
  }));

  // CORS - Restrict cross-origin requests
  app.use(cors());

  // Rate Limiting - DDoS protection at application level
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
    keyGenerator: (req) => req.ip // Custom keyGenerator to silence Forwarded header warnings
  });

  // Body parsers with size limits to prevent large payload attacks
  app.use(express.json({ limit: '10kb' })); 
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));

  // Prevent HTTP Parameter Pollution
  app.use(hpp());

  // XSS Sanitization Middleware for incoming request bodies
  app.use((req, res, next) => {
    if (req.body) {
      for (const key in req.body) {
        if (typeof req.body[key] === 'string') {
          req.body[key] = sanitizeHtml(req.body[key], {
            allowedTags: [], // Strip all HTML tags
            allowedAttributes: {}
          });
        }
      }
    }
    next();
  });

  app.use('/api/', apiLimiter); // Apply rate limiter only to API routes

  // API Routes
  app.get('/api/playlists', (req, res) => {
    const playlists = db.prepare(`
      SELECT p.*, 
             (SELECT COUNT(*) FROM videos v WHERE v.playlist_id = p.id) as total_videos,
             (SELECT COUNT(*) FROM videos v WHERE v.playlist_id = p.id AND v.status = 'completed') as completed_videos,
             (SELECT thumbnail FROM videos v WHERE v.playlist_id = p.id ORDER BY added_at DESC LIMIT 1) as thumbnail
      FROM playlists p
    `).all();
    res.json(playlists);
  });

  app.post('/api/playlists', (req, res) => {
    const { name, description } = req.body;
    const info = db.prepare('INSERT INTO playlists (name, description) VALUES (?, ?)').run(name, description);
    res.json({ id: info.lastInsertRowid, name, description });
  });

  app.patch('/api/playlists/:id', (req, res) => {
    const { name, description } = req.body;
    db.prepare('UPDATE playlists SET name = ?, description = ? WHERE id = ?').run(name, description, req.params.id);
    res.json({ success: true });
  });

  app.delete('/api/playlists/:id', (req, res) => {
    console.log(`Deleting playlist: ${req.params.id}`);
    db.prepare('DELETE FROM videos WHERE playlist_id = ?').run(req.params.id);
    db.prepare('DELETE FROM playlists WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  app.get('/api/playlists/:id/videos', (req, res) => {
    const videos = db.prepare('SELECT * FROM videos WHERE playlist_id = ? ORDER BY added_at DESC').all(req.params.id);
    res.json(videos);
  });

  app.post('/api/videos', (req, res) => {
    const { playlist_id, title, url, thumbnail } = req.body;
    const info = db.prepare('INSERT INTO videos (playlist_id, title, url, thumbnail) VALUES (?, ?, ?, ?)').run(playlist_id, title, url, thumbnail);
    res.json({ id: info.lastInsertRowid, playlist_id, title, url, thumbnail, status: 'active' });
  });

  app.patch('/api/videos/:id', (req, res) => {
    const { status, title, url, thumbnail } = req.body;
    if (status) {
      db.prepare('UPDATE videos SET status = ? WHERE id = ?').run(status, req.params.id);
    } else {
      db.prepare('UPDATE videos SET title = ?, url = ?, thumbnail = ? WHERE id = ?').run(title, url, thumbnail, req.params.id);
    }
    res.json({ success: true });
  });

  app.delete('/api/videos/:id', (req, res) => {
    console.log(`Deleting video: ${req.params.id}`);
    db.prepare('DELETE FROM videos WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  app.get('/api/stats', (req, res) => {
    const stats = db.prepare(`
      SELECT 
        (SELECT COUNT(*) FROM videos) as total_videos,
        (SELECT COUNT(*) FROM videos WHERE status = 'completed') as completed_videos
    `).get();
    res.json(stats);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(process.cwd(), 'dist/index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  // Set server timeouts to mitigate Slowloris DDoS attacks
  server.keepAliveTimeout = 65000; // 65 seconds
  server.headersTimeout = 66000; // 66 seconds
}

startServer();
