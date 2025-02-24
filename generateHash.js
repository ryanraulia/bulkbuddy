import bcrypt from 'bcryptjs';

const password = 'BulkBuddy12';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error generating hash:', err);
  } else {
    console.log('Generated hash:', hash);
  }
});