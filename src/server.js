const express = require('express');
const sendSMS = require('./sendSMS');
const axios = require('axios');

const app = express();

async function fetchWordDefinition(word) {
  try {
    const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    const data = response.data;
    const firstEntry = data[0];

    // Extracting various details
    const phonetic = firstEntry.phonetic || '';
    const origin = firstEntry.origin || '';
    const meanings = firstEntry.meanings.map(meaning => {
      const partOfSpeech = meaning.partOfSpeech || '';
      const definition = meaning.definitions[0].definition || '';
      const example = meaning.definitions[0].example || '';
      const synonyms = meaning.definitions[0].synonyms || [];
      const antonyms = meaning.definitions[0].antonyms || [];

      // Format the information
      return `${partOfSpeech}: ${definition}\nExample: ${example}\nSynonyms: ${synonyms.join(', ')}\nAntonyms: ${antonyms.join(', ')}`;
    });

    // Construct the complete response
    const fullDefinition = `Phonetic: ${phonetic}\nOrigin: ${origin}\n\n${meanings.join('\n\n')}`;
    return fullDefinition;
  } catch (error) {
    console.error('Error fetching word definition:', error);
    return 'Error fetching definition.';
  }
}

module.exports = function smsServer() {
    app.use(express.json());
    app.use(express.urlencoded({extended: false}));

    app.post('/incoming-messages', (req, res) => {
        const data = req.body;
        console.log(`Received message:\n${JSON.stringify(data, null, 2)}`);
        res.sendStatus(200);
    });

    app.post('/dictionary', async (req, res) => {
        const word = req.body.text;
        const phoneNumber = req.body.from;

        console.log(word, phoneNumber)

        if (!word) {
            res.status(400).send('Word parameter is missing.');
            return;
        }

        const definition = await fetchWordDefinition(word);

        try {
            await sendSMS({
                to: phoneNumber,
                message: `Definition of ${word}:\n${definition}`,
                from: '22074'
            });
            res.sendStatus(200);
        } catch(ex) {
            console.error('Error sending SMS:', ex);
            res.status(500).send('Error sending SMS.');
        }
    });

    const port = 3000;

    app.listen(port, () => {
        console.log(`App running on port: ${port}`);
    });
};

// smsServer();
