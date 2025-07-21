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
    isActiveClass: { //To determine if the class is an extracirular or does not count toward GPA
        type: Boolean,
        required: true
    },

},
{
    timestamps: true
});

const Class = mongoose.model('Class', classSchema);

module.exports = Class