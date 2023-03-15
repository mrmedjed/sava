const axios = require('axios');
const expect = require('chai').expect;

const endpoint = 'https://l761dniu80.execute-api.us-east-2.amazonaws.com/default/exercise_api'

describe('Verify GET default/exercise_api', () => {
    it('should return a status code of 200 when a valid request is made', async function () {
        const response = await axios.get(endpoint);
        expect(response.status).to.equal(200);
      });
    
      it('should return an array of objects when a valid request is made', async function () {
        const response = await axios.get(endpoint);
        expect(response.data).to.be.an('array');
        expect(response.data[0]).to.be.an('object');
        expect(response.data[0]).to.have.property('main_key');
        expect(response.data[0]).to.have.property('value');
      });
    
      it('should return an empty array when the API has no objects', async function () {
        const response = await axios.get(endpoint);
        expect(response.data).to.be.an('array').that.is.empty;
      });
    
      it('should return the correct object when a valid key is provided', async function () {
        const response = await axios.get(endpoint);
        expect(response.data).to.be.an('array').that.is.not.empty;
        expect(response.data[0]).to.have.property('main_key', 'Doron');
        expect(response.data[0]).to.have.property('value', '2');
      });
    
  });