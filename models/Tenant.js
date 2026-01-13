const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a tenant name'],
        unique: true,
        trim: true,
        maxlength: [50, 'Name can not be more than 50 characters']
    },
    subdomain: { // e.g., 'goldswest' in goldswest.fitnesspro.com
        type: String,
        required: [true, 'Please add a subdomain'],
        unique: true,
        trim: true,
        lowercase: true
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    theme: {
        primaryColor: { type: String, default: '#6366f1' },
        secondaryColor: { type: String, default: '#4338ca' },
        logoUrl: { type: String }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Tenant', tenantSchema);
