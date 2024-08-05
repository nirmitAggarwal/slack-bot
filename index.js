const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse the JSON bodies of POST requests
app.use(bodyParser.json());

// POST endpoint for /slack/action-endpoint
app.post("/slack/action-endpoint", async (req, res) => {
  const { type, event, challenge } = req.body;

  // Handle URL verification
  if (type === "url_verification" && challenge) {
    res.status(200).json({ challenge: challenge });
  } else if (type === "event_callback") {
    // Log the event for debugging purposes
    console.log("Received event:", event);

    // Handle different event types
    if (event && event.type === "message") {
      // If the message is from a user and not the bot itself
      if (event.subtype !== "bot_message" && !event.bot_id) {
        // Fetch a joke from the JokeAPI
        try {
          const joke = await getJoke();
          // Respond to the message
          await respondToSlack(event.channel, joke);
        } catch (error) {
          console.error("Error fetching joke or responding:", error);
        }
      }
    }

    // Respond to Slack with a 200 OK status
    res.status(200).send("Event received");
  } else {
    res.status(200).send("Request received");
  }
});

// Function to fetch a joke from the JokeAPI
async function getJoke() {
  try {
    const response = await axios.get("https://v2.jokeapi.dev/joke/Any");
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

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
