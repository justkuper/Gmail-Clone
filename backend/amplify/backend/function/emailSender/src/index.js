/**
 * Lambda function: emailSender
 * Triggered by AppSync mutations to send email notifications via SES.
 */

const AWS = require('aws-sdk');
const ses = new AWS.SES({ region: process.env.AWS_REGION || 'us-east-1' });

exports.handler = async (event) => {
  console.log('emailSender triggered:', JSON.stringify(event, null, 2));

  const { to, from, subject, body } = event.arguments || event;

  if (!to || !from || !subject || !body) {
    throw new Error('Missing required fields: to, from, subject, body');
  }

  const recipients = Array.isArray(to) ? to : [to];

  const params = {
    Source: from,
    Destination: {
      ToAddresses: recipients,
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: 'UTF-8',
      },
      Body: {
        Html: {
          Data: body,
          Charset: 'UTF-8',
        },
        Text: {
          Data: body.replace(/<[^>]+>/g, ''),
          Charset: 'UTF-8',
        },
      },
    },
  };

  try {
    const result = await ses.sendEmail(params).promise();
    console.log('Email sent:', result.MessageId);
    return { success: true, messageId: result.MessageId };
  } catch (err) {
    console.error('SES send error:', err);
    throw err;
  }
};
