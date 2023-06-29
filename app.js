const { TwitterApi } = require('twitter-api-v2');
const NewsAPI = require('newsapi');
const axios = require('axios');
const { get } = require('http');
const generateArticle = require('./article');
const newsKey = process.env.news_key;
const newsapi = new NewsAPI(newsKey);
// Set up your API credentials
const T = new TwitterApi({
    appKey: process.env.CONSUMER_KEY || "",
    appSecret: process.env.CONSUMER_SECRET || "",
    accessToken: process.env.ACCESS_TOKEN || "",
    accessSecret: process.env.ACCESS_TOKEN_SECRET || "",
});

async function tweet() {
    let data = await getHeadlines();
    //let dataSummary = await generateSummary(data.content)

    const tweet = data.finalDesc;
    let dataSummary = await T.v1.tweetThread([
        { status: tweet },
        // `Credits: ${data.author}`
        `Read full story at: ${data.url}\nCredits:  ${data.author} `
    ]);

    if (dataSummary.errors) {
        console.error('Error posting tweet:', tweetResponse.errors);
        tweet()
    } else {
        console.log('Tweet posted successfully!');
    }
}

async function getHeadlines() {
    let response = await newsapi.v2.topHeadlines({
        //category: 'politics',
        //'category': 'technology',
        //language: 'en',
        country: 'us'
    });
    let data = response.articles;
    let randomNum = Math.floor(data.length * Math.random())
    let goodArticle = data[data.length - randomNum]
    if (goodArticle && goodArticle.content) {
        let title = goodArticle.title.split('-')[0];
        let description = goodArticle.description;
        let finalDesc = title.length > description.length ? title : description;
        let content = goodArticle.content;
        let image = goodArticle.urlToImage;
        let author = goodArticle.author;
        let url = goodArticle.url;
        let mediaId = await getMedia(image);
        //let info = await generateArticle(content);
        console.log(goodArticle);
        return { content, author, url, finalDesc, mediaId }
    } else {
        return getHeadlines();
    }
}

async function getMedia(imageUrl) {
    let response = await axios.get(imageUrl, { responseType: 'arraybuffer' })
    const contentType = response.headers['content-type'];
    // const extension = mime.extension(contentType);

    const extension = contentType.split('/')[1];
    const fileName = `image.${extension}`;


    const mediaId = await T.v1.uploadMedia(response.data, { mimeType: extension });
    if (!mediaId) {
        console.error('Error uploading media. Tweet not posted.');
        return;
    }
    return mediaId;
}

async function splitParagraph(paragraph, maxLength) {
    const chunks = [];
    let currentChunk = '';

    const words = paragraph.split(' ');
    for (const word of words) {
        if ((currentChunk + word).length <= maxLength) {
            currentChunk += `${word} `;
        } else {
            chunks.push(currentChunk.trim());
            currentChunk = `${word} `;
        }
    }

    // Add the remaining chunk
    if (currentChunk) {
        chunks.push(currentChunk.trim());
    }

    return chunks;
}

tweet()

setInterval(tweet, 5000); // 60000 milliseconds = 1 minute
