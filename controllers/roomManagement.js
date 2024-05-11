const RoomManagement = require('../models/roomManagement');
const House = require('../models/house');
const Contract = require('../models/contract');
const User = require('../models/user')
const Notification = require('../models/notification')
const asyncHandler = require('express-async-handler');
const slugify = require('slugify');

const createRoom = asyncHandler(async (req, res) => {
    if (Object.keys(req.body).length === 0) throw new Error('Missing input');
    const { houseId } = req.params;
    const house = await House.findById(houseId);
    if (!house) throw new Error('House not found');

    const imagePaths = req.files.map(file => file.path);

    const newRoomData = {
        ...req.body,
        house: houseId,
        images: imagePaths
    };

    const newRoom = await RoomManagement.create(newRoomData);

    if (newRoom.status === 'Cho thuê') {
        const allUsers = await User.find({});
        const notificationTitle = "Thông báo từ FDJ";
        const notificationContent = "Phòng trọ mới";

        for (const user of allUsers) {
            const newNotification = await Notification.create({
                title: notificationTitle,
                content: notificationContent,
                user: [user._id],
                house: houseId,
                room: newRoom._id,
            });
        }
    }

    return res.status(200).json({
        success: newRoom ? true : false,
        createdRoom: newRoom ? newRoom : 'Cannot create new Room'
    });
});

const getRoom = asyncHandler(async (req, res) => {
    const { houseId, roomId } = req.params;
    const room = await RoomManagement.findOne({ _id: roomId, house: houseId });
    return res.status(200).json({
        success: room ? true : false,
        roomData: room ? room : 'Cannot get room'
    });
});

const getRoomsByHouse = asyncHandler(async (req, res) => {
    const { houseId } = req.params;
    const rooms = await RoomManagement.find({ house: houseId });
    return res.status(200).json({
        success: rooms ? true : false,
        rooms: rooms ? rooms : 'Cannot get rooms for this house'
    });
});

const getRooms = asyncHandler(async (req, res) => {
    const rooms = await RoomManagement.find();
    return res.status(200).json({
        success: rooms ? true : false,
        rooms: rooms ? rooms : 'Cannot get all rooms'
    });
});

const updateRoom = asyncHandler(async (req, res) => {
    const { houseId, roomId } = req.params;
    const updatedRoom = await RoomManagement.findOneAndUpdate({ _id: roomId, house: houseId }, req.body, { new: true });

    if (updatedRoom.status === 'Cho thuê') {
        const allUsers = await User.find({});
        const notificationTitle = "Thông báo từ FDJ";
        const notificationContent = "Phòng trọ đã được cập nhật";

        for (const user of allUsers) {
            const newNotification = await Notification.create({
                title: notificationTitle,
                content: notificationContent,
                user: [user._id],
                house: houseId,
                room: updatedRoom._id,
            });
        }
    }

    return res.status(200).json({
        success: updatedRoom ? true : false,
        updatedRoom: updatedRoom ? updatedRoom : 'Cannot update Room'
    });
});

