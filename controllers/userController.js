const User = require('../models/userModel')
const Token = require('../models/tokenModel')
const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const sendEmail = require('../utils/emailSender')
const jwt = require('jsonwebtoken')
const { expressjwt } = require('express-jwt')
const tokenModel = require('../models/tokenModel')
const saltRounds = 10


//register
exports.register = async (req, res) => {
    //take input form user
    const { username, email, password } = req.body

    // check if username is available
    let usernameExists = await User.findOne({ username: username })
    if (usernameExists) {
        return res.status(400).json({ error: "username not available" })
    }
    // check if email is already registered
    let emailExixts = await User.findOne({ email })
    if (emailExixts) {
        return res.status(400).json({ error: "email already registered" })
    }
    //encrypt password
    let salt = await bcrypt.genSalt(saltRounds)
    let hashed_password = await bcrypt.hash(password, salt)
    //register user
    let newUser = await User.create({
        username, email, password: hashed_password
    })
    if (!newUser) {
        return res.status(400).json({ error: "user not created" })
    }
    // generate verification token

    // send token in email
    let token = await Token.create({
        token: crypto.randomBytes(16).toString('hex'),
        user: newUser._id
    })
    if (!token) {
        return res.status(400).json({ error: "token not created" })
    }

    const URL = `${process.env.FRONTEND_URL}/emailVerification/${token.token}`

    sendEmail({
        from: 'noreply@something.com',
        to: email,
        subject: 'Verify your email',
        text: `Click on this link to verify your email ${URL}`,
        html: `<a href = '${URL}'><button> verify Account</button></a>`

    })
    //send mesage to user
    res.send({ newUser, message: "user registered successfully" })
}

//verify User

exports.verifyEmail = async (req, res) => {
    // check if token is valid or not
    let token = await Token.findOne({ token: req.params.token })
    if (!token) {
        return res.status(400).json({ error: "invalid token or token expires" })
    }
    //find user associated with token
    let user = await User.findOne({ _id: token.user })
    if (!user) {
        return res.status(400).json({ error: "User not found" })
    }

    //check if user is alreafy verified
    if (user.isVerified) {
        return res.status(400).json({ error: "User already verified. Login to Continue" })
    }
    // verify User
    user.isVerified = true
    user = await user.save()
    if (!user) {
        return res.status(400).json({ error: "user not verified. try anagin later" })
    }

    //send message to user
    res.send({ message: "user verified successfully" })
}


//resend verification
exports.resendVerification = async (req, res) => {
    //check if email is valid or not
    let user = await User.findOne({ email: req.body.email })
    if (!user) {
        return res.status(400).json({ error: "email not registered" })
    }
    //check if password is correct or not
    if (!bcrypt.compare(req.body.password, user.password)) {
        return res.status(400).json({ error: "password is incorrect" })
    }

    //check if user is already verified
    if (user.isVerified) {
        return res.status(400).json({ error: "user already verified. login to continue" })
    }
    //generate token
    let token = await Token.create({
        user,
        token: crypto.randomBytes(16).toString('hex')
    })
    if (!token) {
        return res.status(400).json({ error: "token not generated" })
    }
    //send token in email
    const URL = `${process.env.FRONTEND_URL}/emailVerification/${token.token}`


    sendEmail({
        from: 'noreply@something.com',
        to: req.body.email,
        subject: 'Verify your email',
        text: `Click on this link to verify your email ${URL}`,
        html: `<a href = '${URL}'><button> verify Account</button></a>`

    })
    //send messafe to user
    res.send({ message: "token sent to your email. verify your email to continue" })
}


