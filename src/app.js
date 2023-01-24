import express from 'express';

import { getBooks, getBook } from './queries.js';

const app = express();

app.get('/books', async (req, res) => {
  const books = await getBooks();
  res.send(books);
});

app.get('/books/:id', async (req, res) => {
  const { id } = req.params;
  const book = await getBook(id);
  res.send(book);
});

app.listen(8080, () => {
  // eslint-disable-next-line no-console
  console.log('Server is running on port 8080');
});
