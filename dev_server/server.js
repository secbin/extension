import express from 'express';
import cors_proxy from 'cors-anywhere';

const port = process.env.PORT || 8080;
const host = process.env.HOST || '0.0.0.0';
const app = express(); // Initialize express app

// This displays a message that the server is running and listening to the specified port
app.listen(port, () => console.log(`Listening on port ${port}`));

// create a GET route
app.get('/express_backend', (req, res) => {
  res.send({ express: 'YOUR EXPRESS BACKEND IS CONNECTED TO REACT' });
});

// Set up the CORS Anywhere server
cors_proxy
  .createServer({
    originWhitelist: [], // Allow all origins
    requireHeader: ['origin', 'x-requested-with'],
    removeHeaders: ['cookie', 'cookie2'],
  })
  .listen(port, host, function () {
    console.log('Running CORS Anywhere on ' + host + ':' + port);
  });
