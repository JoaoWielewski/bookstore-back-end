import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import {
  getBooks, getBookById, createUser, getUserByEmail,
  getUser, getBooksByUser, registerBook, bookOwner,
  deleteBookById, editBookById,
} from './queries.js';
import { sendEmailOnPayment, sendEmailOnRegister } from './utils/email.js';

import signupSchema from './schemas/signup-schema.js';
import bookSchema from './schemas/book-schema.js';
import authenticateToken from './middlewares.js';

const app = express();

app.use(express.json({ limit: '1mb' }));

app.use(cors());

app.get('/books', async (req, res) => {
  const books = await getBooks();
  res.send(books);
});

app.get('/books/:id', async (req, res) => {
  const { id } = req.params;
  const book = await getBookById(id);
  res.send(book);
});

app.get('/users/:email', async (req, res) => {
  const { email } = req.params;
  const user = await getUserByEmail(email);

  if (user) {
    res.send(user);
  } else {
    res.sendStatus(404);
  }
});

app.get('/bookuser', authenticateToken, async (req, res) => {
  const books = await getBooksByUser(req.user.id);
  res.send(books);
});

app.get('/bookowner/:bookId', async (req, res) => {
  const { bookId } = req.params;
  const userId = await bookOwner(bookId);
  res.send(userId);
});

app.delete('/deletebook/:bookId', authenticateToken, async (req, res) => {
  const { bookId } = req.params;
  const userId = req.user.id;
  const result = await deleteBookById(bookId, userId);
  res.send(result);
});

app.put('/editbook/:bookId', authenticateToken, async (req, res) => {
  const { bookId } = req.params;
  const {
    name, price, imgSrc, description,
  } = req.body;
  const userId = req.user.id;

  const result = await editBookById(bookId, name, price, imgSrc, description, userId);

  if (result) {
    res.status(204).send();
  } else {
    res.status(500).send({ error: 'Failed to edit book.' });
  }
});

app.get('/users/:email/:password', async (req, res) => {
  const { email, password } = req.params;
  const user = await getUser(email);

  if (user == null) {
    return res.status(400).send();
  }
  try {
    if (await bcrypt.compare(password, user.password)) {
      delete user.password;
      res.send(user);
    } else {
      res.sendStatus(404);
    }
  } catch {
    res.status(500).send();
  }
});

app.get('/login/:email/:password', async (req, res) => {
  const { email, password } = req.params;
  const user = await getUser(email);

  if (user == null) {
    return res.status(400).send();
  }
  try {
    if (await bcrypt.compare(password, user.password)) {
      user.id = user.iduser;
      delete user.iduser;
      delete user.password;
      user.jwt = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
      res.send(user);
    } else {
      res.send();
    }
  } catch {
    res.status(500).send();
  }
});

app.post('/users', async (req, res) => {
  try {
    await signupSchema.validateAsync(req.body, { abortEarly: false });
  } catch (err) {
    res.status(502).send(err.details);
    return err.details;
  }

  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await createUser(email, hashedPassword);
  res.status(201).send(user);
});

app.post('/books', authenticateToken, async (req, res) => {
  try {
    await bookSchema.validateAsync(req.body, { abortEarly: false });
  } catch (err) {
    res.status(502).send(err.detais);
  }

  const {
    name, price, imgSrc, description,
  } = req.body;
  const userId = req.user.id;
  try {
    const book = await registerBook(name, price, imgSrc, description, userId);
    res.status(201).send(book);
  } catch (err) {
    res.status(500);
  }
});

app.post('/sendemailregister', async (req, res) => {
  const { recipientEmail } = req.body;

  try {
    sendEmailOnRegister(recipientEmail);
    res.status(200);
  } catch (error) {
    console.log(error);
    res.status(500);
  }
});

app.post('/sendemailpayment', async (req, res) => {
  const { recipientEmail, bookNames, totalPrice } = req.body;

  try {
    sendEmailOnPayment(recipientEmail, bookNames, totalPrice);
    res.status(200);
  } catch (error) {
    console.log(error);
    res.status(500);
  }
});

app.listen(8080, () => {
  console.log('Server is running on port 8080');
});
