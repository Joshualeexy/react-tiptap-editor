import React from 'react';
import { BubbleMenu } from '@tiptap/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBold, faItalic, faHighlighter, faLink } from '@fortawesome/free-solid-svg-icons';

const MenuBubble = ({ editor, openPopover, highlightColor }) => {
  if (!editor) return null;

  return (
    <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }} className="bubble-menu">
      <button onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'active' : ''}>
        <FontAwesomeIcon icon={faBold} />
      </button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'active' : ''}>
        <FontAwesomeIcon icon={faItalic} />
      </button>
      <button onClick={() => editor.chain().focus().toggleHighlight({ color: highlightColor }).run()} className={editor.isActive('highlight') ? 'active' : ''}>
        <FontAwesomeIcon icon={faHighlighter} />
      </button>
      <div className="bubble-divider" />
      <button onClick={() => openPopover('link')} className={editor.isActive('link') ? 'active' : ''}>
        <FontAwesomeIcon icon={faLink} />
      </button>
    </BubbleMenu>
  );
};

export default MenuBubble;
