/**
 * Universal AI Provider Agnostic Adapter for Craft Editor
 * Supports: DeepSeek, OpenAI, Anthropic Claude, Google Gemini, Ollama, Groq, OpenRouter, and Custom Endpoints.
 */

export const AI_PROVIDERS = {
  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek',
    icon: '⚡',
    defaultModel: 'deepseek-chat',
    models: ['deepseek-chat', 'deepseek-reasoner'],
    baseUrl: 'https://api.deepseek.com/v1',
    format: 'openai'
  },
  openai: {
    id: 'openai',
    name: 'OpenAI',
    icon: '🟢',
    defaultModel: 'gpt-4o-mini',
    models: ['gpt-4o-mini', 'gpt-4o', 'o1-mini'],
    baseUrl: 'https://api.openai.com/v1',
    format: 'openai'
  },
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic Claude',
    icon: '🧠',
    defaultModel: 'claude-3-5-sonnet-20241022',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022'],
    baseUrl: 'https://api.anthropic.com/v1',
    format: 'anthropic'
  },
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    icon: '🔷',
    defaultModel: 'gemini-1.5-flash',
    models: ['gemini-1.5-flash', 'gemini-1.5-pro'],
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    format: 'gemini'
  },
  ollama: {
    id: 'ollama',
    name: 'Ollama (Local)',
    icon: '🦙',
    defaultModel: 'llama3.1:8b',
    models: ['llama3.1:8b', 'mistral-nemo:12b', 'hermes3:8b'],
    baseUrl: 'http://localhost:11434/v1',
    format: 'openai'
  },
  groq: {
    id: 'groq',
    name: 'Groq (Ultra-Fast)',
    icon: '🚀',
    defaultModel: 'llama-3.3-70b-versatile',
    models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'],
    baseUrl: 'https://api.groq.com/openai/v1',
    format: 'openai'
  },
  custom: {
    id: 'custom',
    name: 'Custom Backend / Proxy',
    icon: '⚙️',
    defaultModel: 'default',
    models: ['default'],
    baseUrl: '',
    format: 'custom'
  }
};

export const buildSystemPrompt = ({ tone = 'engaging and clear', length = 1500, keywords = '' }) => {
  return `You are an elite expert content writer and editor.
Write a comprehensive, publication-ready article formatted in clean, semantic HTML.

CONSTRAINTS:
1. Tone: ${tone}.
2. Target Length: Approximately ${length} characters.
3. Keywords to integrate naturally: ${keywords || 'relevant domain terms'}.
4. Formatting rules:
   - Use <h2> and <h3> for structured sections.
   - Use <p> for paragraphs with punchy, engaging cadence.
   - Use <ul>/<li> or <ol>/<li> for lists.
   - Use <blockquote> for key insights or pull quotes.
   - Do NOT wrap response in markdown backticks or \`\`\`html tags.
   - Return valid JSON strictly adhering to:
     {
       "title": "Compelling Headline",
       "excerpt": "Engaging 2-sentence summary hook",
       "content_html": "<h2>Section</h2><p>Body text...</p>"
     }`;
};

/**
 * Universal dispatcher to execute AI generation across any provider
 */
export async function universalAiGenerate({
  provider = 'deepseek',
  apiKey = '',
  baseUrl = '',
  model = '',
  topic = '',
  instructions = '',
  tone = 'practical and clear',
  keywords = '',
  length = 1500,
  sourceNotes = '',
  customHandler = null,
  proxyEndpoint = ''
}) {
  // If custom developer handler is provided, delegate directly
  if (typeof customHandler === 'function') {
    return await customHandler({ topic, instructions, tone, keywords, length, sourceNotes, provider, model });
  }

  // If a server proxy endpoint is specified (e.g. /api/ai/generate), use it
  if (proxyEndpoint) {
    const res = await fetch(proxyEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, apiKey, model, topic, instructions, tone, keywords, length, sourceNotes })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Proxy request failed with status ${res.status}`);
    }
    return await res.json();
  }

  const spec = AI_PROVIDERS[provider] || AI_PROVIDERS.deepseek;
  const activeModel = model || spec.defaultModel;
  const activeBaseUrl = (baseUrl || spec.baseUrl).replace(/\/+$/, '');
  const sysPrompt = buildSystemPrompt({ tone, length, keywords });
  const userPrompt = `Topic: "${topic}"\nAdditional Instructions: "${instructions || 'Focus on value and depth'}"\n${sourceNotes ? `Context / Draft Notes: "${sourceNotes}"` : ''}`;

  // 1. OpenAI-compatible format (DeepSeek, OpenAI, Groq, Ollama, OpenRouter)
  if (spec.format === 'openai') {
    const endpoint = `${activeBaseUrl}/chat/completions`;
    const headers = {
      'Content-Type': 'application/json',
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {})
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: activeModel,
        messages: [
          { role: 'system', content: sysPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || err?.message || `API Error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    const rawText = data.choices?.[0]?.message?.content || '';
    return parseAiJson(rawText, topic);
  }

  // 2. Anthropic Claude format
  if (spec.format === 'anthropic') {
    const endpoint = `${activeBaseUrl}/messages`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'dangerously-allow-browser': 'true'
      },
      body: JSON.stringify({
        model: activeModel,
        system: sysPrompt,
        messages: [{ role: 'user', content: userPrompt }],
        max_tokens: 4096,
        temperature: 0.7
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Anthropic Error: ${res.status}`);
    }

    const data = await res.json();
    const rawText = data.content?.[0]?.text || '';
    return parseAiJson(rawText, topic);
  }

  // 3. Google Gemini format
  if (spec.format === 'gemini') {
    const endpoint = `${activeBaseUrl}/models/${activeModel}:generateContent?key=${apiKey}`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: `${sysPrompt}\n\n${userPrompt}` }]
          }
        ]
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Gemini Error: ${res.status}`);
    }

    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return parseAiJson(rawText, topic);
  }

  throw new Error(`Unsupported AI provider: ${provider}`);
}

function parseAiJson(text, fallbackTopic) {
  let clean = text.trim();
  // Strip code fences if present
  if (clean.includes('```')) {
    const parts = clean.split('```');
    clean = parts[1] || parts[0];
    if (clean.startsWith('json')) clean = clean.substring(4);
    if (clean.startsWith('html')) clean = clean.substring(4);
  }
  clean = clean.trim();

  try {
    const parsed = JSON.parse(clean);
    return {
      title: parsed.title || fallbackTopic,
      excerpt: parsed.excerpt || '',
      content_html: parsed.content_html || parsed.content || clean
    };
  } catch (e) {
    // If not strict JSON, gracefully convert raw HTML/text into result
    return {
      title: fallbackTopic,
      excerpt: clean.substring(0, 140) + '...',
      content_html: clean.startsWith('<') ? clean : `<p>${clean.replace(/\n\n/g, '</p><p>')}</p>`
    };
  }
}
