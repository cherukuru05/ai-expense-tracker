const cron = require('node-cron');
const Bill = require('../models/Bill');
const User = require('../models/User');
const emailService = require('./emailService');
const logger = require('../utils/logger');

exports.startBillReminders = () => {
  // Run every day at 9 AM
  cron.schedule('0 9 * * *', async () => {
    logger.info('Running bill reminder job...');
    await checkUpcomingBills();
  });

  logger.info('Bill reminder cron job scheduled (daily 9 AM)');
};

async function checkUpcomingBills() {
  try {
    const today = new Date();
    const threeDaysLater = new Date(today);
    threeDaysLater.setDate(today.getDate() + 3);

    // Find bills due in next 3 days that haven't been reminded
    const upcomingBills = await Bill.find({
      dueDate: { $gte: today, $lte: threeDaysLater },
      isPaid: false,
      reminderSent: false,
    }).populate('user');

    for (const bill of upcomingBills) {
      const user = await User.findById(bill.user);
      if (!user || !user.notificationPrefs?.billReminders) continue;

      const daysLeft = Math.ceil((new Date(bill.dueDate) - today) / (1000 * 60 * 60 * 24));

      await emailService.sendBillReminder(user.email, user.name, {
        billName: bill.name,
        amount: bill.amount,
        dueDate: new Date(bill.dueDate).toLocaleDateString('en-IN'),
        daysLeft,
      });

      await Bill.findByIdAndUpdate(bill._id, { reminderSent: true });
      logger.info(`Bill reminder sent to ${user.email} for ${bill.name}`);
    }

    // Reset reminderSent for bills that have been rescheduled (repeat bills)
    await processPaidRecurringBills();

  } catch (err) {
    logger.error('Bill reminder job error:', err);
  }
}

async function processPaidRecurringBills() {
  const overduePaid = await Bill.find({ isPaid: true, repeat: { $ne: 'none' } });

  for (const bill of overduePaid) {
    let nextDue = new Date(bill.dueDate);
    if (bill.repeat === 'monthly') nextDue.setMonth(nextDue.getMonth() + 1);
    else if (bill.repeat === 'weekly') nextDue.setDate(nextDue.getDate() + 7);
    else if (bill.repeat === 'yearly') nextDue.setFullYear(nextDue.getFullYear() + 1);

    await Bill.findByIdAndUpdate(bill._id, {
      dueDate: nextDue,
      isPaid: false,
      reminderSent: false,
      paidDate: undefined,
    });
  }
}