const router = require('express').Router()
const ctrls = require('../controllers/contract')
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')
const uploader = require('../config/cloudinary.config')

router.post('/:houseId/:roomId/:serviceId', [verifyAccessToken, isAdmin], ctrls.createContract);
router.get('/:houseId/:roomId/:cid', [verifyAccessToken], ctrls.getContract);
router.get('/:houseId/:roomId', [verifyAccessToken], ctrls.getContractOfRoom);
router.get('/', [verifyAccessToken], ctrls.getAllContracts);
router.get('/:houseId', [verifyAccessToken], ctrls.getContractOfHouse);
router.put('/:cid', [verifyAccessToken, isAdmin], ctrls.updateContract);
router.delete('/:houseId/:roomId/:cid', [verifyAccessToken, isAdmin], ctrls.deleteContractOfRoom);
router.delete('/:houseId/:cid', [verifyAccessToken, isAdmin], ctrls.deleteContractOfHouse);
router.delete('/:cid', [verifyAccessToken, isAdmin], ctrls.deleteContract);

module.exports = router
