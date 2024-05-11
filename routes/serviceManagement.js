const router = require('express').Router();
const ctrls = require('../controllers/serviceManagement');
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken');
const uploader = require('../config/cloudinary.config');

router.post('/:houseId', [verifyAccessToken, isAdmin], ctrls.createService);
router.get('/:houseId/:pid', [verifyAccessToken], ctrls.getService);
router.get('/:houseId', [verifyAccessToken], ctrls.getServiceOfHouse);
router.get('/', [verifyAccessToken], ctrls.getServices);
router.put('/:houseId/:pid', [verifyAccessToken, isAdmin], ctrls.updateService);
router.delete('/:houseId/:pid', [verifyAccessToken, isAdmin], ctrls.deleteServiceOfHouse);
router.delete('/:pid', [verifyAccessToken, isAdmin], ctrls.deleteService);

module.exports = router;