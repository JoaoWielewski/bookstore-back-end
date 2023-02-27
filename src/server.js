import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import {
  getBooks, getBookById, createUser, getUserByEmail,
  getUser, getBooksByUser, registerBook, bookOwner,
  deleteBookById, editBookById, getBooksBySearch,
  getBooksByUserBySearch, adminDeleteBookById,
} from './queries.js';
import { sendEmailOnPayment, sendEmailOnRegister } from './utils/email.js';

import signupSchema from './schemas/signup-schema.js';
import bookSchema from './schemas/book-schema.js';
import authenticateToken from './middlewares.js';

const app = express();

app.use(express.json({ limit: '1mb' }));

app.use(cors());

app.get('/books', async (req, res) => {
  try {
    const books = await getBooks();
    res.send(books);
  } catch (error) {
    res.status(500).send({ error: 'Internal server error' });
  }
});

app.get('/books/search/:searchValue', async (req, res) => {
  try {
    const { searchValue } = req.params;
    const books = await getBooksBySearch(searchValue);
    res.send(books);
  } catch (error) {
    res.status(500).send({ error: 'Failed to retrieve books.' });
  }
});

app.get('/books/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const book = await getBookById(id);
    res.send(book);
  } catch (error) {
    res.status(500).send({ error: 'Failed to get book by id.' });
  }
});

app.get('/users/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const user = await getUserByEmail(email);

    if (user) {
      res.send(user);
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    res.status(500).send({ error: 'Failed to get user by email.' });
  }
});

app.get('/booksuser', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const books = await getBooksByUser(userId);
    res.send(books);
  } catch (error) {
    res.status(500).send({ error: 'Failed to get books by user.' });
  }
});

app.get('/booksuser/search/:searchValue', authenticateToken, async (req, res) => {
  try {
    const { searchValue } = req.params;
    const userId = req.user.id;
    const books = await getBooksByUserBySearch(userId, searchValue);
    res.send(books);
  } catch (error) {
    res.status(500).send({ error: 'Failed to get book by user and by search.' });
  }
});

app.get('/bookowner/:bookId', async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = await bookOwner(bookId);
    res.send(userId);
  } catch (error) {
    res.status(500).send({ error: 'Failed to get book owner by id.' });
  }
});

app.delete('/deletebook/:bookId', authenticateToken, async (req, res) => {
  const { bookId } = req.params;
  const userId = req.user.id;
  const userEmail = req.user.email;

  try {
    let result = '';
    if (userEmail !== 'admin@gmail.com') {
      result = await deleteBookById(bookId, userId);
    } else {
      result = await adminDeleteBookById(bookId);
    }

    res.send(result);
  } catch (error) {
    res.status(500).send({ error: 'Failed to delete book by id.' });
  }
});

app.put('/editbook/:bookId', authenticateToken, async (req, res) => {
  const { bookId } = req.params;
  const {
    name, price, imgSrc, description,
  } = req.body;

  try {
    const userId = req.user.id;

    const result = await editBookById(bookId, name, price, imgSrc, description, userId);

    if (result) {
      res.status(204).send();
    } else {
      res.status(404).send({ error: 'Failed to edit book.' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: 'Failed to edit book.' });
  }
});

app.post('/user', async (req, res) => {
  const { email, password } = req.body;
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

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
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

      if (user.email !== 'admin@gmail.com') {
        user.role = 'user';
      } else {
        user.role = 'admin';
      }

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
