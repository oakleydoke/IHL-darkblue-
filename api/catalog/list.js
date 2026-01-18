
const axios = require('axios');

export default async function handler(req, res) {
  if (!process.env.ESIM_ACCESS_APP_KEY) {
    return res.status(500).json({ error: 'ESIM_ACCESS_APP_KEY is not configured.' });
  }

  try {
    /**
     * eSIMAccess Package List API
     * Returns all packages available to your account.
     */
    const response = await axios.post('https://api.esimaccess.com/package/v1/list', {
      // Optional: Add pager or locationCode filters if your catalog is huge
      page: 1,
      limit: 100
    }, {
      headers: {
        'RT-AppKey': process.env.ESIM_ACCESS_APP_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    // eSIMAccess usually returns { code: "000000", data: { list: [...] } }
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Catalog Fetch Error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to fetch catalog from eSIMAccess',
      details: error.response?.data || error.message 
    });
  }
}
