const bcrypt = require('bcryptjs');

describe('Auth Utilities', () => {
    it('should hash and verify password correctly', async () => {
        const password = 'password123';
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        expect(hash).not.toBe(password);

        const match = await bcrypt.compare(password, hash);
        expect(match).toBe(true);

        const noMatch = await bcrypt.compare('wrongpassword', hash);
        expect(noMatch).toBe(false);
    });
});
