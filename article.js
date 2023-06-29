const natural = require('natural');
const tokenizer = new natural.SentenceTokenizer();

// Example article
async function generateArticle(articl) {

    const article = articl;

    // Tokenize the article into sentences
    const sentences = tokenizer.tokenize(article);

    // Generate bullet points
    const bulletPoints = sentences.map((sentence, index) => {
        return `- Point ${index + 1}: ${sentence}`;
    });

    // Print the bullet points
    bulletPoints.forEach((bulletPoint) => {
        console.log(bulletPoint);
    });
    return bulletPoints
}

module.exports = generateArticle;