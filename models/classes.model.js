const mongoose = require('mongoose');

const classSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    isGradedClass: { //To determine if the class is an extracirular or does not count toward GPA
        type: Boolean,
        required: true
    },
    classNumber: { //Ex. 1214, 2222, 3104 etc...
        type: Number,
        required: true
    },
    department: { //Ex. Math, Comp Eng, Mech Eng, Eng etc...
        type: String,
        required: true
    },
    activesEnrolled: [{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Active'
    }]
},
{
    timestamps: true
});

const Class = mongoose.model('Class', classSchema);

module.exports = Class