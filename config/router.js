const router = require('express').Router();

const matchLists = require('../controllers/matchLists');
const playerSeasons = require('../controllers/playerSeasons');
const maps = require('../controllers/maps');

router.get('/:username', matchLists.getList);

router.get('/telemetry/:username/:matchId/*', matchLists.getInfo);

router.get('/seasons/:username/:playerId/:oldDate?', playerSeasons.getSeasons);

router.get('/map/:matchId', maps.getMap);

module.exports = router;
