const express = require("express");
const pool = require("./db");
const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running");
});
app.get("/test-db",async(req,res)=>{
  try{
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows);
  } catch (err){
    console.error(err);
    res.status(500).send("Database error");
  }
});
app.get("/users", async(req,res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (err){
    console.error(err);
    res.status(500).json({error: "Failed to fetch users"});
  }
});
app.post("/users", async (req,res) => {
  try {
    const {name, email, role} = req.body;

    if(!name || !email || !role){
      return res.status(400).json({error: "All fields are required"});
    }
    const result = await pool.query(
      "INSERT INTO users (name,email,role) VALUES ($1,$2,$3) RETURNING *",[name,email,role]
    );
    res.status(201).json(result.rows[0]);
  } catch (err){
    console.error(err);
    res.status(500).json({error: "Failed to create user"});
  }
});
app.put("/users/:id",async(req,res)=>{
  try{
    const {id} = req.params;
    const {name,email,role} = req.body;
    const result = await pool.query(
      "UPDATE users SET name = $1, email = $2, role = $3 WHERE id= $4 RETURNING *",
      [name,email,role,id]
    );

    if(result.rows.length === 0) {
      return res.status(404).json({error: " User not found"});
    }
    res.json(result.rows[0]);
  } catch (err){
    console.error(err);
    res.status(500).json({error : "Failed to update user"});
  }
});
app.delete("/users/:id",async(req,res)=>{
  try{
    const {id} = req.params;

    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING *",
      [id]
    );

    if(result.rows.length === 0){
      return res.status(404).json({error: "User not found"});
    }
    res.json({message: "User deleted successfully"});
  } catch(err){
    console.error(err);
    res.status(500).json({error: "Failed  to delete the user"});
  }
});
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});