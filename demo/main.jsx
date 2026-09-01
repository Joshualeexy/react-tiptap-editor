import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Editor } from '../index.js';
import '../Editor.css';

function DemoApp() {
  const [content, setContent] = useState(`
    <h1>Welcome to @thejoshualab/react-tiptap-editor</h1>
    <p>This is a live interactive preview of your rich text and blog post editor.</p>
    <h2>Key Capabilities:</h2>
    <ul>
      <li><strong>Drag-and-Drop & Clipboard Paste:</strong> Drag any image onto this canvas or paste screenshots directly!</li>
      <li><strong>Corner Resizable Images:</strong> Click any image to resize it interactively with corner handles.</li>
      <li><strong>Cloud Link Auto-Resolution:</strong> Paste any public Google Drive or Dropbox link to convert it to a raw CDN stream.</li>
      <li><strong>Contextual Menus:</strong> Highlight any text to see the BubbleMenu with <code>target="_blank"</code> links, or click on an empty line for the FloatingMenu.</li>
    </ul>
    <blockquote>"The greatest editor is the one that gets out of the way and lets you write."</blockquote>
  `);

  return (
    <div style={{ maxWidth: '960px', margin: '40px auto', padding: '0 20px', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#1e293b' }}>
          @thejoshualab/react-tiptap-editor
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0 0' }}>
          Interactive Local Development & Test Playground
        </p>
      </header>

      <Editor
        value={content}
        onChange={setContent}
        placeholder="Write something amazing..."
        accentColor="#3b82f6"
      />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DemoApp />
  </React.StrictMode>
);
