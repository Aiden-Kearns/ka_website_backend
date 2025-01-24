const mongoose = require('mongoose');

const classGradeSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    grade: {
        type: String,
        required: true
    }
})

const activeSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    schoolYear: { 
        type: String,
        required: true
    }, 
    pledgeClass: {
        type: String,
        required: true
    },
    team_number: {
        type: Number
    },
    classes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class'
    }],
    inHouse: {
        type: Boolean,
        required: true
    },
    address: {
        type: String,
        required: function() {
            return this.inHouse == true;
        }
    }

},
{
    timestamps: true //createdAt, updatedAt
});

const Active = mongoose.model('Active', activeSchema);

module.exports = Active