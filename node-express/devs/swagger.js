const swaggerAutogen = require('swagger-autogen')();
const path = require('path');

const doc = {
    info: {
      title: 'Powell Puff Planner API',
      description: 
      'These are all the public API Endpoints for our localhost server',
    },
    host: 'localhost:6900',
    schemes: ['http'],
};

const outputFile = path.join(__dirname + '/swagger.json');
const endpointsFiles = [path.join(__dirname + '/../main.js')];

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
    require(path.join(__dirname + '/../server.js'));
});