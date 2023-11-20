require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const {logUsage} = require('./utils/logger');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const statsRouter = require('./routes/stats');
const apiRouter = require('./routes/api');

const app = express();
const port = 3000;

const corsOptions = {
    origin: true,
    credentials: true
}

mongoose
	.connect(process.env.MONGO_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => {
		console.log('MongoDB connection is established successfully! 🎉')
	})

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(logUsage);
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/stats', statsRouter);
app.use('/api', apiRouter);

// Implement routes for admin and user dashboards similarly

// Admin dashboard
app.get('/admin_dashboard', (req, res) => {
    res.send('Welcome to Admin Dashboard');
});

// User dashboard
app.get('/user_dashboard', (req, res) => {
    res.send('Welcome to User Dashboard');
});

app.get('/chat', (req, res) => {
    res.sendFile(__dirname + '/src/chat.html');
})

app.post('/api/v1/chat', (req, res) => {
    // ping the hugging face model.
    // send data back to chat to render the results
})

app.get('/loginpage',function (req, res) {
    res.sendFile(__dirname + '/src/login.html');
});

app.get('/signuppage',function (req, res) {
    res.sendFile(__dirname + '/src/signup.html');
});

app.get('*',function (req, res) {
    res.redirect('/');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