//forget password
exports.forgetPassword = async (req, res) => {
    // check if email is registered or not
    let user = await User.findOne({ email: req.body.email });
    if (!user) {
        return res.status(400).json({ error: "email not registered" });
    }

    //generate password reset link/token
    let token = await Token.create({
        user,
        token: crypto.randomBytes(16).toString('hex')
    })
    if (!token) {
        return res.status(400).json({ error: "somrtihng wnt wrong. please try again" })
    }

    //send link in email
    const URL = `${process.env.FRONTEND_URL}/resetpassword/${token.token}`
    sendEmail({
        from: 'noreply@something.com',
        to: req.body.email,
        subject: 'passwrod reset  Link',
        text: `Click on this link to reset your password ${URL}`,
        html: `<a href = '${URL}'><button>Reset Password</button></a>`

    })

    //send message to user
    res.send({ message: "password reset link sent to your email. reset your password to continue" })
}


//reset password
exports.resetPassword = async (req, res) => {
    //check if token is valid or not
    let token = await Token.findOne({ token: req.params.token });
    if (!token) {
        return res.status(400).json({ error: "invalid token or token have expired" });
    }

    //find user
    let user = await User.findById(token.user)
    if (!user) {
        return res.status(400).json({ error: "user not found" })
    }

    //reset passsword
    let salt = await bcrypt.genSalt(saltRounds)
    let hashed_password = await bcrypt.hash(req.body.password, salt)

    user.password = hashed_password
    user = await user.save()
    if (!user) {
        return res.status(400).json({ error: "somrthing went wrong. please try" })
    }

    //send message to user
    res.send({ message: "password reset successfully. you can now login with your new password" })
}

//userlist- getAllUsers
//userdetails = getUserDetails
//updateUser - user role
//deleteUser - deleteUser


//login/signup
exports.signin = async (req, res) => {
    let { email, password } = req.body
    //check email if registered or not
    let user = await User.findOne({ email: email })
    if (!user) {
        return res.status(400).json({ error: "User not found. Please signup first" })
    }
    // check password if correct or not
    let isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        return res.status(400).json({ error: "Password is incorrect. Please try again" })
    }
    // check if user is verified or not
    if (!user.isVerified) {
        return res.status(400).json({ error: "Your account is not verified. Please check again" })
    }
    //generate login token
    let token = jwt.sign({
        id: user._id,
        email,
        role: user.role,
        username: user.username
    }, process.env.JWT_SECRET, { expiresIn: '24hr' })
    //set login data in cookies
    res.cookie('mycookie', token, { expiresIn: 86400 })
    //send tooken to user
    res.send({ message: "login successfully", user: { id: user._id, email, role: user.role, username: user.username }, token })
}
//authoriation


//requireSignin
// exports.requireSignin = (req, res, next) => {
//   expressjwt({
//     secret: process.env.JWT_SECRET,
//     algorithms: ['HS256'],
//   })(req, res, (error) => {
//     if (error) {
//       return res.status(401).json({ error: 'You must login first' });
//     }
//     next();
//   });
// };

//
// Middleware to check if the user is authenticated (JWT validation)
exports.requireSignin = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // Extract token from headers

    if (!token) {
        return res.status(401).json({ error: "Please login to proceed" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(401).json({ error: "Invalid or expired token. Please re-login to continue." });
        }
        // Attach user information to request object
        req.user = user;
        next(); // Proceed to the next middleware/controller if valid
    });
};



//require admin
exports.requireAdmin = (req, res, next) => expressjwt({
    secret: process.env.JWT_SECRET,
    algorithms: ['HS256'],
    userProperty: "auth"
})(req, res, (error) => {
    if (error) {
        return res.status(401).json({ error: "you must login first" })
    }
    else if (req.auth.role != '1') {
        return res.status(403).json({ error: "you must be admin to get access" })
    }
    next()
})


//get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
exports.updateUserById = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.userid, { username: req.body.username, email: req.body.email, role: req.body.role, isVerified: req.body.isVerified }, { new: true })
        if(!user){
            return res.status(404).json({ error: "User not found" })
        }else{
            res.json(user)
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.deleteUserById = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.userid)
        if(!user){
            return res.status(404).json({ error: "User not found" })
            }
            else{
                res.json(user)
                }
                } catch (error) {
                    res.status(500).json({ error: error.message });
                    }
}