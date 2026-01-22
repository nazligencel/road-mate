require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Pool
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'roadmate',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
});

// Initialize database table
const initDb = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100),
                image VARCHAR(255),
                status VARCHAR(50),
                vehicle VARCHAR(100),
                vehicle_model VARCHAR(100),
                route VARCHAR(100),
                latitude DOUBLE PRECISION,
                longitude DOUBLE PRECISION,
                last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Database initialized');

        // Seed some dummy data if empty
        const { rows } = await pool.query('SELECT COUNT(*) FROM users');
        if (parseInt(rows[0].count) === 0) {
            await pool.query(`
                INSERT INTO users (name, image, status, vehicle, vehicle_model, route, latitude, longitude)
                VALUES 
                ('Selin', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80', 'Şu an çevrimiçi', '4x4 Off-road', 'VW Transporter T4', 'Kuzey (Akyaka)', 34.8697, -111.7601),
                ('Jax', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&q=80', 'Çevrimdışı', 'Ford Transit', 'Ford Transit Custom', 'Güney (Kaş)', 34.8715, -111.7580),
                ('Sage', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&q=80', 'Şu an çevrimiçi', 'Vanagon', 'VW Westfalia', 'Batı (Urla)', 34.8650, -111.7700);
            `);
            console.log('Dummy data seeded');
        }
    } catch (err) {
        console.error('Error initializing database:', err);
    }
};

initDb();

// Routes
app.get('/', (req, res) => {
    res.send('RoadMate API is running');
});

// Update location
app.post('/api/update-location', async (req, res) => {
    const { userId, latitude, longitude } = req.body;
    try {
        await pool.query(
            'UPDATE users SET latitude = $1, longitude = $2, last_active = CURRENT_TIMESTAMP WHERE id = $3',
            [latitude, longitude, userId]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get nearby nomads
app.get('/api/nearby-nomads', async (req, res) => {
    const { lat, lng, radius = 50 } = req.query; // radius in km

    // Simple Haversine approximation in SQL
    const query = `
        SELECT *, (
            6371 * acos(
                cos(radians($1)) * cos(radians(latitude)) * 
                cos(radians(longitude) - radians($2)) + 
                sin(radians($1)) * sin(radians(latitude))
            )
        ) AS distance
        FROM users
        WHERE latitude IS NOT NULL AND longitude IS NOT NULL
        ORDER BY distance
        LIMIT 20;
    `;

    try {
        const { rows } = await pool.query(query, [lat, lng]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
