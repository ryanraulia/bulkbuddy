const request = require('supertest');
const app = require('../index'); // Import your Express app
const db = require('../config/database'); // Import your database connection
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/auth');

describe('BulkBuddy System Tests', () => {
  let token;

  beforeAll(async () => {
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('testpassword', 10);

    // Insert the test user and capture the insertId
    const [result] = await db.promise().query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      ['Test User', 'testuser@example.com', hashedPassword, 'user']
    );
    const insertedId = result.insertId;

    // Generate a JWT token with the real user ID
    token = jwt.sign(
      { id: insertedId, email: 'testuser@example.com', role: 'user' },
      JWT_SECRET,
      { expiresIn: '1d' }
    );
  });

  afterAll(async () => {
    // Clean up the test user from the database
    await db.promise().query("DELETE FROM users WHERE email = ?", ['testuser@example.com']);
    db.end();
  });

  describe('Authentication Endpoints', () => {
    it('should sign up a new user', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'New User',
          email: 'newuser@example.com',
          password: 'newpassword'
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.message).toBe('User created successfully');
    });

    it('should log in an existing user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'testpassword'
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.user.email).toBe('testuser@example.com');
    });

    it('should return user details for authenticated requests', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', `jwt=${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.email).toBe('testuser@example.com');
    });
  });

  describe('Recipe Endpoints', () => {
    it('should fetch random recipes', async () => {
      const response = await request(app).get('/api/recipes/random');
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should search for recipes', async () => {
      const response = await request(app)
        .get('/api/recipes/search')
        .query({ query: 'chicken' });

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should fetch user-submitted recipes', async () => {
      const response = await request(app)
        .get('/api/recipes/user')
        .set('Cookie', `jwt=${token}`);

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Meal Plan Endpoints', () => {
    it('should generate a meal plan', async () => {
      const response = await request(app)
        .get('/api/mealplan')
        .query({
          targetCalories: 2000,
          timeFrame: 'day'
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.meals).toBeDefined();
    });

    it('should handle invalid meal plan requests', async () => {
      const response = await request(app)
        .get('/api/mealplan')
        .query({
          targetCalories: 2000,
          exclude: 'invalid_ingredient'
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('User Recipe Endpoints', () => {
    it('should allow a user to submit a recipe', async () => {
      const response = await request(app)
        .post('/api/user/recipes/submit')
        .set('Cookie', `jwt=${token}`)
        .send({
          title: 'Test Recipe',
          instructions: 'Mix ingredients and cook.',
          calories: 500,
          protein: 20,
          fat: 10,
          carbs: 50,
          ingredients: JSON.stringify([
            { amount: 1, unit: 'cup', name: 'rice' },
            { amount: 2, unit: 'tbsp', name: 'soy sauce' }
          ])
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should fetch user-specific recipes', async () => {
      const response = await request(app)
        .get('/api/user/recipes/user-specific')
        .set('Cookie', `jwt=${token}`);

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should delete a user recipe', async () => {
      // Submit a recipe to delete
      const submitResponse = await request(app)
        .post('/api/user/recipes/submit')
        .set('Cookie', `jwt=${token}`)
        .send({
          title: 'Recipe to Delete',
          instructions: 'Delete this recipe.',
          calories: 300,
          protein: 10,
          fat: 5,
          carbs: 40,
          ingredients: JSON.stringify([
            { amount: 1, unit: 'cup', name: 'pasta' }
          ])
        });

      const recipeId = submitResponse.body.recipeId;

      // Delete the recipe
      const deleteResponse = await request(app)
        .delete(`/api/user/recipes/delete/${recipeId}`)
        .set('Cookie', `jwt=${token}`);

      expect(deleteResponse.statusCode).toBe(200);
      expect(deleteResponse.body.success).toBe(true);
    });
  });
});