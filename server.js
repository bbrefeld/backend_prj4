const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./server/db.js');
const checkMillionDollarIdea = require('./server/checkMillionDollarIdea.js');

module.exports = app;

/* Do not change the following line! It is required for testing and allowing
*  the frontend application to interact as planned with the api server
*/
const PORT = process.env.PORT || 4001;

// Add middleware for handling CORS requests from index.html
app.use(cors());

// Add middware for parsing request bodies here:
app.use(bodyParser.json());

// Mount your existing apiRouter below at the '/api' path.
const apiRouter = require('./server/api');
app.use('/api', apiRouter);

app.use('/api/:name', (req,res,next) => {
  if (req.params.name) {
    req.requestType = req.params.name;
    next();
  } else {
    res.status(404).send();
  };
});

app.use('/api/:name/:id', (req,res,next) => {
  if (req.params.id) {
    const checkId = db.getFromDatabaseById(req.requestType, req.params.id);
    if (checkId) {
      req.requestId = req.params.id;
      next();
    } else {
      res.status(404).send();
    };
  } else {
    res.status(404).send();
  };
});

// get all
app.get(['/api/minions', '/api/ideas', '/api/meetings'], (req,res,next) => {
  res.send(db.getAllFromDatabase(req.requestType));
});

// post
app.post('/api/minions', (req,res,next) => {
  responseBody = db.addToDatabase(req.requestType, req.body);
  if (responseBody) {
    res.status(201).send(responseBody);
    next();
  } else {
    res.status(404).send();
  };
});

app.post('/api/ideas', checkMillionDollarIdea, (req,res,next) => {
  responseBody = db.addToDatabase(req.requestType, req.body);
  if (responseBody) {
    res.status(201).send(responseBody);
    next();
  } else {
    res.status(404).send();
  };
});

app.post('/api/meetings', (req,res,next) => {
  meeting = db.createMeeting();
  db.addToDatabase(req.requestType, meeting);
  res.status(201).send(meeting);
})

// get by id
app.get(['/api/minions/:id', '/api/ideas/:id'], (req,res,next) => {
  res.send(db.getFromDatabaseById(req.requestType, req.requestId));
});

// put
app.put('/api/minions/:id', (req,res,next) => {
  responseBody = db.updateInstanceInDatabase(req.requestType, req.body);
  if (responseBody) {
    res.send(responseBody);
  } else {
    res.status(404).send();
  };
});

app.put('/api/ideas/:id', checkMillionDollarIdea, (req,res,next) => {
  responseBody = db.updateInstanceInDatabase(req.requestType, req.body);
  if (responseBody) {
    res.send(responseBody);
  } else {
    res.status(404).send();
  };
});

// delete
app.delete(['/api/minions/:id', '/api/ideas/:id'], (req,res,next) => {
  responseBody = db.deleteFromDatabasebyId(req.requestType, req.requestId);
  if (responseBody) {
    res.status(204).send();
  } else {
    res.status(404).send();
  };
});

app.delete('/api/meetings', (req,res,next) => {
  responseBody = db.deleteAllFromDatabase('meetings')
  res.status(204).send();
})




// This conditional is here for testing purposes:
if (!module.parent) {
  // Add your code to start the server listening at PORT below:
  app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
 });
};
