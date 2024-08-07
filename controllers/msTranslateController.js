
const asyncHandler = require('express-async-handler');
const axios = require('axios');

const subscriptionKey = '4239ea60176e4d13bdac23d7689c037d';
const endpoint = 'https://api.cognitive.microsofttranslator.com/';

const getTranslate = asyncHandler(async (req, res) => {
  const text = req.query.text; // Text to be translated
  const source = 'en'; // Source language
  const target = 'hi'; // Target language (Hindi)
  try {
    const response = await axios({
      method: 'post',
      url: `${endpoint}/translate?api-version=3.0&from=${source}&to=${target}`,
      headers: {
        'Ocp-Apim-Subscription-Key': subscriptionKey,
        'Content-type': 'application/json',
        'Ocp-Apim-Subscription-Region': 'southeastasia'
      },
      data: [
        {
          text
        }
      ],
      responseType: 'json'
    });

    const translation = response.data[0].translations[0].text;
    res.json({ translation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Translation failed' });
  }
});



module.exports = getTranslate