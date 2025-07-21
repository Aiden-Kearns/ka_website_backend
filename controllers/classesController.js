const Class = require('../models/classes.model');
const Active = require('../models/actives.model');
const { getFilteredCompletedCourses, getFilteredActiveCourses } = require('../services/classesService');
const asyncHandler = require('express-async-handler');
const fs = require('fs');

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
    const completedCourses = await getFilteredCompletedCourses(api_key);
    const activeCourses = await getFilteredActiveCourses(api_key);
    //fs.writeFileSync('grades.json', JSON.stringify(courses, null, 2), 'utf8');


    if (!completedCourses || !activeCourses) {
        return res.status(500).json({ message: "Failed to get course data from Canvas"});
    }

    //Update Classes in Database
    try {
        const bulkUpdateCompletedCourses = completedCourses.map(completedCourse => ({
            updateOne: {
                filter: { courseId: completedCourse.id},
                update: {
                    $set: {
                        courseId: completedCourse.id,
                        title: completedCourse.name,
                        activeIds: [activeId],
                        isActiveClass: false
                    }
                },
                upsert: true
            }
        }));

        await Class.bulkWrite(bulkUpdateCompletedCourses, { ordered: false});

        const bulkUpdateActiveCourses = activeCourses.map(activeCourse => ({
            updateOne: {
                filter: { courseId: activeCourse.id},
                update: {
                    $set: {
                        courseId: activeCourse.id,
                        title: activeCourse.name,
                        activeIds: [activeId],
                        isActiveClass: true
                    }
                },
                upsert: true
            }
        }));

        await Class.bulkWrite(bulkUpdateActiveCourses, { ordered: false});


    } catch (err) {
        return res.status(500).json({ message: "Error updating courses" });
    }


    return res.status(200).json({ message: "Courses Updated" });

    
});



module.exports = {
    getAllClasses,
    upsertClasses
}