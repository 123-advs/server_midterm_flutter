const router = require('express').Router()
const ctrls = require('../controllers/Appointment')
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')
const uploader = require('../config/cloudinary.config')

router.post('/book', [verifyAccessToken], ctrls.createAppointment);
router.get('/user/:uId', [verifyAccessToken], ctrls.getAppointmentOfUser);


module.exports = router
