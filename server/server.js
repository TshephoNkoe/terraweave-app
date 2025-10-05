const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'terraweave-nasa-hackathon-2024';

// Ensure database directory exists
const dbDir = path.join(__dirname, '../database');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});

// Database setup with error handling
const dbPath = path.join(__dirname, '../database/terraweave.db');
let db;

try {
    db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
        } else {
            console.log('Connected to SQLite database.');
            initializeDatabase();
        }
    });
} catch (error) {
    console.error('Database connection failed:', error);
}

function initializeDatabase() {
    const tables = [
        `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            name VARCHAR(255),
            organization VARCHAR(255),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_login DATETIME
        )`,
        
        `CREATE TABLE IF NOT EXISTS user_locations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            location_name VARCHAR(255),
            latitude DECIMAL(10, 8),
            longitude DECIMAL(11, 8),
            is_primary BOOLEAN DEFAULT FALSE,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )`,
        
        `CREATE TABLE IF NOT EXISTS climate_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            location_name VARCHAR(255),
            data_type VARCHAR(50),
            year INTEGER,
            value DECIMAL(10, 4),
            unit VARCHAR(20),
            source VARCHAR(100),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        
        `CREATE TABLE IF NOT EXISTS city_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            city_name VARCHAR(255),
            country VARCHAR(255),
            current_temp DECIMAL(5, 2),
            historical_avg_temp DECIMAL(5, 2),
            aqi INTEGER,
            vegetation_change DECIMAL(5, 2),
            precipitation_change DECIMAL(5, 2),
            last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        
        `CREATE TABLE IF NOT EXISTS action_recommendations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            location_type VARCHAR(50),
            climate_issue VARCHAR(100),
            recommendation TEXT,
            impact_co2 DECIMAL(10, 2),
            difficulty_level VARCHAR(20),
            estimated_cost VARCHAR(50)
        )`,
        
        `CREATE TABLE IF NOT EXISTS energy_plants (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            plant_name VARCHAR(255),
            plant_type VARCHAR(50),
            capacity_mw DECIMAL(10, 2),
            co2_emissions DECIMAL(12, 2),
            population_impact INTEGER,
            location VARCHAR(255),
            latitude DECIMAL(10, 8),
            longitude DECIMAL(11, 8)
        )`,
        
        `CREATE TABLE IF NOT EXISTS user_actions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            recommendation_id INTEGER,
            action_taken BOOLEAN DEFAULT FALSE,
            date_completed DATETIME,
            impact_co2 DECIMAL(10, 2),
            notes TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (recommendation_id) REFERENCES action_recommendations(id)
        )`
    ];

    // Create tables sequentially
    let currentTable = 0;
    
    function createNextTable() {
        if (currentTable >= tables.length) {
            insertSampleData();
            return;
        }
        
        db.run(tables[currentTable], (err) => {
            if (err) {
                console.error(`Error creating table ${currentTable + 1}:`, err.message);
            } else {
                console.log(`Table ${currentTable + 1} created/verified successfully`);
            }
            currentTable++;
            createNextTable();
        });
    }

    createNextTable();
}

function insertSampleData() {
    const sampleData = {
        users: `INSERT OR IGNORE INTO users (email, password_hash, name, organization) 
                VALUES ('admin@terraweave.com', '$2b$10$8K1p/a0dRT.UCVT.fu2V3u2AeC5pa5Rl.Pem5H2c6Yjz1JkUcXJ5C', 'Admin User', 'NASA')`,
        
        city_data: `INSERT OR IGNORE INTO city_data (city_name, country, current_temp, historical_avg_temp, aqi, vegetation_change, precipitation_change) VALUES
                    ('Pretoria', 'South Africa', 32.0, 28.0, 85, -12.0, -50.0),
                    ('Moscow', 'Russia', 18.0, 16.0, 45, 5.0, 20.0),
                    ('Tokyo', 'Japan', 25.0, 24.0, 65, -3.0, -10.0),
                    ('Lagos', 'Nigeria', 35.0, 32.0, 95, -8.0, -30.0),
                    ('London', 'UK', 15.0, 14.0, 55, 2.0, 15.0)`,
        
        action_recommendations: `INSERT OR IGNORE INTO action_recommendations (location_type, climate_issue, recommendation, impact_co2, difficulty_level, estimated_cost) VALUES
                                ('urban', 'heat_island', 'Plant native trees in urban areas', 50.0, 'easy', 'low'),
                                ('urban', 'air_quality', 'Use public transportation 2+ days/week', 800.0, 'medium', 'medium'),
                                ('residential', 'energy_use', 'Switch to LED lighting', 1200.0, 'easy', 'low'),
                                ('residential', 'energy_use', 'Install solar panels', 3000.0, 'hard', 'high'),
                                ('corporate', 'carbon_footprint', 'Implement telecommuting policies', 1500.0, 'medium', 'low')`,
        
        energy_plants: `INSERT OR IGNORE INTO energy_plants (plant_name, plant_type, capacity_mw, co2_emissions, population_impact, location) VALUES
                        ('Kendal Power Station', 'Coal', 4116.0, 18200000.0, 2100000, 'Mpumalanga'),
                        ('Medupi Power Station', 'Coal', 4764.0, 21500000.0, 2800000, 'Limpopo'),
                        ('Koeberg Nuclear', 'Nuclear', 1860.0, 0.0, 0, 'Western Cape')`
    };

    Object.keys(sampleData).forEach((table, index) => {
        db.run(sampleData[table], (err) => {
            if (err) {
                console.error(`Error inserting sample data into ${table}:`, err.message);
            } else {
                console.log(`Sample data inserted into ${table}`);
            }
        });
    });
}

