const mongoose = require('mongoose');

const teamSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    activeIds: [{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Active'
    }],
    gpa: {
        type: Number,
        default: null
    },
    isActive: {
        type: Boolean
    }
},
{
    timestamps: true
});

const Team = mongoose.model('Team', teamSchema);

module.exports = Team
