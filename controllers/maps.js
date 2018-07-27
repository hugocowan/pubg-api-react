function getMap(coords) {


  return new Promise((resolve, reject) => {

    const { spawn } = require('child_process');
    const python = spawn('python', ['lib/compute_map.py']);

    let mapData = '';

    python.stdout.on('data', function(data) {
      // console.log('data: ', data);
      mapData += data.toString();
    });

    python.stderr.on('data', function(error) {
      console.log('error: ', error.toString());
      reject(error.toString());
    });

    python.stdout.on('end', function() {
      // console.log('Sum of numbers = ', mapData);
      resolve(JSON.parse(mapData));
    });

    python.stdin.write(JSON.stringify(coords));

    python.stdin.end();

  });


}

module.exports = {
  getMap
};
