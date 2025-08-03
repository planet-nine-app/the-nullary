/**
 * Nexus Server - Planet Nine Ecosystem Portal
 * Simple Express server for hosting the Nexus portal and proxying API requests
 */

import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PORT = process.env.PORT || 3333;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Planet Nine service URLs (dev deployment)
const SERVICES = {
    julia: 'https://dev.julia.allyabase.com',
    continuebee: 'https://dev.continuebee.allyabase.com',
    bdo: 'https://dev.bdo.allyabase.com',
    fount: 'https://dev.fount.allyabase.com',
    addie: 'https://dev.addie.allyabase.com',
    dolores: 'https://dev.dolores.allyabase.com',
    sanora: 'https://dev.sanora.allyabase.com',
    covenant: 'https://dev.covenant.allyabase.com'
};

// Create Express app
const app = express();

// No security middleware - keeping it simple for development

// CORS configuration
app.use(cors({
    origin: NODE_ENV === 'development' ? true : ['https://nexus.planetnine.app'],
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from public directory with proper headers
app.use(express.static(path.join(__dirname, '../public'), {
    setHeaders: (res, path, stat) => {
        // Set proper MIME types for static assets
        if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        } else if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        } else if (path.endsWith('.html')) {
            res.setHeader('Content-Type', 'text/html');
        }
        // Prevent caching in development
        if (NODE_ENV === 'development') {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        }
    }
}));

// API Routes

// Health check / ping
app.get('/api/ping', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        message: 'Nexus Portal is running'
    });
});

// Server information
app.get('/api/info', (req, res) => {
    res.json({
        name: 'Nexus Portal Server',
        version: '1.0.0',
        environment: NODE_ENV,
        services: Object.keys(SERVICES),
        uptime: process.uptime()
    });
});

// Service health check
app.post('/api/services/health', async (req, res) => {
    const { services = [] } = req.body;
    const results = {};
    
    for (const service of services) {
        if (SERVICES[service]) {
            try {
                const response = await fetch(SERVICES[service], { 
                    method: 'GET',
                    timeout: 5000
                });
                results[service] = {
                    available: response.ok,
                    status: response.status,
                    url: SERVICES[service]
                };
            } catch (error) {
                results[service] = {
                    available: false,
                    error: error.message,
                    url: SERVICES[service]
                };
            }
        } else {
            results[service] = {
                available: false,
                error: 'Service not configured'
            };
        }
    }
    
    const allAvailable = Object.values(results).every(r => r.available);
    
    res.json({
        allAvailable,
        services: results,
        timestamp: new Date().toISOString()
    });
});

// General service status
app.get('/api/services/status', async (req, res) => {
    const results = {};
    
    for (const [name, url] of Object.entries(SERVICES)) {
        try {
            const response = await fetch(url, { 
                method: 'GET',
                timeout: 3000
            });
            results[name] = {
                available: response.ok,
                status: response.status,
                responseTime: Date.now() // Simple timing
            };
        } catch (error) {
            results[name] = {
                available: false,
                error: error.message
            };
        }
    }
    
    const availableCount = Object.values(results).filter(r => r.available).length;
    const totalCount = Object.keys(results).length;
    
    res.json({
        summary: {
            available: availableCount,
            total: totalCount,
            percentage: Math.round((availableCount / totalCount) * 100)
        },
        services: results,
        timestamp: new Date().toISOString()
    });
});

// Base management (mock implementation)
app.get('/api/bases/status', (req, res) => {
    // Mock connected bases data
    res.json({
        connected: true,
        bases: ['dev', 'test', 'prod'],
        total: 3,
        details: [
            { id: 'dev', name: 'Development', url: 'https://dev.allyabase.com', status: 'connected' },
            { id: 'test', name: 'Testing', url: 'https://test.allyabase.com', status: 'connected' },
            { id: 'prod', name: 'Production', url: 'https://prod.allyabase.com', status: 'connected' }
        ]
    });
});

app.get('/api/bases/available', (req, res) => {
    // Mock available bases for discovery
    res.json({
        bases: [
            { 
                id: 'community', 
                name: 'Community Hub', 
                url: 'https://community.allyabase.com',
                description: 'Open community base for public discussions',
                members: 150,
                posts: 2500,
                joinable: true
            },
            { 
                id: 'creators', 
                name: 'Content Creators', 
                url: 'https://creators.allyabase.com',
                description: 'Base for content creators and artists',
                members: 89,
                posts: 1200,
                joinable: true
            }
        ]
    });
});

