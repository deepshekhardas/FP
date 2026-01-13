// Set up mock environment variables
process.env.JWT_SECRET = 'test_secret';
process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_mock';
process.env.MONGO_URI = 'mongodb://localhost:27017/fitness_tracker_test';
process.env.PORT = '3001';
