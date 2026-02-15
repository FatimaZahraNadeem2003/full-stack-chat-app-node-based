const asyncHandler = require('express-async-handler')
const Message = require('../models/messageModel')
const User = require('../models/userModel')
const Chat = require('../models/chatModel')

const sendMessage = asyncHandler(async(req,res) => {
    const {content, chatId, fileUrl, fileName, fileType, replyTo} = req.body;

    if((!content && !fileUrl) || !chatId){
        console.log('Invalid data passed into request');
        return res.sendStatus(400);
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
        res.status(404);
        throw new Error('Chat not found');
    }

    if (chat.blockedBy && chat.blockedBy.length > 0) {
        if (chat.blockedBy.some(blockedUserId => blockedUserId.equals(req.user._id))) {
            res.status(403);
            throw new Error('Cannot send message: You have blocked this chat');
        }
        
        const otherUsers = chat.users.filter(user => !user.equals(req.user._id));
        for (const otherUser of otherUsers) {
            if (chat.blockedBy.some(blockedUserId => blockedUserId.equals(otherUser))) {
                res.status(403);
                throw new Error('Cannot send message: This chat has been blocked by another participant');
            }
        }
    }

    var newMessage = {
        sender: req.user._id,
        content: content || '',
        chat: chatId,
        readBy: [req.user._id] 
    };
    
    if (fileUrl) {
        newMessage.fileUrl = fileUrl;
        newMessage.fileName = fileName;
        newMessage.fileType = fileType;
    }

    if (replyTo) {
        newMessage.replyTo = replyTo;
    }

    try {
        var message = await Message.create(newMessage);
        message = await message.populate('sender','name pic');
        message = await message.populate('chat');
        message = await message.populate('replyTo');
        message = await User.populate(message,{
            path:'chat.users',
            select:'name pic email'
        });

        await Chat.findByIdAndUpdate(req.body.chatId,{
            latestMessage:message
        });

        const io = req.app.get('io');
        if (io) {
            chat.users.forEach(user => {
                if (user._id.toString() !== req.user._id.toString()) {
                    io.to(user._id.toString()).emit('message recieved', message);
                }
            });
        }

        res.json(message);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

const allMessages = asyncHandler(async (req,res) =>{
    try {
        const isAdmin = req.user && req.user.isAdmin;
        const chatId = req.params.chatId;
        
        const messages = await Message.find({chat: chatId})
            .populate('sender','name pic email')
            .populate('chat')
            .populate('replyTo')
            .sort({createdAt: 1});
        
        res.json(messages);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

const deleteMessage = asyncHandler(async (req, res) => {
    try {
        const message = await Message.findById(req.params.messageId);
        
        if (!message) {
            res.status(404);
            throw new Error('Message not found');
        }
        
        if (message.sender.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('You can only delete your own messages');
        }
        
        await Message.findByIdAndDelete(req.params.messageId);
        
        res.json({ message: 'Message deleted successfully' });
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

const clearNotifications = asyncHandler(async (req, res) => {
    try {
        const userChats = await Chat.find({ users: req.user._id }).select('_id');
        
        await Message.updateMany(
            { 
                chat: { $in: userChats },
                sender: { $ne: req.user._id }, 
                readBy: { $ne: req.user._id }  
            },
            { $addToSet: { readBy: req.user._id } }
        );
        
        res.json({ message: 'All notifications cleared' });
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});


const markMessagesAsRead = asyncHandler(async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user._id;

       
        const result = await Message.updateMany(
            { 
                chat: chatId, 
                sender: { $ne: userId },
                readBy: { $ne: userId }
            },
            { $addToSet: { readBy: userId } }
        );

        const unreadCount = await Message.countDocuments({
            chat: chatId,
            sender: { $ne: userId },
            readBy: { $ne: userId }
        });

        const io = req.app.get('io');
        if (io) {
            io.to(userId.toString()).emit('messages read', { 
                chatId, 
                unreadCount 
            });
        }

        res.json({ 
            success: true, 
            modifiedCount: result.modifiedCount,
            unreadCount 
        });
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

const getUnreadCounts = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;

        const chats = await Chat.find({ users: userId });
        
        const unreadCounts = await Promise.all(
            chats.map(async (chat) => {
                const count = await Message.countDocuments({
                    chat: chat._id,
                    sender: { $ne: userId },
                    readBy: { $ne: userId }
                });
                
                return {
                    chatId: chat._id,
                    unreadCount: count
                };
            })
        );

        res.json(unreadCounts);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

const getChatUnreadCount = asyncHandler(async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user._id;

        const count = await Message.countDocuments({
            chat: chatId,
            sender: { $ne: userId },
            readBy: { $ne: userId }
        });

        res.json({ unreadCount: count });
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

module.exports = {
    sendMessage, 
    allMessages, 
    deleteMessage, 
    clearNotifications,
    markMessagesAsRead,
    getUnreadCounts,
    getChatUnreadCount
};