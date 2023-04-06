const {URL} = require('node:url');
const fs = require('node:fs').promises;
const {once} = require('node:events');
const http = require('node:http');

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

    const redirectUri = auth.redirect_uris.filter(u => u.includes('fly.dev') == !!process.env.FLY_APP_NAME)[0];

    // choose the fly.dev redirect URI on fly, or the local one in dev
    const client = new google.auth.OAuth2(
        auth.client_id,
        auth.client_secret,
        redirectUri
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
            prompt : 'consent',
            scope: [
                'https://www.googleapis.com/auth/youtubepartner',
            ],
        });

        const server = http.createServer();
        server.listen(process.env.PORT || 8000, () => {
            console.log(`Server listening, visit ${redirectUri} to proceed`);
        });

        const code = await oauthCallback(server, authUrl);
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
function oauthCallback(server, authUrl) {
    return new Promise((resolve, reject) => {
        server.on('request', (request, response) => {
            const qs = new URL(request.url, 'http://localhost').searchParams;
            const code = qs.get('code');

            if (!code) {
                response.writeHead(302, {Location: authUrl});
                return response.end();
            }

            console.log('Received callback', code);
            response.end('Thanks, you can close this window');
            server.close(() => resolve(code));
        });
    });
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
