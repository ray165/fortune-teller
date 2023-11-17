const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const port = 3000;

mongoose
	.connect(process.env.MONGO_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => {
		console.log('MongoDB connection is established successfully! 🎉')
	})

// Sample users for testing
const users = [
    { id: 1, username: 'john', password: '123' },
    { id: 2, username: 'admin', password: '111' }
];

app.use(bodyParser.json());

app.get('/', function(req, res){
    res.sendFile(__dirname + '/src/landing.html');
});


// Routes for user login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Check if the user exists and the password is correct
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        // Set user session and send success response with redirect URL
        const redirectURL = username === 'admin' ? '/admin_dashboard' : '/user_dashboard';
        res.json({ success: true, redirect: redirectURL });
    } else {
        // Send failure response
        res.json({ success: false });
    }
});

// Implement routes for admin and user dashboards similarly

// Admin dashboard
app.get('/admin_dashboard', (req, res) => {
    res.send('Welcome to Admin Dashboard');
});

// User dashboard
app.get('/user_dashboard', (req, res) => {
    res.send('Welcome to User Dashboard');
});

app.get('*',function (req, res) {
    res.redirect('/');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
