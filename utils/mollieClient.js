const { createMollieClient } = require('@mollie/api-client');
let client;
module.exports = function getMollieClient() {
    if (!client) {
        const apiKey = process.env.MOLLIE_API_KEY;
        if (!apiKey) throw new Error('MOLLIE_API_KEY is not configured on the server');
        client = createMollieClient({ apiKey });
    }
    return client;
};
