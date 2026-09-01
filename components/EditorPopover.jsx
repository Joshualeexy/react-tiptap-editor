import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faUpload,
  faGlobe,
  faImages,
  faArrowLeft,
  faCheck,
  faCloudArrowUp
} from '@fortawesome/free-solid-svg-icons';
import {
  faGoogleDrive,
  faDropbox
} from '@fortawesome/free-brands-svg-icons';
import { resolveCloudImageUrl, openGooglePicker, openDropboxChooser } from '../adapters/cloudStorageAdapter.js';

const EditorPopover = ({
  activePopover,
  popoverSubMode,
  setPopoverSubMode,
  popoverInput,
  setPopoverInput,
  linkOpenInNewTab = true,
  setLinkOpenInNewTab,
  popoverInputRef,
  confirmPopover,
  closePopover,
  accentColor = '#3b82f6',
  popoverError,
  setPopoverError,
  handleImageUpload,
  openMediaPicker,
  cloudConfig = {}
}) => {
  const fileInputRef = useRef(null);
  const [cloudMode, setCloudMode] = useState(null); // 'gdrive' | 'dropbox' | null
  const [cloudUrlInput, setCloudUrlInput] = useState('');

  if (!activePopover || activePopover === 'ai' || typeof document === 'undefined') return null;

  const isImageSelection = activePopover === 'image' && popoverSubMode === 'select';

  const handleApplyUrl = () => {
    const raw = popoverInput.trim();
    if (!raw && activePopover !== 'link') {
      setPopoverError('Please enter a valid URL.');
      return;
    }
    // Auto-resolve Google Drive, Dropbox, or OneDrive share URLs into direct raw CDN streams!
    const resolved = resolveCloudImageUrl(raw);
    setPopoverInput(resolved);
    confirmPopover(resolved, { openInNewTab: linkOpenInNewTab });
  };

  const handleCloudUrlApply = () => {
    const raw = cloudUrlInput.trim();
    if (!raw) {
      setPopoverError('Please paste a link.');
      return;
    }
    const resolved = resolveCloudImageUrl(raw);
    setPopoverInput(resolved);
    confirmPopover(resolved);
    setCloudMode(null);
    setCloudUrlInput('');
  };

  const handleLaunchGooglePicker = () => {
    if (cloudConfig.googleClientId && cloudConfig.googleDeveloperKey) {
      try {
        openGooglePicker({
          clientId: cloudConfig.googleClientId,
          developerKey: cloudConfig.googleDeveloperKey,
          onSelect: ({ url }) => {
            setPopoverInput(url);
            confirmPopover(url);
          },
          onCancel: () => {}
        });
      } catch (err) {
        setPopoverError(err.message || 'Could not open Google Picker.');
      }
    } else {
      // Direct Link Input mode
      setCloudMode('gdrive');
      setPopoverError('');
    }
  };

  const handleLaunchDropboxChooser = () => {
    if (cloudConfig.dropboxAppKey) {
      try {
        openDropboxChooser({
          appKey: cloudConfig.dropboxAppKey,
          onSelect: ({ url }) => {
            setPopoverInput(url);
            confirmPopover(url);
          },
          onCancel: () => {}
        });
      } catch (err) {
        setPopoverError(err.message || 'Could not open Dropbox Chooser.');
      }
    } else {
      // Direct Link Input mode
      setCloudMode('dropbox');
      setPopoverError('');
    }
  };

  return createPortal(
    <div className="popover-overlay">
      <div className={`popover-card ${isImageSelection ? 'max-w-lg' : ''}`}>
        <div className="popover-header">
          <span className="popover-title">
            {cloudMode ? (
              <button
                type="button"
                onClick={() => setCloudMode(null)}
                className="close-popover"
                title="Back to sources"
                style={{ marginRight: '0.4rem' }}
              >
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>
            ) : null}
            {cloudMode === 'gdrive'
              ? 'Import from Google Drive'
              : cloudMode === 'dropbox'
              ? 'Import from Dropbox'
              : isImageSelection
              ? 'Select Media Source'
              : activePopover === 'link'
              ? 'Insert / Edit Link'
              : activePopover === 'image'
              ? 'Insert Image'
              : activePopover === 'youtube'
              ? 'Embed YouTube Video'
              : 'Insert Media'}
          </span>
          <button type="button" onClick={closePopover} className="close-popover" title="Close">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="popover-body">
          {/* Cloud Specific Input View */}
          {cloudMode ? (
            <>
              <p className="popover-note">
                {cloudMode === 'gdrive'
                  ? 'Paste any Google Drive sharing link ("Anyone with the link can view"). It will be instantly converted into a high-speed direct image stream.'
                  : 'Paste any Dropbox share link ("Copy link"). It will be automatically converted to a direct raw image.'}
              </p>
              <input
                type="text"
                value={cloudUrlInput}
                onChange={(e) => setCloudUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCloudUrlApply();
                  }
                }}
                placeholder={
                  cloudMode === 'gdrive'
                    ? 'https://drive.google.com/file/d/...'
                    : 'https://www.dropbox.com/s/...'
                }
                className="popover-input"
                autoFocus
              />
              <div className="popover-actions">
                <button
                  type="button"
                  onClick={() => setCloudMode(null)}
                  className="btn-cancel"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCloudUrlApply}
                  className="btn-confirm"
                  style={{ backgroundColor: accentColor }}
                >
                  <FontAwesomeIcon icon={faCheck} />
                  Insert Image
                </button>
              </div>
            </>
          ) : isImageSelection ? (
            <div className="source-selection">
              {/* 1. Upload Device */}
              <button
                type="button"
                className="selection-option"
                onClick={() => {
                  setPopoverError('');
                  fileInputRef.current?.click();
                }}
              >
                <div className="option-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                  <FontAwesomeIcon icon={faUpload} />
                </div>
                <div className="option-text">
                  <span className="option-title">My Device</span>
                  <span className="option-subtitle">Upload local file</span>
                </div>
              </button>

              {/* 2. Media Library */}
              <button
                type="button"
                className="selection-option"
                onClick={openMediaPicker}
              >
                <div className="option-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                  <FontAwesomeIcon icon={faImages} />
                </div>
                <div className="option-text">
                  <span className="option-title">Media Library</span>
                  <span className="option-subtitle">Browse CMS assets</span>
                </div>
              </button>

              {/* 3. Google Drive */}
              <button
                type="button"
                className="selection-option"
                onClick={handleLaunchGooglePicker}
              >
                <div className="option-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                  <FontAwesomeIcon icon={faGoogleDrive} />
                </div>
                <div className="option-text">
                  <span className="option-title">Google Drive</span>
                  <span className="option-subtitle">Import from Drive</span>
                </div>
              </button>

              {/* 4. Dropbox */}
              <button
                type="button"
                className="selection-option"
                onClick={handleLaunchDropboxChooser}
              >
                <div className="option-icon" style={{ background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4' }}>
                  <FontAwesomeIcon icon={faDropbox} />
                </div>
                <div className="option-text">
                  <span className="option-title">Dropbox</span>
                  <span className="option-subtitle">Import from Dropbox</span>
                </div>
              </button>

              {/* 5. Direct Web URL */}
              <button
                type="button"
                className="selection-option selection-option-full"
                onClick={() => {
                  setPopoverSubMode('url');
                  setPopoverError('');
                }}
              >
                <div className="option-icon" style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}>
                  <FontAwesomeIcon icon={faGlobe} />
                </div>
                <div className="option-text">
                  <span className="option-title">Direct Web URL</span>
                  <span className="option-subtitle">Auto-resolves Google Drive, Dropbox, or CDN links</span>
                </div>
              </button>

              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    void handleImageUpload(file);
                  }
                }}
              />
            </div>
          ) : (
            <>
              <input
                type="text"
                value={popoverInput}
                onChange={(e) => setPopoverInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleApplyUrl();
                  }
                }}
                placeholder="https://..."
                ref={popoverInputRef}
                className="popover-input"
              />
              {activePopover === 'link' && (
                <label className="popover-checkbox">
                  <input
                    type="checkbox"
                    checked={linkOpenInNewTab}
                    onChange={(e) => setLinkOpenInNewTab && setLinkOpenInNewTab(e.target.checked)}
                  />
                  <span>Open link in new tab (<code>target="_blank"</code>)</span>
                </label>
              )}
              <div className="popover-actions">
                {activePopover === 'image' && (
                  <button
                    type="button"
                    onClick={() => setPopoverSubMode('select')}
                    className="btn-cancel"
                  >
                    Back
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="btn-confirm"
                  style={{ backgroundColor: accentColor }}
                >
                  Apply
                </button>
              </div>
            </>
          )}

          {popoverError && (
            <div className="popover-error">
              {popoverError}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default EditorPopover;
