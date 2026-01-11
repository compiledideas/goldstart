const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');

async function createAdmin() {
  const email = 'admin@goldstart.app';
  const password = 'password123';
  const name = 'Admin';
  const role = 'admin';

  const hashedPassword = await bcrypt.hash(password, 10);

  // Use better-sqlite3 directly
  const db = new Database('phone-repair.db');

  try {
    // Delete existing admin if exists
    db.prepare('DELETE FROM users WHERE email = ?').run(email);

    // Insert new admin
    db.prepare('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)')
      .run(email, hashedPassword, name, role);

    console.log('Admin user created successfully!');
    console.log('Email:', email);
    console.log('Password:', password);
  } catch (error) {
    console.error('Error creating admin user:', error.message);
  } finally {
    db.close();
  }
}

createAdmin();
