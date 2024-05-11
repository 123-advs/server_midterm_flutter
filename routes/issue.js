const router = require('express').Router()
const ctrls = require('../controllers/issue')
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')
const uploader = require('../config/cloudinary.config')

router.post('/', verifyAccessToken, ctrls.createIssue);
router.get('/', [verifyAccessToken], ctrls.getAllIssue);
router.get('/:iId', [verifyAccessToken], ctrls.getIssue);
router.put('/:iId', [verifyAccessToken, isAdmin], ctrls.updateIssue);

module.exports = router