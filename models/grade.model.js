const mongoose = require('mongoose');

const gradeSchema = mongoose.Schema({
    activeId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Active'
    },
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Class'
    },
    courseId: {
        type: Number,
        required: true
    },
    grades: {
        currentScore: {
            type: Number,
            required: true
        },
        finalScore: {
            type: Number,
            required: true
        }
    }
});

const Grade = mongoose.model('Grade', gradeSchema);