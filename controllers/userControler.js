const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sql = require('mssql');
const db = require('../config/dbConnection');


//@Desc Login a user
//@Route GET /api/users/login
//@access Public
const loginUser = asyncHandler(async (req, res) => {
    const { UserName, Password } = req.body;

    if (!UserName || !Password) {
      res.status(400);
      throw new Error("All fields are mandatory!");
    }
  
    await sql.connect(db);

    const request = new sql.Request();

    // Find the user based on email
    const result = await request.query(`SELECT * FROM users WHERE UserName = '${UserName}'`);
    
    const user = result.recordset[0];
   // console.log(user);

    if (user && (await bcrypt.compare('admin', user.Password))) {
    const accessToken = jwt.sign(
        {
        user: {
            username: user.username
        },
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
        expiresIn: '1m',
        }
    );

    res.status(200).json({ accessToken });

    } else {
    res.status(401);
    throw new Error('Username or password is not valid');
    }
    
  });

//@Desc Current User
//@Route GET /api/users/current
//@access Private
const currentUser = asyncHandler(async (req, res) => {
      await sql.connect(db);
  
      const request = new sql.Request();

      // Get the current user's details from the database based on the user's ID
      const result = await request.query(`SELECT * FROM users WHERE id = '${req.user.id}'`);
      const user = result.recordset[0];
  
      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
  });

module.exports = {loginUser, currentUser}

