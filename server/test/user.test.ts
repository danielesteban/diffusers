import app from './core/app';

const user: {
  email: string;
  name: string;
  password: string;
  session?: string;
} = {
  email: 'test@example.com',
  name: 'TestUser',
  password: 'TestUserPassword',
};

describe('Sign-up', () => {
  test('POST /user without params should return a 422', () => (
    app
      .post('/user')
      .expect(422)
  ));
  test('POST /user should return a new session', () => (
    app
      .post('/user')
      .send({
        email: user.email,
        name: user.name,
        password: user.password,
      })
      .expect(200)
      .then(({ body }) => {
        expect(body.name).toBe(user.name);
        expect(body.session).toBeTruthy();
        user.session = body.session;
      })
  ));
  test('POST /user with an existing email should return a 400', () => (
    app
      .post('/user')
      .send({
        email: user.email,
        name: user.name,
        password: user.password,
      })
      .expect(400)
  ));
});

describe('Sign-in', () => {
  test('PUT /user without params should return a 422', () => (
    app
      .put('/user')
      .expect(422)
  ));
  test('PUT /user with a bad password should return a 401', () => (
    app
      .put('/user')
      .send({
        email: user.email,
        password: 'badpassword',
      })
      .expect(401)
  ));
  test('PUT /user should return a new session', () => (
    app
      .put('/user')
      .send({
        email: user.email,
        password: user.password,
      })
      .expect(200)
      .then(({ body }) => {
        expect(body.name).toBe(user.name);
        expect(body.session).toBeTruthy();
      })
  ));
});

describe('Refresh Session', () => {
  test('GET /user without a token should return a 401', () => (
    app
      .get('/user')
      .expect(401)
  ));
  test('GET /user should return a session token', () => (
    app
      .get('/user')
      .set('Authorization', `Bearer ${user.session}`)
      .expect(200)
      .then(({ body }) => {
        expect(body.name).toBe(user.name);
        expect(body.session).toBeTruthy();
      })
  ));
});
