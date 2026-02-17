const express = require("express");
const mongoose = require("mongoose");
const Resource = require("./models/Resource");

const app = express();   // 👈 CREATE APP FIRST

app.use(express.json()); // 👈 THEN use middleware

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/christDB")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// Test route
app.get("/", (req, res) => {
    res.send("Backend + MongoDB working 🚀");
});

// SAVE resource
app.post("/upload", async (req, res) => {
    try {
        const newResource = new Resource(req.body);
        await newResource.save();
        res.send("Resource Saved Successfully");
    } catch (err) {
        res.status(500).send(err);
    }
});

// GET all resources
app.get("/resources", async (req, res) => {
    const data = await Resource.find();
    res.json(data);
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});
