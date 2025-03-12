const request = require('supertest');
const app = require('../index');
const axios = require('axios');

jest.mock('axios');

describe('Meal Plan API', () => {
  beforeEach(() => {
    axios.get.mockReset();
  });

  it('should include exclude parameter in Spoonacular request', async () => {
    const mockResponse = {
      data: {
        meals: [],
        nutrients: { calories: 2000 }
      }
    };
    axios.get.mockResolvedValue(mockResponse);

    const response = await request(app)
      .get('/api/mealplan')
      .query({
        targetCalories: 2000,
        exclude: 'nuts,dairy'
      });

    expect(axios.get).toHaveBeenCalledWith(
      'https://api.spoonacular.com/mealplanner/generate',
      expect.objectContaining({
        params: expect.objectContaining({
          exclude: 'nuts,dairy'
        })
      })
    );
  });

  it('should handle exclusion-related errors', async () => {
    const errorResponse = {
      response: {
        status: 400,
        data: { message: 'No meals found with given exclusions' }
      }
    };
    axios.get.mockRejectedValue(errorResponse);

    const response = await request(app)
      .get('/api/mealplan')
      .query({
        targetCalories: 2000,
        exclude: 'invalid_ingredient'
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      error: 'No meal plan found. Please adjust your filters or excluded ingredients.'
    });
  });

  it('should return exclude filter in response', async () => {
    const mockResponse = {
      data: {
        meals: [],
        nutrients: { calories: 2000 }
      }
    };
    axios.get.mockResolvedValue(mockResponse);

    const response = await request(app)
      .get('/api/mealplan')
      .query({
        targetCalories: 2000,
        exclude: 'gluten'
      });

    expect(response.body.filters.exclude).toBe('gluten');
  });
});