const deleteRoomOfHouse = asyncHandler(async (req, res) => {
    const { houseId, roomId } = req.params;
    try {
        await Contract.deleteMany({ room: roomId });

        const deletedRoom = await RoomManagement.findOneAndDelete({ _id: roomId, house: houseId });

        return res.status(200).json({
            success: deletedRoom ? true : false,
            deletedRoom: deletedRoom ? deletedRoom : 'Cannot delete Room'
        });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

const deleteRoom = asyncHandler(async (req, res) => {
    const { roomId } = req.params;

    try {
        await Contract.deleteMany({ room: roomId });

        const deletedRoom = await RoomManagement.findOneAndDelete({ _id: roomId });

        return res.status(200).json({
            success: deletedRoom ? true : false,
            deletedRoom: deletedRoom ? deletedRoom : 'Cannot delete Room'
        });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

const createComment = asyncHandler(async (req, res) => {
    try {
        const uId = req.user._id;
        const commentContent = req.body.commentContent;
        const { roomId } = req.params;

        const newComment = {
            user: uId,
            content: commentContent,
        };

        const updatedRoom = await RoomManagement.findByIdAndUpdate(
            roomId,
            { $push: { comment: newComment } },
            { new: true }
        );

        return res.status(200).json({
            success: updatedRoom ? true : false,
            updatedRoom: updatedRoom ? updatedRoom : 'Cannot add comment to room',
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

const getComments = asyncHandler(async (req, res) => {
    try {
        const { roomId } = req.params;
        const room = await RoomManagement.findById(roomId);

        if (!room) {
            return res.status(404).json({
                success: false,
                error: 'Room not found',
            });
        }

        return res.status(200).json({
            success: true,
            comments: room.comment,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

const createRating = asyncHandler(async (req, res) => {
    try {
        const uId = req.user._id;
        const { roomId } = req.params;
        const rating = req.body.rating;

        const room = await RoomManagement.findById(roomId);

        if (!room) {
            return res.status(404).json({
                success: false,
                error: 'Room not found',
            });
        }

        const existingRatingIndex = room.star.findIndex(r => r.user.equals(uId));

        if (existingRatingIndex !== -1) {
            room.star[existingRatingIndex].rating = rating;
        } else {
            room.star.push({ user: uId, rating: rating });
        }

        const updatedRoom = await room.save();

        await updatedRoom.calculateAvgStar();

        return res.status(200).json({
            success: true,
            updatedRoom: updatedRoom,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

const getRatings = asyncHandler(async (req, res) => {
    try {
        const { roomId } = req.params;
        const room = await RoomManagement.findById(roomId);

        if (!room) {
            return res.status(404).json({
                success: false,
                error: 'Room not found',
            });
        }

        return res.status(200).json({
            success: true,
            ratings: room.star,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

function isDateAvailable(room, targetDate) {
    return room.availability.some((availability) => {
        const availabilityDate = new Date(availability.timeEmpty).toISOString().split('T')[0];
        const targetDateString = new Date(targetDate).toISOString().split('T')[0];
        return availabilityDate === targetDateString;
    });
}

const createAvailability = asyncHandler(async (req, res) => {
    const { roomId } = req.params;
    const { timeEmpty } = req.body;

    try {
        const room = await RoomManagement.findById(roomId);

        if (!room) {
            return res.status(404).json({
                success: false,
                error: 'Room not found',
            });
        }

        if (isDateAvailable(room, timeEmpty)) {
            return res.status(400).json({
                success: false,
                error: 'Ngày đã tồn tại trong danh sách availability',
            });
        }

        const updatedRoom = await RoomManagement.findOneAndUpdate(
            { _id: roomId },
            { $push: { availability: { timeEmpty } } },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            updatedRoom: updatedRoom ? updatedRoom : 'Cannot create availability for the room'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

const calculateMaxOccupancy = async (roomId) => {
    try {
        const contracts = await Contract.find({ room: roomId });

        const room = await RoomManagement.findById(roomId);

        if (!room || !contracts) {
            return null;
        }

        let maxOccupancy = room.maxOccupancy;

        contracts.forEach(contract => {
            maxOccupancy -= 1;
        });

        return maxOccupancy;
    } catch (error) {
        console.error("Error calculating max occupancy:", error.message);
        return null;
    }
};

const updateMaxOccupancy = async (roomId, newMaxOccupancy) => {
    try {
        const updatedRoom = await RoomManagement.findByIdAndUpdate(roomId, { maxOccupancy: newMaxOccupancy }, { new: true });

        return updatedRoom;
    } catch (error) {
        console.error("Error updating max occupancy:", error.message);
        return null;
    }
};

module.exports = {
    createRoom,
    getRoom,
    getRoomsByHouse,
    updateRoom,
    deleteRoomOfHouse,
    getRooms,
    deleteRoom,
    createComment,
    getComments,
    createRating,
    getRatings,
    createAvailability,
    calculateMaxOccupancy,
    updateMaxOccupancy,
};