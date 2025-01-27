const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    roles: [{
        type: String,
        required: true
    }],
    memberStatus: {
        type: String,
        required: true
    },
    pledgeClass: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        default: true
    }
},
{
    timestamps: true //createdAt, updatedAt
});

const User = mongoose.model('User', userSchema);

module.exports = User
