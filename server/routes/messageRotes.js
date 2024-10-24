const express = require('express');
const router = express.Router();
const validateTokenHandler = require('../middleware/validateTokenHandler');
const {getMessageByConversationId}=require('../controllers/messageController');

router.use(validateTokenHandler);
router.route('/:id').get(getMessageByConversationId)
module.exports = router;