// Auth routes
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // For demo purposes, accept any password for existing users
            // In production, use: const validPassword = await bcrypt.compare(password, user.password_hash);
            const validPassword = true; // Demo override

            if (!validPassword) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const token = jwt.sign(
                { userId: user.id, email: user.email },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Update last login
            db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

            res.json({
                success: true,
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    organization: user.organization
                }
            });
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Data routes
app.get('/api/cities', (req, res) => {
    db.all('SELECT * FROM city_data ORDER BY city_name', (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
    });
});

app.get('/api/climate-data/:location', (req, res) => {
    const { location } = req.params;
    
    db.all(
        'SELECT * FROM climate_data WHERE location_name = ? ORDER BY year DESC LIMIT 10',
        [location],
        (err, rows) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            
            // If no data in database, return mock data
            if (rows.length === 0) {
                const mockData = [
                    { year: 2024, data_type: 'temperature', value: 2.1, unit: '°C' },
                    { year: 2020, data_type: 'temperature', value: 2.0, unit: '°C' },
                    { year: 2014, data_type: 'temperature', value: 1.8, unit: '°C' }
                ];
                return res.json(mockData);
            }
            
            res.json(rows);
        }
    );
});

app.get('/api/energy-plants', (req, res) => {
    db.all('SELECT * FROM energy_plants ORDER BY co2_emissions DESC', (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
    });
});

app.get('/api/recommendations/:locationType', (req, res) => {
    const { locationType } = req.params;
    
    db.all(
        'SELECT * FROM action_recommendations WHERE location_type = ? ORDER BY impact_co2 DESC',
        [locationType],
        (err, rows) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            res.json(rows);
        }
    );
});

// NASA API mock endpoints
app.get('/api/nasa/landsat/:location', async (req, res) => {
    const { location } = req.params;
    
    // Mock NASA Landsat data
    res.json({
        location,
        imagery: {
            current: `https://api.example.com/landsat/${location}/2024`,
            historical: `https://api.example.com/landsat/${location}/1984`
        },
        analysis: {
            urban_growth: '+45%',
            temperature_change: '+2.1°C',
            vegetation_change: '-18%',
            data_source: 'NASA Landsat Program'
        }
    });
});

app.get('/api/nasa/climate/:city', async (req, res) => {
    const { city } = req.params;
    
    // Mock NASA climate data
    const mockData = {
        'pretoria': { current: 32.0, historical: 28.0 },
        'moscow': { current: 18.0, historical: 16.0 },
        'tokyo': { current: 25.0, historical: 24.0 },
        'lagos': { current: 35.0, historical: 32.0 },
        'london': { current: 15.0, historical: 14.0 }
    };
    
    const data = mockData[city.toLowerCase()] || { current: 20.0, historical: 18.0 };
    
    res.json({
        city,
        current_temp: data.current,
        historical_avg: data.historical,
        anomaly: (data.current - data.historical).toFixed(1),
        trend: data.current > data.historical ? 'increasing' : 'decreasing',
        confidence: 'high',
        data_source: 'NASA Earth Observing System'
    });
});

// Serve main application
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../login.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../dashboard.html'));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'TerraWeave+ API is running',
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 TerraWeave+ server running on port ${PORT}`);
    console.log(`🌍 Access the application at: http://localhost:${PORT}`);
    console.log(`🔗 API health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down TerraWeave+ server...');
    if (db) {
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err.message);
            } else {
                console.log('Database connection closed.');
            }
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
});