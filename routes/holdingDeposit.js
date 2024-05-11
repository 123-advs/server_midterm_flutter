const router = require('express').Router()
const ctrls = require('../controllers/holdingDeposit')
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')
const uploader = require('../config/cloudinary.config')

router.post('/:houseId/:roomId', [verifyAccessToken, isAdmin], ctrls.createHoldingDeposit);
router.get('/', [verifyAccessToken], ctrls.getAllHoldingDeposit);
router.put('/:hid', [verifyAccessToken, isAdmin], ctrls.updateHoldingDeposit);
router.delete('/:hid', [verifyAccessToken, isAdmin], ctrls.deleteHoldingDeposit);

module.exports = router
