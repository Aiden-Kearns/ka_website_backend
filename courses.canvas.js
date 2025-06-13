const axios = require('axios');
const fs = require('fs');
const { get } = require('http');
const dotenv = require('dotenv');
const { count } = require('console');
dotenv.config(); // Load environment variables from .env file

/*
const getCourses = async (token) => {
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
        `
    };
    try {
        const response = await axios.post((`${process.env.CANVAS_URL}/api/graphql`), data,{
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const courses = response.data.data.allCourses;

        //fs.writeFileSync('courses.json', JSON.stringify(response.data, null, 2), 'utf8');

    } catch (err) {
        console.error('Error fetching courses from Canvas');
        throw err;
    }

    try {
        const requests = courses.map(async (course) => {
            const response = await axios.get(`${process.env.CANVAS_URL}/courses/${course._id}/`)
        })//this is where I stopped
        return courses
}
*/
const getCourses = async (token) => {
    try {
        const courses = await axios.get(`${process.env.CANVAS_URL}/api/v1/courses`, {
        headers: {
            'Authorization': `Bearer ${token}`
        },
        params: {
            include: ['total_scores']
        }});
        console.log(courses.data);
        fs.writeFileSync('grades.json', JSON.stringify(courses.data, null, 2), 'utf8');
    }
    catch (err) {
    console.error('Error fetching all courses from Canvas');
    throw err;
    }
}
getAllCourses('16765~NW7Z6f7EK8BAVCBVJ8wYe6ffhDyrGvhRTJUeMhPMXyxeGtPwV43c7JHt4BNymyBf');
//getCourses('16765~NW7Z6f7EK8BAVCBVJ8wYe6ffhDyrGvhRTJUeMhPMXyxeGtPwV43c7JHt4BNymyBf'); // This line is for testing purposes, you can remove it later

module.exports = getCourses



