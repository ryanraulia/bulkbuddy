const express = require('express');
const router = express.Router();
const transporter = require('../config/email');

router.post('/', async (req, res) => {
  const { name, email, message } = req.body;

  try {
    const mailOptions = {
      from: {
        name: 'BulkBuddy Contact Form',
        address: process.env.EMAIL_USER
      },
      to: process.env.EMAIL_USER,
      subject: `New Contact Form Submission from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: error.message
    });
  }
});

module.exports = router;