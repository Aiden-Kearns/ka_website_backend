const Class = require('../models/classes.model');
const Active = require('../models/actives.model');
const { getFilteredCourses } = require('../services/classesService');
const asyncHandler = require('express-async-handler');
const { decrypt } = require('../services/encryptionService');
//const fs = require('fs');

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


//@desc Add or update classes for an active
//@route POST /classes
//@access Private
const upsertClasses = asyncHandler(async (req, res) => {
    //Check and Convert to an array as needed
    const requests = Array.isArray(req.body) ? req.body : [req.body];

    //Validate all requests
    for (const request of requests) {
        if (!request.activeId || !request.api_key || !request.iv) {
            return res.status(400).json({ message: "Each request must have an activeId, api_key, and iv"})
        }
    }

    await Promise.all(requests.map(async (request) => {
        //Check if active exists
        const active = await Active.findById(request.activeId).lean().exec();
        if (!active) {
            return new Error(`Active does not exist: ${request.activeId}`);
        }

        //Decrypt API Key
        const decryptedApiKey = decrypt(request.api_key, request.iv);

        //Get Filtered Courses for every API Key
        const courses = await getFilteredCourses(decryptedApiKey);

        if (!courses) {
            throw new Error(`Failed to get course data from Canvas Service for Active ${request.activeId}`);
        }
        //Update Classes in Database

        const bulkUpdateCourses = courses.map(course => {
            return {
                updateOne: {
                    filter: { courseId: course.id },
                    update: {
                        $set: {
                            courseId: course.id,
                            title: course.name,
                            term: course.term,
                            section: course.section
                        },
                        $addToSet: {
                            activeIds: request.activeId
                        }
                    },
                    upsert: true
                }
            };
        });

        await Class.bulkWrite(bulkUpdateCourses, { ordered: false});

        }));

    return res.status(200).json({ message: "Courses Updated" });

});


module.exports = {
    getAllClasses,
    upsertClasses
}