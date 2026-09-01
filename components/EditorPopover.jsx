import React, { useRef, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faUpload,
  faGlobe,
  faImages,
  faArrowLeft,
  faCheck,
  faCloudArrowUp,
  faCamera,
  faSearch,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import {
  faGoogleDrive,
  faDropbox
} from '@fortawesome/free-brands-svg-icons';
import { resolveCloudImageUrl, openGooglePicker, openDropboxChooser } from '../adapters/cloudStorageAdapter.js';

const EditorPopover = (props) => {
  const {
    activePopover = props.type,
    popoverSubMode = props.subMode,
    setPopoverSubMode = props.setSubMode,
    popoverInput = props.input ?? '',
    setPopoverInput = props.setInput,
    linkOpenInNewTab = true,
    setLinkOpenInNewTab,
    popoverInputRef = props.inputRef,
    confirmPopover,
    closePopover = props.onClose,
    accentColor = '#3b82f6',
    popoverError = props.error,
    setPopoverError,
    handleImageUpload = props.onUpload,
    openMediaPicker,
    cloudConfig = {}
  } = props;

  const fileInputRef = useRef(null);
  const [cloudMode, setCloudMode] = useState(null); // 'gdrive' | 'dropbox' | 'unsplash' | null
  const [cloudUrlInput, setCloudUrlInput] = useState('');
  
  // Stock Photo States
  const [stockQuery, setStockQuery] = useState('nature');
  const [stockPhotos, setStockPhotos] = useState([]);
  const [stockLoading, setStockLoading] = useState(false);

  const fetchStockPhotos = useCallback(async (query) => {
    setStockLoading(true);
    try {
      if (cloudConfig.unsplashAccessKey) {
        const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query || 'nature')}&per_page=12`, {
          headers: { Authorization: `Client-ID ${cloudConfig.unsplashAccessKey}` }
        });
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          setStockPhotos(data.results.map(r => ({
            id: r.id,
            url: r.urls?.regular || r.urls?.small,
            thumb: r.urls?.small || r.urls?.thumb,
            author: r.user?.name || 'Unsplash Photographer',
            alt: r.alt_description || query
          })));
          setStockLoading(false);
          return;
        }
      }

      // Curated free photo feed
      const pageSeed = (query.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 25) + 1;
      const res = await fetch(`https://picsum.photos/v2/list?page=${pageSeed}&limit=12`);
      const data = await res.json();
      setStockPhotos(data.map(item => ({
        id: item.id,
        url: `https://picsum.photos/id/${item.id}/1200/800`,
        thumb: `https://picsum.photos/id/${item.id}/400/260`,
        author: item.author,
        alt: `${query} photo by ${item.author}`
      })));
    } catch (err) {
      console.warn('Stock photos error:', err);
    } finally {
      setStockLoading(false);
    }
  }, [cloudConfig.unsplashAccessKey]);

  useEffect(() => {
    if (cloudMode === 'unsplash' && stockPhotos.length === 0) {
      fetchStockPhotos(stockQuery);
    }
  }, [cloudMode, stockPhotos.length, stockQuery, fetchStockPhotos]);

  if (!activePopover || activePopover === 'ai' || typeof document === 'undefined') return null;

  const isImageSelection = activePopover === 'image' && popoverSubMode === 'select';

  const handleApplyUrl = () => {
    const raw = (typeof popoverInput === 'string' ? popoverInput : (popoverInput ? String(popoverInput) : '')).trim();
    if (!raw && activePopover !== 'link') {
      if (typeof setPopoverError === 'function') setPopoverError('Please enter a valid URL.');
      return;
    }
    // Auto-resolve Google Drive, Dropbox, or OneDrive share URLs into direct raw CDN streams!
    const resolved = resolveCloudImageUrl(raw);
    if (typeof setPopoverInput === 'function') setPopoverInput(resolved);
    if (typeof confirmPopover === 'function') confirmPopover(resolved, { openInNewTab: linkOpenInNewTab });
  };

  const handleCloudUrlApply = () => {
    const raw = (typeof cloudUrlInput === 'string' ? cloudUrlInput : (cloudUrlInput ? String(cloudUrlInput) : '')).trim();
    if (!raw) {
      if (typeof setPopoverError === 'function') setPopoverError('Please paste a link.');
      return;
    }
    const resolved = resolveCloudImageUrl(raw);
    if (typeof setPopoverInput === 'function') setPopoverInput(resolved);
    if (typeof confirmPopover === 'function') confirmPopover(resolved);
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
      <div className={`popover-card ${cloudMode === 'unsplash' ? 'max-w-3xl' : isImageSelection ? 'max-w-lg' : ''}`}>
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
              : cloudMode === 'unsplash'
              ? 'Free Stock Photos'
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
          {/* Stock Photos View */}
          {cloudMode === 'unsplash' ? (
            <div className="stock-photos-container">
              <div className="stock-search-row">
                <div className="stock-search-input-wrapper">
                  <FontAwesomeIcon icon={faSearch} className="stock-search-icon" />
                  <input
                    type="text"
                    value={stockQuery}
                    onChange={(e) => setStockQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        fetchStockPhotos(stockQuery);
                      }
                    }}
                    placeholder="Search high-res stock photos..."
                    className="stock-search-input"
                    autoFocus
                  />
                </div>
                <button
                  type="button"
                  onClick={() => fetchStockPhotos(stockQuery)}
                  className="btn-confirm"
                  style={{ backgroundColor: accentColor, padding: '0.6rem 1.25rem' }}
                >
                  Search
                </button>
              </div>

              {/* Quick filter chips */}
              <div className="stock-chips">
                {['Nature', 'Minimalist', 'Technology', 'Architecture', 'Workspace', 'Abstract'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setStockQuery(cat);
                      fetchStockPhotos(cat);
                    }}
                    className={`stock-chip ${stockQuery.toLowerCase() === cat.toLowerCase() ? 'active' : ''}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Photos Grid */}
              <div className="stock-grid">
                {stockLoading ? (
                  <div className="stock-loading">
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin text-xl text-blue-500" />
                    <span>Loading stunning photos...</span>
                  </div>
                ) : stockPhotos.length === 0 ? (
                  <div className="stock-empty">No photos found. Try searching for something else!</div>
                ) : (
                  stockPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      className="stock-item"
                      onClick={() => {
                        confirmPopover(photo.url, { alt: photo.alt });
                        setCloudMode(null);
                      }}
                      title={`Insert photo by ${photo.author}`}
                    >
                      <img src={photo.thumb || photo.url} alt={photo.alt} loading="lazy" />
                      <div className="stock-item-overlay">
                        <span className="stock-author">Photo by {photo.author}</span>
                        <span className="stock-insert-btn" style={{ backgroundColor: accentColor }}>Insert</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : cloudMode ? (
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

              {/* 5. Stock Photos */}
              <button
                type="button"
                className="selection-option"
                onClick={() => {
                  setCloudMode('unsplash');
                  setPopoverError('');
                }}
              >
                <div className="option-icon" style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' }}>
                  <FontAwesomeIcon icon={faCamera} />
                </div>
                <div className="option-text">
                  <span className="option-title">Stock Photos</span>
                  <span className="option-subtitle">Browse free high-res photos</span>
                </div>
              </button>

              {/* 6. Direct Web URL */}
              <button
                type="button"
                className="selection-option selection-option-full"
                onClick={() => {
                  if (typeof setPopoverSubMode === 'function') setPopoverSubMode('url');
                  if (typeof setPopoverError === 'function') setPopoverError('');
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
                  if (file && typeof handleImageUpload === 'function') {
                    void handleImageUpload(file);
                  }
                }}
              />
            </div>
          ) : (
            <>
              <input
                type="text"
                value={popoverInput || ''}
                onChange={(e) => typeof setPopoverInput === 'function' && setPopoverInput(e.target.value)}
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
                    onClick={() => typeof setPopoverSubMode === 'function' && setPopoverSubMode('select')}
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
