
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // eSIMAccess sends events as JSON
  const event = req.body;

  console.log('[WEBHOOK] Received Event from eSIMAccess:', JSON.stringify(event, null, 2));

  /**
   * Typical event structure:
   * {
   *   "orderNo": "E2023...",
   *   "status": "COMPLETED",
   *   "iccid": "8986...",
   *   "externalOrderNo": "stripe_session_id"
   * }
   */

  // Here you would typically update your database with the ICCID 
  // or send a custom fulfillment email to the user.
  
  res.status(200).json({ received: true });
}
