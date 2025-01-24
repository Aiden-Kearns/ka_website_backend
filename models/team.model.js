const mongoose = require('mongoose');

const teamSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Active'
    }],
    gpa: {
        type: Number
    },
    isActive: {
        type: Boolean,
        required: true
    }
},
{
    timestamps: true
});

const Team = mongoose.model('Team', teamSchema);

module.exports = Team
