const { env } = require('../config/environment');

function errorHandler(err, req, res, next) {


  if(err === 'Too many requests.' ||
     err.message === '429 - undefined'){
    console.log('From errorHandler: Too many requests.');
    return res.json({message: 'Too many requests and nothing on your user in the database. Wait for 1 minute. Or mash that refresh button.'});
  }


  if(err.message === 'Unauthorized'){
    return res.status(401).json({ message: 'Unauthorized' });
  }

  res.status(500).json({ message: 'Internal Server Error' });
  if(env !== 'test') next(err);
}

module.exports = errorHandler;
