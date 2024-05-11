const router = require('express').Router({ mergeParams: true }); // Sử dụng mergeParams để kế thừa các tham số từ router cha
const ctrls = require('../controllers/roomManagement');
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken');
const uploader = require('../config/cloudinary.config');


router.post('/:houseId', [verifyAccessToken, isAdmin, uploader.array('images', 10)], ctrls.createRoom);
router.get('/:houseId/:roomId', [verifyAccessToken], ctrls.getRoom);
router.get('/:houseId', [verifyAccessToken], ctrls.getRoomsByHouse);
router.get('/', [verifyAccessToken], ctrls.getRooms);
router.put('/:houseId/:roomId', [verifyAccessToken, isAdmin], ctrls.updateRoom);
router.delete('/:houseId/:roomId', [verifyAccessToken, isAdmin], ctrls.deleteRoomOfHouse);
router.delete('/:roomId', [verifyAccessToken, isAdmin], ctrls.deleteRoom);
router.post('/:houseId/:roomId/comment', verifyAccessToken, ctrls.createComment);
router.get('/:houseId/:roomId/comments', verifyAccessToken, ctrls.getComments);
router.post('/:houseId/:roomId/rating', verifyAccessToken, ctrls.createRating);
router.get('/:houseId/:roomId/ratings', [verifyAccessToken], ctrls.getRatings);
router.post('/:roomId/availability',[verifyAccessToken, isAdmin] ,ctrls.createAvailability);

module.exports = router;