const axios = require('axios').default;
const expect = require('chai').expect;
const axiosLogger = require('axios-logger')
const { faker } = require('@faker-js/faker')

const api = axios.create({
  baseURL: 'https://l761dniu80.execute-api.us-east-2.amazonaws.com'
})

const endpoint = '/default/exercise_api'
api.interceptors.request.use(axiosLogger.requestLogger)
api.interceptors.response.use(axiosLogger.responseLogger)

const record = { main_key: faker.name.fullName(), value: faker.animal.cat() };


describe('GET Request Test Scenarios', () => {

  // makes sure tests are running on a clean database
  before('Delete all data', async () => {
    const response = await api.get(endpoint)
    if (response.data !== []) {
      response.data.forEach((element) => {
        api.delete(endpoint, { data: { main_key: element.main_key } })
      });
    }
  })

  describe('Verify GET request on empty database', () => {

    it('should return a status code of 200 when a valid request is made', async () => {
      const response = await api.get(endpoint);
      expect(response.status).to.equal(200);
    });

    it('should return an empty array when DB has no objects', async () => {
      const response = await api.get(endpoint);
      expect(response.data).to.be.an('array').that.is.empty;
    });
  })

  describe('Verify GET request on existing data', () => {

    before('Add one record to the database', async () => {
      const response = await api.put(endpoint, record);
      expect(response.status).to.equal(200);
    })

    it('should return a status code of 200 when a valid request is made', async () => {
      const response = await api.get(endpoint);
      expect(response.status).to.equal(200);
    });

    it('should return an array of objects when a valid request is made', async () => {
      const response = await api.get(endpoint);
      expect(response.data).to.be.an('array');
      expect(response.data[0]).to.be.an('object');
      expect(response.data[0]).to.have.property('main_key');
      expect(response.data[0]).to.have.property('value');
    });

    it('should return the correct object when a valid data exists', async () => {
      const response = await api.get(endpoint);
      expect(response.data).to.be.an('array').that.is.not.empty;
      expect(response.data[0]).to.have.property('main_key', record.main_key);
      expect(response.data[0]).to.have.property('value', record.value);
    });

    it('should return objects with valid data types for main_key and value fields', async () => {
      const response = await api.get(endpoint)
      response.data.forEach((element) => {
        expect(element.main_key).to.be.a('string');
        expect(element.value).to.be.a('string');
      });
    });
  })
});