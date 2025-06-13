const express = require('express');
const router = express.Router();
const activesController = require('../controllers/activesController');
const verifyJWT = require('../middleware/verifyJWT.js');

//router.use(verifyJWT);

router.route('/')
    .get(activesController.getAllActives)
    .post(activesController.createNewActive)
    .patch(activesController.updateActive)
    .delete(activesController.deleteActive)

module.exports = router