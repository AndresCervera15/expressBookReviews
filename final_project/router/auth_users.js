const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [{ username: "admin", password: "adminadmin" }];

const isValid = (username) => {
  let userWithSameName = users.filter((user) => {
    return user.username === username;
  });

  return userWithSameName.length > 0;
};

const authenticatedUser = (username, password) => {
  //returns boolean
  const matchingUsers = users.filter(
    (user) => user.username === username && user.password === password
  );
  return matchingUsers.length > 0;
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username } = req.body;
  const { password } = req.body;
  const isAuth = authenticatedUser(username, password);
  if (!username || !password) {
    return res.status(401).json({ message: "Please fill all the fields" });
  }

  if (isAuth) {
    const accessToken = jwt.sign({ payload: password }, "access", {
      expiresIn: 60 * 60,
    });
    req.session.authorization = { accessToken, username };
    return res.status(200).json({ message: "User successfully logged in" });
  } else {
    return res.status(403).json({ message: "Invalid username or password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { username } = req.session.authorization;
  const { review } = req.query;
  const { isbn } = req.params;

  if (!username || !review || !isbn) {
    return res.status(400).json({ message: "Invalid request parameters" });
  }

  if (books[isbn] !== undefined) {
    const book = books[isbn];

    if (book.reviews[username] !== undefined) {
      book.reviews[username] = review;
      res.status(200).json({
        message: `Review updated successfully for ISBN ${isbn} by ${username}`,
      });
    } else {
      book.reviews[username] = review;
      res
        .status(200)
        .json({ message: `Review added successfully by ${username}` });
    }
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { username } = req.session.authorization;
  const { isbn } = req.params;

  if (!username || !isbn) {
    return res.status(400).json({ message: "Invalid request parameters" });
  }

  if (books[isbn] !== undefined) {
    const book = books[isbn];

    if (book.reviews[username] !== undefined) {
      delete book.reviews[username];
      res.status(200).json({
        message: `Review deleted successfully for ISBN ${isbn} by ${username}`,
      });
    } else {
      res.status(404).json({ message: `Review not found for ${isbn} ISBN.` });
    }
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
