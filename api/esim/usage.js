
const axios = require('axios');
const crypto = require('crypto');

export default async function handler(req, res) {
  const { iccid } = req.query;

  if (!iccid || iccid === 'PENDING') {
    return res.status(400).json({ error: 'Valid ICCID required' });
  }

  try {
    const appKey = process.env.ESIM_ACCESS_APP_KEY;
    const appSecret = process.env.ESIM_ACCESS_APP_SECRET;
    const timestamp = Date.now().toString();
    const sign = crypto.createHash('sha256').update(appKey + appSecret + timestamp).digest('hex');

    const response = await axios.get(`https://api.esimaccess.com/esim/v1/usage?iccid=${iccid}`, {
      headers: {
        'RT-AppKey': appKey,
        'RT-Timestamp': timestamp,
        'RT-Sign': sign
      }
    });

    res.status(200).json(response.data.obj || {
      totalVolume: 0,
      usedVolume: 0,
      remainingVolume: 0,
      status: 'Unknown'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch usage telemetry' });
  }
}
