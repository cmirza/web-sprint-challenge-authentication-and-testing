// Write your tests here
test('sanity', () => {
  expect(true).toBe(true)
});

const request = require('supertest');
const server = require('./server');
const db = require('../data/dbConfig');

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
});

beforeEach(async () => {
  await db('users').truncate();
});

afterAll(async () => {
  await db.destroy();
});

const userA = { username: '21Savage', password: 'password' };
const userB = { username: 'LilYachty', password: 'password' };

describe('server endpoints', () => {
  describe('[POST] /api/auth/register', () => {
    it('respond with 201 on success', async () => {
      const res = await request(server).post('/api/auth/register').send(userA);
      expect(res.status).toBe(201);
    });
    it('respond with new user', async () => {
      let res;

      res = await request(server).post('/api/auth/register').send(userB);
      expect(res.body.username).toBe(userB.username);

      res = await request(server).post('/api/auth/register').send(userA);
      expect(res.body.username).toBe(userA.username);
    });
  });

  describe('[POST] /api/auth/login', () => {
    it('respond with 200 on success', async () => {
      await request(server).post('/api/auth/register').send(userA);
      const res = await request(server).post('/api/auth/login').send(userA);
      expect(res.status).toBe(200);
    });
    it('respond with welcome message', async () => {
      let res;

      await request(server).post('/api/auth/register').send(userB);
      res = await request(server).post('/api/auth/login').send(userB);
      expect(res.body.message).toBe(`Welcome, ${userB.username}`);

      await request(server).post('/api/auth/register').send(userA);
      res = await request(server).post('/api/auth/login').send(userA);
      expect(res.body.message).toBe(`Welcome, ${userA.username}`);
    });
  });

  describe('[GET] /api/jokes', () => {
    it('respond with 200 on success', async () => {
      let res;

      await request(server).post('/api/auth/register').send(userA);
      res = await request(server).post('/api/auth/login').send(userA);
      const token = res.body.token;
      res = await request(server).get('/api/jokes').set({ Authorization: token });
      expect(res.status).toBe(200);
    });
    it('token invalid response when sent bad token', async () => {
      const token = '23ij32lk4'
      const res = await request(server).get('/api/jokes').set({ Authorization: token });
      expect(res.body.message).toBe('token invalid');
    });
  });
});