import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import {
  getBooks, getBookById, createUser, getUserByEmail, getUser,
} from './queries.js';
import signupSchema from './validator.js';

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
    console.log(err.details);
    res.status(502).send(err.details);
    return err.details;
  }

  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await createUser(email, hashedPassword);
  res.status(201).send(user);
});

app.listen(8080, () => {
  console.log('Server is running on port 8080');
});
