# Livogen Iron Deficiency Campaign API

## Project Overview
This project is part of a campaign where doctors can enter their personal information to receive personalized banners and videos branded with Livogen. The backend API is built using Node.js and ffmpeg to dynamically generate these custom assets based on the input provided.

This project marks my first foray into Node.js development, focusing on server-side media generation.

## Prerequisites
- **Node.js**: Ensure Node.js is installed on your machine.
- **ffmpeg**: Make sure ffmpeg is installed and available in your system's PATH.

## Installation

1. Clone the repository to your local machine:
   ```bash
   git clone [https://github.com/your-username/livogen-campaign-api.git
   
   npm install

   nodemon server.js
   
## API Usage
To generate a personalized video or banner, make a POST request to the server with the following body fields:

- **FullName**: The full name of the doctor.
- **Phone**: The doctor's address..
- **Address**: Preferred language for the content (en for English, hi for Hindi).
- **Language**: The path where the generated media will be saved..
- **FilePathName**: The full name of the doctor.
- **Photo**: TUpload the doctor's photo to include in the banner and video.

