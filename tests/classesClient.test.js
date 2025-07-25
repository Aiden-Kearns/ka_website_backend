const axios = require('axios');
const { getCompletedCourses, getActiveCourses } = require('../clients/classesClient');
const { getFilteredCompletedCourses, getFilteredActiveCourses } = require('../services/classesService');
const mockCoursesResponse = require('./fixtures/coursesApiResponseTest.json');


jest.mock('axios');

describe('Classes Client Tests', () => {

    //Happy path for Completed Courses
    test('getCompletedCourses Happy Path', async () => {
        axios.get.mockResolvedValue({ data: mockCoursesResponse});

        const result = await getCompletedCourses('fake-token');
        expect(result).toEqual(mockCoursesResponse);
    });

    //Sad path for completed courses
    test('getCompletedCourses Sad Path', async () => {
        const mockError = new Error('API is down');
        axios.get.mockRejectedValue(mockError);

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        await expect(getCompletedCourses('fake-token')).rejects.toThrow('API is down');

        expect(consoleSpy).toHaveBeenCalledWith(
        'Error fetching completed courses from Canvas',
        'API is down'
        );

        consoleSpy.mockRestore();
    });

    //Happy path for Active Courses
    test('getActiveCourses Happy Path', async () => {
        axios.get.mockResolvedValue({ data: mockCoursesResponse});

        const result = await getActiveCourses('fake-token');
        expect(result).toEqual(mockCoursesResponse);
    });

    //Sad path for active courses
    test('getActiveCourses Sad Path', async () => {
        const mockError = new Error('API is down');
        axios.get.mockRejectedValue(mockError);

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        await expect(getActiveCourses('fake-token')).rejects.toThrow('API is down');

        expect(consoleSpy).toHaveBeenCalledWith(
        'Error fetching active courses from Canvas',
        'API is down'
        );
        consoleSpy.mockRestore();
    });

});