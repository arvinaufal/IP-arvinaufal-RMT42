const app = require('../app');
const request = require('supertest');
const { User, sequelize } = require('../models');
const { queryInterface } = sequelize;

const user1 = {
  username: "usrOne",
  email: "userscxas@gmail.com",
  password: '11111',
  name: 'User 1',
};

const timeOut = 20000;
beforeAll(async () => {
  await User.create({...user1, email: 'sasascac@gmail.com', accountType: 'google'});
}, timeOut);

describe('/register', () => {
  describe('Positive Testing', () => {
    test('success register user', async () => {
      let { status, body } = await request(app)
        .post('/register')
        .send(user1);

      expect(status).toBe(201);
      expect(body).toBeInstanceOf(Object);
      expect(body).toHaveProperty("email", "user1@gmail.com");
      expect(body).toHaveProperty("role", "member");
      expect(body).toHaveProperty("id");
    }, timeOut);
  });

  describe('Negative Testing', () => {
    test('failed register with empty username', async () => {
      let { status, body } = await request(app)
        .post('/register')
        .send({ email: 'test@mail.com', password: '111111' });

      expect(status).toBe(400);
      expect(body).toBeInstanceOf(Object);
      expect(body).toHaveProperty("message", ["Username is required!"]);
    }, timeOut);

    test('failed register with empty email', async () => {
      let { status, body } = await request(app)
        .post('/register')
        .send({ username: 'testUsn', password: '111111' });

      expect(status).toBe(400);
      expect(body).toBeInstanceOf(Object);
      expect(body).toHaveProperty("message", ["Email is required!"]);
    }, timeOut);

    test('failed register with empty password', async () => {
      let { status, body } = await request(app)
        .post('/register')
        .send({ username: 'testUsn', email: 'testing123@gmail.com' });

      expect(status).toBe(400);
      expect(body).toBeInstanceOf(Object);
      expect(body).toHaveProperty("message", ["Password is required!"]);
    }, timeOut);

    test('failed register with existing email', async () => {
      let { status, body } = await request(app)
        .post('/register')
        .send({ ...user1 });

      expect(status).toBe(400);
      expect(body).toBeInstanceOf(Object);
      expect(body).toHaveProperty("message", ["email must be unique"]);
    }, timeOut);
  });
});

describe('/login', () => {
  describe('Positive Testing', () => {
    test('success login with google account', async () => {
      let { status, body } = await request(app)
        .post('/login-google')
        .set("g_token", process.env.APP_USER_GMAIL_LOGIN_CREDENTIAL);

      expect(status).toBe(201);
      expect(body).toBeInstanceOf(Object);
    }, timeOut);

    test('success login with new user', async () => {
      let { status, body } = await request(app)
        .post('/login')
        .send(user1);

      expect(status).toBe(200);
      expect(body).toBeInstanceOf(Object);
      expect(body).toHaveProperty("email", "user1@gmail.com");
      expect(body).toHaveProperty("role", "member");
      expect(body).toHaveProperty("access_token", expect.any(String));
    }, timeOut);
  });

  describe('Negative Testing', () => {
    test('failed login with empty email', async () => {
      let { status, body } = await request(app)
        .post('/login')
        .send({ password: '111111' });

      expect(status).toBe(400);
      expect(body).toBeInstanceOf(Object);
      expect(body).toHaveProperty("message", "Email is required");
    }, timeOut);

    test('failed login with empty password', async () => {
      let { status, body } = await request(app)
        .post('/login')
        .send({ email: 'testing123@gmail.com' });

      expect(status).toBe(400);
      expect(body).toBeInstanceOf(Object);
      expect(body).toHaveProperty("message", "Password is required");
    }, timeOut);

    test('failed manual login with google account', async () => {
      let { status, body } = await request(app)
        .post('/login')
        .send({...user1, email: 'user2@gmail.com'});

      expect(status).toBe(400);
      expect(body).toBeInstanceOf(Object);
      expect(body).toHaveProperty("message", "Use your Google account to login");
    }, timeOut);

    test('failed login with unregistered  user/email invalid', async () => {
      let { status, body } = await request(app)
        .post('/login')
        .send({ ...user1, email: 'ddsd@dasa.sadads' });

      expect(status).toBe(401);
      expect(body).toBeInstanceOf(Object);
      expect(body).toHaveProperty("message", expect.any(String));
    }, timeOut);

    test('failed login with invalid/unmatched password', async () => {
      let { status, body } = await request(app)
        .post('/login')
        .send({ ...user1, password: '22222222' });

      expect(status).toBe(401);
      expect(body).toBeInstanceOf(Object);
      expect(body).toHaveProperty("message", "Invalid Email/Password!");
    }, timeOut);

    test('failed login with google account but invalid token', async () => {
      let { status, body } = await request(app)
        .post('/login-google')
        .set("g_token", ` thetoken`);

      expect(status).toBe(500);
      expect(body).toBeInstanceOf(Object);
    }, timeOut);

  });
});


afterAll(async () => {
  await queryInterface.bulkDelete('Users', null, {
    truncate: true,
    cascade: true,
    restartIdentity: true
  });
});