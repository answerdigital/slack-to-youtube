const url = require('url');
const fs = require('fs').promises;
const {once} = require('events');
const http = require('http');

const open = require('open');
const {google} = require('googleapis')
const youtube = google.youtube('v3');

const TOKEN_PATH = __dirname + '/../config/google-token.json';
let credentials = {};

// get a client with access token
async function authoriseClient(credentials) {
    const auth = credentials.web;
    if (!auth) {
        throw new Error('Missing Google API credentials');
    }

    const client = new google.auth.OAuth2(
        auth.client_id,
        auth.client_secret,
        auth.redirect_uris[0]
    );

    let tokens = {};

    try {
        // previously saved token?
        tokens = require(TOKEN_PATH);
    } catch (err) {
    }

    if (!tokens.access_token) {
        const authUrl = client.generateAuthUrl({
            access_type: 'offline',
            scope: [
                'https://www.googleapis.com/auth/youtube',
            ],
        });

        const server = http.createServer();
        server.listen(3000, async () => {
            console.log('Visit this URL to proceed:', authUrl);
            await open(authUrl, {wait: false});
        });

        const [request, response] = await once(server, 'request');
        const code = await oauthCallback(request, response, server);
        const res = await client.getToken(code);

        console.log('Saving tokens to file');
        await fs.writeFile(TOKEN_PATH, JSON.stringify(res.tokens, null, 2), 'utf-8');
        tokens = res.tokens;
    }

    if (tokens.access_token) {
        client.setCredentials(tokens);
        return client;
    }

    throw new Error('Token not found');
}

// callback from Google
async function oauthCallback(req, res, server) {
    const qs = new url.URL(req.url, 'http://localhost:3000').searchParams;
    const code = qs.get('code');

    console.log('Received callback', code);
    res.end('Thanks, you can close this window');
    await server.close();
    return code;
}

class YTClient {
    constructor(creds, playlistId) {
        credentials = creds;
        this.playlist = playlistId;
    }

    async authorise() {
        this.client = await authoriseClient(credentials);
    }

    findLink(text) {
        if (!this.client) {
            throw new Error('Must authorise YouTube client');
        }

        // find YouTube video ID in text
        const matches = text.match(/^.*(?:youtu.be\/|v\/|watch\?v=|\&v=|\?v=)([^#\&\?\>]*).*/m);

        if (matches) {
            const request = {
                userId: 'me',
                auth: this.client,
                part: 'snippet',
                resource: {
                    snippet: {
                        playlistId: this.playlist,
                        resourceId: {
                            videoId: matches[1],
                            kind: 'youtube#video',
                        }
                    }
                }
            };

            console.log('Adding video to playlist:', matches[1]);
            youtube.playlistItems.insert(request, (err, response) => {
                if (err) {
                    console.log('Error adding to playlist:', err);
                }
                else {
                    console.log('Video added successfully!');
                }
            });
        }
    }
}

module.exports = YTClient;
