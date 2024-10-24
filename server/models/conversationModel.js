const mongoose = require('mongoose');

const conversationSchema = mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add the title'],
        minLength: 3,
        maxLength: 50
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Please add the admin']
    },
    users: [{
        _id : false ,
        userIds: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        readAt: {
            type: Date,
            default:null
        }
    }],
    isGroup: {
        type: Boolean,
        default: false,
    }

},
    {
        timestamps: true,
    }
)


module.exports = mongoose.model('Conversation', conversationSchema);