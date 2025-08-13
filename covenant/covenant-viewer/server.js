/**
 * Covenant Viewer - Public Web Interface
 * Displays covenant contract states via SVG visualizations
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3333;

// Environment configuration
const ENVIRONMENTS = {
    dev: {
        covenant: 'https://dev.covenant.allyabase.com',
        bdo: 'https://dev.bdo.allyabase.com',
    },
    test: {
        covenant: 'http://127.0.0.1:5122',
        bdo: 'http://127.0.0.1:5113',
    },
    local: {
        covenant: 'http://127.0.0.1:3011',
        bdo: 'http://127.0.0.1:3003',
    }
};

const currentEnv = process.env.COVENANT_ENV || 'dev';
const config = ENVIRONMENTS[currentEnv] || ENVIRONMENTS.dev;

console.log(`🌍 Covenant Viewer starting in ${currentEnv} environment`);
console.log(`📍 Covenant service: ${config.covenant}`);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Proxy endpoint for covenant SVG
app.get('/api/contract/:uuid/svg', async (req, res) => {
    try {
        const { uuid } = req.params;
        const { theme = 'light', width = 800, height = 600 } = req.query;
        
        console.log(`🎨 Fetching SVG for contract: ${uuid} (${theme} theme)`);
        
        const response = await fetch(
            `${config.covenant}/contract/${uuid}/svg?theme=${theme}&width=${width}&height=${height}`
        );
        
        if (!response.ok) {
            console.error(`❌ Failed to fetch SVG: ${response.status}`);
            return res.status(response.status).json({
                error: 'Failed to fetch contract visualization',
                status: response.status
            });
        }
        
        const svg = await response.text();
        
        // Set appropriate headers for SVG
        res.setHeader('Content-Type', 'image/svg+xml');
        res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minute cache
        res.send(svg);
        
    } catch (error) {
        console.error('❌ Error fetching contract SVG:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

// Proxy endpoint for contract data
app.get('/api/contract/:uuid', async (req, res) => {
    try {
        const { uuid } = req.params;
        
        console.log(`📋 Fetching contract data: ${uuid}`);
        
        const response = await fetch(`${config.covenant}/contract/${uuid}`);
        
        if (!response.ok) {
            console.error(`❌ Failed to fetch contract: ${response.status}`);
            return res.status(response.status).json({
                error: 'Contract not found',
                status: response.status
            });
        }
        
        const contract = await response.json();
        res.json(contract);
        
    } catch (error) {
        console.error('❌ Error fetching contract:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

// List all contracts (public endpoint)
app.get('/api/contracts', async (req, res) => {
    try {
        console.log('📋 Fetching all contracts');
        
        const response = await fetch(`${config.covenant}/contracts`);
        
        if (!response.ok) {
            console.error(`❌ Failed to fetch contracts: ${response.status}`);
            return res.status(response.status).json({
                error: 'Failed to fetch contracts',
                status: response.status
            });
        }
        
        const contracts = await response.json();
        res.json(contracts);
        
    } catch (error) {
        console.error('❌ Error fetching contracts:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        environment: currentEnv,
        covenant_service: config.covenant,
        timestamp: new Date().toISOString()
    });
});

// Serve the main application
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle contract viewer routes
app.get('/contract/:uuid', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('❌ Server error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: err.message 
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Covenant Viewer running on http://localhost:${PORT}`);
    console.log(`🔧 Environment: ${currentEnv}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;