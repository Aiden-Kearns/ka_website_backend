const mongoose = require('mongoose');

const classSchema = mongoose.Schema({
    activeIds: [{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Active'
    }],
    courseId: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true
    },
    term: {
        type: String,
        required: true
    },
    section: {
        type: Number,
        required: true
    }

},
{
    timestamps: true
});

const Class = mongoose.model('Class', classSchema);

module.exports = Class