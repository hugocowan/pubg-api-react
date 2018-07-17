const router = require('express').Router();

const pubgapi = require('../controllers/pubg-api');

router.get('/:username', pubgapi.season);
router.get('/telemetry/:telemetryURL', pubgapi.match);

module.exports = router;
