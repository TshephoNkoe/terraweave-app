const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'terraweave-nasa-hackathon-2024';

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});

// Mock data - NO DATABASE
const mockData = {
    users: [{ id: 1, email: 'admin@terraweave.com', name: 'Admin User', organization: 'NASA' }],
    cities: [
        { id: 1, city_name: 'Pretoria', country: 'South Africa', current_temp: 32.0, historical_avg_temp: 28.0, aqi: 85, vegetation_change: -12.0, precipitation_change: -50.0 },
        { id: 2, city_name: 'Moscow', country: 'Russia', current_temp: 18.0, historical_avg_temp: 16.0, aqi: 45, vegetation_change: 5.0, precipitation_change: 20.0 },
        { id: 3, city_name: 'Tokyo', country: 'Japan', current_temp: 25.0, historical_avg_temp: 24.0, aqi: 65, vegetation_change: -3.0, precipitation_change: -10.0 }
    ]
};

// Auth route
app.post('/api/auth/login', (req, res) => {
    const { email } = req.body;
    const user = mockData.users.find(u => u.email === email);
    
    if (user) {
        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ success: true, token, user });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// Data routes
app.get('/api/cities', (req, res) => res.json(mockData.cities));
app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'TerraWeave+ NASA App Running' }));

// Serve static files
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 TerraWeave+ NASA App running on port ${PORT}`);
});
