const router = require('express').Router();

const pubgapi = require('../controllers/pubg-api');
// const season = require('../controllers/seasons');

router.get('/:username', pubgapi.matchList);
// router.get('/:username', season.index);
router.get('/telemetry/:username/:matchId/*', pubgapi.match);

module.exports = router;
