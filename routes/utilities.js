const router = require('express').Router()
const ctrls = require('../controllers/utilities')
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')

router.post('/:houseId/:roomId/:cId', [verifyAccessToken, isAdmin], ctrls.createUtilities);
// router.get('/:uId/:utId', ctrls.getUtilities);
router.get('/:houseId', [verifyAccessToken], ctrls.getUtilitiesOfHouse);
router.get('/:houseId/:roomId', [verifyAccessToken], ctrls.getUtilitiesOfRoom);
router.get('/', [verifyAccessToken], ctrls.getAllUtilities);
router.put('/:utId', [verifyAccessToken, isAdmin], ctrls.updateUtilities);
router.delete('/:houseId/:roomId/:utId', [verifyAccessToken, isAdmin], ctrls.deleteUtilitiesOfRoom);
router.delete('/:houseId/:utId', [verifyAccessToken, isAdmin], ctrls.deleteUtilitiesOfHouse);
router.delete('/:utId', [verifyAccessToken, isAdmin], ctrls.deleteUtilities);

module.exports = router
