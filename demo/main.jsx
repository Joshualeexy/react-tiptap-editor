import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Editor } from '../index.js';
import '../Editor.css';
import './demo.css';

const SAMPLE_DOCUMENT = `<p><img src="https://yt3.googleusercontent.com/ft9qar4vVe-v5DaDfNM9-WXESpgp2NUI5h6rWPYbiqDvrl0noa7Crx5V4I29PWdYv7c3BbwWNUw=w1707-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-rj" alt="The Joshua Lab Channel Banner" referrerpolicy="no-referrer" /></p>

<h1>Building Systems. Automating Everything.</h1>
<p>Welcome to <strong>@thejoshualab/react-tiptap-editor</strong> — a modern, high-performance WYSIWYG rich text editor engineered for developers, content creators, and enterprise web applications. Designed from the ground up with native media embeds, precision two-tier formatting, and built-in AI authoring tools.</p>

<h3>Key Architectural Highlights:</h3>
<ul>
  <li><strong>Precision Two-Tier Toolbar:</strong> Dedicated rows for rapid inline styling, headings, typography scales, font families, and code views.</li>
  <li><strong>Adaptive Canvas Views:</strong> Toggle fluidly between an elevated <em>Document Paper Sheet</em>, a clean <em>Classic Form</em> container, and a distraction-free <em>Inline</em> experience.</li>
  <li><strong>Interactive Media & Embeds:</strong> Responsive YouTube players, high-resolution Unsplash stock discovery, and intuitive drag-and-drop image resizing with presets.</li>
  <li><strong>Built-in AI Copilot:</strong> Context-aware content generation, grammar perfection, tone shifts, and summarization right in your editor flow.</li>
</ul>

<h3>Quick Start & Initialization:</h3>
<p>Install the package via npm or pnpm:</p>
<pre><code>npm install @thejoshualab/react-tiptap-editor</code></pre>

<p>Initialize the editor inside any React component:</p>
<pre><code>import React, { useState } from 'react';
import { Editor } from '@thejoshualab/react-tiptap-editor';
import '@thejoshualab/react-tiptap-editor/dist/index.css';

export default function DocumentEditor() {
  const [content, setContent] = useState('&lt;h1&gt;Building Systems.&lt;/h1&gt;');

  return (
    &lt;Editor
      value={content}
      onChange={setContent}
      mode="document"
      placeholder="Start typing your story..."
      showModeSwitcher={true}
      accentColor="#2563eb"
    /&gt;
  );
}</code></pre>

<blockquote>
  "The best software doesn't just process input — it amplifies creative velocity and brings clarity to complex systems."
</blockquote>

<div data-youtube-video="">
  <iframe src="https://www.youtube.com/embed/9VPwJHJxyIg"></iframe>
</div>

<p>Feel free to edit this canvas: select any text to open the floating bubble menu, test the image resize presets above, or format tables and code blocks with the toolbar!</p>`;

function EditorStudioDemo() {
  const [content, setContent] = useState(() => {
    try {
      const saved = localStorage.getItem('react_tiptap_editor_draft');
      if (saved && saved.includes('DocumentEditor')) {
        return saved;
      }
    } catch (_) {}
    return SAMPLE_DOCUMENT;
  });
  const [accentColor, setAccentColor] = useState('#2563eb');
  const [copied, setCopied] = useState(false);

  const handleCopyHtml = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy HTML: ', err);
    }
  };

  const handleClear = () => {
    setContent('<p></p>');
  };

  const handleResetSample = () => {
    setContent(SAMPLE_DOCUMENT);
    try {
      localStorage.setItem('react_tiptap_editor_draft', SAMPLE_DOCUMENT);
    } catch (_) {}
  };

  return (
    <div className="app-wrapper">
      {/* Top Application Bar */}
      <header className="app-header">
        <div className="header-brand">
          <span className="brand-icon">✍️</span>
          <span className="brand-title">Editor Studio</span>
          <a
            href="https://www.npmjs.com/package/@thejoshualab/react-tiptap-editor"
            target="_blank"
            rel="noopener noreferrer"
            className="pkg-badge"
            title="View on npm"
            style={{ textDecoration: 'none' }}
          >
            📦 @thejoshualab/react-tiptap-editor v1.1.0 ↗
          </a>
        </div>

        <div className="header-actions">
          <div className="live-indicator">
            <span className="pulse-dot"></span>
            <span>WYSIWYG Active</span>
          </div>

          <label className="color-picker-label" title="Change Editor Accent Color">
            <span>Accent:</span>
            <input
              type="color"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className="color-input"
            />
          </label>

          <button type="button" className="btn-secondary" onClick={handleResetSample}>
            Load Sample
          </button>

          <button type="button" className="btn-secondary" onClick={handleClear}>
            Clear
          </button>

          <button type="button" className="btn-primary" onClick={handleCopyHtml}>
            {copied ? '✓ Copied HTML!' : '📋 Copy HTML'}
          </button>
        </div>
      </header>

      {/* Main Full-Width Centered Studio */}
      <main className="main-studio-container">
        <Editor
          value={content}
          onChange={(newHtml) => setContent(newHtml)}
          placeholder="Write something amazing..."
          accentColor={accentColor}
          mode="document"
          showModeSwitcher={true}
        />
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <EditorStudioDemo />
  </React.StrictMode>
);
