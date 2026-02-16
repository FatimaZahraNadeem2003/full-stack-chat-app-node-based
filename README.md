
# Chat App - Backend API

A robust real-time chat application backend built with Node.js, Express, MongoDB, and Socket.io. Provides RESTful APIs for user management, chat operations, and real-time messaging with file upload support.

## ✨ Features

- **User Authentication**: JWT-based authentication with register/login
- **Real-time Messaging**: Socket.io for instant message delivery
- **Private Chats**: One-on-one conversation management
- **Group Chats**: Create, update, and manage group conversations
- **Message Management**: Send, receive, and delete messages
- **File Uploads**: Cloudinary integration for file sharing
- **Read Receipts**: Track message read status
- **Block/Unblock**: Chat blocking functionality
- **Admin Panel**: Special admin routes for monitoring
- **Unread Counts**: Track unread messages per chat

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.io
- **File Storage**: Cloudinary
- **Password Encryption**: bcryptjs
- **Validation**: express-validator
- **Environment Variables**: dotenv
- **CORS**: cors middleware

## 📁 Project Structure



## 🚀 Installation & Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd backend

npm install
nodemon app.js


{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.0.0",
    "dotenv": "^16.0.3",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "express-async-handler": "^1.2.0",
    "socket.io": "^4.6.0",
    "cloudinary": "^1.35.0",
    "multer": "^1.4.5-lts.1",
    "colors": "^1.4.0",
    "cors": "^2.8.5"
  }
}
