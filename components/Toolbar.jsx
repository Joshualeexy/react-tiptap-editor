'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBold, faItalic, faUnderline, faStrikethrough,
  faSubscript, faSuperscript, faEraser, faUndo, faRedo,
  faAlignLeft, faAlignCenter, faAlignRight, faAlignJustify,
  faListUl, faListOl, faCheckSquare,
  faLink, faImage, faVideo, faTable, faMinus,
  faWandMagicSparkles, faExpand, faCompress, faCode,
  faChevronDown, faPlus, faTrash, faFont
} from '@fortawesome/free-solid-svg-icons';

const FONT_FAMILIES = [
  { label: 'Default (Sans)', value: '' },
  { label: 'Serif (Editorial)', value: 'Georgia, Cambria, "Times New Roman", serif' },
  { label: 'Monospace (Code)', value: 'ui-monospace, Menlo, Monaco, Consolas, monospace' },
  { label: 'Modern (Inter)', value: 'Inter, system-ui, -apple-system, sans-serif' },
  { label: 'Casual (Handwritten)', value: '"Comic Sans MS", "Chalkboard SE", cursive' },
];

const FONT_SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '40px'];

const STYLES = [
  { label: 'Paragraph', type: 'paragraph' },
  { label: 'Heading 1', type: 'heading', level: 1 },
  { label: 'Heading 2', type: 'heading', level: 2 },
  { label: 'Heading 3', type: 'heading', level: 3 },
  { label: 'Heading 4', type: 'heading', level: 4 },
  { label: 'Quote', type: 'blockquote' },
  { label: 'Code Block', type: 'codeBlock' },
];

