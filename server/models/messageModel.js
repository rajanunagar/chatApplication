const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: [true, 'Please add the conversation ID']
    },
    sender: {
        type: String,
        required: [true, 'Please add the sender username']
    },
    // sender: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'User',
    //     required: [true, 'Please add the sender ID']
    // },
    type: {
        type: String,
        enum: ['text', 'file'],
        default:'text'
    },
    text: {
        type: String,
        trim: true 
    },
    fileName: {
        type: String,
        trim: true 
    }
}
,{
    timestamps: true,
 }
);

module.exports = mongoose.model('Message', messageSchema);
