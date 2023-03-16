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

describe('DELETE Request Test Scenarios', () => {

    before('Delete all data', async () => {
        const response = await api.get(endpoint)

        if (response.data !== []) {
            response.data.forEach((element) => {
                api.delete(endpoint, { data: { main_key: element.main_key } })
            });
        }
    })

    beforeEach('Creates one record', async () => {
        await api.put(endpoint, { value: faker.animal.cat(), main_key: faker.name.fullName() })
    })

    it('should return a 200 OK status code', async () => {
        const getResponse = await api.get(endpoint);
        const deletePayload = { main_key: getResponse.data[0].main_key };

        const response = await api.delete(endpoint, { data: deletePayload });
        expect(response.status).to.equal(200);
    })

    it('should successfully delete a record', async () => {
        const getResponse = await api.get(endpoint);
        const deletePayload = { main_key: getResponse.data[0].main_key };

        await api.delete(endpoint, { data: deletePayload });
        const getResponse2 = await api.get(endpoint);
        expect(getResponse2.data).to.be.an('array').which.is.empty;
    })

    /*
    BUG - This one is not quite clear from the requirement so I decided to log it as a bug
    Expected result: Should return the key/value pair which is deleted
    Actual result: Returns only the key
    */
    it('should return a deleted object', async () => {
        const getResponse = await api.get(endpoint);
        const deletePayload = { main_key: getResponse.data[0].main_key };

        const response = await api.delete(endpoint, { data: deletePayload });
        expect(response.data).to.deep.equal(getResponse.data[0]);
    })

    /*
    BUG
    Expected result: Should return status 400 if the key doesn't exist
    Actual result: Status 200 is returned
    */
    it('should return status 400 if key does not exist', async () => {
        const deletePayload = { main_key: 'This key should not exist' };

        const response = await api.delete(endpoint, { data: deletePayload });
        expect(response.status).to.equal(400);
    })

    /*
    BUG
    Expected result: Should return status 400 if the payload is invalid
    Actual result: Status 200 is returned for all invalid combinations except when main_key property is missing
    */
    it('should return status 400 if payload is invalid', async () => {
        const getResponse = await api.get(endpoint);
        const invalidPayloads = [
            // status 400
            { foo: 'bar' },
            // status 400
            { value: getResponse.data[0].value },
            // status 200 and record is deleted
            { main_key: getResponse.data[0].main_key, foo: getResponse.data[0].value },
            // status 400
            { foo: 'some cool name', value: getResponse.data[0].value }
        ];

        for (payload of invalidPayloads) {
            const response = await api.delete(endpoint, { data: payload });
            expect(response.status).to.equal(400)
        }
    })
})