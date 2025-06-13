const User = require('../models/users.model');
const Class = require('../models/classes.model.js');
const Team = require('../models/team.model.js');
const Active = require('../models/actives.model.js');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt'); 
const { default: mongoose } = require('mongoose');

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
    const { userId, schoolYear, team_number, classes, inHouse, address, roles, api_key } = req.body;

    //Confirm Data
    if (!userId ||!schoolYear || inHouse == null || !Array.isArray(roles) || !roles.length || !api_key) {
        return res.status(400).json({message: "All fields are required"});
    }

    //Does user exist
    const userExists = await User.findById(userId).lean().exec();
    if (!userExists) {
        return res.status(400).json({ message: "UserId not found"});
    }

    //Is userId already tied to an active
    const checkUserReference = await Active.findById(userId);
    if (checkUserReference) {
        return res.status(409).json({ message: "UserId is already associated with an Active "});
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

    //Hash API Key
    const hashedApiKey = await bcrypt.hash(api_key, 10); //10 salt rounds
    
    const activeObject = {userId, schoolYear, roles, team_number, classes, inHouse, address, "api_key": hashedApiKey};

    //Create and store user
    const active = await Active.create(activeObject);

    if(active) { //It was created
        res.status(201).json({message: `New Active from user ${userId} created`});
    } else {
        res.status(400).json({message: 'Invalid user data recieved'});
    }

});

//@desc Update an active
//@route PATCH /actives
//@access Private
const updateActive = asyncHandler(async (req, res) => {
    const { activeIdString, userIdString, schoolYear, roles, team_number, classes, inHouse, address, api_key } = req.body;

    console.log(activeIdString, userIdString, schoolYear);

    //Confirm data
    if(!activeIdString || !userIdString || !schoolYear || inHouse == null || !Array.isArray(roles) || !roles.length ) {
        return res.status(400).json({message: "All fields are required"});
    }
    //Check if inHouse
    if (!inHouse && !address) {
        return res.status(400).json({ message: "Must provide an address as an Out-of-House Active"})
    }

    const activeId = new mongoose.Types.ObjectId(`${activeIdString}`);
    const userId = new mongoose.Types.ObjectId(`${userIdString}`);

    //const userId = "123456"

    const active = await Active.findById(activeIdString).exec();

    if (!active) {
        return res.status(400).json({message: "Active not found"});
    }

    //Check for duplicate name or email
    const duplicateActive = await Active.findById(userIdString).lean().exec();
    
    if (duplicateActive && duplicateActive?._id.toString() !== activeId) {
        return res.status(409).json({ message: 'Dupilcate Active User'});
    }

    //Hash API Key if provided
    if(api_key) {
        active.api_key = await bcrypt.hash(api_key, 10); //10 salt rounds
    }

    if (classes) {
        active.classes = classes;
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
//@route DELETE /active
//@access Private
const deleteActive = asyncHandler(async (req, res) => {
    const { activeIdString } = req.body;

    if(!activeIdString) {
        return res.status(400).json({message: "Active ID is required"})
    }

    //Check if user is enrolled in a team
    const team = await Team.findOne({ members: id }).lean().exec();
    if(team) {
        return res.status(400).json({ message: "Active is enrolled in one or more teams" });
    }

    //Check if user is enrolled in one or more classes
    const classes = await Class.find( {activesEnrolled: id} ).lean().exec();
    if (classes?.length) {
        return res.status(400).json( {message: "Active is enrolled in one or more classes  "})
    }


    const active = await Active.findById(activeIdString).exec();

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
