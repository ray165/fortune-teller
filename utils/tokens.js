const { sign, verify, JsonWebTokenError } = require('jsonwebtoken');
const User = require('../models/user')


const createAccessToken = (id) => {
	return sign({ id }, process.env.ACCESS_TOKEN_SECRET, {
		expiresIn: 15 * 60,
	})
}

const sendAccessToken = (req, res, accessToken) => {
	res.writeHead(200, {
		'Set-Cookie': `token=${accessToken}; HttpOnly; Max-Age=3600`,
		'Content-Type': 'application/json',
	})

	res.end(JSON.stringify({
		"message": 'Sign in Successful. Token is HttpOnly cookie 🥳',
		"type": 'success',
	}));
}

const verifyAccessToken = async (req, res, token) => {
	console.log("calling verifyAccessToken");

	try {
		let decode = verify(token, process.env.ACCESS_TOKEN_SECRET);
		let user_id = decode.id

		// verify if the decoded id is a user in the DB
		if (user_id) {
			const validUser = await User.findOne({ _id: user_id });

			if (validUser) {
				
				console.log(`validToken: true, user_id: ${user_id}`)
				return {validToken: true, user_id}
			}
		}

		console.log(`validToken: false, user_id: null`)
		return {validToken: false, user_id: null};

	} catch (err) {
		if (err instanceof JsonWebTokenError) {
			console.log(`validToken: false, user_id: null`)
			return {validToken: false, user_id: null};
		}
		console.log('JWT Error: ', err);
		res.status(500).json({
			message: "Error with authorization",
			type: "error",
			err,
		});
	}
}

const createPasswordResetToken = ({ _id, email, password }) => {
	const secret = password
	return sign({ id: _id, email }, secret, {
		expiresIn: 15 * 60, // 15 minutes
	})
}

module.exports = {
	createAccessToken,
	sendAccessToken,
	verifyAccessToken,
	createPasswordResetToken,
}