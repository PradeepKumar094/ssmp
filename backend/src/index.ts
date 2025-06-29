import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import prereqRoutes from './routes/prerequisites';
import summaryRoutes from './routes/summaryRoute' 
import quizAttempts from './routes/quixAttempts'
import learningPath from './routes/learningPath'
import authRoutes from './routes/auth'
import notificationRoutes from './routes/notifications'
import chatRoutes from './routes/chat'
import { authenticate } from './middleware/auth'
import Notification from './models/Notification';
import Chat from './models/Chat';

// Load environment variables with explicit path
dotenv.config({ path: path.join(__dirname, '../.env') });

// Debug: Check if environment variables are loaded
console.log('Environment variables loaded:');
console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('PORT:', process.env.PORT);
console.log('OPENROUTER_API_KEY:', process.env.OPENROUTER_API_KEY ? `${process.env.OPENROUTER_API_KEY.substring(0, 20)}...` : 'undefined');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173","https://ssmp-backend.onrender.com"],
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/prerequisites', authenticate, prereqRoutes);
app.use('/api', summaryRoutes);
app.use('/api',quizAttempts);
app.use('/api', learningPath);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);

// WebSocket authentication middleware
io.use((socket: Socket, next: (err?: Error) => void) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    (socket as any).data = { user: decoded };
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

// WebSocket connection handling
io.on('connection', (socket: Socket) => {
  const user = (socket as any).data.user;
  console.log('User connected:', user.username);
  
  // Join user to their personal room
  socket.join(`user_${user.id}`);
  
  // Join admin to admin room
  if (user.role === 'admin') {
    socket.join('admin_room');
  }
  
  // Handle new chat message
  socket.on('send_message', async (data: { chatId: string; message: string }) => {
    try {
      const { chatId, message } = data;
      
      // Save message to database
      const chat = await Chat.findById(chatId);
      if (!chat) return;
      
      const newMessage = {
        sender: user.role,
        senderId: user.id,
        message,
        timestamp: new Date()
      };
      
      chat.messages.push(newMessage);
      
      // If admin is responding, set adminId and update status
      if (user.role === 'admin' && !chat.adminId) {
        chat.adminId = user.id;
        chat.status = 'in_progress';
      }
      
      await chat.save();
      
      // Notify the other party
      const recipientId = user.role === 'admin' ? chat.studentId : chat.adminId;
      if (recipientId) {
        const notification = await Notification.create({
          userId: recipientId,
          type: 'chat_response',
          title: 'New Message',
          message: `New message in chat: ${chat.subject}`,
          relatedData: { chatId: chat._id }
        });
        
        // Emit to recipient
        io.to(`user_${recipientId}`).emit('new_message', {
          chatId,
          message: newMessage,
          notification
        });
      }
      
      // Emit to sender for confirmation
      socket.emit('message_sent', { chatId, message: newMessage });
      
      // Emit to admin room for real-time updates
      if (user.role === 'student') {
        io.to('admin_room').emit('new_chat_message', {
          chatId,
          message: newMessage,
          chat
        });
      }
      
    } catch (error) {
      console.error('Error handling message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });
  
  // Handle new chat creation
  socket.on('new_chat', async (data: { subject: string; message: string }) => {
    try {
      const { subject, message } = data;
      
      const chat = new Chat({
        studentId: user.id,
        subject,
        messages: [{
          sender: 'student',
          senderId: user.id,
          message,
          timestamp: new Date()
        }]
      });
      
      await chat.save();
      
      // Notify admins
      io.to('admin_room').emit('new_chat_request', { chat });
      
    } catch (error) {
      console.error('Error creating chat:', error);
      socket.emit('error', { message: 'Failed to create chat' });
    }
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', user.username);
  });
});

// MongoDB connection with fallback values
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/mern-project';
const port = process.env.PORT || 5000;

console.log('Attempting to connect to MongoDB with URI:', mongoUri);

mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    console.log('Server will continue running without database connection');
  });

server.listen(port, () => console.log(`Server running on port ${port}`));
