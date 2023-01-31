import express from 'express';
import cors from 'cors';

import {
  getBooks, getBookById, createUser, getUserByEmail,
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

app.post('/users', async (req, res) => {
  try {
    await signupSchema.validateAsync(req.body, { abortEarly: false });
  } catch (err) {
    console.log(err.details);
    res.status(502).send(err.details);
    return err.details;
  }

  const { email, password } = req.body;
  const user = await createUser(email, password);
  res.status(201).send(user);
});

app.listen(8080, () => {
  console.log('Server is running on port 8080');
});
