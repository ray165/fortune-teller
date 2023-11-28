const express = require('express')
const router = express.Router()
const { hash, compare } = require('bcryptjs')
const { verify } = require('jsonwebtoken')
const cors = require('cors');

const User = require('../models/user')
const { getUser } = require('../utils/user')

const {
	createAccessToken,
	sendAccessToken,
    verifyAccessToken,
    retrieveToken,
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
            // update endpoint count
            await User.findOneAndUpdate(
                { username: username},
                {
                    $inc: { 'stats.auth/signup.count': 1},
                },
                { new: true}
            );

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
            stats: {}
		})

		await newUser.save()

        // update endpoint count
        await User.findOneAndUpdate(
            { username: username},
            {
                $inc: { 'stats.auth/signup.count': 1},
                $set: { 'stats.auth/signup.method': 'POST' }
            },
            { new: true}
        );

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

        // update endpoint count
        await User.findOneAndUpdate(
            { username: username},
            { 
                $inc: { 'stats.auth/login.count': 1},
                $set: { 'stats.auth/login.method': 'POST' }
            },
            { new: true}
        );

		sendAccessToken(req, res, accessToken, validUser.role);

    } catch (err) {
        console.log('Error: ', err);
        res.status(500).json({ 
            message: "Error signing in!", 
            type: "error",
            err,
        });
    }
});

router.put('/update-email', async (req, res) => {
    // delete all records in side of the api stats table of mongodb
    try {
        console.log("update endpoint called");
        const token = retrieveToken(req);
        const { username, password, currentEmail, newEmail} = req.body;
        const { message, user } = await getUser(username, password, token);
    
        if (!user || user.email !== currentEmail) {
            return res.status(401).json({ message });
        }

        // await User.findOneAndUpdate(
        //     { username: user},
        //     { 
        //         $set: { 'email': newEmail },
        //     },
        //     { new: true}
        // );

        await user.updateOne({ email: newEmail });
    }
    catch (err) {
        console.log('Error: ', err);
        res.status(500).json({ 
            message: "Error updating email!", 
            type: "error",
            err,
        });
    }

    res.status(200).json({ message: "Email updated successfully" });
});

router.post('/logout', async (req, res) => {
    const cookies = req.headers.cookie;

    const parsedCookies = cookies.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
    }, {});

    const token = parsedCookies.token;

    const { validToken, user_id } = await verifyAccessToken(token);

    if (!validToken){
        return res.status(404).json({ message: "Unauthorized" });
    }

    // update endpoint count
    await User.findOneAndUpdate(
        { _id: user_id},
        { 
            $inc: { 'stats.auth/logout.count': 1},
            $set: { 'stats.auth/logout.method': 'POST' }
        },
        { new: true}
    );
    
    // send a httpOnly cookie that expired and is empty string
    // res.writeHead(200, {
	// 	'Set-Cookie': `token=“111”; HttpOnly; SameSite=None; Secure; Max-Age=3600; Path=/`,
	// 	'Content-Type': 'application/json',
	// })

    res.clearCookie('token')

    res.end(JSON.stringify({
		"message": 'Sign out'
	}));

    

    // res.cookie('token', '', { expires: new Date(0), httpOnly: true, sameSite: 'None', secure: true, path: '/' });
    // res.status(200).json({ message: "Logout successful"});
});

// router.post('/send-password-reset-email', async (req, res) => {
//     // TODO: To implement for bonus
// });


module.exports = router;