require('dotenv').config();
const { runComplianceNotificationCheck } = require('../services/complianceNotifications');

(async () => {
  try {
    const result = await runComplianceNotificationCheck();
    console.log('Compliance notification check result:', result);
  } catch (error) {
    console.error('Error running compliance notification check:', error);
    process.exit(1);
  }
})();
