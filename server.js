const express = require('express');
const dotenv = require('dotenv');
const { connectDB } = require('./db');
const profileRoutes = require('./routes/profileRoutes');

const exerciseRoutes = require('./routes/exerciseRoutes');
const planRoutes = require('./routes/planRoutes');
const workoutRoutes = require('./routes/workoutRoutes');
const authRoutes = require('./routes/authRoutes');

dotenv.config();

connectDB();

const app = express();

const cors = require('cors');

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.static('public'));

// Tenant Middleware (Multi-tenancy)
const tenantMiddleware = require('./middleware/tenantMiddleware');
app.use(tenantMiddleware);

// Swagger API Docs
const setupSwagger = require('./swagger');
setupSwagger(app);

// Routes
const statsRoutes = require('./routes/statsRoutes');
const goalRoutes = require('./routes/goalRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', require('./routes/aiRoutes')); // AI Routes
app.use('/api/admin', require('./routes/adminRoutes')); // Admin Routes
app.use('/api/tenants', require('./routes/tenantRoutes')); // Multi-tenant routes
app.use('/api/payment', require('./routes/paymentRoutes')); // Payment Routes
app.use('/api', planRoutes); // planRoutes has mixed paths, so mounting at /api

const PORT = process.env.PORT || 3001;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
