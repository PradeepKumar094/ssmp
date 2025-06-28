const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
const jwt = require('jsonwebtoken'); // Import jsonwebtoken

const app = express();

// Increase payload size limit to handle larger data (e.g., base64 images)
app.use(express.json({ limit: '10mb' }));
app.use(cors());

// MongoDB Connection
const connectToMongoDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/learnpath', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB successfully');
    } catch (err) {
        console.error('Failed to connect to MongoDB:', err.message);
        process.exit(1);
    }
};
connectToMongoDB();

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Password is not required if socialId is present
    socialId: { type: String },
    signupMethod: { type: String, required: true }, // 'email', 'google', etc.
    profilePicture: { type: String }, // Base64 string for profile picture
    isAdmin: { type: Boolean, default: false }, // Field to indicate admin status
});
const User = mongoose.model('User', userSchema);

// JWT Secret Key (store this in environment variables in production)
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key'; // Replace with a strong, random key

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token.' });
        }
        req.user = user;
        next();
    });
};

// Middleware to check if user is admin (optional, for admin-specific routes)
const isAdmin = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ message: 'Forbidden. Admin access required.' });
    }
    next();
};

// Strong password regex (at least 8 characters, one uppercase, one lowercase, one number, one special character)
const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]|\\:;"'<>,.?/~`])[A-Za-z\d!@#$%^&*()_+={}\[\]|\\:;"'<>,.?/~`]{8,}$/;


// User Signup Route
app.post('/api/auth/signup', async (req, res) => {
    const { username, email, password } = req.body;

    // Basic validation
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    if (!strongPasswordRegex.test(password)) {
        return res.status(400).json({
            message: 'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*).',
        });
    }

    try {
        // Check if username or email already exists
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(409).json({ message: 'Username or email already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            signupMethod: 'email', // Default signup method
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully.' });
    } catch (err) {
        console.error('Error during signup:', err.message);
        res.status(500).json({ message: `Server error: ${err.message}` });
    }
});

// User Signin Route
app.post('/api/auth/signin', async (req, res) => {
    const { identifier, password } = req.body; // 'identifier' can be username or email

    try {
        const user = await User.findOne({
            $or: [{ username: identifier }, { email: identifier }],
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        // If social login, disallow password login
        if (user.signupMethod !== 'email') {
            return res.status(400).json({ message: `Please sign in using your ${user.signupMethod} account.` });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, username: user.username, email: user.email, isAdmin: user.isAdmin },
            JWT_SECRET,
            { expiresIn: '1h' } // Token expires in 1 hour
        );

        res.status(200).json({
            message: 'Signed in successfully.',
            token,
            user: {
                id: user._id.toString(),
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture,
                isAdmin: user.isAdmin,
            },
        });
    } catch (err) {
        console.error('Error during signin:', err.message);
        res.status(500).json({ message: `Server error: ${err.message}` });
    }
});

// User Update Route (requires authentication)
app.put('/api/users/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { username, email, password, profilePicture } = req.body;

    // Ensure the authenticated user is updating their own profile or is an admin
    if (req.user.id !== id && !req.user.isAdmin) {
        return res.status(403).json({ message: 'Forbidden: You can only update your own profile.' });
    }

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Update fields if provided
        if (username) {
            // Check for unique username if changed
            if (username !== user.username) {
                const existingUsername = await User.findOne({ username });
                if (existingUsername) {
                    return res.status(409).json({ message: 'Username already taken.' });
                }
            }
            user.username = username;
        }
        if (email) {
            // Check for unique email if changed
            if (email !== user.email) {
                const existingEmail = await User.findOne({ email });
                if (existingEmail) {
                    return res.status(409).json({ message: 'Email already taken.' });
                }
            }
            user.email = email;
        }
        if (password) {
            if (!strongPasswordRegex.test(password)) {
                console.log('Weak password for:', user.email);
                return res.status(400).json({
                    message: 'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*).'
                });
            }
            user.password = await bcrypt.hash(password, 10);
        }
        user.profilePicture = profilePicture || user.profilePicture;

        await user.save();
        console.log('User updated successfully:', user);
        res.status(200).json({
            message: 'User updated successfully.',
            user: {
                id: user._id.toString(),
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture,
                isAdmin: user.isAdmin,
            },
        });
    } catch (err) {
        console.error('Error updating user:', err.message);
        res.status(500).json({ message: `Server error: ${err.message}` });
    }
});

// Example of a protected route
app.get('/api/protected', authenticateToken, (req, res) => {
    res.status(200).json({ message: `Welcome, ${req.user.username}! You have access to protected data.` });
});

// Error handling for payload too large
app.use((err, req, res, next) => {
    if (err.type === 'entity.too.large') {
        return res.status(413).json({ message: 'Uploaded file is too large. Please use an image smaller than 10MB.' });
    }
    next(err);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});