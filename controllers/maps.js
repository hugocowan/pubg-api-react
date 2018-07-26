function getMap(coords) {


  return new Promise((resolve, reject) => {

    const { spawn } = require('child_process');
    const python = spawn('python', ['lib/compute_input.py']);
    // const data = [1,2,3,4,5,6,7,8,9];
    let dataString = '';

    python.stdout.on('data', function(data) {
      // console.log('data: ', data);
      dataString += data.toString();
    });

    python.stderr.on('data', function(data) {
      console.log('error: ', data.toString());
      reject(data.toString());
    });

    python.stdout.on('end', function() {
      // console.log('Sum of numbers = ', dataString);
      resolve(JSON.parse(dataString));
    });

    python.stdin.write(JSON.stringify(coords));

    python.stdin.end();

  });


}

module.exports = {
  getMap
};
