const { sign, verify, JsonWebTokenError } = require('jsonwebtoken');
const User = require('../models/user')


const createAccessToken = (id) => {
	return sign({ id }, process.env.ACCESS_TOKEN_SECRET, {
		expiresIn: 15 * 60,
	})
}

const sendAccessToken = (req, res, accessToken) => {
	res.writeHead(200, {
		'Set-Cookie': `token=${accessToken}; HttpOnly; SameSite=None; Secure; Max-Age=3600; Path=/`,
		'Content-Type': 'application/json',
	})

	res.end(JSON.stringify({
		"message": 'Sign in Successful. Token is HttpOnly cookie 🥳',
		"type": 'success',
	}));
}

const verifyAccessToken = async (token) => {
	console.log("calling verifyAccessToken with token: ", token);

	try {
		if (!token) throw new Error("token is empty bro (⊙_⊙;)")
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
		return {validToken: false, user_id: null, error : err};
	}
}

const createPasswordResetToken = ({ _id, email, password }) => {
	const secret = password
	return sign({ id: _id, email }, secret, {
		expiresIn: 15 * 60, // 15 minutes
	})
}

const isUserAuthenticated = (req, res) => {
	var flag = false
	console.log("isUserAuthenticated() called")
	try {
		let myCookie = req.cookies['token']
		verifyAccessToken(myCookie)
		.then((data) => {
			if (data['validToken'] == true) {
				console.log('token is valid')
				flag = true
			} else {
				throw new Error("token is not valid")
			}
		})
		.catch((e) => {
			console.error("verify access token method failed", e)
			// res.status(403,"You do not have rights to visit this page");
			// res.status(403).send("nope!");
		})
	} catch (e) {
		console.error(e)
		// res.status(403).end();
	}

	if (!flag) throw new Error("Express handled exception 😥")
}

module.exports = {
	createAccessToken,
	sendAccessToken,
	verifyAccessToken,
	createPasswordResetToken,
	isUserAuthenticated
}