// Content aggregation (mock implementation)
app.get('/api/content/feed', (req, res) => {
    const { limit = 20, offset = 0 } = req.query;
    
    // Mock aggregated content from multiple apps
    const mockContent = [
        {
            id: '1',
            type: 'blog',
            app: 'rhapsold',
            title: 'Welcome to Planet Nine',
            content: 'Exploring the decentralized future of social media...',
            author: 'Alice Dev',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            base: 'dev',
            likes: 15,
            comments: 3
        },
        {
            id: '2',
            type: 'photo',
            app: 'photary',
            title: 'Beautiful sunset',
            imageUrl: 'https://picsum.photos/400/300?random=1',
            author: 'Bob Photographer',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            base: 'community',
            likes: 28,
            comments: 5
        },
        {
            id: '3',
            type: 'microblog',
            app: 'lexary',
            content: 'Just deployed a new feature! The decentralized web is getting better every day 🚀',
            author: 'Charlie Engineer',
            timestamp: new Date(Date.now() - 1800000).toISOString(),
            base: 'dev',
            likes: 7,
            comments: 1
        }
    ];
    
    res.json({
        content: mockContent.slice(offset, offset + parseInt(limit)),
        total: mockContent.length,
        hasMore: offset + parseInt(limit) < mockContent.length
    });
});

// Shopping API (mock implementation)
app.get('/api/shopping/products', (req, res) => {
    const { limit = 20, offset = 0, category = '' } = req.query;
    
    // Mock products from Sanora
    const mockProducts = [
        {
            id: 'ebook-1',
            title: 'The Complete JavaScript Handbook',
            price: 4999, // in cents
            category: 'ebooks',
            description: 'Comprehensive guide to modern JavaScript development',
            author: 'Tech Writer',
            base: 'dev',
            downloads: 150,
            rating: 4.8
        },
        {
            id: 'music-1',
            title: 'Ambient Focus - Productivity Soundtrack',
            price: 1999,
            category: 'music',
            description: 'Perfect background music for coding and focus work',
            author: 'Sound Designer',
            base: 'creators',
            downloads: 89,
            rating: 4.6
        },
        {
            id: 'software-1',
            title: 'React Component Library Starter',
            price: 7999,
            category: 'software',
            description: 'Professional React component library template',
            author: 'Frontend Developer',
            base: 'dev',
            downloads: 45,
            rating: 4.9
        }
    ];
    
    let filteredProducts = mockProducts;
    if (category) {
        filteredProducts = mockProducts.filter(p => p.category === category);
    }
    
    res.json({
        products: filteredProducts.slice(offset, offset + parseInt(limit)),
        total: filteredProducts.length,
        hasMore: offset + parseInt(limit) < filteredProducts.length
    });
});

app.get('/api/shopping/categories', (req, res) => {
    res.json({
        categories: [
            { id: 'ebooks', name: 'E-Books', count: 25 },
            { id: 'music', name: 'Music', count: 18 },
            { id: 'software', name: 'Software', count: 12 },
            { id: 'courses', name: 'Courses', count: 8 },
            { id: 'templates', name: 'Templates', count: 15 },
            { id: 'tickets', name: 'Tickets', count: 5 }
        ]
    });
});

// Communications API (mock implementation)
app.get('/api/communications/conversations', (req, res) => {
    // Mock StackChat conversations
    res.json({
        conversations: [
            {
                id: 'conv-1',
                participants: ['Alice', 'Bob'],
                lastMessage: 'Hey, how\'s the Planet Nine development going?',
                timestamp: new Date(Date.now() - 1800000).toISOString(),
                unread: 2,
                base: 'dev'
            },
            {
                id: 'conv-2',
                participants: ['Charlie', 'Dana'],
                lastMessage: 'The new Nexus portal looks amazing!',
                timestamp: new Date(Date.now() - 3600000).toISOString(),
                unread: 0,
                base: 'community'
            }
        ]
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        error: 'API endpoint not found',
        path: req.path
    });
});

// Serve the main portal for all other routes (SPA fallback)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🌍 Nexus Portal Server started`);
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`🔧 Environment: ${NODE_ENV}`);
    console.log(`🚀 API: http://localhost:${PORT}/api/ping`);
    console.log('');
    console.log('🎯 Planet Nine Ecosystem Portal Ready!');
});