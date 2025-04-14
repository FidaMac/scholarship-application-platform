// Netlify function to handle API requests
exports.handler = async (event) => {
  // Get the API endpoint from the path
  const path = event.path.replace('/.netlify/functions/redirect-api', '');
  
  // Extract the actual backend URL from environment variables
  // You'll need to set this in Netlify's environment variables
  const API_SERVER_URL = process.env.API_SERVER_URL || 'http://localhost:5000';
  
  console.log(`Redirecting API request from ${path} to ${API_SERVER_URL}${path}`);
  
  // For requests that don't actually need backend data, we can return mock responses
  // This is useful for auth pages and similar static content scenarios
  if (path === '/api/user' && event.httpMethod === 'GET') {
    // If we can't reach backend, return a 401 so the client redirects to auth page
    return {
      statusCode: 401,
      body: JSON.stringify({ message: "Not authenticated" }),
    };
  }
  
  // Redirect to your actual API endpoint
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      message: "This is a mock response from Netlify Functions",
      error: "No actual backend connection available in static deployment"
    }),
  };
};