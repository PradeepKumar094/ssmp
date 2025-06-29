import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

// Route & Model Imports
import prereqRoutes from './src/routes/prerequisites';
import summaryRoutes from './src/routes/summaryRoute';
import quizAttempts from './src/routes/quixAttempts';
import learningPath from './src/routes/learningPath';
import authRoutes from './src/routes/auth';
import notificationRoutes from './src/routes/notifications';
import chatRoutes from './src/routes/chat';

import { authenticate } from './src/middleware/auth';
import Notification from './src/models/Notification';
import Chat from './src/models/Chat';

// Load .env variables in non-production
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const app = express();
const server = createServer(app);

// Allow frontend origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://ssmp.onrender.com',
  'https://ssmp-frontend.vercel.app',
  'https://your-frontend-domain.com' // Replace if needed
];

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// CORS middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Health Check Endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Server is running 🚀',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/prerequisites', authenticate, prereqRoutes);
app.use('/api', summaryRoutes);
app.use('/api', quizAttempts);
app.use('/api', learningPath);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);

// WebSocket JWT Auth
io.use((socket: Socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Authentication error'));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    (socket as any).data = { user: decoded };
    next();
  } catch {
    next(new Error('Authentication error'));
  }
});

// WebSocket Events
io.on('connection', (socket: Socket) => {
  const user = (socket as any).data.user;
  console.log('User connected:', user.username);

  socket.join(`user_${user.id}`);
  if (user.role === 'admin') socket.join('admin_room');

  socket.on('send_message', async ({ chatId, message }) => {
    try {
      const chat = await Chat.findById(chatId);
      if (!chat) return;

      const newMessage = {
        sender: user.role,
        senderId: user.id,
        message,
        timestamp: new Date()
      };

      chat.messages.push(newMessage);

      if (user.role === 'admin' && !chat.adminId) {
        chat.adminId = user.id;
        chat.status = 'in_progress';
      }

      await chat.save();

      const recipientId = user.role === 'admin' ? chat.studentId : chat.adminId;
      if (recipientId) {
        const notification = await Notification.create({
          userId: recipientId,
          type: 'chat_response',
          title: 'New Message',
          message: `New message in chat: ${chat.subject}`,
          relatedData: { chatId: chat._id }
        });

        io.to(`user_${recipientId}`).emit('new_message', {
          chatId,
          message: newMessage,
          notification
        });
      }

      socket.emit('message_sent', { chatId, message: newMessage });

      if (user.role === 'student') {
        io.to('admin_room').emit('new_chat_message', {
          chatId,
          message: newMessage,
          chat
        });
      }

    } catch (err) {
      console.error('Error sending message:', err);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  socket.on('new_chat', async ({ subject, message }) => {
    try {
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
      io.to('admin_room').emit('new_chat_request', { chat });

    } catch (err) {
      console.error('Error creating chat:', err);
      socket.emit('error', { message: 'Failed to create chat' });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', user.username);
  });
});

// MongoDB connection setup
const mongoUri = process.env.MONGO_URI || '';
const port = parseInt(process.env.PORT || '5000');

// Ensure port is valid
if (isNaN(port) || port <= 0) {
  console.error('❌ Invalid port number:', process.env.PORT);
  process.exit(1);
}

console.log(`🔧 Configured to run on port: ${port}`);

// Retry on failure
const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
    throw err; // Let the caller handle the retry logic
  }
};

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Start the server
const startServer = () => {
  server.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📊 Health check: http://0.0.0.0:${port}/`);
    console.log(`🔗 Socket.IO server ready for connections`);
    console.log(`✅ Server is listening and ready to accept connections`);
  });

  server.on('error', (error: any) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${port} is already in use`);
      process.exit(1);
    } else {
      console.error('❌ Server error:', error);
      process.exit(1);
    }
  });
};

// Connect to MongoDB first, then start server
const initializeApp = async () => {
  try {
    await connectDB();
    startServer();
  } catch (error) {
    console.error('❌ Failed to initialize app:', error);
    process.exit(1);
  }
};

// Initialize the application
initializeApp();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => console.log('Process terminated'));
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => console.log('Process terminated'));
});
