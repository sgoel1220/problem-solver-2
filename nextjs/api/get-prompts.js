// API endpoint for retrieving user prompts
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let username;
    
    // Handle both GET and POST methods
    if (req.method === 'GET') {
      username = req.query.username;
    } else {
      username = req.body.username;
    }

    // Validate required fields
    if (!username) {
      return res.status(400).json({ 
        error: 'Missing required field: username' 
      });
    }

    // Validate input length
    if (username.length > 100) {
      return res.status(400).json({ error: 'Username too long (max 100 characters)' });
    }

    // Sanitize input
    const sanitizedUsername = username.trim().toLowerCase();

    // In a real app, you would fetch from a database here
    // For now, we'll return some mock data
    // In production, use MongoDB, PostgreSQL, or other database
    
    console.log('Fetching prompts for user:', sanitizedUsername);

    // Mock data - replace with actual database query
    const mockPrompts = {
      'Math Solver': 'You will receive an image containing a math problem. Your task is to: 1. Read the problem from the image. 2. Solve it step by step. 3. Respond with only the **final answer** — no explanation, no context. Example format: "Answer: 42"',
      'Text Extractor': 'Extract all the text from this image and return it exactly as shown, maintaining formatting and structure.',
      'Code Analyzer': 'Analyze the code in this image and explain what it does. If there are any bugs or improvements, mention them briefly.',
      'General Problem Solver': 'You will receive an image containing a problem statement (e.g. a math or logical question). Your task is to: 1. Read the problem from the image. 2. Solve it step by step. 3. Respond with only the **final answer** — no explanation, no context. Example format: "Answer: 42"',
      'Detailed Explanation': 'Analyze this image and provide a detailed explanation of what you see, including any problems, questions, or content that needs to be addressed. Provide step-by-step solutions where applicable.'
    };

    res.status(200).json({ 
      success: true, 
      prompts: mockPrompts,
      count: Object.keys(mockPrompts).length,
      username: sanitizedUsername,
      retrievedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching prompts:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch prompts'
    });
  }
}