import pool from './config/db.js';

export async function getBooks() {
  const [result] = await pool.query('SELECT id, name, price, img_src FROM books');
  return result;
}

export async function getBook(id) {
  const [result] = await pool.query(`
  SELECT id, name, price, img_src
  FROM books
  WHERE id = ?
  `, [id]);
  return result[0];
}

export async function createUser(name, password) {
  const [result] = await pool.query(`
  INSERT INTO users(name, password)
  VALUES (?, ?)
  `, [name, password]);
  return result;
}
