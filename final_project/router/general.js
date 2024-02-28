const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require("axios");

public_users.post("/register", (req, res) => {
  const { username } = req.body;
  const { password } = req.body;

  if (!username || !password) {
    return res.status(401).json({ message: "Please fill all the fields" });
  }

  if (username && password) {
    if (!isValid(username)) {
      users.push({ username: username, password: password });
      return res
        .status(200)
        .json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(409).json({ message: "User already exist" });
    }
  }
  return res.status(403).json({ message: "Registration failed" });
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  return res.status(200).json({
    message: "OK",
    books: books,
  });
});
// Get the book list available in the shop using async/await
public_users.get("/allBooks", async function (req, res) {
  try {
    let response = await axios.get("http://localhost:5000/");
    console.info(response.data);
    return res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error getting book list" });
  }
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const { isbn } = req.params;
  const book = books[isbn];
  if (book) {
    return res.status(200).json({ message: "Book found", book: book });
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});
// Get book details based on ISBN using async/await
public_users.get("/isbn/async/:isbn", async function (req, res) {
  const { isbn } = req.params;
  try {
    let response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
    console.info(response.data);
    return res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
});
// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const { author } = req.params;

  const authorBooks = [];

  for (const isbn in books) {
    if (books.hasOwnProperty(isbn)) {
      const book = books[isbn];
      if (book.author === author) {
        authorBooks.push({ isbn: isbn, title: book.title });
      }
    }
  }

  if (authorBooks.length > 0) {
    return res
      .status(200)
      .json({ message: "Books found", booksByAuthor: authorBooks });
  } else {
    return res.status(404).json({ message: "No books found by this author" });
  }
});
// Get book details based on author usig async/await
public_users.get("/author/async/:author", async function (req, res) {
  const { author } = req.params;
  try {
    let response = await axios.get(`http://localhost:5000/author/${author}`);
    console.info(response.data);
    return res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const { title } = req.params;

  const booksByTitle = [];

  for (const isbn in books) {
    if (books.hasOwnProperty(isbn)) {
      const book = books[isbn];
      if (book.title === title) {
        booksByTitle.push({
          isbn: isbn,
          author: book.author,
          reviews: book.reviews,
        });
      }
    }
  }

  if (booksByTitle) {
    return res.status(200).json({ message: "Book found", booksByTitle });
  } else {
    return res.status(404).json({ message: "No books found by this title" });
  }
});
// Get all books based on title using async/await
public_users.get("/title/:title", async function (req, res) {
  const { title } = req.params;
  try {
    let response = await axios.get(`http://localhost:5000/title/${title}`);
    console.info(response.data);
    return res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const { isbn } = req.params;
  const book = books[isbn];
  if (book) {
    return res
      .status(200)
      .json({ message: "Book found", reviews: book.reviews });
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
