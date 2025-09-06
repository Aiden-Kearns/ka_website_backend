const mongoose = require('mongoose');

const gradeSchema = mongoose.Schema({
    activeId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Active'
    },
    courseId: {
        type: Number,
        required: true,
    },
    currentScore: {
        type: Number,
        required: true
    },
    finalScore: {
        type: Number,
        required: true
    },
    currentLetterGrade: {
        type: String,
        required: true
    },
    finalLetterGrade: {
        type: String,
        required: true
    }

});

const Grade = mongoose.model('Grade', gradeSchema);

module.exports = Grade