const axios = require('axios');
//const fs = require('fs');

const query = `
  query {
    allCourses {
        _id
        name
        term {
            sisTermId
        }
    }
}`;

// const getCourses = async (token) => {
//   try {
//     const response = await axios.post(
//       'https://umsystem.instructure.com/api/graphql',
//       { query },
//       {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       }
//     );
//     return response.data.data.allCourses;
//   } catch (err) {
//     console.error('Error fetching courses from Canvas:', err.message);
//     throw err;
//   }
// };






const getCourses = async (token) => {
    try {
        const courses = await axios.get(`${process.env.CANVAS_URL}/api/v1/courses`, {
        headers: {
            'Authorization': `Bearer ${token}`
        },
        params: {
            include: ['total_scores', 'term'],
            per_page: 100
        }});
        //fs.writeFileSync('active_grades_REST.json', JSON.stringify(courses.data, null, 2), 'utf-8');
        return courses.data;
    }
    catch (err) {
        console.error('Error fetching completed courses from Canvas', err.message);
        throw err;
    }
}

// const getActiveCourses = async (token) => {
//     try {
//         const courses = await axios.get(`${process.env.CANVAS_URL}/api/v1/courses`, {
//         headers: {
//             'Authorization': `Bearer ${token}`
//         },
//         params: {
//             include: ['total_scores'],
//             enrollment_state: "active",
//             per_page: 100
//         }});        
//         return courses.data;
//     }
//     catch (err) {
//         console.error('Error fetching active courses from Canvas', err.message);
//         throw err;
//     }
// }




module.exports = {
    getCourses
}
