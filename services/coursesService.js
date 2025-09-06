const { getCourses } = require('../clients/coursesClient');
const excludedTermIds = require('./excludedCourses.json');



const getFilteredCourses = async (token) => {
    try {
        const courses = await getCourses(token);
        const filteredCourses = [];
        const courseNameRegex = /^(\d{4}(FS|SP))-([A-Z_]+(?:-[A-Z_]+)*-\d+)(?:-([A-Z0-9_]+(?:_[A-Z0-9_]+)*))?$/;        
        for(let i = 0; i < courses.length; i++) {
            const course = courses[i];
            if(!course.name || !course.id || course.term.name == 'Organizations' || course.term.name == 'Non-Credit'){
                continue
            }
            console.log(course.name);

            const match = course.name.match(courseNameRegex);

            if(match) {
                course.name = match[3];
                course.section = match[4];
            }

            course.term = course.term.name
            course.enrollments = course.enrollments[0];

            filteredCourses.push(course);
        }
        console.log(filteredCourses)
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



