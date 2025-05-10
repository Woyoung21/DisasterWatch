const API_KEY = ;
const MODEL = 'models/gemini-2.0-flash';
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

const rateLimiter = {
  tokens: 60,
  lastRefill: Date.now(),
  refillRate: 60000,
  checkLimit: function () {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    this.tokens = Math.min(60, this.tokens + Math.floor(timePassed / this.refillRate) * 60);
    this.lastRefill = now;
    if (this.tokens < 1) return false;
    this.tokens--;
    return true;
  }
};

async function getRegionalDisasterHistory(region, city = null) {
  if (!rateLimiter.checkLimit()) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  const endpoint = `${BASE_URL}/${MODEL}:generateContent?key=${API_KEY}`;
  const location = city ? `${city}, ${region}` : region;
  const prompt = `List the most common natural disasters and environmental hazards for ${location}.

                  Format each entry EXACTLY as follows:
                  
                  **[DISASTER TYPE]:**
                  Description: [Brief description of how it affects the area]
                  Frequency: [Annual/Seasonal/Periodic with specific timeframes]
                  Severity: [Scale or rating system specific to the disaster type]
                  Sources: 
                  1. [Primary source - NOAA/USGS/CalFire/etc with specific department]
                  2. [Secondary source - Different agency with relevant division]
                  --------------------------------------------------------------------------------

                  Rules:
                  1. Use verified data only
                  2. Include specific frequencies (e.g., "3-4 times annually" not "common")
                  3. Use official severity scales where applicable
                  4. Cite specific departments/divisions within agencies
                  5. Format disaster type in bold using markdown **text**
                  6. Add separator line after each entry
                  7. Focus on ${location}-specific data`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [{ text: prompt }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    let reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) throw new Error('No valid response from Gemini');

    // Clean up the response
    reply = reply
      .replace(/undefined/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/:\s+\[/g, ': [')
      .trim();

    return reply;
  } catch (err) {
    console.error('Error fetching disaster data:', err);
    throw new Error('Failed to fetch regional disaster information');
  }
}

async function getHistoricalDisasters(region, city = null) {
  if (!rateLimiter.checkLimit()) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  const endpoint = `${BASE_URL}/${MODEL}:generateContent?key=${API_KEY}`;
  const location = city ? `${city}, ${region}` : region;
  const currentYear = new Date().getFullYear();
  const prompt = `Provide exactly 5 verified historical disasters from ${currentYear-20} to present day that directly impacted ${location}.

                  Format each entry EXACTLY as follows, with no extra text:
                  YYYY-MM-DD: [DISASTER TYPE]: [LOCATION]: [IMPACT DATA]

                  Rules:
                  1. Include only verified events with confirmed data
                  2. Use exact dates (estimate month/day if needed)
                  3. Focus on direct local impacts, not regional effects
                  4. Include specific numbers for deaths/damage costs
                  5. List from newest to oldest
                  6. Keep descriptions brief and factual
                  
                  End with a short paragraph analyzing patterns or trends.`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [{ text: prompt }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    let reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) throw new Error('No valid response from Gemini');

    // Clean up the response
    reply = reply
      .replace(/undefined/g, '')  // Remove 'undefined' text
      .replace(/\n{3,}/g, '\n\n')  // Replace multiple newlines with double newline
      .replace(/:\s+\[/g, ': [')  // Clean up spacing around brackets
      .trim();  // Remove leading/trailing whitespace

    return reply;
  } catch (err) {
    console.error('Error fetching historical data:', err);
    throw new Error('Failed to fetch historical disaster information');
  }
}

export { getRegionalDisasterHistory, getHistoricalDisasters };
