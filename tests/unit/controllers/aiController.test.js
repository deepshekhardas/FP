const { generateWorkout } = require('../../../controllers/aiController');
const Exercise = require('../../../models/Exercise');

jest.mock('../../../models/Exercise', () => ({
    find: jest.fn().mockResolvedValue([])
}));

describe('AI Controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            user: { _id: 'user123' },
            body: {}
        };
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        };
        jest.clearAllMocks();
    });

    describe('generateWorkout', () => {
        it('should generate a workout based on user goals and exercises', async () => {
            req.body = { goal: 'Strength', equipment: 'Dumbbell', duration: 45 };

            Exercise.find.mockResolvedValue([
                { name: 'Dumbbell Press', muscleGroup: 'Chest', equipment: 'Dumbbell', difficulty: 'Beginner' },
                { name: 'Dumbbell Row', muscleGroup: 'Back', equipment: 'Dumbbell', difficulty: 'Beginner' }
            ]);

            await generateWorkout(req, res);

            expect(Exercise.find).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                plan: expect.objectContaining({
                    title: expect.stringContaining('STRENGTH'),
                    exercises: expect.any(Array)
                })
            }));
        });

        it('should return empty exercises if none found', async () => {
            req.body = { goal: 'Unknown', equipment: 'Magic', duration: 30 };
            Exercise.find.mockResolvedValue([]);

            await generateWorkout(req, res);

            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                plan: expect.objectContaining({
                    exercises: []
                })
            }));
        });

        it('should handle server errors', async () => {
            Exercise.find.mockRejectedValue(new Error('DB Error'));

            await generateWorkout(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });
});
