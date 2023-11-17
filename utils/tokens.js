const { sign } = require('jsonwebtoken');

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

const createPasswordResetToken = ({ _id, email, password }) => {
	const secret = password
	return sign({ id: _id, email }, secret, {
		expiresIn: 15 * 60, // 15 minutes
	})
}

module.exports = {
	createAccessToken,
	sendAccessToken,
	createPasswordResetToken,
}