const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Create transporter lazily — only when email credentials are available
function getTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null;
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

exports.sendBillReminder = async (to, name, { billName, amount, dueDate, daysLeft }) => {
  const transporter = getTransporter();
  if (!transporter) return;
  const urgency = daysLeft <= 1 ? '🚨 URGENT' : daysLeft <= 2 ? '⚠️ Soon' : '📅 Reminder';
  await transporter.sendMail({
    from: `"FinTrack AI" <${process.env.EMAIL_USER}>`,
    to,
    subject: `${urgency}: ${billName} due in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:24px">
        <h2 style="color:#185FA5">FinTrack AI</h2>
        <p>Hi ${name},</p>
        <p>This is a reminder that your upcoming bill is due soon:</p>
        <div style="background:#f5f7fa;border-radius:10px;padding:20px;margin:20px 0">
          <p style="margin:0;font-size:18px;font-weight:600">${billName}</p>
          <p style="margin:8px 0;color:#555">Amount: <strong>₹${amount.toLocaleString()}</strong></p>
          <p style="margin:0;color:#555">Due: <strong>${dueDate}</strong> (${daysLeft} day${daysLeft !== 1 ? 's' : ''} left)</p>
        </div>
        <p style="color:#888;font-size:13px">Log in to FinTrack AI to mark this as paid or update the reminder.</p>
        <a href="${process.env.FRONTEND_URL}/bills" style="background:#185FA5;color:#fff;padding:10px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:8px">View in app</a>
      </div>
    `,
  });
};

exports.sendWeeklySummary = async (to, name, summary) => {
  const transporter = getTransporter();
  if (!transporter) return;
  await transporter.sendMail({
    from: `"FinTrack AI" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Your weekly spending summary — FinTrack AI`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:24px">
        <h2 style="color:#185FA5">Weekly Summary</h2>
        <p>Hi ${name}, here's your spending this week:</p>
        <p><strong>Total spent:</strong> ₹${summary.total.toLocaleString()}</p>
        <p><strong>Top category:</strong> ${summary.topCategory}</p>
        <a href="${process.env.FRONTEND_URL}/analytics" style="background:#185FA5;color:#fff;padding:10px 24px;border-radius:6px;text-decoration:none;display:inline-block">View Analytics</a>
      </div>
    `,
  });
};

exports.sendWelcome = async (to, name) => {
  const transporter = getTransporter();
  if (!transporter) return;
  await transporter.sendMail({
    from: `"FinTrack AI" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Welcome to FinTrack AI — Start tracking smarter 🎉',
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:24px">
        <h2 style="color:#185FA5">Welcome, ${name}!</h2>
        <p>Your FinTrack AI account is ready. Start by adding your first expense or setting a monthly budget.</p>
        <a href="${process.env.FRONTEND_URL}/dashboard" style="background:#185FA5;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:12px">Open App</a>
      </div>
    `,
  });
};

logger.info('Email service initialized');