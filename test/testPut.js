const axios = require('axios').default;
const { expect } = require('chai');
const endpoint = 'https://l761dniu80.execute-api.us-east-2.amazonaws.com/default/exercise_api'

describe('PUT Request Test Scenarios', function() {
    it('should return a status code of 200 Created when a valid request is made', async function() {
      const payload = { main_key: 'asd', value: 'asdf' };
      try {
        await axios.put(endpoint, payload);
      } catch (error) {
        console.log(error.response.data)
        expect(error.response.status).to.equal(231);
      }
  
    });
  });