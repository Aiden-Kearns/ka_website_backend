const User = require('../models/users.model');
const Course = require('../models/courses.model.js');
const Team = require('../models/team.model.js');
const Active = require('../models/actives.model.js');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt'); 
const { default: mongoose } = require('mongoose');
const { encrypt } = require('../services/encryptionService.js');

//@desc Get all actives
//@route GET /actives
//@access Private
const getAllActives = asyncHandler(async (req, res) => {
    const actives = await Active.find().lean();
    if (!actives?.length) {
        return res.status(400).json({message: "No actives found"});
    }
    return res.json(actives);
});

//@desc Create new active
//@route POST /actives
//@access Private
const createNewActive = asyncHandler(async (req, res) => {
    const { userId, schoolYear, team_number, courses, inHouse, address, roles, api_key } = req.body;
    //Confirm Data
    if (!userId ||!schoolYear || inHouse == null || !Array.isArray(roles) || !roles.length || !api_key) {
        return res.status(400).json({message: "All fields are required"});
    }

    //Does user exist
    const userExists = await User.findById(userId).lean().exec();
    if (!userExists) {
        return res.status(400).json({ message: "UserId not found"});
    }

    //Check if inHouse
    if (!inHouse && !address) {
        return res.status(400).json({ message: "Must provide an address as an Out-of-House Active"})
    }
    //Check for duplicates
    const duplicateUser = await Active.findOne({ userId }).lean().exec();

    if (duplicateUser) {
        return res.status(409).json({message: "Duplicate Active User"});
    }

    const { encryptedData, iv } = encrypt(api_key);

    const activeObject = {userId, schoolYear, roles, team_number, courses, inHouse, address, "api_key": encryptedData, iv};

    //Create and store user
    const active = await Active.create(activeObject);

    if(active) { //It was created
        res.status(201).json({message: `New Active ${active._id} created from User ${userId}`});
    } else {
        res.status(400).json({message: 'Invalid user data recieved'});
    }

});

//@desc Update an active
//@route PATCH /actives
//@access Private
const updateActive = asyncHandler(async (req, res) => {
    const { activeId, userId, schoolYear, roles, team_number, courses, inHouse, address, api_key } = req.body;

    //Confirm data
    if(!activeId || !userId || !schoolYear || inHouse == null || !Array.isArray(roles) || !roles.length ) {
        return res.status(400).json({message: "All fields are required"});
    }
    //Check if inHouse
    if (!inHouse && !address) {
        return res.status(400).json({ message: "Must provide an address as an Out-of-House Active"})
    }

    const active = await Active.findById(activeId).exec();

    if (!active) {
        return res.status(400).json({message: "Active not found"});
    }

    //Check for duplicate name or email
    const duplicateActive = await Active.findById(userId).lean().exec();
    
    if (duplicateActive && duplicateActive?._id.toString() !== activeId) {
        return res.status(409).json({ message: 'Dupilcate Active User'});
    }

    //Encrypt API Key if provided
    if(api_key) {
        const { encryptedData, iv } = encrypt(api_key);
        active.api_key = encryptedData;
        active.iv = iv;
    }

    if (courses) {
        active.courses = courses;
    }

    active.userId = userId;
    active.schoolYear = schoolYear;
    active.roles = roles;
    active.team_number = team_number;
    active.inHouse = inHouse;
    active.address = address;

    const updatedActive = await active.save();

    res.json({message: `${updatedActive.userId} updated`});
});

//@desc Delete an active
//@route DELETE /actives
//@access Private
const deleteActive = asyncHandler(async (req, res) => {
    const { activeId } = req.body;
    console.log(activeId);

    if(!activeId) {
        return res.status(400).json({message: "Active ID is required"})
    }

    //Check if user is enrolled in a team
    const inTeam = await Team.findOne({ activeIds: activeId }).lean().exec();
    if(inTeam) {
        return res.status(400).json({ message: "Active is enrolled in one or more teams" });
    }

    //Check if user is enrolled in one or more courses
    const inCourses = await Course.findOne( {activeIds: activeId} ).lean().exec();
    if (inCourses) {
        return res.status(400).json( {message: "Active is enrolled in one or more Courses  "})
    }


    const active = await Active.findById(activeId).exec();

    if (!active) {
        return res.status(400).json( {message: "Active not found"} );
    }

    await active.deleteOne();

    const reply = 'Active deleted';
    res.json(reply);

});

module.exports = {
    getAllActives,
    createNewActive,
    updateActive,
    deleteActive
}
