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
import { universalAiGenerate, AI_PROVIDERS } from './adapters/aiAdapter.js';

const Editor = ({
  value = '',
  onChange = () => { },
  placeholder = 'Write something amazing...',
  accentColor = '#3b82f6',
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
}) => {
  const [activePopover, setActivePopover] = useState(null);
  const [popoverSubMode, setPopoverSubMode] = useState('url');
  const [popoverInput, setPopoverInput] = useState('');
  const [popoverError, setPopoverError] = useState('');
  
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
        class: `prose prose-slate dark:prose-invert max-w-none w-full outline-none bg-transparent transition-all selection:bg-blue-100 dark:selection:bg-blue-900 ${compact ? 'min-h-[280px] p-4 md:p-6' : 'min-h-[450px] p-5 md:p-12'}`,
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
      onChange(editor.getHTML());
    },
    extensions: [
      StarterKit.configure({
        codeBlock: { HTMLAttributes: { class: 'rounded-lg bg-slate-900 text-slate-100 p-4 font-mono text-sm' } },
        horizontalRule: false,
        dropcursor: { color: accentColor, width: 2 },
      }),
      Underline, Subscript, Superscript, Typography, FontSize,
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
    if (!aiTopic.trim()) {
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

  return (
    <div
      className={`craft-editor-container tiptap-container ${compact ? 'compact' : ''} relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden ${containerClassName}`}
      style={{
        '--accent': accentColor,
        '--accent-highlight': highlightColor,
      }}
    >
      <Toolbar
        editor={editor}
        activePopover={activePopover}
        openPopover={openPopover}
        accentColor={accentColor}
        glassColor={glassColor}
        compact={compact}
        changeFontSize={changeFontSize}
        highlightColor={highlightColor}
      />

      <MenuFloating editor={editor} openPopover={openPopover} />
      <MenuBubble editor={editor} openPopover={openPopover} highlightColor={highlightColor} />

      <div className="editor-content-wrapper editor-viewport relative">
        <EditorContent editor={editor} />
      </div>

      <EditorStats editor={editor} limit={limit} />

      <EditorPopover
        activePopover={activePopover}
        cloudConfig={cloudConfig}
        active={['link', 'image', 'youtube', 'table'].includes(activePopover)}
        type={activePopover}
        subMode={popoverSubMode}
        setSubMode={setPopoverSubMode}
        input={popoverInput}
        setInput={setPopoverInput}
        linkOpenInNewTab={linkOpenInNewTab}
        setLinkOpenInNewTab={setLinkOpenInNewTab}
        error={popoverError}
        inputRef={popoverInputEl}
        onClose={() => setActivePopover(null)}
        accentColor={accentColor}
        confirmPopover={(resolvedUrl, options = {}) => {
          const finalUrl = resolvedUrl || popoverInput;
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
        closePopover={() => setActivePopover(null)}
        handleImageUpload={handleImageUpload}
        openMediaPicker={() => {
          setIsMediaPickerOpen(true);
          setActivePopover(null);
        }}
        popoverError={popoverError}
        setPopoverError={setPopoverError}
        popoverInputRef={popoverInputEl}
        onUpload={handleImageUpload}
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
