import pool from './config/db.js';

export async function getBooks() {
  const [result] = await pool.query('SELECT idbook, name, price, img_src, description FROM books');
  return result;
}

export async function getBookById(bookId) {
  const [result] = await pool.query(`
  SELECT idbook, name, price, img_src, description
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

export async function registerBook(name, price, imgSrc, description, userId) {
  const [result] = await pool.query(`
  INSERT INTO books(name, price, img_src, description, id_user)
  VALUES (?, ?, ?, ?, ?)
  `, [name, price, imgSrc, description, userId]);
  return result;
}

export async function bookOwner(bookId) {
  const [result] = await pool.query(`
    SELECT id_user
    FROM books
    WHERE idbook = ?
  `, [bookId]);
  return result[0];
}

export async function deleteBookById(bookId, userId) {
  try {
    const [result] = await pool.query(`
      DELETE FROM books
      WHERE idbook = ? AND id_user = ?
    `, [bookId, userId]);
    return result.affectedRows === 1;
  } catch (error) {
    console.error(`Error deleting book with ID ${bookId}: ${error}`);
    return false;
  }
}
