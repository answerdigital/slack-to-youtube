# Slack to YouTube

A Slack bot that reads YouTube links posted in a channel and adds them to a YouTube playlist.

This is an updated version adapted from [YouSlackBot](https://www.npmjs.com/package/YouSlackBot).

## Configuration

Create a [Fly app](https://fly.io/) and set the app name in `fly.toml`.

Create a [Slack bot](https://my.slack.com/services/new/bot) and store the token as the `SLACK_TOKEN` secret:

```bash
flyctl secrets set "SLACK_TOKEN=xoxb-12345..."
```

Create a [Google project](https://console.developers.google.com/) and add the [YouTube Data API v3](https://developers.google.com/youtube/v3).

Create an OAuth consent screen. If you want others outside your organisation to use it, you'll need to publish the app.

Create an OAuth client ID (Desktop app or Web application) and set the credentials as the `YOUTUBE_CREDENTIALS` secret:

```bash
flyctl secrets set "YOUTUBE_CREDENTIALS=$(< credentials.json)"
```

Store the YouTube playlist ID as the `YOUTUBE_PLAYLIST` secret:

```bash
flyctl secrets set "YOUTUBE_PLAYLIST=..."
```

## Running the bot

Deploy the app with `flyctl deploy` and invite the Slack bot to any channels.
