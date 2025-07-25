const User = require('../models/users.model');
const Class = require('../models/classes.model.js');
const Team = require('../models/team.model.js');
const Active = require('../models/actives.model.js');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt'); 

//@desc Get all users
//@route GET /users
//@access Private
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select('-password').lean();
    if (!users?.length) {
        return res.status(400).json({message: "No users found"});
    }
    return res.json(users);
});

//@desc Create new user
//@route POST /users
//@access Private
const createNewUser = asyncHandler(async (req, res) => {
    const { name, password, email, phoneNumber, memberStatus, roles, pledgeClass } = req.body;

    //Confirm Data
    if (!name || !password || !email || !phoneNumber || !memberStatus || !Array.isArray(roles) || !roles.length || !pledgeClass) {
        return res.status(400).json({message: "All fields are required"});
    }

    //Check for duplicates
    const duplicateName = await User.findOne({ name }).lean().exec();
    const duplicateEmail = await User.findOne({ email }).lean().exec();

    if (duplicateName || duplicateEmail) {
        return res.status(409).json({message: "Duplicate User Name or Email"});
    }

    //Hash Password
    const hashedPwd = await bcrypt.hash(password, 10); //10 salt rounds

    const userObject = { name, "password": hashedPwd, email, phoneNumber, roles, memberStatus, pledgeClass}

    //Create and store user
    const user = await User.create(userObject);

    if(user) { //It was created
        res.status(201).json({message: `New User: ${user._id} created`});
    } else {
        res.status(400).json({message: 'Invalid user data recieved'});
    }

});

//@desc Update a user
//@route PATCH /users
//@access Private
const updateUser = asyncHandler(async (req, res) => {
    const { name, password, email, phoneNumber, memberStatus, roles, id, pledgeClass, active } = req.body;

    //Confirm data
    if(!name || !email || !phoneNumber || !memberStatus || !Array.isArray(roles) || !roles.length || !id || !pledgeClass || typeof active !== 'boolean') {
        return res.status(400).json({message: "All fields are required"});
    }

    const user = await User.findById(id).exec();

    if (!user) {
        return res.status(400).json({message: "User not found"});
    }

    //Check for duplicate name or email
    const duplicateName = await User.findOne({ name }).lean().exec();
    const duplicateEmail = await User.findOne({ email }).lean().exec();
    
    if (duplicateName && duplicateName?._id.toString() !== id) {
        return res.status(409).json({ message: 'Dupilcate User Name'});
    }
    else if (duplicateEmail && duplicateEmail?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate User Email'});
    }

    user.name = name;
    user.email = email;
    user.roles = roles;
    user.memberStatus = memberStatus;
    user.pledgeClass = pledgeClass;
    user.phoneNumber = phoneNumber;
    user.active = active;

    //Change password only if provided
    if (password) {
        //Hash password
        user.password = await bcrypt.hash(password, 10); //10 salt rounds
    }

    const updatedUser = await user.save();

    res.json({message: `${updatedUser.name}:${updatedUser.email} updated`});
});

//@desc Delete a user
//@route DELETE /users
//@access Private
const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.body;

    if(!id) {
        return res.status(400).json({message: "User ID is required"})
    }

    //Check if user is an Active
    const active = await Active.findOne( {user: id }).lean().exec();
    if (active) {
        return res.status(400).json( {message: "User is an Active"} )
    }

    const user = await User.findById(id).exec();

    if (!user) {
        return res.status(400).json( {message: "User not found"} );
    }

    await user.deleteOne();

    const reply = 'User deleted';
    res.json(reply);

});

module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
}