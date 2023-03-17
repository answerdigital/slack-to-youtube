# Slack to YouTube

A Slack bot that reads YouTube links posted in a channel and adds them to a YouTube playlist.

This is an updated version adapted from [YouSlackBot](https://www.npmjs.com/package/YouSlackBot).

## Configuration

Create a [Slack bot](https://my.slack.com/services/new/bot) and store the token in `config/slack.json`:

```json
{
  "token": "xoxb-12345..."
}
```

Create a [Google project](https://console.developers.google.com/) and add the [YouTube Data API v3](https://developers.google.com/youtube/v3).

Create an OAuth consent screen. If you want others outside your organisation to use it, you'll need to publish the app.

Create an OAuth client ID (Desktop app or Web application) and download the credentials to `config/youtube.json`:

```json
{
  "installed": {
    "client_id": "..."
  }
}
```

Store the YouTube playlist ID in `config/playlist.json`:

```json
{
  "playlist": "..."
}
```

## Running the bot

Run `node bot` and invite the Slack bot to any channels.
