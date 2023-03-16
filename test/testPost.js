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
This part is making axios return a response insead of just rejecting a promise on statuses which are not 200.
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

describe('POST Request Test Scenarios', () => {

  // makes sure tests are running on a clean database
  before('Create one record', async () => {
    const response = await api.get(endpoint)

    if (response.data !== []) {
      response.data.forEach((element) => {
        api.delete(endpoint, { data: { main_key: element.main_key } })
      });
    }
    await api.put(endpoint, { value: faker.animal.cat(), main_key: faker.name.fullName() })
  })

  it('should return a 200 OK status code', async () => {
    const getResponse = await api.get(endpoint);
    const updateValue = 'update value';
    const updatePayload = { main_key: getResponse.data[0].main_key, value: updateValue };

    const response = await api.post(endpoint, updatePayload);
    expect(response.status).to.equal(200);

  });

  it('should update the record', async () => {
    const getResponse = await api.get(endpoint);
    const updateValue = 'update value';
    const updatePayload = { main_key: getResponse.data[0].main_key, value: updateValue };

    const response = await api.post(endpoint, updatePayload);
    // calling the get method again to verify updated value
    const getResponse2 = await api.get(endpoint);
    // fetching the updated record
    const updatedRecord = getResponse2.data.find(element => element.main_key === updatePayload.main_key);
    expect(updatedRecord.value).to.equal(updateValue);
  });

  it('should return updated object', async () => {
    const getResponse = await api.get(endpoint);
    const updateValue = 'update value';
    const updatePayload = { main_key: getResponse.data[0].main_key, value: updateValue };

    const response = await api.post(endpoint, updatePayload);
    expect(response.data).to.deep.equal(updatePayload);
  });

  it('should return status 400 if key does not exist', async () => {
    const updateValue = 'update value';
    const updatePayloadInvalidKey = { main_key: 'This key does not exist', value: updateValue };

    const response = await api.post(endpoint, updatePayloadInvalidKey);
    expect(response.status).to.equal(400);
  });

  it('should return status 400 if payload is invalid', async () => {
    const getResponse = await api.get(endpoint);
    const invalidPayloads = [
      { foo: 'bar' },
      { main_key: 'Some name' },
      { value: 'Some value' },
      { main_key: getResponse.data[0].main_key, foo: 'Some value' },
      { foo: 'some cool name', value: 'some value' }
    ];

    for (payload of invalidPayloads) {
      const response = await api.post(endpoint, payload);
      expect(response.status).to.equal(400)
    }
  });

});