const mongoose = require('mongoose');

const courseSchema = mongoose.Schema({
    activeIds: [{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Active'
    }],
    courseId: {
        type: String,
        required: true,
        unique: true
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
        type: String,
        required: true
    }

},
{
    timestamps: true
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course