const { env } = require('../config/environment');

function errorHandler(err, req, res, next) {

  console.log('From errorHandler: ', err);

  if(err === 'Too many requests.'){
    return res.json({message: 'Too many requests and nothing in the database. Wait for 1 minute. Or mash that refresh button.'});
  }


  if(err.message === 'Unauthorized'){
    return res.status(401).json({ message: 'Unauthorized' });
  }

  res.status(500).json({ message: 'Internal Server Error' });
  if(env !== 'test') next(err);
}

module.exports = errorHandler;
