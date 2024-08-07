const sql = require('mssql');

const db = async () => {
  try {
    const pool = await sql.connect({
      server: 'sparktserver.westindia.cloudapp.azure.com',
      database: 'Livogen-IDD',
      user: 'remotedevlogin',
      password: 'Sparkt@123',
      options: {
         encrypt: true,  // Enable encryption
         trustServerCertificate: true,  // Disable SSL verification
         charset: 'UTF8'
      },
    });

    console.log('Database Connected!');

    return pool;
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

module.exports = db;

