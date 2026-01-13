const { getUsers, getAdminStats, updateUser, deleteUser } = require('../../../controllers/adminController');
const { User, WorkoutLog, Goal } = require('../../../db');

jest.mock('../../../db', () => ({
    User: {
        find: jest.fn(),
        countDocuments: jest.fn(),
        findById: jest.fn(),
        findByIdAndUpdate: jest.fn(),
        findByIdAndDelete: jest.fn()
    },
    WorkoutLog: {
        countDocuments: jest.fn()
    },
    Goal: {
        countDocuments: jest.fn()
    }
}));

describe('Admin Controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            query: {},
            params: {},
            body: {}
        };
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        };
        jest.clearAllMocks();
    });

    describe('getUsers', () => {
        it('should return paginated users', async () => {
            req.query = { page: 1, limit: 10 };

            User.countDocuments.mockResolvedValue(20);
            User.find.mockReturnValue({
                select: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                sort: jest.fn().mockResolvedValue([
                    { name: 'User 1' }, { name: 'User 2' }
                ])
            });

            await getUsers(req, res);

            expect(User.find).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                page: 1,
                pages: 2,
                users: expect.any(Array)
            }));
        });
    });

    describe('getAdminStats', () => {
        it('should return correct stats', async () => {
            User.countDocuments.mockResolvedValue(100);
            User.countDocuments.mockImplementation((query) => {
                if (query && query.createdAt) return Promise.resolve(10); // New users this month
                return Promise.resolve(100); // Total users
            });
            WorkoutLog.countDocuments.mockResolvedValue(500);
            Goal.countDocuments.mockResolvedValue(200);

            await getAdminStats(req, res);

            expect(res.json).toHaveBeenCalledWith({
                totalUsers: 100,
                totalWorkouts: 500,
                totalGoals: 200,
                newUsersThisMonth: 10,
                workoutsThisWeek: 500 // Simplified mock return
            });
        });
    });

    describe('updateUser', () => {
        it('should update user fields', async () => {
            req.params.id = 'user123';
            req.body = { isSuspended: true, isAdmin: true };

            const mockUser = {
                _id: 'user123',
                name: 'Test',
                isSuspended: false,
                isAdmin: false,
                save: jest.fn().mockImplementation(function () { return this; })
            };
            User.findById.mockResolvedValue(mockUser);

            await updateUser(req, res);

            expect(User.findById).toHaveBeenCalledWith('user123');
            expect(mockUser.isSuspended).toBe(true);
            expect(mockUser.isAdmin).toBe(true);
            expect(mockUser.save).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                _id: 'user123',
                isSuspended: true
            }));
        });

        it('should return 404 if user not found', async () => {
            req.params.id = 'invalid';
            User.findById.mockResolvedValue(null);

            await updateUser(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
        });
    });

    describe('deleteUser', () => {
        it('should delete user', async () => {
            req.params.id = 'user123';
            const mockUser = {
                _id: 'user123',
                deleteOne: jest.fn().mockResolvedValue({})
            };
            User.findById.mockResolvedValue(mockUser);

            await deleteUser(req, res);

            expect(User.findById).toHaveBeenCalledWith('user123');
            expect(mockUser.deleteOne).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ message: 'User removed' });
        });
    });
});
