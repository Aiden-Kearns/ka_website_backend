const axios = require('axios');
const fs = require('fs');



const data = {
    query: `
        query getCourses {
            allCourses {
                _id
                name
                courseNickname
                term {
                    name
                }
            }
        }
    `
};

const getCourses = async (token) => {
    console.log(token);
    try {
        const courses = await axios.get(`${process.env.CANVAS_URL}/api/v1/courses`, {
        headers: {
            'Authorization': `Bearer ${token}`
        },
        params: {
            include: ['total_scores']
        }});
        return courses.data;
        console.log(courses.data);
        fs.writeFileSync('grades.json', JSON.stringify(courses.data, null, 2), 'utf8');
    }
    catch (err) {
    console.error('Error fetching all courses from Canvas');
    throw err;
    }
}

module.exports = getCourses



