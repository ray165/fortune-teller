const express = require('express')
const router = express.Router()
const { hash, compare } = require('bcryptjs')
const { verify } = require('jsonwebtoken')

const User = require('../models/user')

const {
	createAccessToken,
	sendAccessToken,
    verifyAccessToken,
	createPasswordResetToken,
} = require('../utils/tokens')

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
		const { username, email, password } = req.body;

        const users = await User.find({ username });

        let existingUser = null;
        for (const user of users) {
            const passwordMatch = await compare(password, user.password);
            if (passwordMatch) {
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
		
        // FIXME:  NEED TO COME UP WITH LOGIC FOR ROLE. User shouldn't be able to choose their own role. 
        const newUser = new User({
            username: username,
			email: email,
			password: passwordHash,
            role: 'admin',
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
            const passwordMatch = await compare(password, user.password);
            if (passwordMatch) {
                validUser = user;
                break;
            }
        }

        if (!validUser) {
            return res.status(401).json({ message: "Invalid password" });
        }

        const accessToken = createAccessToken(validUser._id);
        console.log("FOR TESTING AccessToken: ", accessToken );

        // await validUser.save(); //Kris, what was the purpose of this line?

		sendAccessToken(req, res, accessToken);

    } catch (err) {
        console.log('Error: ', err);
        res.status(500).json({ 
            message: "Error signing in!", 
            type: "error",
            err,
        });
    }
});

router.post('/logout', async (req, res) => {
    //logic to return the admin page? Need to discuss
    // let landingPagePath = path.join(__dirname, '../', 'src', 'admin.html');
    // res.sendFile(landingPagePath);

    return res.json({
		message: 'Logged out successfully! 🤗',
		type: 'success',
	})
});

router.post('/send-password-reset-email', async (req, res) => {
    // TODO: To implement for bonus
});


module.exports = router;