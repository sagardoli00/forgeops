const { sendEmail } = require("../../services/emailService");

function getLastEmail() {
  return sendEmail.mock.calls[
    sendEmail.mock.calls.length - 1
  ][0];
}

function getTokenFromEmail(emailData) {
  return emailData.html.match(/token=([a-f0-9]+)/)[1];
}

module.exports = {
  getLastEmail,
  getTokenFromEmail,
};