const axios = require('axios');

const getCourses = async (token) => {
    try {
        const response = await axios.get((`${process.env.CANVAS_URL}/api/v1/courses`), {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            params: {
                'enrollment_state': 'active',
                'enrollment_type': 'student',
                "include[]": "total_scores"
            }
        })
        return response.data;
    } catch (err) {
        console.error('Error fetching courses from Canvas');
        throw err;
    }
}

module.exports = getCourses



