const router = require('express').Router()
const ctrls = require('../controllers/house')
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')


router.post('/', [verifyAccessToken, isAdmin], ctrls.createHouse);
router.get('/:pid', [verifyAccessToken], ctrls.getHouse);
router.get('/', [verifyAccessToken], ctrls.getHouses);
router.put('/:pid', [verifyAccessToken, isAdmin], ctrls.updateHouse);
router.delete('/:pid', [verifyAccessToken, isAdmin], ctrls.deleteHouse);

module.exports = router