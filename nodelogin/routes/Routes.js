const express = require('express')
const router = express.Router();
const fs = require('fs');
const accountRoutes = require('./user_accounts.js')

router.use(accountRoutes)
module.exports = router;