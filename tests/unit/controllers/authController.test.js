jest.mock('../../../utils/emailService', () => ({
    sendVerificationEmail: jest.fn().mockResolvedValue({ success: true }),
    sendPasswordResetEmail: jest.fn().mockResolvedValue({ success: true }),
    sendEmail: jest.fn().mockResolvedValue({ success: true })
}));

const { registerUser, loginUser } = require('../../../controllers/authController');
const User = require('../../../models/User');
const Token = require('../../../models/Token');
const emailService = require('../../../utils/emailService');

jest.mock('../../../models/User');
jest.mock('../../../models/Token');
jest.mock('jsonwebtoken', () => ({
    sign: jest.fn().mockReturnValue('mock_token')
}));

describe('Auth Controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            user: { _id: 'user123' },
            body: {},
            params: {}
        };
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        };
        jest.clearAllMocks();
    });

    describe('registerUser', () => {
        it('should register a new user and send verification email', async () => {
            req.body = { name: 'John', email: 'john@test.com', password: 'password123' };
            User.findOne.mockResolvedValue(null);
            User.create.mockResolvedValue({ _id: 'user123', name: 'John', email: 'john@test.com', isAdmin: false });
            Token.generateToken.mockResolvedValue('verify_token');

            await registerUser(req, res);

            expect(User.create).toHaveBeenCalled();
            expect(emailService.sendVerificationEmail).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                _id: 'user123',
                token: 'mock_token'
            }));
        });
    });

    describe('loginUser', () => {
        it('should login valid user', async () => {
            req.body = { email: 'john@test.com', password: 'password123' };
            const mockUser = {
                _id: 'user123',
                matchPassword: jest.fn().mockResolvedValue(true),
                isSuspended: false
            };
            User.findOne.mockResolvedValue(mockUser);

            await loginUser(req, res);

            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                token: 'mock_token'
            }));
        });
    });
});
