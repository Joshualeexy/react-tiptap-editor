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
  const [isDark, setIsDark] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = React.useRef(null);

  React.useEffect(() => {
    document.body.classList.toggle('dark', isDark);
  }, [isDark]);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };

    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

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
    <div className={`app-wrapper ${isDark ? 'dark' : ''}`}>
      {/* Top Application Bar */}
      <header className="app-header">
        <div className="header-brand">
          <span className="brand-icon" aria-hidden="true">✍️</span>
          <span className="brand-title">Editor Studio</span>
          <a
            href="https://www.npmjs.com/package/@thejoshualab/react-tiptap-editor"
            target="_blank"
            rel="noopener noreferrer"
            className="pkg-badge"
            title="View @thejoshualab/react-tiptap-editor on npm"
            style={{ textDecoration: 'none' }}
          >
            <span className="pkg-badge-icon">📦</span>
            <span className="pkg-badge-full">@thejoshualab/react-tiptap-editor v2.0.0</span>
            <span className="pkg-badge-short">v2.0.0</span>
            <span className="pkg-badge-arrow">↗</span>
          </a>
        </div>

        <div className="header-actions">
          <div className="live-indicator" title="Editor Engine: WYSIWYG Active">
            <span className="pulse-dot"></span>
            <span className="live-text-full">WYSIWYG Active</span>
            <span className="live-text-short">Active</span>
          </div>

          <label className="color-picker-label" title={`Accent Color: ${accentColor}`}>
            <span className="accent-label-text">Accent:</span>
            <div className="color-swatch-wrapper" style={{ backgroundColor: accentColor }}>
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="color-input"
                aria-label="Editor accent color"
              />
            </div>
          </label>

          <button
            type="button"
            className="btn-secondary"
            onClick={() => setIsDark((prev) => !prev)}
            title="Toggle Dark / Light Mode"
          >
            {isDark ? '☀️ Light' : '🌙 Dark'}
          </button>

          <button
            type="button"
            className="btn-secondary desktop-only-btn"
            onClick={handleResetSample}
            title="Reset to sample document"
          >
            <span className="btn-text-full">Load Sample</span>
            <span className="btn-text-short">Sample</span>
          </button>

          <button
            type="button"
            className="btn-secondary desktop-only-btn"
            onClick={handleClear}
            title="Clear editor canvas"
          >
            Clear
          </button>

          <button
            type="button"
            className="btn-primary"
            onClick={handleCopyHtml}
            title="Copy editor HTML"
          >
            {copied ? (
              <span>✓ Copied!</span>
            ) : (
              <>
                <span className="btn-icon">📋</span>
                <span className="copy-text-full">Copy HTML</span>
                <span className="copy-text-short">Copy</span>
              </>
            )}
          </button>

          {/* Mobile Overflow Menu */}
          <div className="mobile-menu-container" ref={menuRef}>
            <button
              type="button"
              className={`btn-icon-menu ${mobileMenuOpen ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="More actions"
              aria-expanded={mobileMenuOpen}
              title="More actions"
            >
              ⋯
            </button>

            {mobileMenuOpen && (
              <div className="mobile-dropdown-menu" role="menu">
                <div className="mobile-dropdown-header">
                  <span className="pulse-dot"></span>
                  <span>WYSIWYG Engine Active</span>
                </div>

                <button
                  type="button"
                  className="mobile-dropdown-item"
                  onClick={() => {
                    setIsDark((prev) => !prev);
                    setMobileMenuOpen(false);
                  }}
                >
                  <span className="dropdown-item-icon">{isDark ? '☀️' : '🌙'}</span>
                  <span>Toggle {isDark ? 'Light' : 'Dark'} Mode</span>
                </button>

                <button
                  type="button"
                  className="mobile-dropdown-item"
                  onClick={() => {
                    handleResetSample();
                    setMobileMenuOpen(false);
                  }}
                >
                  <span className="dropdown-item-icon">📄</span>
                  <span>Load Sample Document</span>
                </button>

                <button
                  type="button"
                  className="mobile-dropdown-item text-danger"
                  onClick={() => {
                    handleClear();
                    setMobileMenuOpen(false);
                  }}
                >
                  <span className="dropdown-item-icon">🗑️</span>
                  <span>Clear Canvas</span>
                </button>

                <div className="mobile-dropdown-divider"></div>

                <a
                  href="https://www.npmjs.com/package/@thejoshualab/react-tiptap-editor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mobile-dropdown-item"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ textDecoration: 'none' }}
                >
                  <span className="dropdown-item-icon">📦</span>
                  <span>npm package (v2.0.0) ↗</span>
                </a>
              </div>
            )}
          </div>
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
          theme={isDark ? 'dark' : 'light'}
          showModeSwitcher={true}
          aiConfig={{
            provider: 'ollama',
            model: 'qwen3:8b'
          }}
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
