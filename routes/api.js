const { default: axios } = require('axios');
const { verifyAccessToken, isUserAuthenticated} = require('../utils/tokens')
const express = require('express')
const router = express.Router()
const User = require('../models/user')


router.get('/', async (req, res) => {
    res.send('Hello 👋, this is API endpoint');
});

router.post('/question', async (req, res) => {
    isUserAuthenticated(req, res);

    try {
        const MODEL_URL = '';
        const { token, question } = req.body;
        const { validToken, user_id } = await verifyAccessToken(req, res, token);

        if (!validToken){
            return res.status(404).json({ message: "Unauthorized" });
        }

        // call model endpoint
        const postData = {
            "api-key": process.env.API_KEY,
            "quesion": question
        }

        const response = await axios.post(MODEL_URL, postData);

        // update endpoint count
        await User.findOneAndUpdate(
            { _id: user_id},
            { 
                $inc: { 'stats.api/question.count': 1},
                $set: { 'stats.api/question.method': 'POST' }
            },
            { new: true}
        );

        res.status(200).json({
			message: response.data,
			type: 'success',
		})

    } catch (err) {
        console.log("Error: calling model endpoint: ", err);

        res.status(500).json({
			type: 'error',
			message: 'Error creating user!',
			error,
		})
    }
});

module.exports = router;
