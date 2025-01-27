const User = require('../models/users.model');
const Class = require('../models/classes.model.js');
const Team = require('../models/team.model.js');
const Active = require('../models/actives.model.js');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt'); 

//@desc Get all teams
//@route GET /teams
//@access Private
const getAllTeams = asyncHandler(async (req, res) => {
    const teams = await Team.find().lean();
    if (!teams?.length) {
        return res.status(400).json({ message: "No teams found"});
    } 
    return res.json(teams);
})

//@desc Create new team
//@route POST /teams
//@access Private
const createNewTeam = asyncHandler(async (req, res) => {
    const { name, members, isActive } = req.body;

    //Confirm Data
    if (!name || !Array.isArray(members) || !members.length || isActive == null) {
        return res.status(400).json({ message: "All fields required"});
    }

    //Check for Active status
    const areActives = await Active.find({
        _id: { $in: members }
    }).lean().exec();

    if (areActives.length !== members.length) {
        return res.status(400).json({ message: "Team members must be Actives"})
    }

    //Check for duplicates
    const duplicate = await Team.findOne({ name }).lean().exec();
    if (duplicate) {
        return res.status(400).json({message: "Duplicate Team Name"})
    }

    //Create and store team object
    const teamObject = { name, members, isActive };
    const team = Team.create(teamObject);

    if (team) {
        return res.status(201).json({ message: `New Team: ${name} Created`});
    } else {
        return res.status(400).json({ message: 'Invalid user data recieved'});
    }
})
// @desc Update a team
// @route PATCH /teams
// @access Private
const updateTeam = asyncHandler(async (req, res) => {
    const { name, members, isActive, id } = req.body;

    //Confirm Data
    if (!name || !Array.isArray(members) || !members.length || isActive == null || typeof isActive !== 'boolean' || !id ) {
        return res.status(400).json({ message: "All fields required"});
    }

    //Check if team exists
    const team = await Team.findById(id).exec();
    if (!team) {
        return res.status(400).json({ message: 'Team not found' });
    }

    //Check for Active status
    const areActives = await Active.find({
        _id: { $in: members }
    }).lean().exec();

    if (areActives.length !== members.length) {
        return res.status(400).json({ message: "Team members must be Actives"})
    }

    //Check for dulicate
    const duplicate = await Team.findOne({ name }).lean().exec();
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate Team Name' });
    }

    team.name = name;
    team.members = members;
    team.isActive = isActive;

    const updatedTeam = await team.save();

    return res.json({ message: `${updatedTeam.name} updated`});

})

// @desc Delete a team
// @route DELETE /users
// @access Private
const deleteTeam = asyncHandler(async (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ message: "Team ID is required"});
    }

    //Check if team is Active
    const isActive = await Team.findOne({ isActive: true}).lean().exec();
    if (isActive) {
        return res.status(400).json({message: "Team is active"});
    }

    const team = await Team.findById(id).exec();

    if (!team) {
        return res.status(400).json({ message: "Team not found"});
    }

    await team.deleteOne();

    const reply = "Team deleted";
    res.json(reply);

    
})


module.exports = {
    getAllTeams,
    createNewTeam,
    updateTeam,
    deleteTeam
}

