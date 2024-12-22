const router = require('express').Router()
const { register, verifyEmail, resendVerification, forgetPassword, resetPassword, signin, validateUser, getAllUsers, updateUserById, deleteUserById } = require('../controllers/userController')
const { userRules, validationMethod } = require('../utils/ourValidator')
const { route } = require('./bookingRoute')


router.post('/register',userRules,validationMethod, register)
router.get('/verifyuser/:token',verifyEmail)
router.post('/resendverification',resendVerification)
router.post('/forgetpassword',forgetPassword)
router.post('/resetpassword/:token',resetPassword)
router.post('/login',signin)
router.get('/getallusers',getAllUsers)
router.post('/updateuserbyid/:userid',updateUserById)
router.post('/deleteuserbyid/:userid',deleteUserById)


module.exports = router