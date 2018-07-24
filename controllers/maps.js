function getMap(coords) {

  const { spawn } = require('child_process');
  const py = spawn('python', ['compute_input.py']);
  // const data = [1,2,3,4,5,6,7,8,9];
  let dataString = '';

  py.stdout.on('data', function(data){
    dataString += data.toString();
  });
  py.stdout.on('end', function(){
    console.log('Sum of numbers = ', dataString);
  });
  py.stdin.write(JSON.stringify(coords));
  py.stdin.end();

}
module.exports = {
  getMap
};
