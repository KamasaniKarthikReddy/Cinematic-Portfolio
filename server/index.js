import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase, getPool, isDbConnected } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.SERVER_PORT || process.env.PORT || 5000;

// Enable CORS so the React app (port 5173) can communicate with this backend (port 5000)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
}));

app.use(express.json());

// ----------------------------------------------------
// Health check: Check if server and MySQL are alive
// ----------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    database: isDbConnected() ? 'connected to MySQL' : 'disconnected (check MySQL service & credentials)',
    timestamp: new Date().toISOString(),
  });
});

// ----------------------------------------------------
// 1. POST /api/contact - Save submitted message to MySQL
// ----------------------------------------------------
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields (name, email, message) are required.' });
    }

    const pool = getPool();
    if (!pool || !isDbConnected()) {
      return res.status(503).json({
        error: 'Database is currently offline. Please ensure MySQL service is started.',
      });
    }

    const [result] = await pool.query(
      'INSERT INTO messages (name, email, message) VALUES (?, ?, ?)',
      [name.trim(), email.trim(), message.trim()]
    );

    console.log(`📩 New message saved to MySQL! ID: ${result.insertId} from: ${name}`);

    return res.status(201).json({
      success: true,
      message: 'Transmission logged to MySQL database successfully.',
      id: result.insertId,
    });
  } catch (error) {
    console.error('Error saving contact message:', error);
    return res.status(500).json({ error: 'Internal server error saving message to database.' });
  }
});

// ----------------------------------------------------
// 2. GET /api/messages - View all saved messages (Admin)
// ----------------------------------------------------
app.get('/api/messages', async (req, res) => {
  try {
    const pool = getPool();
    if (!pool || !isDbConnected()) {
      return res.status(503).json({ error: 'Database is offline.' });
    }

    const [rows] = await pool.query('SELECT * FROM messages ORDER BY created_at DESC');
    return res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return res.status(500).json({ error: 'Failed to retrieve messages.' });
  }
});

// ----------------------------------------------------
// 3. GET /api/projects - Fetch projects from MySQL
// ----------------------------------------------------
app.get('/api/projects', async (req, res) => {
  try {
    const pool = getPool();
    if (!pool || !isDbConnected()) {
      return res.status(503).json({ error: 'Database is offline.' });
    }

    const [rows] = await pool.query('SELECT * FROM projects ORDER BY id ASC');

    // Parse JSON strings for tech and metrics
    const formattedProjects = rows.map((p) => ({
      ...p,
      tech: typeof p.tech === 'string' ? JSON.parse(p.tech) : p.tech,
      metrics: typeof p.metrics === 'string' ? JSON.parse(p.metrics) : p.metrics,
    }));

    return res.json({ success: true, data: formattedProjects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return res.status(500).json({ error: 'Failed to retrieve projects from database.' });
  }
});

// ----------------------------------------------------
// Start the Express Server and Initialize MySQL DB
// ----------------------------------------------------
async function startServer() {
  await initDatabase();

  app.listen(PORT, () => {
    console.log(`\n=================================================`);
    console.log(`⚡ Backend API Server running at: http://localhost:${PORT}`);
    console.log(`📡 Health Check:  http://localhost:${PORT}/api/health`);
    console.log(`📬 View Messages: http://localhost:${PORT}/api/messages`);
    console.log(`💼 View Projects: http://localhost:${PORT}/api/projects`);
    console.log(`=================================================\n`);
  });
}

startServer();
