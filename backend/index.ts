// import express from 'express';
// import mongoose from 'mongoose';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import path from 'path';
// import { createServer } from 'http';
// import { Server, Socket } from 'socket.io';
// import jwt from 'jsonwebtoken';

// import prereqRoutes from './src/routes/prerequisites';
// import summaryRoutes from './src/routes/summaryRoute';
// import quizAttempts from './src/routes/quixAttempts';
// import learningPath from './src/routes/learningPath';
// import authRoutes from './src/routes/auth';
// import notificationRoutes from './src/routes/notifications';
// import chatRoutes from './src/routes/chat';
// import { authenticate } from './src/middleware/auth';
// import Notification from './src/models/Notification';
// import Chat from './src/models/Chat';

// // Load environment variables from .env file
// dotenv.config();

// const app = express();
// const server = createServer(app);

// // CORS configuration for production and development
// const allowedOrigins = [
//   'http://localhost:3000',
//   'http://localhost:5173',
//   'https://ssmp-frontend.onrender.com',
//   'https://ssmp-frontend.vercel.app',
//   'https://your-frontend-domain.com' // Replace with your actual frontend domain
// ];

// const io = new Server(server, {
//   cors: {
//     origin: allowedOrigins,
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true
//   }
// });

// // Middleware
// app.use(cors({
//   origin: function (origin, callback) {
//     // Allow requests with no origin (like mobile apps or curl requests)
//     if (!origin) return callback(null, true);
    
//     if (allowedOrigins.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       console.log('CORS blocked origin:', origin);
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true
// }));

// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ limit: '10mb', extended: true }));

// // Health check route for Render
// app.get('/', (req, res) => {
//   res.json({ 
//     message: 'Server is running 🚀',
//     timestamp: new Date().toISOString(),
//     environment: process.env.NODE_ENV || 'development'
//   });
// });

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/prerequisites', authenticate, prereqRoutes);
// app.use('/api', summaryRoutes);
// app.use('/api', quizAttempts);
// app.use('/api', learningPath);
// app.use('/api/notifications', notificationRoutes);
// app.use('/api/chat', chatRoutes);

// // WebSocket authentication
// io.use((socket: Socket, next) => {
//   const token = socket.handshake.auth.token;
//   if (!token) return next(new Error('Authentication error'));

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
//     (socket as any).data = { user: decoded };
//     next();
//   } catch {
//     next(new Error('Authentication error'));
//   }
// });

// // WebSocket events
// io.on('connection', (socket: Socket) => {
//   const user = (socket as any).data.user;
//   console.log('User connected:', user.username);

//   socket.join(`user_${user.id}`);
//   if (user.role === 'admin') socket.join('admin_room');

//   socket.on('send_message', async ({ chatId, message }) => {
//     try {
//       const chat = await Chat.findById(chatId);
//       if (!chat) return;

//       const newMessage = {
//         sender: user.role,
//         senderId: user.id,
//         message,
//         timestamp: new Date()
//       };

//       chat.messages.push(newMessage);

//       if (user.role === 'admin' && !chat.adminId) {
//         chat.adminId = user.id;
//         chat.status = 'in_progress';
//       }

//       await chat.save();

//       const recipientId = user.role === 'admin' ? chat.studentId : chat.adminId;
//       if (recipientId) {
//         const notification = await Notification.create({
//           userId: recipientId,
//           type: 'chat_response',
//           title: 'New Message',
//           message: `New message in chat: ${chat.subject}`,
//           relatedData: { chatId: chat._id }
//         });

//         io.to(`user_${recipientId}`).emit('new_message', {
//           chatId,
//           message: newMessage,
//           notification
//         });
//       }

//       socket.emit('message_sent', { chatId, message: newMessage });

//       if (user.role === 'student') {
//         io.to('admin_room').emit('new_chat_message', {
//           chatId,
//           message: newMessage,
//           chat
//         });
//       }

//     } catch (error) {
//       console.error('Error sending message:', error);
//       socket.emit('error', { message: 'Failed to send message' });
//     }
//   });

//   socket.on('new_chat', async ({ subject, message }) => {
//     try {
//       const chat = new Chat({
//         studentId: user.id,
//         subject,
//         messages: [{
//           sender: 'student',
//           senderId: user.id,
//           message,
//           timestamp: new Date()
//         }]
//       });

//       await chat.save();
//       io.to('admin_room').emit('new_chat_request', { chat });

//     } catch (error) {
//       console.error('Error creating chat:', error);
//       socket.emit('error', { message: 'Failed to create chat' });
//     }
//   });

