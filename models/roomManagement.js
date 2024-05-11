const mongoose = require('mongoose'); // Erase if already required
const Contract = require('../models/contract');

var roomManagementSchema = new mongoose.Schema({
    house: {
        type: mongoose.Types.ObjectId,
        ref: 'House',
        required: true
    },
    houseName: String,
    roomName: {
        type: String,
        required: true,
    },
    floor: {
        type: String,
        required: true,
    },
    images: {
        type: Array,
    },
    rentPrice: {
        type: Number,
        required: true,
    },
    deposit: {
        type: Number,
        required: true,
    },
    area: {
        type: Number,
        required: true,
    },
    maxOccupancy: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: [
            'Cho thuê',
            'Không cho thuê'
        ],
        required: true
    },
    comment: [
        {
            user: {
                type: mongoose.Types.ObjectId,
                ref: 'User',
            },
            content:{
                type: String
            }
        }
    ],
    star: [
        {
            user: {
                type: mongoose.Types.ObjectId,
                ref: 'User',
            },
            rating: {
                type: Number,
                min: 1,
                max: 5,
            },
        }
    ],
    avgStar:{
        type: Number
    },
    availability: [
        {
            timeEmpty: { type: Date },
        }
    ]
}, {
    timestamps: true
});

// Thêm hook để tự động điền vào houseName từ trường name của house tương ứng
roomManagementSchema.pre('save', async function (next) {
    const house = await mongoose.model('House').findById(this.house);
    if (house) {
        this.houseName = house.name;
    }
    next();
});

roomManagementSchema.pre('remove', async function(next) {
    try {
        await Contract.deleteMany({ room: this._id });

        next();
    } catch (error) {
        next(error);
    }
});

roomManagementSchema.methods.calculateAvgStar = async function() {
    const totalStars = this.star.reduce((acc, curr) => acc + curr.rating, 0);
    const numberOfRatings = this.star.length;

    if (numberOfRatings > 0) {
        this.avgStar = totalStars / numberOfRatings;
    } else {
        this.avgStar = 0;
    }

    await this.save();
};

module.exports = mongoose.model('RoomManagement', roomManagementSchema);