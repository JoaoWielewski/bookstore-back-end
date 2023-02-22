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
    html: `
      <html>
        <head>
          <style>
            h1 {
              color: #000058;
              font-size: 24px;
            }
            p {
              color: black;
              font-size: 16px;
            }
          </style>
        </head>
        <body>
          <h1>Welcome to BookStore!</h1>
          <p>Dear customer, <br><br>Thank you for registering at BookStore. We're excited to have you as a part of our community and we can't wait to help you discover your next favorite book! <br><br>Best regards, BookStore.</p>
        </body>
      </html>`,
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
    html: `
      <html>
        <head>
          <style>
            h1 {
              color: #000058;
              font-size: 24px;
            }
            p {
              color: black;
              font-size: 16px;
            }
            .price {
              color: rgb(192, 168, 31);
              font-size: 18px;
            }
            .books {
              color: black;
              font-size: 16px;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <h1>Successfull payment!</h1>
          <p>Dear customer, your order has been confirmed! <br><br>You successfully bought the following books: <span class="books">${separatedBookNames}</span>.<br><br>Your total purchase amount was <span class="price">$${totalPrice}</span>. <br><br>We appreciate your business and hope you enjoy your new books! <br><br>Best regards, BookStore.</p>
        </body>
      </html>`,
  };

  sendEmail(mailOptions);
};
