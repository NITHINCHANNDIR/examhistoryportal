const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6,
        select: false
    },
    role: {
        type: String,
        enum: ['student', 'admin', 'superadmin'],
        default: 'student',
        index: true
    },
    studentId: {
        type: String,
        sparse: true,
        unique: true,
        index: true
    },
    profile: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        department: { type: String },
        batchYear: { type: Number },
        semester: { type: Number },
        dateOfBirth: { type: Date },
        gender: { type: String },
        phone: { type: String },
        address: {
            street: String,
            city: String,
            state: String,
            pincode: String
        },
        avatar: { type: String }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isFirstLogin: {
        type: Boolean,
        default: false
    },
    requiresOnboarding: {
        type: Boolean,
        default: false
    },
    lastLogin: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual for full name
userSchema.virtual('fullName').get(function () {
    return `${this.profile.firstName} ${this.profile.lastName}`;
});

// Text index for search
userSchema.index({
    email: 'text',
    studentId: 'text',
    'profile.firstName': 'text',
    'profile.lastName': 'text'
});

module.exports = mongoose.model('User', userSchema);
