const Class = require('../models/classModel');
const Active = require('../models/activeModel');
const getCourses = require('../services/courses.canvas');
const bycrypt = require('bcrypt');
const asyncHandler = require('express-async-handler');

// @desc Get all classes
// @route GET /classes
// @access Private
const getAllClasses = asyncHandler(async (req, res) => {
    const classes = await Class.find().lean();
    if(!classes?.length) {
        return res.status(400).json({message: "No classes found"});
    }
    return res.json(classes);
});

const getActivesClasses = asyncHandler(async (req, res) => {
    const { activeId } = req.params;
    if (!activeId) {
        return res.status(400).json({ message: "Active ID is Required"});
    }

    const classes = await Class.find({ activeIds: activeId }).lean();
    if(!classes?.length) {
        return res.status(400).json({message: "No classes found for this Active"})
    }
    return res.json(classes);
});

const complexRefreshClasses = asyncHandler(async (req, res) => {
    const { user, api_key } = req.body;
    if (!user || !api_key) {
        return res.status(400).json({ message: "User and API Key are required"});
    }
    //Check if user exists
    const userExists = await User.findById(user).lean().exec();
    if (!userExists) {
        return res.status(400).json({ message: "User does not exist"});
    }
    //Check if user is an Active
    const active = await Active.findOne({ user }).lean().exec();
    if (!active) {
        return res.status(400).json({ message: "User is not an Active"});
    }

    //Check if API Keys Match
    const match = await bycrypt.compare(api_key, Active.api_key);
    if (!match) {
        return res.status(401().json({ message: "Invalid API Key"}));

    }

    //Update Classes from Canvas
    const updatedClasses = await getCourses(api_key);

    if (!updatedClasses) {
        return res.status(500).json({ message: "Failed to update classes from Canvas"});
    }
    //Update Classes in Database
    const classPromises = updatedClasses.map(async (course) => {
        const classData = {
            id: course.id,
            name: course.name,
            
        }
    })
});