//   socket.on('disconnect', () => {
//     console.log('User disconnected:', user.username);
//   });
// });

// // MongoDB connection with better error handling
// const mongoUri = process.env.MONGO_URI || 'mongodb+srv://dsivasai05:csk@cluster0.nmjhsng.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
// const port = process.env.PORT || 5000;

// // Improved MongoDB connection with retry logic
// const connectDB = async () => {
//   try {
//     await mongoose.connect(mongoUri);
//     console.log('✅ MongoDB connected successfully');
//   } catch (error) {
//     console.error('❌ MongoDB connection failed:', error);
//     console.log('⚠️ Retrying connection in 5 seconds...');
//     setTimeout(connectDB, 5000);
//   }
// };

// // Handle MongoDB connection events
// mongoose.connection.on('error', (err) => {
//   console.error('MongoDB connection error:', err);
// });

// mongoose.connection.on('disconnected', () => {
//   console.log('MongoDB disconnected');
// });

// // Start server
// server.listen(port, () => {
//   console.log(`🚀 Server running on port ${port}`);
//   console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
//   console.log(`📊 Health check: http://localhost:${port}/`);
// });

// // Connect to MongoDB
// connectDB();

// // Graceful shutdown
// process.on('SIGTERM', () => {
//   console.log('SIGTERM received, shutting down gracefully');
//   server.close(() => {
//     console.log('Process terminated');
//   });
// });

// process.on('SIGINT', () => {
//   console.log('SIGINT received, shutting down gracefully');
//   server.close(() => {
//     console.log('Process terminated');
//   });
// });


import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

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

// Load environment variables from .env file
dotenv.config();

const app = express();
const server = createServer(app);

// CORS configuration for production and development
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://ssmp-frontend.onrender.com',
  'https://ssmp-frontend.vercel.app',
  'https://your-frontend-domain.com' // Replace with your actual frontend domain
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
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

// Health check route for Render
app.get('/', (req, res) => {
  res.json({ 
    message: 'Server is running 🚀',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 5000
  });
});

// Health check route specifically for deployment
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
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

// Catch-all route for undefined endpoints
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// WebSocket authentication
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

// WebSocket events
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

    } catch (error) {
      console.error('Error sending message:', error);
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

    } catch (error) {
      console.error('Error creating chat:', error);
      socket.emit('error', { message: 'Failed to create chat' });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', user.username);
  });
});

// MongoDB connection with better error handling
const mongoUri = process.env.MONGO_URI || 'mongodb+srv://dsivasai05:csk@cluster0.nmjhsng.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// FIX: Ensure port is properly typed and bound to 0.0.0.0
const port = parseInt(process.env.PORT || '5000', 10);

// DEBUG: Log environment variables
console.log('🔍 DEBUG INFO:');
console.log('PORT from env:', process.env.PORT);
console.log('Parsed port:', port);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('All env keys:', Object.keys(process.env).filter(key => key.includes('PORT')));

// Improved MongoDB connection with retry logic
const connectDB = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    console.log('⚠️ Retrying connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

// Handle MongoDB connection events
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Connect to MongoDB first
connectDB();

// FIX: Start server with explicit error handling and better logging
const startServer = () => {
  console.log('🚀 Attempting to start server...');
  console.log('📍 Binding to address: 0.0.0.0');
  console.log('🔌 Binding to port:', port);
  
  const serverInstance = server.listen(port, '0.0.0.0', () => {
    console.log(`✅ Server successfully started!`);
    console.log(`🚀 Server running on port ${port}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📊 Health check: http://0.0.0.0:${port}/`);
    console.log(`🔗 Server bound to 0.0.0.0:${port} for external access`);
    console.log(`⏰ Server started at: ${new Date().toISOString()}`);
    
    // Additional debug info
    const address = serverInstance.address();
    console.log('📍 Server address info:', address);
  });

  serverInstance.on('error', (err: any) => {
    console.error('❌ Server error:', err);
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️ Port ${port} is in use, trying port ${port + 1}`);
      const newPort = port + 1;
      serverInstance.listen(newPort, '0.0.0.0');
    } else {
      console.error('💥 Fatal server error:', err);
      process.exit(1);
    }
  });

  serverInstance.on('listening', () => {
    console.log('🎉 Server is now listening for connections');
  });

  return serverInstance;
};

const serverInstance = startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  mongoose.connection.close();
  serverInstance.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  mongoose.connection.close();
  serverInstance.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});