import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const handler = async (event, context) => {
  // Debug environment variables
  
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' }),
      };
    }

    const { amount, currency = 'INR', receipt, notes } = JSON.parse(event.body);

    // Input validation
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Valid amount is required' }),
      };
    }

    // Prevent extremely large amounts (potential abuse)
    if (amount > 1000000) { // 10 lakh INR max
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Amount exceeds maximum limit' }),
      };
    }

    if (!receipt || typeof receipt !== 'string' || receipt.length > 100) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Valid receipt is required' }),
      };
    }

    // Validate currency
    const allowedCurrencies = ['INR', 'USD', 'EUR', 'GBP'];
    if (!allowedCurrencies.includes(currency)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid currency' }),
      };
    }

    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: currency,
      receipt: receipt.trim(),
      notes: notes && typeof notes === 'object' ? notes : {},
    };

    const order = await razorpay.orders.create(options);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        order: order,
      }),
    };
  } catch (error) {
    // Sanitize error messages to prevent information leakage
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to create order',
      }),
    };
  }
}; 