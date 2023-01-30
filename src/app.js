import express from 'express';
import cors from 'cors';

import { getBooks, getBook, createUser } from './queries.js';

const app = express();

app.use(express.json({ limit: '1mb' }));

app.use(cors());

app.get('/books', async (req, res) => {
  const books = await getBooks();
  res.send(books);
});

app.get('/books/:id', async (req, res) => {
  const { id } = req.params.id;
  const book = await getBook(id);
  res.send(book);
});

app.post('/users', async (req, res) => {
  const { email, password } = req.body;
  const user = await createUser(email, password);
  res.status(201).send(user);
});

app.listen(8080, () => {
  // eslint-disable-next-line no-console
  console.log('Server is running on port 8080');
});