const Toolbar = ({
  editor,
  openPopover,
  accentColor = '#3b82f6',
  highlightColor = '#3b82f630',
  isFullscreen = false,
  toggleFullscreen = () => {},
  isHtmlMode = false,
  toggleHtmlMode = () => {},
}) => {
  const [openDropdown, setOpenDropdown] = useState(null); // 'style' | 'fontFamily' | 'fontSize' | 'table'
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const toggleDropdown = (name) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  // Current Style Label
  const getCurrentStyleLabel = () => {
    if (!editor) return 'Paragraph';
    if (editor.isActive('heading', { level: 1 })) return 'Heading 1';
    if (editor.isActive('heading', { level: 2 })) return 'Heading 2';
    if (editor.isActive('heading', { level: 3 })) return 'Heading 3';
    if (editor.isActive('heading', { level: 4 })) return 'Heading 4';
    if (editor.isActive('blockquote')) return 'Quote';
    if (editor.isActive('codeBlock')) return 'Code Block';
    return 'Paragraph';
  };

  const handleApplyStyle = (item) => {
    if (!editor) return;
    editor.chain().focus();
    if (item.type === 'paragraph') {
      editor.chain().focus().setParagraph().run();
    } else if (item.type === 'heading') {
      editor.chain().focus().toggleHeading({ level: item.level }).run();
    } else if (item.type === 'blockquote') {
      editor.chain().focus().toggleBlockquote().run();
    } else if (item.type === 'codeBlock') {
      editor.chain().focus().toggleCodeBlock().run();
    }
    setOpenDropdown(null);
  };

  // Current Font Size
  const currentFontSize = editor?.getAttributes('textStyle')?.fontSize || '16px';

  // Current Font Family
  const currentFontFamily = editor?.getAttributes('textStyle')?.fontFamily || '';
  const currentFontLabel = FONT_FAMILIES.find((f) => f.value === currentFontFamily)?.label || 'Font Family';

  if (!editor) return null;

  return (
    <div className="froala-toolbar" ref={dropdownRef}>
      {/* Tier 1: Fast Formatting, Colors & Layout */}
      <div className="toolbar-tier toolbar-tier-top">
        {/* Fullscreen & History */}
        <div className="toolbar-group">
          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Zen Mode'}
            className={isFullscreen ? 'active' : ''}
          >
            <FontAwesomeIcon icon={isFullscreen ? faCompress : faExpand} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo (Ctrl+Z)"
          >
            <FontAwesomeIcon icon={faUndo} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo (Ctrl+Y)"
          >
            <FontAwesomeIcon icon={faRedo} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
            title="Clear All Formatting"
          >
            <FontAwesomeIcon icon={faEraser} />
          </button>
        </div>

        <div className="toolbar-divider" />

        {/* Inline Typography Marks */}
        <div className="toolbar-group">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'active' : ''}
            title="Bold (Ctrl+B)"
          >
            <FontAwesomeIcon icon={faBold} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'active' : ''}
            title="Italic (Ctrl+I)"
          >
            <FontAwesomeIcon icon={faItalic} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={editor.isActive('underline') ? 'active' : ''}
            title="Underline (Ctrl+U)"
          >
            <FontAwesomeIcon icon={faUnderline} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={editor.isActive('strike') ? 'active' : ''}
            title="Strikethrough"
          >
            <FontAwesomeIcon icon={faStrikethrough} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleSubscript().run()}
            className={editor.isActive('subscript') ? 'active' : ''}
            title="Subscript"
          >
            <FontAwesomeIcon icon={faSubscript} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleSuperscript().run()}
            className={editor.isActive('superscript') ? 'active' : ''}
            title="Superscript"
          >
            <FontAwesomeIcon icon={faSuperscript} />
          </button>
        </div>

        <div className="toolbar-divider" />

        {/* Text & Highlight Color */}
        <div className="toolbar-group">
          <label className="toolbar-color-btn" title="Text Color">
            <span
              className="color-indicator-letter"
              style={{ color: editor.getAttributes('textStyle').color || 'var(--text-main)' }}
            >
              A
            </span>
            <span
              className="color-bar"
              style={{ backgroundColor: editor.getAttributes('textStyle').color || 'currentColor' }}
            />
            <input
              type="color"
              className="sr-only"
              onInput={(e) => editor.chain().focus().setColor(e.target.value).run()}
              value={editor.getAttributes('textStyle').color || '#000000'}
            />
          </label>

          <label className="toolbar-color-btn" title="Highlight Background Color">
            <span className="color-indicator-highlight">🖍️</span>
            <span
              className="color-bar"
              style={{ backgroundColor: editor.getAttributes('highlight').color || '#fef08a' }}
            />
            <input
              type="color"
              className="sr-only"
              onInput={(e) => editor.chain().focus().setHighlight({ color: e.target.value }).run()}
              value={editor.getAttributes('highlight').color || '#fef08a'}
            />
          </label>
        </div>

        <div className="toolbar-divider" />

        {/* Text Alignments */}
        <div className="toolbar-group">
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={editor.isActive({ textAlign: 'left' }) ? 'active' : ''}
            title="Align Left"
          >
            <FontAwesomeIcon icon={faAlignLeft} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={editor.isActive({ textAlign: 'center' }) ? 'active' : ''}
            title="Align Center"
          >
            <FontAwesomeIcon icon={faAlignCenter} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={editor.isActive({ textAlign: 'right' }) ? 'active' : ''}
            title="Align Right"
          >
            <FontAwesomeIcon icon={faAlignRight} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={editor.isActive({ textAlign: 'justify' }) ? 'active' : ''}
            title="Justify"
          >
            <FontAwesomeIcon icon={faAlignJustify} />
          </button>
        </div>

        <div className="toolbar-divider" />

        {/* Lists */}
        <div className="toolbar-group">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'active' : ''}
            title="Bullet List"
          >
            <FontAwesomeIcon icon={faListUl} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? 'active' : ''}
            title="Numbered List"
          >
            <FontAwesomeIcon icon={faListOl} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            className={editor.isActive('taskList') ? 'active' : ''}
            title="Task List"
          >
            <FontAwesomeIcon icon={faCheckSquare} />
          </button>
        </div>
      </div>

      {/* Tier 2: Structure, Typography Dropdowns & Rich Inserts */}
      <div className="toolbar-tier toolbar-tier-bottom">
        {/* Style Dropdown */}
        <div className="dropdown-container">
          <button
            type="button"
            onClick={() => toggleDropdown('style')}
            className={`toolbar-select-btn ${openDropdown === 'style' ? 'active' : ''}`}
            title="Paragraph Style"
          >
            <span>{getCurrentStyleLabel()}</span>
            <FontAwesomeIcon icon={faChevronDown} className="dropdown-arrow" />
          </button>

          {openDropdown === 'style' && (
            <div className="toolbar-dropdown-menu">
              {STYLES.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className={`dropdown-item ${getCurrentStyleLabel() === item.label ? 'active' : ''}`}
                  onClick={() => handleApplyStyle(item)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Font Family Dropdown */}
        <div className="dropdown-container">
          <button
            type="button"
            onClick={() => toggleDropdown('fontFamily')}
            className={`toolbar-select-btn ${openDropdown === 'fontFamily' ? 'active' : ''}`}
            title="Font Family"
          >
            <span>{currentFontLabel}</span>
            <FontAwesomeIcon icon={faChevronDown} className="dropdown-arrow" />
          </button>

          {openDropdown === 'fontFamily' && (
            <div className="toolbar-dropdown-menu">
              {FONT_FAMILIES.map((font) => (
                <button
                  key={font.label}
                  type="button"
                  className={`dropdown-item ${currentFontFamily === font.value ? 'active' : ''}`}
                  style={{ fontFamily: font.value || 'inherit' }}
                  onClick={() => {
                    if (font.value) {
                      editor.chain().focus().setFontFamily(font.value).run();
                    } else {
                      editor.chain().focus().unsetFontFamily().run();
                    }
                    setOpenDropdown(null);
                  }}
                >
                  {font.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Font Size Dropdown */}
        <div className="dropdown-container">
          <button
            type="button"
            onClick={() => toggleDropdown('fontSize')}
            className={`toolbar-select-btn toolbar-size-btn ${openDropdown === 'fontSize' ? 'active' : ''}`}
            title="Font Size"
          >
            <span>{currentFontSize}</span>
            <FontAwesomeIcon icon={faChevronDown} className="dropdown-arrow" />
          </button>

          {openDropdown === 'fontSize' && (
            <div className="toolbar-dropdown-menu size-menu">
              {FONT_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  className={`dropdown-item ${currentFontSize === size ? 'active' : ''}`}
                  onClick={() => {
                    editor.chain().focus().setFontSize(size).run();
                    setOpenDropdown(null);
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="toolbar-divider" />

        {/* Rich Media & Elements */}
        <div className="toolbar-group">
          <button
            type="button"
            onClick={() => openPopover('link')}
            className={editor.isActive('link') ? 'active' : ''}
            title="Insert Link (Ctrl+K)"
          >
            <FontAwesomeIcon icon={faLink} />
          </button>

          <button
            type="button"
            onClick={() => openPopover('image')}
            title="Insert Image (Upload, URL or Stock Photos)"
          >
            <FontAwesomeIcon icon={faImage} />
          </button>

          <button
            type="button"
            onClick={() => openPopover('youtube')}
            title="Embed YouTube Video"
          >
            <FontAwesomeIcon icon={faVideo} />
          </button>

          {/* Table Operations Dropdown */}
          <div className="dropdown-container">
            <button
              type="button"
              onClick={() => toggleDropdown('table')}
              className={editor.isActive('table') ? 'active' : ''}
              title="Table Operations"
            >
              <FontAwesomeIcon icon={faTable} />
            </button>

            {openDropdown === 'table' && (
              <div className="toolbar-dropdown-menu table-menu">
                {!editor.isActive('table') ? (
                  <>
                    <button
                      type="button"
                      className="dropdown-item"
                      onClick={() => {
                        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
                        setOpenDropdown(null);
                      }}
                    >
                      <FontAwesomeIcon icon={faPlus} className="mr-2" /> Insert 3 × 3 Table
                    </button>
                    <button
                      type="button"
                      className="dropdown-item"
                      onClick={() => {
                        editor.chain().focus().insertTable({ rows: 4, cols: 4, withHeaderRow: true }).run();
                        setOpenDropdown(null);
                      }}
                    >
                      <FontAwesomeIcon icon={faPlus} className="mr-2" /> Insert 4 × 4 Table
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="dropdown-item"
                      onClick={() => { editor.chain().focus().addRowAfter().run(); setOpenDropdown(null); }}
                    >
                      Add Row Below
                    </button>
                    <button
                      type="button"
                      className="dropdown-item"
                      onClick={() => { editor.chain().focus().addColumnAfter().run(); setOpenDropdown(null); }}
                    >
                      Add Column Right
                    </button>
                    <button
                      type="button"
                      className="dropdown-item"
                      onClick={() => { editor.chain().focus().deleteRow().run(); setOpenDropdown(null); }}
                    >
                      Delete Row
                    </button>
                    <button
                      type="button"
                      className="dropdown-item"
                      onClick={() => { editor.chain().focus().deleteColumn().run(); setOpenDropdown(null); }}
                    >
                      Delete Column
                    </button>
                    <div className="dropdown-separator" />
                    <button
                      type="button"
                      className="dropdown-item !text-red-400"
                      onClick={() => { editor.chain().focus().deleteTable().run(); setOpenDropdown(null); }}
                    >
                      <FontAwesomeIcon icon={faTrash} className="mr-2" /> Delete Table
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Horizontal Divider Line"
          >
            <FontAwesomeIcon icon={faMinus} />
          </button>
        </div>

        <div className="toolbar-divider" />

        {/* AI Copilot Sparkles */}
        <button
          type="button"
          onClick={() => openPopover('ai')}
          title="AI Content Copilot"
          className="btn-ai-copilot"
        >
          <FontAwesomeIcon icon={faWandMagicSparkles} />
          <span>AI Assist</span>
        </button>

        {/* Right End: HTML Code View Toggle */}
        <div className="toolbar-spacer" />
        <button
          type="button"
          onClick={toggleHtmlMode}
          className={`btn-html-view ${isHtmlMode ? 'active' : ''}`}
          title={isHtmlMode ? 'Switch to WYSIWYG View' : 'Switch to HTML Source View'}
        >
          <FontAwesomeIcon icon={faCode} />
          <span>{isHtmlMode ? 'WYSIWYG' : 'Code'}</span>
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
