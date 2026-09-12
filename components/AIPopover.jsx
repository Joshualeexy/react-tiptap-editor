import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faWandMagicSparkles, faGear, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { AI_PROVIDERS } from '../adapters/aiAdapter.js';

const AIPopover = ({
  active,
  topic,
  onClose,
  accentColor = '#3b82f6',
  result,
  loading,
  error,
  onGenerate,
  onApply,
  setTopic,
  setTone,
  setKeywords,
  tone,
  keywords,
  length,
  setLength,
  message,
  setMessage,
  provider = 'deepseek',
  setProvider,
  model = '',
  setModel,
  allowedProviders = null,
  allowConfig = true,
}) => {
  const [showConfig, setShowConfig] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (typeof onClose === 'function') onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!active || typeof document === 'undefined') return null;

  const availableProviders = allowedProviders && Array.isArray(allowedProviders) && allowedProviders.length > 0
    ? Object.values(AI_PROVIDERS).filter((p) => allowedProviders.includes(p.id))
    : Object.values(AI_PROVIDERS);

  const currentProviderSpec = AI_PROVIDERS[provider] || availableProviders[0] || AI_PROVIDERS.deepseek;

  return createPortal(
    <div className="popover-overlay">
      <div className="popover-card max-w-3xl">
        <div className="popover-header">
          <span className="popover-title">
            <FontAwesomeIcon icon={faWandMagicSparkles} style={{ color: accentColor }} />
            AI Draft Copilot
            <span className="ai-provider-badge">
              {currentProviderSpec.icon} {currentProviderSpec.name}
            </span>
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {allowConfig && (
              <button
                type="button"
                onClick={() => setShowConfig(!showConfig)}
                className="ai-header-btn"
                title="Choose AI Model & Engine"
              >
                <FontAwesomeIcon icon={faGear} />
              </button>
            )}
            <button type="button" onClick={onClose} className="close-popover" title="Close">
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>

        <div className="popover-body">
          {/* Provider Settings Drawer */}
          {allowConfig && showConfig && (
            <div className="ai-config-drawer">
              <div className="ai-field-group">
                <label className="ai-field-label">AI Engine / Provider</label>
                <select
                  value={provider}
                  onChange={(e) => {
                    const newP = e.target.value;
                    if (setProvider) setProvider(newP);
                    if (setModel) setModel(AI_PROVIDERS[newP]?.defaultModel || '');
                  }}
                  className="ai-field-select"
                >
                  {availableProviders.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.icon} {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="ai-field-group">
                <label className="ai-field-label">Model Name</label>
                <input
                  type="text"
                  value={model || currentProviderSpec.defaultModel}
                  onChange={(e) => setModel && setModel(e.target.value)}
                  placeholder={currentProviderSpec.defaultModel}
                  className="ai-field-input"
                />
              </div>
            </div>
          )}

          {!result ? (
            <div className="ai-form-layout">
              <div className="ai-field-group col-span-2">
                <label className="ai-field-label">Article Topic or Headline</label>
                <input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  type="text"
                  placeholder="e.g. The Secret History of Damascus Steel..."
                  className="ai-field-input"
                  autoFocus
                />
              </div>

              <div className="ai-field-group">
                <label className="ai-field-label">Tone / Persona</label>
                <input
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  type="text"
                  placeholder="Practical, dramatic, investigative..."
                  className="ai-field-input"
                />
              </div>

              <div className="ai-field-group">
                <label className="ai-field-label">Target Length (Characters)</label>
                <input
                  value={length}
                  onChange={(e) => setLength(parseInt(e.target.value) || 1500)}
                  type="number"
                  min="300"
                  max="12000"
                  step="100"
                  className="ai-field-input"
                />
              </div>

              <div className="ai-field-group col-span-2">
                <label className="ai-field-label">Keywords & Instructions</label>
                <input
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  type="text"
                  placeholder="wootz, metallurgy, carbon nanotubes"
                  className="ai-field-input"
                />
              </div>
            </div>
          ) : (
            <div className="ai-preview-container">
              <div>
                <span className="ai-field-label" style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>Generated Title</span>
                <h3 className="ai-preview-title">{result.title}</h3>
              </div>
              <div>
                <span className="ai-field-label" style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>Hook Excerpt</span>
                <p className="ai-preview-excerpt">{result.excerpt}</p>
              </div>
              <div>
                <span className="ai-field-label" style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>HTML Content Preview</span>
                <div className="ai-preview-code">
                  <div dangerouslySetInnerHTML={{ __html: result.content_html || '' }} />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="popover-error">
              {error}
            </div>
          )}
        </div>

        <div className="popover-footer">
          {!result ? (
            <button
              type="button"
              onClick={onGenerate}
              disabled={loading || !(typeof topic === 'string' && topic.trim())}
              className="ai-generate-btn"
              style={{ backgroundColor: accentColor }}
            >
              {loading && <FontAwesomeIcon icon={faSpinner} className="animate-spin" />}
              {loading ? 'Synthesizing Draft...' : 'Generate Full Draft'}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onGenerate()}
                disabled={loading}
                className="btn-cancel"
              >
                Regenerate
              </button>
              <button
                type="button"
                onClick={onApply}
                className="ai-generate-btn"
                style={{ backgroundColor: accentColor }}
              >
                Insert into Editor
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AIPopover;
