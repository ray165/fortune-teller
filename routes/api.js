const { default: axios } = require('axios');
const { verifyAccessToken, isUserAuthenticated } = require('../utils/tokens')
const express = require('express')
const router = express.Router()
const cors = require('cors');

const User = require('../models/user')

router.get('/', async (req, res) => {
    res.send('Hello 👋, this is API endpoint');
});

router.post('/question', async (req, res) => {
    const cookies = req.headers.cookie;

    if (cookies) {
        // Parse cookies
        const parsedCookies = cookies.split(';').reduce((acc, cookie) => {
            const [key, value] = cookie.trim().split('=');
            acc[key] = value;
            return acc;
        }, {});

        const token = parsedCookies.token; // get the cookie we want
        console.log("TOKEN RECEIVED: ", token)

        try {
            const MODEL_URL = process.env.MODEL_URL;
            const question = req.body.message;
            console.log("question: ", question);
            const { validToken, user_id } = await verifyAccessToken(token);

            if (!validToken) {
                return res.status(404).json({ message: "Unauthorized" });
            }

            // call model endpoint
            const postData = {
                inputs: question,
                parameters: {
                    repetition_penalty: 4.0,
                    max_time: 60,
                    max_new_tokens: 300,
                    use_cache: false,
                    temperature: 0.8,
                    return_full_text: false,
                    num_return_sequences: 1
                }
            }

            const headers = {
                Authorization: process.env.API_KEY
            };

            await axios.post(MODEL_URL, postData, { headers })
                .then((response) => {
                    res.status(200).json({
                        message: response.data,
                        type: 'success',
                    })
                }).then(async () => {
                    // update endpoint count
                    await User.findOneAndUpdate(
                        { _id: user_id },
                        {
                            $inc: { 'stats.api/question.count': 1 },
                            $set: { 'stats.api/question.method': 'POST' }
                        },
                        { new: true }
                    );
                });

        } catch (err) {
            console.log("Error: calling model endpoint: ", err);

            res.status(500).json({
                type: 'error',
                message: 'Error calling the model endpoint /question!',
                error: err,
            })
        }

    } else {
        console.log("NO COOKIES DETECTED")

        res.status(400).json({
            type: 'error',
            message: 'missing cookie',
            error,
        })
    }
});

module.exports = router;
