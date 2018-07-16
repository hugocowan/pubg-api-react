const router = require('express').Router();

const pubgapi = require('../controllers/pubg-api');

router.get('/matches/:username', pubgapi.matches);

module.exports = router;
