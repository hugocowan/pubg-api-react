const Match = require('../models/match');

function getMap(req, res, next) {

  Match
    .findOne({ 'attributes.id': req.params.matchId })
    .populate('info')
    .then(match => {
      const coords = match.info.player1.coords;

      return new Promise((resolve, reject) => {

        const { spawn } = require('child_process');
        const python = spawn('python', ['lib/compute_map.py']);

        let mapData = '';

        python.stdout.on('data', function(data) {
          mapData += data.toString();
        });

        python.stderr.on('data', function(error) {
          console.log('error: ', error.toString());
          reject(error.toString());
        });

        python.stdout.on('end', function() {
          // console.log('Sum of numbers = ', mapData);
          const map = JSON.parse(mapData);
          delete map.axes[0].axes[0].visible;
          delete map.axes[0].axes[1].visible;
          delete map.axes[0].lines[0].drawstyle;
          map.axes[0].axesbg = '#F8F8FF';
          map.axes[0].lines[0].linewidth = 3;
          resolve(map);
        });

        python.stdin.write(JSON.stringify(coords));

        python.stdin.end();

      });
    })
    .then(map => res.json(map))
    .catch(next);
}

module.exports = {
  getMap
};
