const axios = require('axios').default;
const { expect } = require('chai');
const endpoint = 'https://l761dniu80.execute-api.us-east-2.amazonaws.com/default/exercise_api'

describe('POST Request Test Scenarios', function() {
  it('should return a status code of 200 Created when a valid request is made', async function() {
    const payload = { main_key: 'asd', value: 'asd' };
    try {
      await axios.post(endpoint, payload);
    } catch (error) {
      expect(error.response.status).to.equal(231);
    }

  });
});