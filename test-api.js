const axios = require('axios').default;

const options = {
  method: 'GET',
  url: 'https://api.datasectors.com/api/docs/chart-v2',
  headers: {
    Accept: '*/*',
    'X-API-Key': 'ds_live_WK9GthvrNNstE3a4eaak38Ng5oLkREDD'
  }
};

axios.request(options).then(function (response) {
  console.log(JSON.stringify(response.data, null, 2));
}).catch(function (error) {
  console.error(error);
});
