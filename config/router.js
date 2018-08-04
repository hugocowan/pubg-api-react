const router = require('express').Router();

const matchLists = require('../controllers/matchLists');
const playerSeasons = require('../controllers/playerSeasons');
// const season = require('../controllers/seasons');

router.get('/:username', matchLists.getList);
// router.get('/:username', season.index);
router.get('/telemetry/:username/:matchId/*', matchLists.getInfo);

router.get('/seasons/:username/:playerId/:oldDate?', playerSeasons.getSeasons);

module.exports = router;
