import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendEmail = async (mailOptions) => {
  transporter.sendMail(mailOptions, (error) => {
    if (error) {
      console.log(error);
    }
  });
};

export const sendEmailOnRegister = async (recipientEmail) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: recipientEmail,
    subject: 'Welcome to BookStore!',
    text: 'Dear customer, \n\nThank you for registering at BookStore. We\'re excited to have you as a part of our community and we can\'t wait to help you discover your next favorite book! \n\nBest regards, BookStore.',
  };

  sendEmail(mailOptions);
};

export const sendEmailOnPayment = async (recipientEmail, bookNames, totalPrice) => {
  const separatedBookNames = bookNames.reduce((acc, bookName, index) => {
    if (index === bookNames.length - 1) {
      return `${acc} and ${bookName}`;
    }
    return `${acc}, ${bookName}`;
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: recipientEmail,
    subject: 'Successfull payment!',
    text: `Dear customer, your order has been confirmed! \n\nYou successfully bought the following books: ${separatedBookNames}.\n\nYour total purchase amount was $${totalPrice}. \n\nWe appreciate your business and hope you enjoy your new books! \n\nBest regards, BookStore.`,
  };

  sendEmail(mailOptions);
};
