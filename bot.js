const { RTMClient } = require('@slack/rtm-api');
const YTClient = require('./lib/youtube');

const { playlist } = require('./config/playlist');
const ytCredentials = require('./config/youtube');
const yt = new YTClient(ytCredentials, playlist);

const { token } = require('./config/slack');
const rtm = new RTMClient(token);


rtm.on('message', (event) => {
    if (event.type == 'message' && event.text != '' && event.subtype != 'message_changed') {
        console.log('message:', event.text);

        if (event.text.indexOf('youtu') >= 0) {
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
