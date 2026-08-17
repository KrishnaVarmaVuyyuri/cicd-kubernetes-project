const express = require("express");

const app = express();

app.use(express.json());

const users = [
  {
    id: 1,
    name: "Krishna",
    role: "DevOps Engineer"
  },
  {
    id: 2,
    name: "Varma",
    role: "Cloud Engineer"
  },
  {
    id: 3,
    name: "Rahul",
    role: "Software Engineer"
  }
];

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    message: "Application is healthy - cicd v3 --- 10000"
  });
});

// Get all users
app.get("/api/users", (req, res) => {
  res.status(200).json(users);
});

// Get user by ID
app.get("/api/users/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const user = users.find((user) => user.id === id);

  if (!user) {
    return res.status(404).json({
      message: "User not found"
    });
  }

  res.status(200).json(user);
});

module.exports = app;
