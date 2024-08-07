const express = require('express');
const router = express.Router();
const {getContacts, createContact, getContact, updateContact, deleteContact} = require('../controllers/leadsController')
//const validateToken = require("../middleware/validateTokenHandler");


//router.use(validateToken);
router.route('/').get(getContacts);
router.route('/create').post(createContact);
router.route('/:id').get(getContact).delete(deleteContact);


module.exports = router;