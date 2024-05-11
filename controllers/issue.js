const { request } = require('express');
const Issue = require('../models/issue')
const House = require('../models/house')
const User = require('../models/user')
const RoomManagement = require('../models/roomManagement');
const Contract = require('../models/contract');
const Notification = require('../models/notification')
const asyncHandler = require('express-async-handler')

const createIssue= asyncHandler(async (req, res) => {
    if (Object.keys(req.body).length === 0) throw new Error('Missing input');

    const newIssue = await Issue.create({
        ...req.body,
        status: 'unedited'
    });

    return res.status(200).json({
        success: newIssue ? true : false,
        createdIssue: newIssue ? newIssue : 'Cannot create new Issue'
    });
});

const getIssue = asyncHandler(async (req, res) => {
    const { iId } = req.params
    const issues = await Issue.findOne({_id: iId});
    return res.status(200).json({
        success: issues ? true : false,
        issues: issues ? issues : 'Cannot get issues'
    });
});

const getAllIssue = asyncHandler(async (req, res) => {
    const issues = await Issue.find();
    return res.status(200).json({
        success: issues ? true : false,
        issues: issues ? issues : 'Cannot get All issues'
    });
});

const updateIssue = asyncHandler(async (req, res) => {
    const { iId } = req.params;
    const issue = await Issue.findById(iId);

    if (!issue) {
        return res.status(404).json({
            success: false,
            message: 'Issue not found'
        });
    }

    let newStatus;
    if (issue.status === 'unedited') {
        newStatus = 'editing';
    } else if (issue.status === 'editing') {
        newStatus = 'fixed';

        if (issue.status === 'editing') {
            await createNotificationForFixedIssue(issue);
        }
    } else if (issue.status === 'fixed') {
        newStatus = 'fixed';
    }

    issue.status = newStatus;
    const updatedIssue = await issue.save();

    return res.status(200).json({
        success: true,
        updatedIssue
    });
});

const createNotificationForFixedIssue = async (issue) => {
    const { house, room, user, nameIssue, roomName, houseName } = issue;

    await Notification.create({
        title: 'Vấn đề đã được sửa chữa',
        content: `Vấn đề "${nameIssue}" tại phòng ${roomName} của nhà ${houseName} đã được sửa chữa.`,
        user: [user],
        house: house,
        room: room,
        status: 'approved',
    });
};

module.exports = {
    createIssue,
    getIssue,
    getAllIssue,
    updateIssue
}