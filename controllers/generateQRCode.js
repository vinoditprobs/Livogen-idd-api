const axios = require('axios');
const fs = require('fs');

const generateQRCode = async (VideoURL, callback) => {

  const apiUrl = `https://phillipsx-pims-stage.azurewebsites.net/api/QRGenerator?URL=${VideoURL}`
    try {
      const response = await axios.post(apiUrl, null, { responseType: 'arraybuffer' });
      
     //  const contentDisposition = response.headers['content-disposition'];
     // const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
     // const matches = filenameRegex.exec(contentDisposition);
      const filename = 'uploads/qrcode'
      const fileExtension = '.png'; 
      const outputFilename = filename + fileExtension;

      fs.writeFileSync(outputFilename, Buffer.from(response.data), 'binary');

     // return outputFilename;
      callback(outputFilename);

    } catch (error) {
      console.error(error);
      throw error; // Optional: Rethrow the error to be handled by the caller
    }
};

module.exports = generateQRCode