const {compare } = require('bcryptjs')
const User = require('../models/user');
const { verifyAccessToken } = require('./tokens');

async function getUser(username = '', password = '', token) {

    // if token is provided, verify it and return user
    if (token) {
        const { validToken, user_id } = await verifyAccessToken(token);
        console.log("validToken: ", validToken);
        console.log("user_id: ", user_id);
    
        if (validToken) {
            const validUser = await User.findOne({ _id: user_id });
            return { message: "User Is Valid", user: validUser}; 
        }
        else if (!validToken) {
            return { message: "Could Not Verify User. Invalid Token", user: null };
        }
    }

    if (!username) {
        return { message: "Could Not Verify User. Missing username param", user: null };
    }
    if (!password) {
        return { message: "Could Not Verify User. Missing password" , user: null};
    }
    
    const users = await User.find({ username });

    if (users.length === 0) {
        return { message: "Could Not Verify User. User not found", user: null };
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
        return { message: "Could Not Verify User. Invalid password", user: null };
    }

    return { message: "User Is Valid", user: validUser};
}

module.exports = { getUser };