const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

// Basic GET endpoint
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
