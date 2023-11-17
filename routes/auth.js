const express = require('express')
const router = express.Router()
const { hash, compare } = require('bcryptjs')
const { verify } = require('jsonwebtoken')

const User = require('../models/user')

// Sample users for testing
// const users = [
//     { id: 1, username: 'john', password: '123' },
//     { id: 2, username: 'admin', password: '111' }
// ];

router.get('/', async (req, res) => {
    res.send('Hello 👋, this is Auth endpoint');
});

// Routes for user login: can't have multiple johns with the same password
router.post('/signup', async (req, res) => {
	try {
		const { username, password } = req.body;

        const users = await User.find({ username });

        let existingUser = null;
        for (const user of users) {
            if (password === user.password) {
                existingUser = user;
                break;
            }
        }

        if (existingUser) {
            return res.status(500).json({ 
                message: "User already exists! Try logging in. 👍🏻", 
                type: "warning" ,
            });
        }

		const passwordHash = await hash(password, 10);
		
        const newUser = new User({
			email: email,
			password: passwordHash,
		})

		await newUser.save()

		res.status(200).json({
			message: 'User created successfully! 🥳',
			type: 'success',
		})
	} catch (error) {
		console.log('Error: ', error)
		res.status(500).json({
			type: 'error',
			message: 'Error creating user!',
			error,
		})
	}
})

// Routes for user login: allow multiple John as username, match password with all Johns
router.post('/login', async (req, res) => {

    try {

        const { username, password } = req.body;

        const users = await User.find({ username });

        if (users.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        let validUser = null;
        for (const user of users) {
            if (password === user.password) {
                validUser = user;
                break;
            }
        }

        if (!validUser) {
            return res.status(401).json({ message: "Invalid password" });
        }
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
});