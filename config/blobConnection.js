const { BlobServiceClient } = require('@azure/storage-blob');

async function connectToBlobStorage() {
  const connectionString = 'DefaultEndpointsProtocol=https;AccountName=livogen;AccountKey=/WSYidxVzi5sdSL+8mPicjCaKCWf56jUtvU1mLpjDh6sW7XeUHdXBJKfpTjDttz/Jlr05PQULSay+AStIB0PKA==;EndpointSuffix=core.windows.net'; // Replace with your Azure Blob Storage connection string
  const bannerContainerName = 'banners';
  const videoContainerName = 'videos';

  // Create a BlobServiceClient object using the connection string
  const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

  // Get a reference to the banner container
  const bannerContainerClient = blobServiceClient.getContainerClient(bannerContainerName);

  // Check if the banner container exists, create it if it doesn't
  const bannerContainerExists = await bannerContainerClient.exists();
  if (!bannerContainerExists) {
    await bannerContainerClient.create();
    console.log(`Banner container "${bannerContainerName}" created successfully`);
  } else {
    console.log(`Banner container "${bannerContainerName}" already exists`);
  }

  // Get a reference to the video container
  const videoContainerClient = blobServiceClient.getContainerClient(videoContainerName);

  // Check if the video container exists, create it if it doesn't
  const videoContainerExists = await videoContainerClient.exists();
  if (!videoContainerExists) {
    await videoContainerClient.create();
    console.log(`Video container "${videoContainerName}" created successfully`);
  } else {
    console.log(`Video container "${videoContainerName}" already exists`);
  }

  return { bannerContainerClient, videoContainerClient };
}

module.exports = connectToBlobStorage;
