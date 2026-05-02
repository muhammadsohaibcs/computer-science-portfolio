/**
 * auth.service.test.js
 * 
 * Unit tests for authentication service
 * Tests registration, login, token rotation, logout, and password change
 */

const { expect } = require('chai');
const mongoose = require('mongoose');
const AuthService = require('../src/services/auth.service');
const UsersRepo = require('../src/repositories/users.repo');
const User = require('../src/models/user.model');
const config = require('../src/config/app.config');

describe('Authentication Service', function() {
  this.timeout(10000);

  before(async function() {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital_test', {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    }
  });

  afterEach(async function() {
    // Clean up test data
    await User.deleteMany({ username: /^test_/ });
  });

  after(async function() {
    await mongoose.connection.close();
  });

  describe('User Registration', function() {
    it('should register a new user with valid credentials', async function() {
      const userData = {
        username: 'test_user_001',
        password: 'Test@1234',
        role: 'Patient'
      };

      const user = await AuthService.register(userData);
      
      expect(user).to.exist;
      expect(user.username).to.equal(userData.username);
      expect(user.role).to.equal(userData.role);
      expect(user.passwordHash).to.exist;
      expect(user.passwordHash).to.not.equal(userData.password);
    });

    it('should throw error when registering duplicate username', async function() {
      const userData = {
        username: 'test_duplicate',
        password: 'Test@1234',
        role: 'Patient'
      };

      await AuthService.register(userData);
      
      try {
        await AuthService.register(userData);
        expect.fail('Should have thrown error for duplicate username');
      } catch (error) {
        expect(error.message).to.include('already exists');
      }
    });
  });

  describe('User Login', function() {
    beforeEach(async function() {
      // Create test user
      await AuthService.register({
        username: 'test_login_user',
        password: 'Test@1234',
        role: 'Doctor'
      });
    });

    it('should login with valid credentials', async function() {
      const result = await AuthService.login({
        username: 'test_login_user',
        password: 'Test@1234',
        ip: '127.0.0.1',
        device: 'Test Device'
      });

      expect(result).to.exist;
      expect(result.accessToken).to.exist;
      expect(result.refreshToken).to.exist;
      expect(result.role).to.equal('Doctor');
      expect(result.user).to.exist;
      expect(result.user.username).to.equal('test_login_user');
    });

    it('should throw error with invalid username', async function() {
      try {
        await AuthService.login({
          username: 'nonexistent_user',
          password: 'Test@1234'
        });
        expect.fail('Should have thrown error for invalid username');
      } catch (error) {
        expect(error.message).to.include('Invalid credentials');
      }
    });

    it('should throw error with invalid password', async function() {
      try {
        await AuthService.login({
          username: 'test_login_user',
          password: 'WrongPassword123!'
        });
        expect.fail('Should have thrown error for invalid password');
      } catch (error) {
        expect(error.message).to.include('Invalid credentials');
      }
    });
  });

  describe('Password Change', function() {
    let testUserId;

    beforeEach(async function() {
      const user = await AuthService.register({
        username: 'test_password_change',
        password: 'OldPass@123',
        role: 'Patient'
      });
      testUserId = user._id;
    });

    it('should change password with valid current password', async function() {
      const result = await AuthService.changePassword(
        testUserId,
        'OldPass@123',
        'NewPass@456'
      );

      expect(result.success).to.be.true;

      // Verify can login with new password
      const loginResult = await AuthService.login({
        username: 'test_password_change',
        password: 'NewPass@456'
      });
      expect(loginResult.accessToken).to.exist;
    });

    it('should throw error with incorrect current password', async function() {
      try {
        await AuthService.changePassword(
          testUserId,
          'WrongOldPass@123',
          'NewPass@456'
        );
        expect.fail('Should have thrown error for incorrect current password');
      } catch (error) {
        expect(error.message).to.include('Invalid current password');
      }
    });

    it('should throw error when new password same as current', async function() {
      try {
        await AuthService.changePassword(
          testUserId,
          'OldPass@123',
          'OldPass@123'
        );
        expect.fail('Should have thrown error for same password');
      } catch (error) {
        expect(error.message).to.include('must be different');
      }
    });
  });

  describe('Refresh Token Rotation', function() {
    let refreshToken;

    beforeEach(async function() {
      await AuthService.register({
        username: 'test_refresh_user',
        password: 'Test@1234',
        role: 'Doctor'
      });

      const loginResult = await AuthService.login({
        username: 'test_refresh_user',
        password: 'Test@1234'
      });
      refreshToken = loginResult.refreshToken;
    });

    it('should rotate refresh token successfully', async function() {
      const result = await AuthService.rotateRefreshToken(refreshToken);
      
      expect(result).to.exist;
      expect(result.accessToken).to.exist;
    });

    it('should throw error with invalid refresh token', async function() {
      try {
        await AuthService.rotateRefreshToken('invalid_token_12345');
        expect.fail('Should have thrown error for invalid refresh token');
      } catch (error) {
        expect(error.message).to.include('Invalid refresh token');
      }
    });
  });

  describe('Logout', function() {
    let refreshToken;

    beforeEach(async function() {
      await AuthService.register({
        username: 'test_logout_user',
        password: 'Test@1234',
        role: 'Patient'
      });

      const loginResult = await AuthService.login({
        username: 'test_logout_user',
        password: 'Test@1234'
      });
      refreshToken = loginResult.refreshToken;
    });

    it('should logout successfully', async function() {
      const result = await AuthService.logout(refreshToken);
      expect(result.ok).to.be.true;

      // Verify token is no longer valid
      try {
        await AuthService.rotateRefreshToken(refreshToken);
        expect.fail('Should have thrown error for logged out token');
      } catch (error) {
        expect(error.message).to.include('Invalid refresh token');
      }
    });
  });
});
