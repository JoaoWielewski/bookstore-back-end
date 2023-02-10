import pool from './config/db.js';

export async function getBooks() {
  const [result] = await pool.query('SELECT idbook, name, price, img_src FROM books');
  return result;
}

export async function getBookById(bookId) {
  const [result] = await pool.query(`
  SELECT idbook, name, price, img_src
  FROM books
  WHERE idbook = ?
  `, [bookId]);
  return result[0];
}

export async function createUser(email, password) {
  const [result] = await pool.query(`
  INSERT INTO users(email, password)
  VALUES (?, ?)
  `, [email, password]);
  return result;
}

export async function getUserByEmail(email) {
  const [result] = await pool.query(`
  SELECT email
  FROM users
  WHERE email = ?
  `, [email]);
  return result[0];
}

export async function getUser(email) {
  const [result] = await pool.query(`
    SELECT iduser, email, password
    FROM users
    WHERE email = ?
  `, [email]);
  return result[0];
}

export async function getBooksByUser(idUser) {
  const [result] = await pool.query(`
    SELECT idbook, name, price, img_src
    FROM books
    WHERE id_user = ?
  `, [idUser]);
  return result;
}

export async function registerBook(name, price, imgSrc, userId) {
  const [result] = await pool.query(`
  INSERT INTO books(name, price, img_src, id_user)
  VALUES (?, ?, ?, ?)
  `, [name, price, imgSrc, userId]);
  return result;
}
