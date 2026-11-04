const { createMollieClient } = require('@mollie/api-client');

// Explicit test-mode key shared by all backend payment routes.
const MOLLIE_TEST_API_KEY = 'test_BDybrWRK8yQAhu9EzTcrmcFkhDGgvD';
let client;
module.exports = function getMollieClient() {
    if (!client) {
        client = createMollieClient({ apiKey: MOLLIE_TEST_API_KEY });
    }
    return client;
};
