const axios = require('axios');
const fs = require('fs');

const getCompletedCourses = async (token) => {
    try {
        const courses = await axios.get(`${process.env.CANVAS_URL}/api/v1/courses`, {
        headers: {
            'Authorization': `Bearer ${token}`
        },
        params: {
            include: ['total_scores'],
            enrollment_state: "completed",
            per_page: 100
        }});
        //fs.writeFileSync('active_grades.json', JSON.stringify(courses.data, null, 2), 'utf-8');
        
        return courses.data;
    }
    catch (err) {
    console.error('Error fetching all courses from Canvas');
    throw err;
    }
}

const getActiveCourses = async (token) => {
    try {
        const courses = await axios.get(`${process.env.CANVAS_URL}/api/v1/courses`, {
        headers: {
            'Authorization': `Bearer ${token}`
        },
        params: {
            include: ['total_scores'],
            enrollment_state: "active",
            per_page: 100
        }});        
        return courses.data;
    }
    catch (err) {
    console.error('Error fetching active courses from Canvas');
    throw err;
    }
}

module.exports = {
    getCompletedCourses,
    getActiveCourses
}
