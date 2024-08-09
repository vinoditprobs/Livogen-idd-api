const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const connectToBlobStorage = require('../config/blobConnection');

const uploadBlob = async (containerClient, blobName, filePath) => {
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.uploadFile(filePath);
  console.log(`Blob "${blobName}" uploaded successfully`);
};

const generateVideoBanner = async (DrNameImg, DrPhoneImg, DrAddressImg, DrPhotoPath, fileName, Language, qrCode, progressCallback) => {

 // const { bannerContainerClient, videoContainerClient } = await connectToBlobStorage();

  const reportProgress = (message) => {
    if (progressCallback && typeof progressCallback === 'function') {
      progressCallback(message);
    }
  };

  return new Promise((resolve, reject) => {

      // Select Raw Video and Banner
      const userSelectedLanguage = Language
      if(userSelectedLanguage == 'hi'){
        var selectedLangVideo = 'assets/livogen-dr-video-hindi.mp4'
        var selectedLangBanner = 'assets/livogen-dr-banner-hindi.png'
      }else{
        var selectedLangVideo = 'assets/livogen-dr-video.mp4'
        var selectedLangBanner = 'assets/livogen-dr-banner.png'
      }
      const originalVideoPath = path.join(selectedLangVideo);
      const originalBannerPath = path.join(selectedLangBanner);
       // Select Raw Video and Banner


      const outputVideo = `${fileName}-video.mp4`;
      const outputBanner = `${fileName}-banner.png`;

    
    const generateVideo = () => {

      return new Promise((resolve, reject) => {
          const ffmpeg = spawn('ffmpeg', [
            '-i', originalVideoPath,
            '-i', DrPhotoPath,
            '-i', DrNameImg,
            '-i', DrPhoneImg,
            '-i', DrAddressImg,
            '-filter_complex',
            `[0:v]scale=1280:1280[main_video];
            [1:v]scale=383:468[doctor_photo];
            [2:v]scale=-1:min(115\\,ih)[doctor_name_img];
            [3:v]scale=-1:min(60\\,ih)[doctor_phone_img];
            [4:v]scale=-1:min(150\\,ih)[doctor_address_img];
            [main_video][doctor_photo]overlay=x=449:y=304:enable='between(t,0,3)'[video_with_name];
            [video_with_name][doctor_name_img]overlay=x=(main_w-overlay_w)/2:y=130:enable='between(t,0,3)+between(t,48,51)'[video_with_phone];
            [video_with_phone][doctor_phone_img]overlay=x=(main_w-overlay_w)/2:y=395:enable='between(t,48,51)'[video_with_address];
            [video_with_address][doctor_address_img]overlay=x=(main_w-overlay_w)/2:y=570:enable='between(t,48,51)'[output_video]`,  
            '-map', '[output_video]',
            '-c:v', 'libx264',
            '-preset', 'ultrafast',
            '-crf', '18',
            '-c:a', 'aac',
            '-y',
            outputVideo
          ]);

        ffmpeg.stdout.on('data', (data) => {
          console.log(`FFmpeg stdout: ${data}`);
          reportProgress('Generating video...');
        });

        ffmpeg.stderr.on('data', (data) => {
          console.error(`FFmpeg stderr: ${data}`);
          reportProgress('Error occurred during video generation.');
        });

        ffmpeg.on('close', (code) => {
          console.log(`FFmpeg process exited with code ${code}`);
          if (code === 0) {
            console.log('Video Generated successfully');
            reportProgress('Video generated successfully.');
            resolve();
          } else {
            reject(new Error('Video generation failed.'));
            
          }
        });
      });
    };


    const generateBanner = () => {

      return new Promise((resolve, reject) => {
        const ffmpeg = spawn('ffmpeg', [
          '-i', originalBannerPath,
          '-i', DrPhotoPath,
          '-i', qrCode,
          '-i', DrNameImg,       // Path to DrNameImg image
          '-i', DrPhoneImg,      // Path to DrPhoneImg image
          '-i', DrAddressImg,    // Path to DrAddressImg image
          '-filter_complex',
          '[1:v]scale=530:716[dr_photo_scaled];' +
          '[2:v]scale=434:434[qr_code_scaled];' +
          '[3:v]scale=-1:-1[doctor_name_img];' +
          '[4:v]scale=-1:-1[doctor_phone_img];' +
          '[5:v]scale=-1:-1[doctor_address_img];' +
          '[0:v][dr_photo_scaled]overlay=x=127:y=2015[banner_with_photo];' +
          '[banner_with_photo][qr_code_scaled]overlay=x=785:y=1445[banner_with_name];' +
          '[banner_with_name][doctor_name_img]overlay=x=725:y=2305[banner_with_phone];' +
          '[banner_with_phone][doctor_phone_img]overlay=x=725:y=2535[banner_with_address];' +
          '[banner_with_address][doctor_address_img]overlay=x=725:y=2625[output_image];',
          '-map', '[output_image]',
          '-y',
          outputBanner
        ]);
        
        


        ffmpeg.stdout.on('data', (data) => {
          console.log(`FFmpeg (generateBanner) stdout: ${data}`);
          reportProgress('Generating banner...');
        });

        ffmpeg.stderr.on('data', (data) => {
          console.error(`FFmpeg (generateBanner) stderr: ${data}`);
          reportProgress('Error occurred during banner generation.');
        });

        ffmpeg.on('close', (code) => {
          console.log(`FFmpeg (generateBanner) process exited with code ${code}`);
          if (code === 0) {
            console.log('Banner Generated successfully');
            reportProgress('Banner generated successfully.');
            resolve();
          } else {
            reject(new Error('Failed to generate the banner image.'));
          }
        });
      });
    };

    generateVideo()
      .then(() => generateBanner())
      .then(async () => {
        console.log('Video and Banner Generated successfully');
        reportProgress('Video and banner generated successfully.');
       // await uploadBlob(videoContainerClient, outputVideo, outputVideo);
       // await uploadBlob(bannerContainerClient, outputBanner, outputBanner);
        fs.unlinkSync(outputVideo); // Remove the temporary video file
        fs.unlinkSync(outputBanner); // Remove the temporary banner file
        resolve();
      })
      .catch((error) => {
        console.error(error);
        reportProgress('Generation Failed.');
        reject(new Error('Generation Failed.'));
      });
  });
};

module.exports = generateVideoBanner;
