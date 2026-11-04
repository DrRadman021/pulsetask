const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'pulsetask.db');
const db = new DatabaseSync(dbPath);

console.log('🌱 PulseTask standalone seeder initialized...');
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;

if (userCount > 0) {
  console.log(`Database already contains ${userCount} users. Seed complete!`);
} else {
  console.log('Seeding initial demo data...');
}
