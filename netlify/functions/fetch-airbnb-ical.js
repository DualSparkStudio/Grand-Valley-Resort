import fetch from 'node-fetch';

export const handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Get the iCal URL from query parameters
    const { icalUrl } = event.queryStringParameters || {};
    
    if (!icalUrl) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'iCal URL is required' })
      };
    }


    // Fetch the iCal data from Airbnb
    const response = await fetch(icalUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000 // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const icalData = await response.text();
    

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'text/plain'
      },
      body: icalData
    };

  } catch (error) {
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to fetch Airbnb calendar data',
        details: error.message 
      })
    };
  }
}; 