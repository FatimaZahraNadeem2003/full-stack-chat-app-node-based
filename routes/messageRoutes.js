const express = require('express')
const { protect } = require('../middleware/authMiddleware');
const { 
    sendMessage, 
    allMessages, 
    deleteMessage, 
    clearNotifications,
    markMessagesAsRead,
    getUnreadCounts,
    getChatUnreadCount
} = require('../controllers/messageControllers');

const router = express.Router()

router.route('/').post(protect, sendMessage)
router.route('/:chatId').get(protect, allMessages)
router.route('/:messageId').delete(protect, deleteMessage)
router.route('/clear-notifications').put(protect, clearNotifications)

router.route('/:chatId/read').put(protect, markMessagesAsRead)
router.route('/unread/counts').get(protect, getUnreadCounts)
router.route('/:chatId/unread').get(protect, getChatUnreadCount)

module.exports = router;