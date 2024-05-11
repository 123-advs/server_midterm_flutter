const router = require('express').Router()
const User = require('../models/user');
const ctrls = require('../controllers/user')
const {verifyAccessToken, isAdmin} = require('../middlewares/verifyToken')

router.post('/register', ctrls.register)
router.post('/register/verify', ctrls.verifyCode)
router.post('/login', ctrls.login)
router.get('/current', verifyAccessToken, ctrls.getCurrent)
router.post('/refreshtoken', ctrls.refreshAccessToken)
router.get('/', ctrls.getUsers)
router.get('/logout', ctrls.logout)
router.post('/forgotpassword', ctrls.forgotPassword)
router.put('/resetpassword', ctrls.resetPassword)
router.put('/changepassword', verifyAccessToken, ctrls.changePassword);
router.put('/updateuser/:_id', verifyAccessToken, ctrls.updateUser);
router.post('/like-room/:roomId', verifyAccessToken, ctrls.likeRoom);


module.exports = router

// CRUD | Create - Read - Update - Delete | POST - GET - PUT - DELETE
//CREATE (POST) + PUT - body
//GET + DELETE - query 