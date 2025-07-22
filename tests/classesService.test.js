const { getFilteredCompletedCourses, getFilteredActiveCourses } = require('../services/classesService');
const classesClient = require('../clients/classesClient');

jest.mock('../clients/classesClient');

describe('Classes Service Tests', () => {
    //Happy path for getFilteredCompletedCourses
    test('getFilteredCompletedCourses Happy Path', async () => {

        const mockData = [
            { name: "Chemisty" },
            { name: "Math" },
            { name: "Chemisty" },
            { name: "Missouri Civics Exam" },
            { name:  "" },
            { name: "1234ABC-MISC-HONORS-2024-2025" }
        ]

        const mockFilteredData = [
            { name: "Chemisty" },
            { name: "Math" },
            { name: "Chemisty" }
        ]

        classesClient.getCompletedCourses.mockReturnValue(mockData);

        const result = await getFilteredCompletedCourses('test-token');

        expect(result).toEqual(mockFilteredData);
        expect(classesClient.getCompletedCourses).toHaveBeenCalledWith('test-token');

    });

    //Sad Path for getFilteredCompletedCourses
    test('getFilteredCompletedCourses Sad Path', async () => {
        const mockError = new Error('Service is down');
        classesClient.getCompletedCourses.mockRejectedValue(mockError);

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        await expect(getFilteredCompletedCourses('fake-token')).rejects.toThrow('Service is down');

        expect(consoleSpy).toHaveBeenCalledWith(
            'Error filtering Completed Courses from Canvas',
            'Service is down'
        )

        consoleSpy.mockRestore();
    });

    //Happy path for getFilteredActiveCourses
    test('getActiveCompletedCourses Happy Path', async () => {

        const mockData = [
            { name: "Chemisty" },
            { name: "Math" },
            { name: "Chemisty" },
            { name: "Missouri Civics Exam" },
            { name:  "" },
            { name: "1234ABC-MISC-HONORS-2024-2025" }
        ]

        const mockFilteredData = [
            { name: "Chemisty" },
            { name: "Math" },
            { name: "Chemisty" }
        ]

        classesClient.getActiveCourses.mockReturnValue(mockData);

        const result = await getFilteredActiveCourses('test-token');

        expect(result).toEqual(mockFilteredData);
        expect(classesClient.getActiveCourses).toHaveBeenCalledWith('test-token');

    });

    //Sad Path for getFilteredActiveCourses
    test('getFilteredCompletedCourses Sad Path', async () => {
        const mockError = new Error('Service is down');
        classesClient.getActiveCourses.mockRejectedValue(mockError);

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        await expect(getFilteredActiveCourses('fake-token')).rejects.toThrow('Service is down');

        expect(consoleSpy).toHaveBeenCalledWith(
            'Error filtering Active Courses from Canvas',
            'Service is down'
        )

        consoleSpy.mockRestore();
    });
});