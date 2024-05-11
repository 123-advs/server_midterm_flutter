const router = require('express').Router()
const ctrls = require('../controllers/notification')
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')
const uploader = require('../config/cloudinary.config')

router.post('/:houseId/:roomId/:uId', [verifyAccessToken, isAdmin], ctrls.createNotification);
router.get('/:uId', [verifyAccessToken], ctrls.getNotificationOfUser);
router.patch('/status/:notificationId', [verifyAccessToken, isAdmin], ctrls.confirmNotificationStatus);


module.exports = router
