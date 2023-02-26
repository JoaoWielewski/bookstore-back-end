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
    console.log(`Error deleting book with ID ${bookId}: ${error}`);
    return false;
  }
}

export async function adminDeleteBookById(bookId) {
  try {
    const [result] = await pool.query(`
      DELETE FROM books
      WHERE idbook = ?
    `, [bookId]);
    return result.affectedRows === 1;
  } catch (error) {
    console.log(`Error deleting book with ID ${bookId}: ${error}`);
    return false;
  }
}

export async function editBookById(bookId, name, price, imgSrc, description, userId) {
  try {
    const [result] = await pool.query(`
      UPDATE books
      SET name = ?, price = ?, img_src = ?, description = ?
      WHERE idbook = ? AND id_user = ?
    `, [name, price, imgSrc, description, bookId, userId]);
    return result;
  } catch (error) {
    console.log(`Error editing book with ID ${bookId}: ${error}`);
    return false;
  }
}

export async function getBooksBySearch(searchValue) {
  try {
    const [result] = await pool.query(`
      SELECT idbook, name, price, img_src, description
      FROM books
      WHERE name LIKE ?
    `, [`%${searchValue}%`]);
    return result;
  } catch (error) {
    console.log(error);
  }
}

export async function getBooksByUserBySearch(userId, searchValue) {
  try {
    const [result] = await pool.query(`
      SELECT idbook, name, price, img_src, description
      FROM books
      WHERE id_user = ? AND name LIKE ?
    `, [userId, `%${searchValue}%`]);
    return result;
  } catch (error) {
    console.log(error);
  }
}
