const { getCourses } = require('../clients/classesClient');
const excludedTermIds = require('./excludedCourses.json');

const getFilteredCourses = async (token) => {
    try {
        const courses = await getCourses(token);
        const filteredCourses = [];
        for(let i = 0; i < courses.length; i++) {
            const course = courses[i];
            if(!course.name || !course.id || course.term.name == 'ORG' || course.term.name == 'NONCREDIT'){
                continue
            }

            course.name = course.name.slice(7, -3)
            course.section = Number(course.name.slice(-3))
            course.term = course.term.name

            filteredCourses.push(course);
        }
        return filteredCourses;
    }
    catch (err) {
        console.error('Error filtering Canvas Courses', err.message);
        throw err;
    }
}

module.exports = {
    getFilteredCourses
}



