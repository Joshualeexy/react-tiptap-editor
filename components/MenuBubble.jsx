import React from 'react';
import { BubbleMenu } from '@tiptap/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBold, faItalic, faUnderline, faStrikethrough, faCode, faQuoteLeft, faHighlighter, faPalette, faEraser, faLink } from '@fortawesome/free-solid-svg-icons';

const MenuBubble = ({ editor, openPopover, highlightColor }) => {
  if (!editor) return null;

  return (
    <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }} className="bubble-menu">
      <button onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'active' : ''} title="Bold">
        <FontAwesomeIcon icon={faBold} />
      </button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'active' : ''} title="Italic">
        <FontAwesomeIcon icon={faItalic} />
      </button>
      <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive('underline') ? 'active' : ''} title="Underline">
        <FontAwesomeIcon icon={faUnderline} />
      </button>
      <button onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'active' : ''} title="Strikethrough">
        <FontAwesomeIcon icon={faStrikethrough} />
      </button>
      <button onClick={() => editor.chain().focus().toggleCode().run()} className={editor.isActive('code') ? 'active' : ''} title="Inline Code">
        <FontAwesomeIcon icon={faCode} />
      </button>
      <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={editor.isActive('blockquote') ? 'active' : ''} title="Blockquote">
        <FontAwesomeIcon icon={faQuoteLeft} />
      </button>
      
      <div className="bubble-divider" />

      <button className="color-picker-btn" title="Text Color">
        <FontAwesomeIcon icon={faPalette} style={{ color: editor.getAttributes('textStyle').color || 'inherit' }} />
        <input 
          type="color" 
          onInput={(e) => editor.chain().focus().setColor(e.target.value).run()} 
          value={editor.getAttributes('textStyle').color || '#000000'} 
        />
      </button>

      <button className={`color-picker-btn ${editor.isActive('highlight') ? 'active' : ''}`} title="Background / Highlight Color">
        <FontAwesomeIcon icon={faHighlighter} style={{ color: editor.getAttributes('highlight').color || 'inherit' }} />
        <input 
          type="color" 
          onInput={(e) => editor.chain().focus().setHighlight({ color: e.target.value }).run()} 
          value={editor.getAttributes('highlight').color || '#fef08a'} 
        />
      </button>

      {editor.isActive('highlight') && (
        <button onClick={() => editor.chain().focus().unsetHighlight().run()} title="Remove Highlight" className="text-red-400">
          <FontAwesomeIcon icon={faEraser} />
        </button>
      )}

      <div className="bubble-divider" />
      <button onClick={() => openPopover('link')} className={editor.isActive('link') ? 'active' : ''} title="Link">
        <FontAwesomeIcon icon={faLink} />
      </button>
    </BubbleMenu>
  );
};

export default MenuBubble;
