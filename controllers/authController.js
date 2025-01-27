const User = require('../models/users.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');

//@desc Login
//@route POST /auth
//@access Public
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if(!email || !password) {
        return res.status(400).json({ message: 'All fields are required'});
    }

    //Check for user in database
    const foundUser = await User.findOne({ email }).exec();

    if(!foundUser || !foundUser.active) {
        return res.status(401).json({ message: 'Unauthorized'});
    }

    //Checking password matching
    const match = await bcrypt.compare(password, foundUser.password);

    if (!match) {
        return res.status(401).json({ message: 'Unauthorized'});
    }

    //Create JWT access token
    const accessToken = jwt.sign(
        {
            'UserInfo': {
                'email': foundUser.email,
                'roles': foundUser.roles
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1m'}
    )

    //Create JWT refresh token
    const refreshToken = jwt.sign(
        { 'email': foundUser.email },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '1d'}
    )

    //Create secure cookie with refresh token
    res.cookie('jwt', refreshToken, {
        httpOnly: true, //Accessible only by web server
        secure: true, //https
        sameSite: 'None', //cross-site cookie

        //Cookie expirey (1000ms * 60 = 1 minute * 60 = 60 minutes * 24 = 1 day * 7 = 1 week)
        maxAge: 7 * 24 * 60 * 60 * 1000 
    })

    //Send accessToken containing username and roles
    res.json({ accessToken })

 })

//@desc Refresh
//@route Geth /auth/refresh
//@access Public -token has expired
const refresh = (req, res) => {
    const cookies = req.cookies;

    if(!cookies?.jwt) {
        return res.status(401).json({ message: 'Unauthorized'});
    }

    const refreshToken = cookies.jwt;

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        asyncHandler(async (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: 'Forbidden' });
            }

            const foundUser = await User.findOne({ email: decoded.email }).exec();

            if (!foundUser) {
                return res.status(401).json({ message: 'Unauthorized'});
            }

            const accessToken = jwt.sign(
                {
                    'UserInfo': {
                        'email': foundUser.email,
                        'roles': foundUser.roles
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '1m' }
            )

            res.json({ accessToken });
        })
    )

}

//@desc Logout
//@route Geth /auth/logout
//@access Public -clear cookie if it exists
const logout = (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) {
        return res.sendStatus(204); //Successful request but no content
    }
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
    res.json({ message: 'Cookie cleared'})

}

module.exports = {
    login,
    refresh,
    logout
}