// Vercel Serverless Function - Claude API Proxy
// This keeps your API key secure on the server side

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get API key from environment variable
  const apiKey = process.env.CLAUDE_API_KEY;

  if (!apiKey) {
    console.error('CLAUDE_API_KEY not found in environment variables');
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const { name, tags } = req.body;

    // Validate input
    if (!name || !tags || !Array.isArray(tags)) {
      return res.status(400).json({ error: 'Invalid request: name and tags required' });
    }

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `Generate clear, concise workout instructions for "${name}" targeting: ${tags.join(', ')}.\nFormat as numbered steps (1. 2. 3. etc). Cover: starting position, movement execution, breathing, and common cues. Keep it practical and under 200 words. Plain text only, no markdown.`
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Claude API error:', errorData);
      return res.status(response.status).json({
        error: 'Failed to generate instructions',
        details: errorData
      });
    }

    const data = await response.json();
    const instructions = data.content?.[0]?.text || 'Could not generate instructions.';

    return res.status(200).json({ instructions });

  } catch (error) {
    console.error('Error generating instructions:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
