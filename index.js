const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse the JSON bodies of POST requests
app.use(bodyParser.json());

// POST endpoint for /slack/action-endpoint
app.post("/slack/action-endpoint", (req, res) => {
  console.log("Received a request:", req.body);

  // Respond to Slack with a 200 OK status
  res.status(200).send("Action received");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
