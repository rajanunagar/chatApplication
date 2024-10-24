const express = require('express');
const router = express.Router();
const validateTokenHandler = require('../middleware/validateTokenHandler');
const { createConversation, getConversationOfUser, addUserToConversation ,getGroupMember,deleteMemberFromGroup,updateReadTimeUser} = require('../controllers/conversationController');

router.use(validateTokenHandler);
router.route('/').post(createConversation);
router.route('/user').get(getConversationOfUser);
//router.route('/exit/:id').delete(exitFromConversation);
router.route('/user/:id').put(addUserToConversation);
router.route('/exit/:id/:userid').delete(deleteMemberFromGroup);
router.route('/update/:id').patch(updateReadTimeUser);
router.route('/:id').get(getGroupMember);

module.exports = router;