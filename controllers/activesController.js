const User = require('../models/users.model');
const Class = require('../models/classes.model.js');
const Team = require('../models/team.model.js');
const Active = require('../models/actives.model.js');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt'); 

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
    const { user, schoolYear, team_number, classes, inHouse, address, roles, api_key } = req.body;

    //Confirm Data
    if (!user ||!schoolYear || inHouse == null || !Array.isArray(roles) || !roles.length) {
        return res.status(400).json({message: "All fields are required"});
    }

    //Check if inHouse
    if (!inHouse && !address) {
        return res.status(400).json({ message: "Must provide an address as an Out-of-House Active"})
    }
    //Check for duplicates
    const duplicateUser = await Active.findOne({ user }).lean().exec();

    if (duplicateUser) {
        return res.status(409).json({message: "Duplicate Active User"});
    }

    const activeObject = {user, schoolYear, roles, team_number, classes, inHouse, address, api_key}

    //Create and store user
    const active = await Active.create(activeObject);

    if(active) { //It was created
        res.status(201).json({message: `New Active from user ${user} created`});
    } else {
        res.status(400).json({message: 'Invalid user data recieved'});
    }

});

//@desc Update an active
//@route PATCH /actives
//@access Private
const updateActive = asyncHandler(async (req, res) => {
    const { user, schoolYear, roles, team_number, classes, inHouse, address, id, api_key } = req.body;

    //Confirm data
    if(!user || !id || !schoolYear || inHouse == null || !Array.isArray(roles) || !roles.length ) {
        return res.status(400).json({message: "All fields are required"});
    }
    //Check if inHouse
    if (!inHouse && !address) {
        return res.status(400).json({ message: "Must provide an address as an Out-of-House Active"})
    }

    const active = await Active.findById(id).exec();

    if (!active) {
        return res.status(400).json({message: "Active not found"});
    }

    //Check for duplicate name or email
    const duplicateActive = await Active.findOne({ user }).lean().exec();
    
    if (duplicateActive && duplicateActive?._id.toString() !== id) {
        return res.status(409).json({ message: 'Dupilcate Active User'});
    }

    active.user = user;
    active.schoolYear = schoolYear;
    active.roles = roles;
    active.team_number = team_number;
    active.classes = classes;
    active.inHouse = inHouse;
    active.address = address;
    active.api_key = api_key;

    const updatedActive = await active.save();

    res.json({message: `${updatedActive.user} updated`});
});

//@desc Delete an active
//@route DELETE /active
//@access Private
const deleteActive = asyncHandler(async (req, res) => {
    const { id } = req.body;

    if(!id) {
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


    const active = await Active.findById(id).exec();

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
