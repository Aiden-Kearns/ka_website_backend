const express = require('express');
const router = express.Router();
const coursesController = require('../controllers/coursesController.js');
const verifyJWT = require('../middleware/verifyJWT.js');

router.use(verifyJWT);

router.route('/')
    .get(coursesController.getAllCourses)
    .post(coursesController.upsertCourses)





module.exports = router
