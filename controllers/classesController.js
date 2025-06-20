const Class = require('../models/classes.model');
const Active = require('../models/actives.model');
const getCourses = require('../services/courses.canvas');
const asyncHandler = require('express-async-handler');

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
    const { activeId, api_key } = req.body;
    if (!activeId || !api_key) {
        return res.status(400).json({ message: "Active ID and API Key are required"});
    }
    //Check if user exists
    const active = await Active.findById(activeId).lean().exec();
    if (!active) {
        return res.status(400).json({ message: "Active does not exist"});
    }

    //Update Classes from Canvas
    const courses = await getCourses(api_key);

    if (!courses) {
        return res.status(500).json({ message: "Failed to get course data from Canvas"});
    }
    console.log(courses);

    //Update Classes in Database

        const coursesData = courses.map(course => ({
            courseId: course.id,
            title: course.name,
            activeIds: [activeId],
            isGradedClass: true
            
        }));

    console.log(coursesData);

    try {
        const savePromises = coursesData.map(course =>
            Class.findOneAndUpdate(
                { courseId: course.courseId },
                { $set: course },
                { upsert: true, new: true, setDefaultsOnInsert: true }

            )
        );

        await Promise.all(savePromises);
    } catch (err) {
        return res.status(500).json({ message: "Internal Server Error" });
    }


    return res.status(200).json({ message: "Courses Updated" });

    
});

module.exports = {
    getAllClasses,
    upsertClasses
}