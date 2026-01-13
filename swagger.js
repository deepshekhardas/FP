const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'FitnessPro API',
            version: '1.0.0',
            description: 'Enterprise-grade Fitness Tracking API with AI-powered workout planning, user management, and subscription billing.',
            contact: {
                name: 'API Support',
                email: 'support@fitnesspro.com'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server'
            },
            {
                url: 'https://fitnesspro.onrender.com',
                description: 'Production server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        name: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                        isAdmin: { type: 'boolean' },
                        isEmailVerified: { type: 'boolean' },
                        subscriptionTier: { type: 'string', enum: ['free', 'pro', 'premium'] }
                    }
                },
                Exercise: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        name: { type: 'string' },
                        muscleGroup: { type: 'string' },
                        equipment: { type: 'string' },
                        difficulty: { type: 'string' },
                        instructions: { type: 'string' }
                    }
                },
                WorkoutLog: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        userId: { type: 'string' },
                        exercises: { type: 'array', items: { type: 'object' } },
                        duration: { type: 'number' },
                        caloriesBurned: { type: 'number' },
                        date: { type: 'string', format: 'date-time' }
                    }
                },
                Goal: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        userId: { type: 'string' },
                        name: { type: 'string' },
                        targetValue: { type: 'number' },
                        currentValue: { type: 'number' },
                        targetDate: { type: 'string', format: 'date' },
                        status: { type: 'string', enum: ['InProgress', 'Completed', 'Failed'] }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' }
                    }
                }
            }
        },
        tags: [
            { name: 'Auth', description: 'Authentication endpoints' },
            { name: 'Users', description: 'User profile management' },
            { name: 'Workouts', description: 'Workout logging and history' },
            { name: 'Exercises', description: 'Exercise library' },
            { name: 'Goals', description: 'Fitness goal tracking' },
            { name: 'Stats', description: 'Analytics and statistics' },
            { name: 'AI', description: 'AI-powered workout generation' },
            { name: 'Admin', description: 'Admin dashboard (requires admin role)' },
            { name: 'Payment', description: 'Subscription and billing' }
        ]
    },
    apis: ['./routes/*.js', './controllers/*.js']
};

const specs = swaggerJsdoc(options);

const setupSwagger = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'FitnessPro API Docs'
    }));

    // Serve raw JSON spec
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(specs);
    });
};

module.exports = setupSwagger;
