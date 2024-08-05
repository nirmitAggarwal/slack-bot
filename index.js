const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse the JSON bodies of POST requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // To parse URL-encoded bodies

// POST endpoint for /slack/action-endpoint
app.post("/slack/action-endpoint", async (req, res) => {
  const { type, event, challenge } = req.body;

  // Handle URL verification
  if (type === "url_verification" && challenge) {
    res.status(200).json({ challenge: challenge });
  } else if (type === "event_callback") {
    console.log("Received event:", event);

    if (event && event.type === "message") {
      if (event.subtype !== "bot_message" && !event.bot_id) {
        try {
          const joke = await getJoke("Any");
          await respondToSlack(event.channel, joke);
        } catch (error) {
          console.error("Error fetching joke or responding:", error);
        }
      }
    }

    res.status(200).send("Event received");
  } else {
    res.status(200).send("Request received");
  }
});

// POST endpoint for slash commands
app.post("/slack/commands", async (req, res) => {
  const { command, text, response_url } = req.body;

  let jokeType = "Any";
  if (text === "programming") {
    jokeType = "Programming";
  } else if (text === "miscellaneous") {
    jokeType = "Miscellaneous";
  } else if (text === "dark") {
    jokeType = "Dark";
  } else if (text === "christmas") {
    jokeType = "Christmas";
  }

  try {
    const joke = await getJoke(jokeType);
    await sendSlackResponse(response_url, joke);
    res.status(200).send("");
  } catch (error) {
    console.error("Error fetching joke:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Function to fetch a joke from the JokeAPI
async function getJoke(type) {
  try {
    const response = await axios.get(`https://v2.jokeapi.dev/joke/${type}`);
    if (response.data.type === "single") {
      return response.data.joke;
    } else {
      return `${response.data.setup} ${response.data.delivery}`;
    }
  } catch (error) {
    throw new Error("Error fetching joke: " + error.message);
  }
}

// Function to respond to Slack
async function respondToSlack(channel, text) {
  try {
    const response = await axios.post(
      "https://slack.com/api/chat.postMessage",
      {
        channel: channel,
        text: text,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
        },
      }
    );
    if (!response.data.ok) {
      throw new Error(response.data.error);
    }
  } catch (error) {
    throw new Error("Error responding to Slack: " + error.message);
  }
}

// Function to send a response to Slack for slash commands
async function sendSlackResponse(responseUrl, text) {
  try {
    await axios.post(responseUrl, {
      response_type: "ephemeral",
      text: text,
    });
  } catch (error) {
    throw new Error("Error sending response to Slack: " + error.message);
  }
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
