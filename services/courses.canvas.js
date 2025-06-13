const axios = require('axios');
//const fs = require('fs');



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
    try {
        const response = await axios.post((`${process.env.CANVAS_URL}/api/graphql`), data,{
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log(response.data);

        //fs.writeFileSync('courses.json', JSON.stringify(response.data, null, 2), 'utf8');

        return response.data;
    } catch (err) {
        console.error('Error fetching courses from Canvas');
        throw err;
    }
}

module.exports = getCourses



