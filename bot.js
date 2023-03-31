require('dotenv').config();
const { RTMClient } = require('@slack/rtm-api');
const YTClient = require('./lib/youtube');

if (!process.env.YOUTUBE_CREDENTIALS) throw new Error('Missing YouTube OAuth credentials');
if (!process.env.YOUTUBE_PLAYLIST) throw new Error('Missing YouTube playlist');
if (!process.env.SLACK_TOKEN) throw new Error('Missing Slack token');

const ytCredentials = JSON.parse(process.env.YOUTUBE_CREDENTIALS);
const yt = new YTClient(ytCredentials, process.env.YOUTUBE_PLAYLIST);
const rtm = new RTMClient(process.env.SLACK_TOKEN);

rtm.on('message', (event) => {
    if (event.type == 'message' && event.text != '' && event.subtype != 'message_changed') {
        console.log('message:', event.text);

        if (event.text && event.text.indexOf('youtu') >= 0) {
            yt.findLink(event.text);
        }
    }
});

(async () => {
    const { self, team } = await rtm.start();
    console.log('Connected to slack');

    await yt.authorise();
    console.log('Connected to YouTube');
})();
