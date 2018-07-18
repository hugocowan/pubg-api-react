const router = require('express').Router();

const pubgapi = require('../controllers/pubg-api');
const season = require('../controllers/seasons');

router.get('/:username', pubgapi.season);
// router.get('/:username', season.index);
router.get('/telemetry/:telemetryURL', pubgapi.match);

module.exports = router;
