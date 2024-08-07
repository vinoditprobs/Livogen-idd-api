const { createCanvas, registerFont } = require('canvas');
const fs = require('fs');

const generateImage = async (text, fontSize, fontColor, fontFamily, filename) => {
    const canvas = createCanvas(1, 1); // Create an initial small canvas
    const ctx = canvas.getContext('2d');
  
    // Load and set the font
    ctx.font = `${fontSize}px ${fontFamily}`;
  
    // Calculate the text width and height to determine the canvas dimensions
    const textWidth = ctx.measureText(text).width;
    const textHeight = ctx.measureText(text).actualBoundingBoxAscent + ctx.measureText(text).actualBoundingBoxDescent;
  
    // Resize the canvas to accommodate the text
    canvas.width = textWidth;
    canvas.height = textHeight;
  
    // Clear the initial canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    // Set a transparent background
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  
    // Load the font again after resizing the canvas
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.fillStyle = fontColor;
  
    // Draw the text on the canvas starting from x=0, y=0 (top-left corner)
    ctx.fillText(text, 0, textHeight - ctx.measureText(text).actualBoundingBoxDescent);
  
    const out = fs.createWriteStream(filename);
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    out.on('finish', () => console.log(`Image created and saved as ${filename}`));

    return new Promise((resolve, reject) => {
        out.on('finish', () => {
            resolve(filename);
        });
        out.on('error', reject);
    });
};


const fontPathBold = 'assets/rajdhani-bold.otf';
registerFont(fontPathBold, { family: 'HindiFontBold' });

const textToImage = async (FullName, Phone, Address, Language) => {
    const userSelectedLanguage = Language;
    let DrTitle, PhoneTitle, AddressTitle;

    if (userSelectedLanguage === 'hi') {
        DrTitle = 'डॉ. ';
        PhoneTitle = 'फ़ोन नंबर: ';
        AddressTitle = 'पता: ';
    } else {
        DrTitle = 'Dr. ';
        PhoneTitle = 'Phone: ';
        AddressTitle = 'Address: ';
    }
    
    const wrappedAddress = Address.match(/.{1,66}/g).join('-\n');
    // Use Promise.all to run all image generation calls concurrently
    const [fullNameImage, phoneImage, addressImage] = await Promise.all([
        generateImage(DrTitle + FullName, 120, '#d62f1e', 'HindiFontBold', 'uploads/fullnameimage.png'),
        generateImage(PhoneTitle + Phone, 50, '#000000', 'HindiFontBold', 'uploads/phoneimage.png'),

        
        generateImage(AddressTitle + wrappedAddress, 50, '#000000', 'HindiFontBold', 'uploads/addressimage.png')
    ]);

    return { fullNameImage, phoneImage, addressImage };
};


module.exports = textToImage;
