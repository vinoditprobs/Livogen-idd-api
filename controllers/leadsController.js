const asyncHandler = require('express-async-handler');
const sql = require('mssql');
const db = require('../config/dbConnection');
const generateVideoBanner = require('./generateVideo'); 
const generateQRCode = require('./generateQRCode'); 
const textToImage = require('./textToImageController');
const fs = require('fs');

//@Desc Get All Contacts
//@Route GET /api/contacts
//@access Private
const getContacts = asyncHandler(async (req, res) => {
  const pool = await sql.connect(db);
  const result = await pool.request().query('SELECT * FROM leads');
  const contacts = result.recordset;
  res.status(200).json(contacts);
});


//@Desc Create Contact
//@Route POST /api/contacts
//@access Public
const createContact = asyncHandler(async (req, res, next) => {
  const { FullName, FilePathName, Phone, Address, Language } = req.body;
  const Photo = req.files.Photo;

  if (!FullName || !FilePathName || !Phone || !Address || !Photo || !Language) {
    res.status(400);
    return next(new Error("All fields are mandatory!"));
  }

  // Handle file upload appropriately using multer or similar middleware

  const photoData = Photo.data;
  const DrPhotoPath = 'uploads/dr-photo.jpg';

  try {
    await fs.promises.writeFile(DrPhotoPath, photoData);
    console.log('File saved successfully.');

    const createdDate = new Date().toISOString();
    const Active = "1";
    //const fileName = `${FullName.replace(/\s+/g, '-')}-${new Date().getTime()}`;
    const fileName = `${FilePathName.replace(/\s+/g, '-')}-${new Date().getTime()}`
    
    const VideoName = `${fileName}-video.mp4`;
    const VideoURL = `https://livogen.blob.core.windows.net/videos/${fileName}-video.mp4`;

    const BannerName = `${fileName}-banner.png`;
    const BannerURL = `https://livogen.blob.core.windows.net/banners/${fileName}-banner.png`;
    
    let qrCode;
    await generateQRCode(VideoURL, (outputFilename) => {
      qrCode = outputFilename
    });
 

    let DrNameImg
    let DrPhoneImg
    let DrAddressImg
    await textToImage(FullName, Phone, Address, Language)
      .then((images) => {
        DrNameImg = images.fullNameImage
        DrPhoneImg = images.phoneImage
        DrAddressImg = images.addressImage
      })
      .catch((err) => {
        console.error('Error generating image:', err);
    });

    await generateVideoBanner(DrNameImg, DrPhoneImg, DrAddressImg, DrPhotoPath, fileName, Language, qrCode, (message) => {
      console.log('progress', message);
     // res.write(`data: ${JSON.stringify({ progress: message })}\n\n`);
    });

    const pool = await sql.connect(db);
    const request = pool.request();
    const result = await request.query(
      `INSERT INTO Leads (FullName, Phone, Address, Active, CreatedDate, BannerName, BannerURL, VideoName, VideoURL) VALUES (N'${FullName}', N'${Phone}', N'${Address}', '${Active}', '${createdDate}', N'${BannerName}', N'${BannerURL}', N'${VideoName}', N'${VideoURL}')`
    );    

    if (result.rowsAffected[0] === 1) {
      const insertedRecord = {
        FullName,
        BannerName,
        BannerURL,
        VideoName,
        VideoURL
      };

      // Send the second response
      res.status(201).json({ statusCode: 201, message: 'Contact created successfully', result: insertedRecord });
    } else {
      res.status(500).json({ error: 'Failed to create contact' });
    }
  } catch (error) {
    next(error);
  }
});

  
//@Desc Get Single Contact
//@Route GET /api/contacts/:id
//@access Private
const getContact = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const pool = await sql.connect(db);
    const result = await pool.request().query(`SELECT * FROM leads WHERE id = ${id}`);
    const lead = result.recordset[0];
    if (!lead) {
        res.status(404);
        throw new Error("Lead not found"); 
    }
    res.status(200).json(lead); 
});


//@Desc Delete Contact
//@Route DELETE /api/contacts/:id
//@access Private
const deleteContact = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const pool = await sql.connect(db);
    const request = pool.request();

    const checkResult = await request.query(`SELECT * FROM Leads WHERE id = ${id}`);
    const contact = checkResult.recordset[0];

    if (!contact) {
        res.status(404);
        throw new Error("Lead not found!");
    }

    const result = await request.query(`DELETE FROM Leads WHERE id = ${id}`);

    if (result.rowsAffected[0] === 1) {
      res.status(201).json({ message: 'Contact deleted successfully' });
    } else {
        res.status(500);
        throw new Error("Failed to delete contact!");
    }
});


module.exports = {getContacts, createContact, getContact, deleteContact}
