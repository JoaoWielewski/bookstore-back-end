import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import {
  getBooks, getBookById, createUser, getUserByEmail,
  getUser, getBooksByUser, registerBook, bookOwner,
} from './queries.js';

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
  res.send(user);
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
      res.send();
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

  const { name, price, imgSrc } = req.body;
  const userId = req.user.id;
  try {
    const book = await registerBook(name, price, imgSrc, userId);
    res.status(201).send(book);
  } catch (err) {
    res.status(500);
  }
});

app.listen(8080, () => {
  console.log('Server is running on port 8080');
});
