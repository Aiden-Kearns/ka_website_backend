const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const verifyJWT = require('../middleware/verifyJWT.js');

router.route('/')
    .post(usersController.createNewUser)

router.use(verifyJWT);

router.route('/')
    .get(usersController.getAllUsers)
    //.post(usersController.createNewUser)
    .patch(usersController.updateUser)
    .delete(usersController.deleteUser)

module.exports = router
