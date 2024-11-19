const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const cors = require("cors");
const path = require("path");
const app = express();
app.use(express.json());
app.use(cors());
const dbpath = path.join(__dirname, "users.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error : ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

//!API for getting all Users
app.get("/users", async (request, response) => {
  try {
    const gettingUsersQuery = `SELECT * FROM users`;
    const API1 = await db.all(gettingUsersQuery);
    response.send(API1);
  } catch (error) {
    response.status(500);
    response.send(error);
  }
});

//!API for Adding New User
app.post("/user", async (request, response) => {
  try {
    const { first_name, last_name, email, department } = request.body;
    const addingUserQuery = `
      INSERT INTO users (first_name, last_name, email, department) 
      VALUES (?, ?, ?, ?)`;
    await db.run(addingUserQuery, [first_name, last_name, email, department]);
    response.status(201).send("User added successfully");
  } catch (error) {
    response
      .status(500)
      .send({ error: "Failed to add user", details: error.message });
  }
});

//!API for updating an User
app.put("/user/:id", async (request, response) => {
  const { id } = request.params;
  const { first_name, last_name, email, department } = request.body;
  const updatingQuery = `UPDATE users SET first_name="${first_name}",last_name="${last_name}",email="${email}",department="${department}" WHERE id="${id}"`;
  await db.run(updatingQuery);
  response.send("User updated Successfully");
});

//!API for Deleting a User
app.delete("/user/:id", async (request, response) => {
  try {
    const { id } = request.params;
    const deletingUserQuery = `DELETE FROM users WHERE id=?`;
    const result = await db.run(deletingUserQuery, [id]);
    if (result.changes === 0) {
      response.status(404).send("User not found");
    } else {
      response.status(204).send("User Deleted Successfully");
    }
  } catch (error) {
    response
      .status(500)
      .send({ error: "Failed to delete user", details: error.message });
  }
});

module.exports = app;
