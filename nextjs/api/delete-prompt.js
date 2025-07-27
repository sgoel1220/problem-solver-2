// API endpoint for deleting user prompts
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

  if (req.method !== 'POST' && req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, promptName } = req.body;

    // Validate required fields
    if (!username || !promptName) {
      return res.status(400).json({ 
        error: 'Missing required fields: username and promptName are required' 
      });
    }

    // Validate input lengths
    if (username.length > 100) {
      return res.status(400).json({ error: 'Username too long (max 100 characters)' });
    }
    
    if (promptName.length > 200) {
      return res.status(400).json({ error: 'Prompt name too long (max 200 characters)' });
    }

    // Sanitize inputs
    const sanitizedUsername = username.trim().toLowerCase();
    const sanitizedPromptName = promptName.trim();

    // In a real app, you would delete from a database here
    // For now, we'll simulate deleting from a simple in-memory store
    // In production, use MongoDB, PostgreSQL, or other database
    
    console.log('Deleting prompt:', {
      username: sanitizedUsername,
      promptName: sanitizedPromptName,
      timestamp: new Date().toISOString()
    });

    // Simulate successful deletion
    res.status(200).json({ 
      success: true, 
      message: 'Prompt deleted successfully',
      data: {
        username: sanitizedUsername,
        promptName: sanitizedPromptName,
        deletedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error deleting prompt:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to delete prompt'
    });
  }
}