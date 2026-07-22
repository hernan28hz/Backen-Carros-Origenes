const app = require("./app");
const env = require("./config/env");
const { startComplianceNotificationScheduler } = require("./services/complianceNotifications");

app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`${env.appName} listening on ${env.appUrl || `http://localhost:${env.port}`}`);
  startComplianceNotificationScheduler();
});
