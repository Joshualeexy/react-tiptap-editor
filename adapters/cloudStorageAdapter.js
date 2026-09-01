/**
 * Cloud Storage Adapter for Craft Editor
 * Direct link resolver & cloud pickers for Google Drive, Dropbox, OneDrive, and Box.
 */

/**
 * Automatically transforms cloud share links (Google Drive, Dropbox, Box) into direct, raw image CDN streams.
 */
export function resolveCloudImageUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();

  // 1. Google Drive Link Resolver
  // e.g. https://drive.google.com/file/d/1A2B3C4D5E/view?usp=sharing
  // or https://drive.google.com/open?id=1A2B3C4D5E
  // or https://drive.google.com/uc?id=1A2B3C4D5E
  const gDriveMatch = trimmed.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:.*&)?id=)([a-zA-Z0-9_-]+)/);
  if (gDriveMatch && gDriveMatch[1]) {
    const fileId = gDriveMatch[1];
    // lh3.googleusercontent.com/d/{id} provides the fastest direct high-res image stream without cookies/redirects
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  // 2. Dropbox Link Resolver
  // e.g. https://www.dropbox.com/s/abcdefg/photo.jpg?dl=0
  // or https://www.dropbox.com/scl/fi/xxxx/photo.jpg?rlkey=xxxx&dl=0
  if (trimmed.includes('dropbox.com')) {
    // Replace www.dropbox.com with dl.dropboxusercontent.com and set raw=1
    let direct = trimmed.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
    direct = direct.replace(/[?&]dl=[01]/g, '');
    const separator = direct.includes('?') ? '&' : '?';
    return `${direct}${separator}raw=1`;
  }

  // 3. OneDrive Link Resolver
  // e.g. https://1drv.ms/u/s!... or onedrive.live.com
  if (trimmed.includes('1drv.ms') || trimmed.includes('onedrive.live.com')) {
    if (trimmed.includes('download=1')) return trimmed;
    const sep = trimmed.includes('?') ? '&' : '?';
    return `${trimmed}${sep}download=1`;
  }

  // 4. Standard Web URL (Unchanged)
  return trimmed;
}

/**
 * Loads and opens Dropbox Chooser
 */
export function openDropboxChooser({ appKey, onSelect, onCancel }) {
  if (!appKey) {
    throw new Error('Dropbox App Key is required to launch Dropbox Chooser.');
  }

  function launch() {
    if (!window.Dropbox) {
      throw new Error('Dropbox Chooser SDK failed to initialize.');
    }

    window.Dropbox.choose({
      success: (files) => {
        if (files && files.length > 0) {
          const file = files[0];
          // Use the direct link or transform it
          const rawUrl = file.link.replace('?dl=0', '?raw=1');
          onSelect({
            url: rawUrl,
            name: file.name,
            size: file.bytes,
            thumbnailUrl: file.thumbnails?.['640x480'] || rawUrl
          });
        }
      },
      cancel: () => {
        if (onCancel) onCancel();
      },
      linkType: 'direct',
      multiselect: false,
      extensions: ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']
    });
  }

  if (window.Dropbox) {
    launch();
  } else {
    // Dynamically inject Dropbox script
    const script = document.createElement('script');
    script.src = 'https://www.dropbox.com/static/api/2/dropins.js';
    script.id = 'dropboxjs';
    script.setAttribute('data-app-key', appKey);
    script.onload = () => launch();
    script.onerror = () => {
      throw new Error('Could not load Dropbox SDK script.');
    };
    document.body.appendChild(script);
  }
}

/**
 * Loads and opens Google Drive Picker
 */
export function openGooglePicker({ developerKey, clientId, onSelect, onCancel }) {
  if (!developerKey || !clientId) {
    throw new Error('Google Developer Key (API Key) and Client ID are required.');
  }

  function loadPicker(oauthToken) {
    window.gapi.load('picker', () => {
      const view = new window.google.picker.View(window.google.picker.ViewId.DOCS_IMAGES);
      view.setMimeTypes('image/png,image/jpeg,image/jpg,image/webp,image/gif');

      const picker = new window.google.picker.PickerBuilder()
        .enableFeature(window.google.picker.Feature.NAV_HIDDEN)
        .setAppId(clientId)
        .setOAuthToken(oauthToken)
        .addView(view)
        .setDeveloperKey(developerKey)
        .setCallback((data) => {
          if (data[window.google.picker.Response.ACTION] === window.google.picker.Action.PICKED) {
            const doc = data[window.google.picker.Response.DOCUMENTS][0];
            const fileId = doc[window.google.picker.Document.ID];
            const name = doc[window.google.picker.Document.NAME];
            const directUrl = `https://lh3.googleusercontent.com/d/${fileId}`;
            onSelect({
              url: directUrl,
              id: fileId,
              name,
              thumbnailUrl: doc[window.google.picker.Document.THUMBNAIL_URL] || directUrl
            });
          } else if (data[window.google.picker.Response.ACTION] === window.google.picker.Action.CANCEL) {
            if (onCancel) onCancel();
          }
        })
        .build();

      picker.setVisible(true);
    });
  }

  // Check if gapi and google.accounts are available
  function initAuth() {
    if (!window.google?.accounts?.oauth2) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = () => initAuth();
      document.body.appendChild(script);
      return;
    }

    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'https://www.googleapis.com/auth/drive.readonly',
      callback: (response) => {
        if (response.error) {
          if (onCancel) onCancel();
          return;
        }
        loadPicker(response.access_token);
      },
    });

    tokenClient.requestAccessToken({ prompt: 'consent' });
  }

  if (!window.gapi) {
    const gapiScript = document.createElement('script');
    gapiScript.src = 'https://apis.google.com/js/api.js';
    gapiScript.onload = () => initAuth();
    document.body.appendChild(gapiScript);
  } else {
    initAuth();
  }
}
