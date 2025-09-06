const Course = require('../models/courses.model');
const Active = require('../models/actives.model');
const Grade = require('../models/grade.model');
const { getFilteredCourses } = require('../services/coursesService');
const asyncHandler = require('express-async-handler');
const { decrypt } = require('../services/encryptionService');
const { default: mongoose } = require('mongoose');
//const fs = require('fs');

// @desc Get all courses
// @route GET /courses
// @access Private
const getAllCourses = asyncHandler(async (req, res) => {
    const courses = await Course.find().lean();
    if(!courses?.length) {
        return res.status(400).json({message: "No courses found"});
    }
    return res.json(courses);
});

const getActivesCourses = asyncHandler(async (req, res) => {
    const { activeId } = req.params;
    if (!activeId) {
        return res.status(400).json({ message: "Active ID is Required"});
    }

    const courses = await Course.find({ activeIds: activeId }).lean();
    if(!courses?.length) {
        return res.status(400).json({message: "No courses found for this Active"})
    }
    return res.json(courses);
});


//@desc Add or update courses for an active
//@route POST /courses
//@access Private
const upsertCourses = asyncHandler(async (req, res) => {
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
            throw new Error(`Active does not exist: ${request.activeId}`);
        }

        //Decrypt API Key
        const decryptedApiKey = decrypt(request.api_key, request.iv);
        if(!decryptedApiKey) {
            throw new Error('Failed to decrypt API Key');
        }

        //Get Filtered Courses for every API Key
        const courses = await getFilteredCourses(decryptedApiKey);

        if (!courses) {
            throw new Error(`Failed to get course data from Canvas Service for Active ${request.activeId}`);
        }
        //Update Courses in Database

        try {
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

            //Save Courses in database
            await Course.bulkWrite(bulkUpdateCourses, { ordered: false });

            // --- Phase 3: Bulk Upsert Grades (using _id) ---
            const bulkUpdateGrades = courses.map(course => {
                return {
                    updateOne: {
                        filter: {
                            activeId: request.activeId,
                            courseId: course.id
                        },
                        update: {
                            $set: {
                                // Populate initial grade data
                                currentScore: course.enrollments.computed_current_score,
                                finalScore: course.enrollments.computed_final_score,
                                currentLetterGrade: course.enrollments.computed_current_grade,
                                finalLetterGrade: course.enrollments.computed_final_grade
                            },
                            $setOnInsert: {
                                activeId: request.activeId,
                                courseId: course.id
                            }
                        },
                        upsert: true
                    }
                };
            });

            await Grade.bulkWrite(bulkUpdateGrades, { ordered: false });

        } catch (error) {
            console.error('Course and/or Grades failed to save');
            throw error;
        }
    }));
    return res.status(200).json({ message: `Successfully upserted Courses and Grades for Active ${requests.activeId}` });
});

module.exports = {
    getAllCourses,
    upsertCourses
}