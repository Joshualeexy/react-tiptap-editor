# @thejoshualab/react-tiptap-editor

> A high-productivity WYSIWYG rich text and blog editor for React with **Universal AI Drafting**, **Google Drive & Dropbox Cloud Import**, freeform resizable media, dual contextual menus, and zero vendor lock-in.

[![npm version](https://img.shields.io/npm/v/@thejoshualab/react-tiptap-editor.svg)](https://www.npmjs.com/package/@thejoshualab/react-tiptap-editor)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

---

## ✨ Features

- **Universal AI Copilot (Provider-Agnostic):**
  - Out-of-the-box support for **DeepSeek**, **OpenAI**, **Anthropic Claude**, **Google Gemini**, **Ollama (Local / Offline)**, and **Groq**.
  - Built-in provider switcher with real-time live HTML card previews before insertion.
  - Secure backend proxy support to protect server API keys.
- **Cloud Storage Pickers (Google Drive & Dropbox):**
  - **Zero-Config Direct Paste:** Paste any Google Drive or Dropbox sharing link—the editor instantly resolves it into a high-speed raw image CDN stream (`lh3.googleusercontent.com` or `?raw=1`), bypassing viewer wrappers!
  - **Native Pickers:** Mounts Google Drive Picker and Dropbox Chooser SDK dialogs with `cloudConfig`.
- **Fluid Resizable Media:**
  - Interactive corner drag-to-resize with aspect ratio preservation and live pixel size indicators.
  - **Direct Drag-and-Drop:** Drop image files from your desktop directly onto the canvas.
  - **Instant Clipboard Paste:** Paste screenshots or copied images directly (`Ctrl+V` / `Cmd+V`).
  - Automatic fallback to base64 Data URLs when no backend upload server is configured.
- **Dual Contextual Menus:**
  - `FloatingMenu` on empty lines (H1, H2, Tables, Media).
  - `BubbleMenu` on text selection (Bold, Italic, Color Highlighter, Link with `target="_blank"` toggle).
- **Rich Document Elements:**
  - Nested checklists / task lists, resizable HTML tables, YouTube embeds, subscript/superscript, underlines, alignments, and typography enhancement.
- **Full TypeScript Support:**
  - Ships with complete type definitions (`Editor.d.ts`).
- **Dark Mode & Theming:**
  - Automatic system dark mode (`prefers-color-scheme: dark`) and parent `.dark` class support.
  - Dynamic `--accent` and `--accent-highlight` CSS variables driven by your `accentColor` prop.

---

## 📦 Installation

```bash
npm install @thejoshualab/react-tiptap-editor
```

or with yarn / pnpm:

```bash
yarn add @thejoshualab/react-tiptap-editor
# or
pnpm add @thejoshualab/react-tiptap-editor
```

> **Peer Dependency Requirement:** Ensure your project has `react` and `react-dom` (>= 18.0.0) installed.

---

## 🚀 Quick Start

```jsx
import React, { useState } from 'react';
import { Editor } from '@thejoshualab/react-tiptap-editor';
import '@thejoshualab/react-tiptap-editor/Editor.css';

export default function BlogPostEditor() {
  const [content, setContent] = useState('<h2>Welcome to the editor!</h2><p>Start typing...</p>');

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Editor
        value={content}
        onChange={setContent}
        placeholder="Write something amazing..."
        accentColor="#3b82f6"
        // Universal AI Configuration (Optional):
        aiConfig={{
          provider: 'deepseek', // 'deepseek' | 'openai' | 'anthropic' | 'gemini' | 'ollama' | 'groq'
          apiKey: process.env.NEXT_PUBLIC_AI_KEY,
          model: 'deepseek-chat',
        }}
        // Cloud Storage Pickers (Optional):
        cloudConfig={{
          googleClientId: 'YOUR_GOOGLE_CLIENT_ID',
          googleDeveloperKey: 'YOUR_GOOGLE_API_KEY',
          dropboxAppKey: 'YOUR_DROPBOX_APP_KEY',
        }}
      />
    </div>
  );
}
```

---

## 🛠️ Props Reference (`EditorProps`)

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `value` | `string` | `''` | Initial or controlled HTML content of the editor. |
| `onChange` | `(html: string) => void` | `() => {}` | Callback invoked whenever editor content changes. Returns semantic HTML. |
| `placeholder` | `string` | `'Write something amazing...'` | Placeholder text displayed when editor is empty. |
| `accentColor` | `string` | `'#3b82f6'` | Primary theme color applied to active buttons, progress bars, and focus rings. |
| `compact` | `boolean` | `false` | When `true`, applies compact padding and lower minimum height (`min-h-[280px]`). |
| `limit` | `number` | `0` | Character limit. Displays live character count, word count, and visual progress bar. (`0` = no limit). |
| `authToken` | `string` | `''` | Bearer token for default `/api/admin/upload` backend endpoint. |
| `onImageUpload` | `(file: File) => Promise<string>` | `null` | Custom async upload handler. Should return the public URL string of the uploaded image. |
| `aiConfig` | `AiConfig` | `{}` | Configuration for the Universal AI Copilot. |
| `cloudConfig` | `CloudStorageConfig` | `{}` | API keys to mount native Google Drive Picker and Dropbox Chooser dialogs. |
| `onAiGenerate` | `(params: AiGenerateParams) => Promise<AiDraftResult>` | `null` | Custom handler to route AI drafting to your own custom API / backend service. |
| `onAiDraftApplied` | `(result: AiDraftResult) => void` | `() => {}` | Callback fired when the user accepts an AI draft into the editor. |
| `containerClassName` | `string` | `''` | Additional CSS classes appended to the outer container. |
| `seoPreview` | `ReactNode` | `null` | Optional node to render custom SEO preview components beneath the editor. |

---

## 🤖 Universal AI Copilot

The editor includes a built-in, multi-model AI Copilot that drafts structured blog articles (Title, Excerpt hook, and semantic HTML body).

### Supported Providers

| Provider ID | Provider Name | Default Model | Base URL / Format |
| :--- | :--- | :--- | :--- |
| `'deepseek'` | DeepSeek | `deepseek-chat` | OpenAI-compatible (`api.deepseek.com`) |
| `'openai'` | OpenAI | `gpt-4o-mini` | OpenAI API (`api.openai.com`) |
| `'anthropic'` | Anthropic Claude | `claude-3-5-sonnet-20241022` | Anthropic Messages API |
| `'gemini'` | Google Gemini | `gemini-1.5-flash` | Google Generative Language API |
| `'ollama'` | Ollama (Local) | `llama3.1:8b` | `http://localhost:11434/v1` (No API key needed!) |
| `'groq'` | Groq | `llama-3.3-70b-versatile` | Ultra-fast Groq API |
| `'custom'` | Custom Proxy | `default` | Custom backend proxy endpoint |

### 1. Using Local Ollama (Completely Free & Offline)
Run Ollama locally and point the editor to your localhost endpoint without any API keys:
```jsx
<Editor
  aiConfig={{
    provider: 'ollama',
    model: 'llama3.1:8b',
    endpoint: 'http://localhost:11434/v1',
  }}
/>
```

### 2. Protecting API Keys via Backend Proxy (Recommended for Production)
Instead of exposing API keys in the browser, pass an `endpoint` or implement `onAiGenerate`:
```jsx
<Editor
  aiConfig={{
    endpoint: '/api/my-ai-proxy', // Your Next.js / Express route
  }}
/>
```

---

## ☁️ Google Drive & Dropbox Image Resolution

### 1. Zero-Config Direct Paste
Users do not need API keys to embed cloud images. Simply paste any public sharing link into the Image URL dialog:
* **Google Drive:** `https://drive.google.com/file/d/FILE_ID/view?usp=sharing`  
  ➡️ Automatically transformed into: `https://lh3.googleusercontent.com/d/FILE_ID`
* **Dropbox:** `https://www.dropbox.com/s/abcdef/photo.jpg?dl=0`  
  ➡️ Automatically transformed into: `https://dl.dropboxusercontent.com/s/abcdef/photo.jpg?raw=1`

### 2. Native Interactive Pickers
Pass `cloudConfig` to enable Google's official Drive Picker and Dropbox's Chooser modals:
```jsx
<Editor
  cloudConfig={{
    googleClientId: 'YOUR_GOOGLE_OAUTH_CLIENT_ID',
    googleDeveloperKey: 'YOUR_GOOGLE_API_KEY',
    dropboxAppKey: 'YOUR_DROPBOX_APP_KEY',
  }}
/>
```

---

## 🖼️ Media & Image Upload Handling

Images can be inserted using three flexible methods:

1. **Drag-and-Drop:** Drag image files directly from your desktop or file explorer onto the editor.
2. **Clipboard Paste:** Copy an image or take a screenshot and press `Ctrl+V` (or `Cmd+V`) anywhere in the editor.
3. **Toolbar & Modals:** Click the Image icon to upload from device, paste a direct/cloud link, or select from your media library.

### Custom Image Upload Handler
To upload images to AWS S3, Cloudinary, or Supabase Storage:
```jsx
const uploadToS3 = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  const res = await fetch('/api/upload', { method: 'POST', body: formData });
  const data = await res.json();
  return data.url; // Must return the public URL string
};

<Editor onImageUpload={uploadToS3} />
```
*If no `onImageUpload` or `authToken` is configured, local dropped/pasted images automatically fall back to base64 Data URLs.*

---

## 🔗 Links & Target Blanks

When inserting or editing links via the toolbar or bubble menu:
* The link modal features an **"Open link in new tab (`target="_blank"`)"** toggle.
* Pressing **Enter** in the URL input immediately applies the link.
* Applying an empty URL cleanly removes the link.

---

## 🎨 Theming & Styling

Import the bundled stylesheet:
```jsx
import '@thejoshualab/react-tiptap-editor/Editor.css';
```

### Custom Accent Color
Pass any CSS color to `accentColor`. The editor automatically binds it to CSS variables (`--accent` and `--accent-highlight`):
```jsx
<Editor accentColor="#10b981" /> {/* Emerald theme */}
<Editor accentColor="#8b5cf6" /> {/* Purple theme */}
```

### Dark Mode
Dark mode activates automatically when:
1. The user's operating system prefers dark mode (`prefers-color-scheme: dark`).
2. Any parent HTML element has the `dark` class (e.g. `<html class="dark">` or `<div className="dark">`).

---

## 📝 TypeScript Support

Full type definitions are bundled:

```typescript
import {
  Editor,
  EditorProps,
  AiConfig,
  CloudStorageConfig,
  AiGenerateParams,
  AiDraftResult,
} from '@thejoshualab/react-tiptap-editor';
```

---

## 📄 License

MIT © [Joshualeexy](https://github.com/Joshualeexy)
