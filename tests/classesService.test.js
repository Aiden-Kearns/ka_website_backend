const { getFilteredCompletedCourses, getFilteredActiveCourses } = require('../services/classesService');
const mockCoursesResponse = require('./fixtures/coursesApiResponse.json');
const mockExcludedCourses = require('./fixtures/excludedCoursesTest.json');

describe('Classes Service Test', () => {

    //Happy Path for getFilteredCompletedCourses
    test('Should return filtered courses', async () => {
        const result = getFilteredCompletedCourses()

        
    })
})