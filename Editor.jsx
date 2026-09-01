'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import { Color } from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import Link from '@tiptap/extension-link';
import ResizableImage from './extensions/ResizableImage.js';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Underline from '@tiptap/extension-underline';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Youtube from '@tiptap/extension-youtube';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Typography from '@tiptap/extension-typography';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe, faEllipsisV, faChevronDown } from '@fortawesome/free-solid-svg-icons';

import Toolbar from './components/Toolbar.jsx';
import EditorPopover from './components/EditorPopover.jsx';
import AIPopover from './components/AIPopover.jsx';
import MenuFloating from './components/MenuFloating.jsx';
import MenuBubble from './components/MenuBubble.jsx';
import EditorStats from './components/EditorStats.jsx';
import { FontSize } from './extensions/FontSize.js';
import FontFamily from './extensions/FontFamily.js';
import ExitBlockHelper from './extensions/ExitBlockHelper.js';
import { universalAiGenerate, AI_PROVIDERS } from './adapters/aiAdapter.js';

const Editor = ({
  value = '',
  onChange = () => { },
  placeholder = 'Write something amazing...',
  accentColor = '#2563eb',
  limit = 0,
  authToken = '',
  aiConfig = {},
  cloudConfig = {},
  onAiGenerate = null,
  onAiDraftApplied = () => { },
  onImageUpload = null,
  compact = false,
  containerClassName = '',
  seoPreview = null,
  autoSave = true,
  autoSaveKey = 'react_tiptap_editor_draft',
  mode = 'document', // 'document' | 'classic' | 'inline'
  showModeSwitcher = true,
  theme = 'light',
}) => {
  const [currentMode, setCurrentMode] = useState(mode);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [rawHtml, setRawHtml] = useState(value);

  const [activePopover, setActivePopover] = useState(null);
  const [popoverSubMode, setPopoverSubMode] = useState('url');
  const [popoverInput, setPopoverInput] = useState('');
  const [popoverError, setPopoverError] = useState('');
  
  // Auto-Save Status
  const [saveStatus, setSaveStatus] = useState('');
  const autoSaveTimerRef = useRef(null);

  const handleAutoSave = useCallback((html) => {
    if (!autoSave || typeof window === 'undefined' || !window.localStorage) return;
    setSaveStatus('● Saving...');
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(autoSaveKey, html);
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setSaveStatus(`✓ Draft saved ${timeStr}`);
      } catch (err) {
        console.warn('Auto-save error:', err);
      }
    }, 1000);
  }, [autoSave, autoSaveKey]);

  // AI Copilot States
  const [aiTopic, setAiTopic] = useState('');
  const [aiTone, setAiTone] = useState('clear and practical');
  const [aiKeywords, setAiKeywords] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiError, setAiError] = useState('');
  const [aiMessage, setAiMessage] = useState('');
  const [aiLength, setAiLength] = useState(1500);
  const [aiProvider, setAiProvider] = useState(aiConfig?.provider || 'deepseek');
  const [aiModel, setAiModel] = useState(aiConfig?.model || '');
  const [aiApiKey, setAiApiKey] = useState(aiConfig?.apiKey || '');
  const [aiEndpoint, setAiEndpoint] = useState(aiConfig?.endpoint || '');

  const [linkOpenInNewTab, setLinkOpenInNewTab] = useState(true);
  const handleImageUploadRef = useRef(null);
  const popoverInputEl = useRef(null);

  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: `prose prose-slate ${theme === 'dark' ? 'dark:prose-invert' : ''} max-w-none w-full outline-none bg-transparent transition-all selection:bg-blue-100 ${compact ? 'min-h-[280px] p-4 md:p-6' : 'min-h-[450px] p-5 md:p-12'}`,
        spellcheck: 'false',
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
          const file = event.dataTransfer.files[0];
          if (file && file.type.startsWith('image/')) {
            event.preventDefault();
            handleImageUploadRef.current?.(file);
            return true;
          }
        }
        return false;
      },
      handlePaste: (view, event, slice) => {
        if (event.clipboardData && event.clipboardData.files && event.clipboardData.files.length > 0) {
          const file = event.clipboardData.files[0];
          if (file && file.type.startsWith('image/')) {
            event.preventDefault();
            handleImageUploadRef.current?.(file);
            return true;
          }
        }
        return false;
      },
    },
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
      if (autoSave) {
        handleAutoSave(html);
      }
    },
    extensions: [
      StarterKit.configure({
        codeBlock: { HTMLAttributes: { class: 'rounded-lg bg-slate-900 text-slate-100 p-4 font-mono text-sm' } },
        horizontalRule: false,
        dropcursor: { color: accentColor, width: 2 },
      }),
      Underline, Subscript, Superscript, Typography, FontSize, FontFamily,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight.configure({ multicolor: true }),
      TextStyle, Color,
      Link.configure({
        openOnClick: false,
        defaultProtocol: 'https',
        HTMLAttributes: { class: 'text-blue-600 dark:text-blue-400 underline cursor-pointer font-medium hover:opacity-80' },
      }),
      ResizableImage.configure({
        allowBase64: true,
        HTMLAttributes: { class: 'rounded-xl shadow-lg border-2 border-white/5 inline-block max-w-full h-auto mx-auto transition-all' },
      }),
      Youtube.configure({
        width: 840,
        nocookie: true,
        HTMLAttributes: { class: 'aspect-video rounded-xl shadow-2xl mx-auto my-8 border-4 border-white' },
      }),
      Table.configure({ resizable: true }),
      TableRow, TableHeader, TableCell, TaskList,
      TaskItem.configure({ nested: true }),
      HorizontalRule.configure({
        HTMLAttributes: { class: 'my-8 border-t-2 border-slate-200 dark:border-slate-800 rounded-full' },
      }),
      Placeholder.configure({ placeholder }),
      CharacterCount.configure({ limit: limit || null }),
      ExitBlockHelper,
    ],
  });

  const handleImageUpload = useCallback(async (file) => {
    if (!file || !editor) return;

    try {
      if (typeof onImageUpload === 'function') {
        const url = await onImageUpload(file);
        if (url) editor.chain().focus().setImage({ src: url }).run();
        setActivePopover(null);
        return;
      }

      // Backend upload if token available
      if (authToken) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: { authorization: `Bearer ${authToken}` },
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed.');
        }

        const payload = await response.json();
        const src = payload.url;

        editor.chain().focus().setImage({ src }).run();
        setActivePopover(null);
        setPopoverSubMode('url');
        setPopoverError('');
        return;
      }

      // Client-side fallback: convert dropped/pasted local file to base64 Data URL
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const base64 = readerEvent.target?.result;
        if (base64) {
          editor.chain().focus().setImage({ src: base64 }).run();
        }
      };
      reader.readAsDataURL(file);
      setActivePopover(null);
      setPopoverSubMode('url');
      setPopoverError('');
    } catch (error) {
      console.error('Image upload failed:', error);
      setPopoverError('Could not process that image. Try again.');
    }
  }, [authToken, editor, onImageUpload]);

  handleImageUploadRef.current = handleImageUpload;

  useEffect(() => {
    if (editor && value !== undefined && editor.getHTML() !== value) {
      editor.commands.setContent(value, false);
    }
  }, [value, editor]);

  // Restore draft if editor is empty and a saved draft exists
  useEffect(() => {
    if (!autoSave || typeof window === 'undefined' || !window.localStorage || !editor) return;
    try {
      const saved = localStorage.getItem(autoSaveKey);
      if (saved && (!value || value === '<p></p>' || value === '')) {
        if (editor.isEmpty) {
          editor.commands.setContent(saved, false);
          setSaveStatus('✓ Draft restored');
          setTimeout(() => setSaveStatus('✓ Draft saved'), 2500);
        }
      }
    } catch (e) {
      console.warn('Draft restoration failed:', e);
    }
  }, [editor, autoSave, autoSaveKey]);

  const glassColor = useMemo(() => accentColor + '10', [accentColor]);
  const highlightColor = useMemo(() => accentColor + '30', [accentColor]);

  const openPopover = useCallback((type) => {
    setActivePopover(type);
    setPopoverSubMode(type === 'image' ? 'select' : 'url');
    setPopoverError('');
    setAiError('');
    setAiResult(null);

    if (type === 'link') {
      const linkAttrs = editor?.getAttributes('link') || {};
      const previousUrl = linkAttrs.href || '';
      setPopoverInput(previousUrl);
      setLinkOpenInNewTab(linkAttrs.target === '_blank' || !previousUrl);
      setTimeout(() => popoverInputEl.current?.focus(), 50);
    } else {
      setPopoverInput('');
    }
  }, [editor]);

  const handleAiGenerate = useCallback(async () => {
    if (!aiTopic || typeof aiTopic !== 'string' || !aiTopic.trim()) {
      setAiError('Please enter a topic.');
      return;
    }

    setAiLoading(true);
    setAiError('');

    try {
      const data = await universalAiGenerate({
        provider: aiProvider,
        apiKey: aiApiKey,
        baseUrl: aiEndpoint,
        model: aiModel,
        topic: aiTopic,
        instructions: aiMessage,
        tone: aiTone,
        keywords: aiKeywords,
        length: aiLength,
        sourceNotes: editor?.getHTML() || '',
        customHandler: onAiGenerate,
        proxyEndpoint: aiEndpoint || (authToken ? '/api/admin/generate-post' : '')
      });

      setAiResult(data);
    } catch (error) {
      console.error('AI generation error:', error);
      setAiError(error.message || 'AI generation failed.');
    } finally {
      setAiLoading(false);
    }
  }, [aiTopic, aiProvider, aiApiKey, aiEndpoint, aiModel, aiMessage, aiTone, aiKeywords, aiLength, editor, onAiGenerate, authToken]);

  const changeFontSize = useCallback((delta) => {
    if (!editor) return;
    const currentSizeStr = editor.getAttributes('textStyle').fontSize || '16px';
    const currentSize = parseInt(currentSizeStr, 10) || 16;
    const newSize = Math.max(8, Math.min(72, currentSize + delta));
    editor.chain().focus().setFontSize(`${newSize}px`).run();
  }, [editor]);

  const applyAiDraft = useCallback(() => {
    if (!editor || !aiResult) return;

    const html = [
      `<h1>${aiResult.title}</h1>`,
      aiResult.excerpt ? `<p class="lead">${aiResult.excerpt}</p>` : '',
      aiResult.content_html,
    ].filter(Boolean).join('');

    editor.commands.setContent(html);
    onAiDraftApplied(aiResult);
    setActivePopover(null);
    setAiResult(null);
  }, [aiResult, editor, onAiDraftApplied]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  const toggleHtmlMode = useCallback(() => {
    setIsHtmlMode((prev) => {
      const next = !prev;
      if (next) {
        setRawHtml(editor ? editor.getHTML() : '');
      } else {
        if (editor) {
          editor.commands.setContent(rawHtml, true);
          onChange(rawHtml);
        }
      }
      return next;
    });
  }, [editor, rawHtml, onChange]);

  return (
    <div
      className={`craft-editor-container tiptap-container mode-${currentMode} ${isFullscreen ? 'froala-fullscreen' : ''} ${compact ? 'compact' : ''} relative rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden ${theme === 'dark' ? 'dark bg-slate-900 border-slate-800' : ''} ${containerClassName}`}
      style={{
        '--accent': accentColor,
        '--accent-highlight': highlightColor,
      }}
    >
      {/* Mode Switcher Bar */}
      {showModeSwitcher && (
        <div className="froala-mode-bar">
          <div className="mode-tabs-group">
            <span className="mode-caption">Change Mode:</span>
            <div className="mode-pills">
              <button
                type="button"
                className={`mode-pill ${currentMode === 'classic' ? 'active' : ''}`}
                onClick={() => setCurrentMode('classic')}
              >
                Classic
              </button>
              <button
                type="button"
                className={`mode-pill ${currentMode === 'inline' ? 'active' : ''}`}
                onClick={() => setCurrentMode('inline')}
              >
                Inline
              </button>
              <button
                type="button"
                className={`mode-pill ${currentMode === 'document' ? 'active' : ''}`}
                onClick={() => setCurrentMode('document')}
              >
                Document Ready
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Two-Tier Studio Toolbar (Hidden via CSS in Inline mode) */}
      <div style={{ display: currentMode === 'inline' ? 'none' : 'block' }}>
        <Toolbar
          editor={editor}
          activePopover={activePopover}
          openPopover={openPopover}
          accentColor={accentColor}
          glassColor={glassColor}
          compact={compact}
          changeFontSize={changeFontSize}
          highlightColor={highlightColor}
          isFullscreen={isFullscreen}
          toggleFullscreen={toggleFullscreen}
          isHtmlMode={isHtmlMode}
          toggleHtmlMode={toggleHtmlMode}
        />
      </div>

      <MenuFloating editor={editor} openPopover={openPopover} />
      <MenuBubble editor={editor} openPopover={openPopover} highlightColor={highlightColor} />

      {/* Raw HTML Code Editor Mode */}
      <div
        className="html-editor-container"
        style={{ display: isHtmlMode ? 'block' : 'none' }}
      >
        <textarea
          className="html-editor-textarea"
          value={rawHtml}
          onChange={(e) => setRawHtml(e.target.value)}
          placeholder="<!-- Enter raw HTML here -->"
          spellCheck="false"
        />
      </div>

      {/* Persistent Single TipTap Canvas Instance (Never unmounted on mode change) */}
      <div
        className={`editor-viewport-wrapper ${currentMode === 'document' ? 'document-sheet-backdrop' : 'classic-viewport-backdrop'}`}
        style={{ display: isHtmlMode ? 'none' : 'flex' }}
      >
        <div 
          className={`editor-content-wrapper relative cursor-text ${currentMode === 'document' ? 'document-paper-sheet' : 'classic-paper-sheet'}`}
          onClick={(e) => {
            if (e.target === e.currentTarget && editor) {
              const lastNode = editor.state.doc.lastChild;
              if (lastNode && lastNode.type.name !== 'paragraph') {
                editor.chain().insertContentAt(editor.state.doc.content.size, { type: 'paragraph' }).focus('end').unsetAllMarks().run();
              } else {
                editor.commands.focus('end');
              }
            }
          }}
        >
          <EditorContent editor={editor} />
        </div>
      </div>

      <EditorStats editor={editor} limit={limit} saveStatus={saveStatus} />

      <EditorPopover
        activePopover={activePopover}
        type={activePopover}
        cloudConfig={cloudConfig}
        popoverSubMode={popoverSubMode}
        subMode={popoverSubMode}
        setPopoverSubMode={setPopoverSubMode}
        setSubMode={setPopoverSubMode}
        popoverInput={popoverInput}
        input={popoverInput}
        setPopoverInput={setPopoverInput}
        setInput={setPopoverInput}
        linkOpenInNewTab={linkOpenInNewTab}
        setLinkOpenInNewTab={setLinkOpenInNewTab}
        popoverError={popoverError}
        error={popoverError}
        setPopoverError={setPopoverError}
        popoverInputRef={popoverInputEl}
        inputRef={popoverInputEl}
        closePopover={() => setActivePopover(null)}
        onClose={() => setActivePopover(null)}
        accentColor={accentColor}
        handleImageUpload={handleImageUpload}
        onUpload={handleImageUpload}
        openMediaPicker={() => {
          setIsMediaPickerOpen(true);
          setActivePopover(null);
        }}
        confirmPopover={(resolvedUrl, options = {}) => {
          const finalUrl = (typeof resolvedUrl === 'string' ? resolvedUrl : (typeof popoverInput === 'string' ? popoverInput : '')).trim();
          if (activePopover === 'link') {
            if (finalUrl) {
              const shouldOpenInNewTab = options.openInNewTab !== undefined ? options.openInNewTab : linkOpenInNewTab;
              editor?.chain().focus().setLink({
                href: finalUrl,
                target: shouldOpenInNewTab ? '_blank' : null,
              }).run();
            } else {
              editor?.chain().focus().unsetLink().run();
            }
          } else if (activePopover === 'image' && finalUrl) {
            editor?.chain().focus().setImage({ src: finalUrl }).run();
          } else if (activePopover === 'youtube' && finalUrl) {
            editor?.commands.setYoutubeVideo({ src: finalUrl });
          }
          setActivePopover(null);
        }}
      />

      <AIPopover
        active={activePopover === 'ai'}
        topic={aiTopic}
        setTopic={setAiTopic}
        tone={aiTone}
        setTone={setAiTone}
        keywords={aiKeywords}
        setKeywords={setAiKeywords}
        message={aiMessage}
        setMessage={setAiMessage}
        length={aiLength}
        setLength={setAiLength}
        loading={aiLoading}
        error={aiError}
        result={aiResult}
        accentColor={accentColor}
        provider={aiProvider}
        setProvider={setAiProvider}
        model={aiModel}
        setModel={setAiModel}
        allowedProviders={aiConfig?.allowedProviders}
        allowConfig={aiConfig?.showConfig !== false}
        onClose={() => setActivePopover(null)}
        onGenerate={handleAiGenerate}
        onApply={applyAiDraft}
      />
    </div>
  );
};

export default Editor;
