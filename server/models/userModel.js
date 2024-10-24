const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please add the UserName'],
        minLength: 5,
        maxLength: 50,
        unique: [true, 'UserName address already taken']
    },
    password: {
        type: String,
        required: [true, 'Please add the Password']
    },
    isLogedIn: {
        type: Boolean,
        default: false,
    }
},

    {
        timestamps: true,
    })

module.exports = mongoose.model('User', userSchema);