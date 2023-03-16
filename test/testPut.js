const axios = require('axios').default;
const expect = require('chai').expect;
const axiosLogger = require('axios-logger')
const { faker } = require('@faker-js/faker');

const endpoint = '/default/exercise_api'
const api = axios.create({
  baseURL: 'https://l761dniu80.execute-api.us-east-2.amazonaws.com'
})
api.interceptors.request.use(axiosLogger.requestLogger)
api.interceptors.response.use(axiosLogger.responseLogger)
/*
This part is making axios return a response insead of rejecting a promise on statuses which are not 200.
This is done for easier assertions.
*/
api.interceptors.response.use((response) => {
  return response;
},
  (error) => {

    if (error.response.status !== 200) {
      return Promise.resolve(error.response)
      //return error.response;

    } else {
      return Promise.reject(error.response);
    }
  })

describe('PUT Request Test Scenarios', () => {

  // makes sure tests are running on a clean database
  before('Delete all data', async () => {
    const response = await api.get(endpoint)

    if (response.data !== []) {
      response.data.forEach((element) => {
        api.delete(endpoint, { data: { main_key: element.main_key } })
      });
    }
  })

  it('should return a 200 OK status code', async () => {
    const payload = { main_key: faker.name.fullName(), value: faker.animal.cat() };

    const response = await api.put(endpoint, payload);
    expect(response.status).to.equal(200);
  });

  it('should return a new item as an object', async () => {
    const payload = { main_key: faker.name.fullName(), value: faker.animal.cat() };

    const response = await api.put(endpoint, payload);
    expect(response.data).to.be.an('object').that.includes(payload);
  });

  it('should create a new item in the array', async () => {
    const payload = { value: faker.animal.cat(), main_key: faker.name.fullName() };

    const response = await api.put(endpoint, payload);
    expect(response.status).to.equal(200);

    const getResponse = await api.get(endpoint);
    expect(getResponse.data).to.be.an('array').that.deep.includes(payload);
  });

  it('should return status 400 when trying to add existing key/value', async () => {
    const payload = { value: faker.animal.cat(), main_key: faker.name.fullName() };

    const response = await api.put(endpoint, payload);
    expect(response.status).to.equal(200);

    const response2 = await api.put(endpoint, payload);
    expect(response2.status).to.equal(400);
  });

  it('should return status 400 for requests with invalid payloads', async () => {
    const invalidPayloads = [
      { foo: 'bar' },
      { main_key: 'Some name' },
      { value: 'Some value' },
      { main_key: 'Some cool name', foo: 'Some value' },
      { foo: 'some cool name', value: 'some value' }
    ];

    for (payload of invalidPayloads) {
      const response = await api.put(endpoint, payload);
      expect(response.status).to.equal(400)
    }
  });

  it('should return status 400 for requests with invalid [main_key] data type', async () => {
    const invalidPayloads = [
      { main_key: 123, value: 'value' },
      { main_key: null, value: 'value' },
      { main_key: true, value: 'value' }
    ];

    for (payload of invalidPayloads) {
      const response = await api.put(endpoint, payload);
      expect(response.status).to.equal(400)
    }
  });

  /*
  BUG
  Expected result: Value type should be string in a request and request should fail with status 400 otherwise
  Actual result: Value can be passed as any type and the request will pass
  */
  it('should return status 400 for requests with invalid [value] data type', async () => {
    const invalidPayloads = [
      { main_key: 'key1', value: 123 },
      { main_key: 'key2', value: null },
      { main_key: 'key3', value: true }
    ];

    for (payload of invalidPayloads) {
      const response = await api.put(endpoint, payload);
      expect(response.status).to.equal(400)
    }
  });

  /*
  BUG
  Expected result: Up to 10 records can be created
  Actual result: Over 10 records can be created
  */
  it('should return status 400 when trying to add more than 10 records', async () => {
    //let payload = { value: faker.animal.cat(), main_key: faker.name.fullName() }
    const getResponse = await api.get(endpoint)
    const remainingRecords = 10 - getResponse.data.length

    // making sure we have 10 records in db
    for (let i = remainingRecords; i > 0; i--) {
      const response = await api.put(endpoint, { value: faker.animal.cat(), main_key: faker.name.fullName() })
      expect(response.status).to.equal(200)
    }
    // expecting the 11th record to fail
    const response = await api.put(endpoint, { value: faker.animal.cat(), main_key: faker.name.fullName() });
    expect(response.status).to.equal(400);
  });
});