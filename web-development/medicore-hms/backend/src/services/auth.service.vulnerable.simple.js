/**
 * SUPER SIMPLE vulnerable auth - guaranteed to work
 */

const User = require('../models/user.model');

class SimpleVulnerableAuth {
  async loginVulnerable({ username, password }) {
    // ❌ VULNERABLE: Pass user input directly to MongoDB
    const user = await User.findOne({ username }).exec();
    
    if (!user) {
      throw new Error('No user found');
    }
    
    // ❌ VULNERABLE: Skip password check!
    return { 
      success: true,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      },
      message: 'VULNERABLE LOGIN - Password check bypassed!'
    };
  }
}

module.exports = new SimpleVulnerableAuth();
