const express = require('express');
const router = express.Router();
const classesController = require('../controllers/classesController.js');
const verifyJWT = require('../middleware/verifyJWT.js');

//router.use(verifyJWT);

router.route('/')
    .get(classesController.getAllClasses)
    .post(classesController.upsertClasses)





module.exports = router
