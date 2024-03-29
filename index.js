const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression'); 
const config = require('./config');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
const { port, allowedDomains } = config;
const fs = require('fs');
const server = http.createServer(app);

app.use(cors({ origin: allowedDomains }));
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(compression()); 
app.use(bodyParser.json());

app.get('/', (req, res) => {
    return res.send("hello");
});
app.get('/api', (req, res) => {
  res.send('API is working!');
});
app.post('/comments', async (req, res) => {
    try {
        const { youtubeLink } = req.body;
        console.log(youtubeLink)

        if (!youtubeLink) {
            return res.status(400).json({ error: 'Missing youtubeLink in the request body' });
        }

        const apiKey = 'AIzaSyCWvZVNbX-aT6XCvopLcAJRS_kDlj3A4LY';
        const videoId = extractVideoId(youtubeLink);

        if (!videoId) {
            return res.status(400).json({ error: 'Invalid youtubeLink format' });
        }

        let allComments = [];
        let nextPageToken = null;

        do {
            const apiUrl = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&key=${apiKey}&pageToken=${nextPageToken || ''}`;

            const response = await axios.get(apiUrl);
            const comments = response.data.items.map(item => item.snippet.topLevelComment.snippet.textDisplay);
            allComments = allComments.concat(comments);

            nextPageToken = response.data.nextPageToken;
        } while (nextPageToken);

        res.json(allComments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'An error occurred while fetching comments.' });
    }
});

function extractVideoId(url) {
    const match = url.match(/(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=([^&]+)/);
    console.log("url",url)
    return (match && match[3]) ? match[3] : null;
}


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
