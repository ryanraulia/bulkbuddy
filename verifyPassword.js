import bcrypt from 'bcryptjs';

// The stored hash for the password 'admin123'
const hash = '$2a$10$xn3/L3sHB5r8Y7Z8V6qV.OUYkQGw95b/6Zf9lyeB7W6Mw4u3YzQaC';

// The password to verify
const password = 'admin123';

// Compare the password with the stored hash
const isMatch = bcrypt.compareSync(password, hash);

// Output the result
console.log(isMatch); // Should output 'true' if the password matches the hash