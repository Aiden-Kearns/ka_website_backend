const { getCompletedCourses, getActiveCourses } = require('../clients/classesClient');
const excludedCourses = require('./excludedCourses.json');

const getFilteredCompletedCourses = async (token) => {
    try {
        const completedCourses = await getCompletedCourses(token);
        const filteredCompletedCourses = completedCourses.filter(completedCourse => completedCourse.name && !excludedCourses.some(excludedCourse => completedCourse.name.toLowerCase().includes(excludedCourse.toLowerCase())) );
        return filteredCompletedCourses;
    }
    catch (err) {
        console.error('Error filtering Completed Courses from Canvas');
        throw err;
    }
}

const getFilteredActiveCourses = async (token) => {
    try {
        const activeCourses = await getActiveCourses(token);
        const filteredActiveCourses = activeCourses.filter(activeCourses => activeCourses.name && !excludedCourses.some(excludedCourse => activeCourses.name.toLowerCase().includes(excludedCourse.toLowerCase())) );
        return filteredActiveCourses;
    }
    catch (err) {
        console.error('Error filtering Active Courses from Canvas');
        throw err;
    }
}



module.exports = {
    getFilteredCompletedCourses,
    getFilteredActiveCourses
}



