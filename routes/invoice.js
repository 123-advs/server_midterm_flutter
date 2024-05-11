const router = require('express').Router()
const ctrls = require('../controllers/invoice')
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')

router.post('/:houseId/:roomId/:cId', [verifyAccessToken, isAdmin], ctrls.createInvoice);
router.get('/', ctrls.getAllInvoice);
router.delete('/:iId', [verifyAccessToken, isAdmin], ctrls.deleteInvoice);
router.put('/:iId', [verifyAccessToken, isAdmin], ctrls.updateInvoice);


module.exports = router
