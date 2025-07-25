const mongoose = require('mongoose');


const activeSchema = mongoose.Schema({
    userId: {
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
    classIds: [{
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
            return this.inHouse == false;
        }
    },
    api_key: {
        type: String,
        required: true
    },
    iv: {
        type: String,
        required: true
    }

},
{
    timestamps: true //createdAt, updatedAt
});

const Active = mongoose.model('Active', activeSchema);

module.exports = Active