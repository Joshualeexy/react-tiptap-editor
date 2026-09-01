import React from 'react';

const EditorStats = ({ editor, limit }) => {
  if (!editor) return null;

  const charCount = editor.storage.characterCount.characters() || 0;
  const wordCount = editor.storage.characterCount.words() || 0;
  const percentage = limit ? Math.min(100, Math.round((100 / limit) * charCount)) : 0;

  if (limit <= 0 && wordCount <= 0) return null;

  return (
    <div className="editor-footer">
      <div className="footer-info">
        <span className="pill">{wordCount} words</span>
        <span className="pill">{charCount}{limit > 0 ? ` / ${limit}` : ''} chars</span>
      </div>
      {limit > 0 && (
        <div className="progress-wrapper">
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${percentage}%`, background: percentage > 90 ? '#ef4444' : 'var(--accent)' }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorStats;
