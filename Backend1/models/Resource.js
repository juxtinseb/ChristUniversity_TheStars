const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema({
    title: String,
    subject: String,
    semester: String,
    description: String,
    link: String,
    uploadedBy: String
});

module.exports = mongoose.model("Resource", resourceSchema);
