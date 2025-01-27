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
    roles: {
        type: Array,
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
    },
    address: {
        type: String,
        required: function() {
            return this.inHouse == false;
        }
    },
    api_key: {
        type: String,
    }

},
{
    timestamps: true //createdAt, updatedAt
});

const Active = mongoose.model('Active', activeSchema);

module.exports = Active