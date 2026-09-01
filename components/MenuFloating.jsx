import React from 'react';
import { FloatingMenu } from '@tiptap/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTable, faImage, faQuoteLeft, faList, faFileCode } from '@fortawesome/free-solid-svg-icons';

const MenuFloating = ({ editor, openPopover }) => {
  if (!editor) return null;

  return (
    <FloatingMenu editor={editor} tippyOptions={{ duration: 100 }} className="floating-menu">
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="Heading 1">H1</button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2">H2</button>
      <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={editor.isActive('blockquote') ? 'active' : ''} title="Blockquote">
        <FontAwesomeIcon icon={faQuoteLeft} />
      </button>
      <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'active' : ''} title="Bullet List">
        <FontAwesomeIcon icon={faList} />
      </button>
      <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={editor.isActive('codeBlock') ? 'active' : ''} title="Code Block">
        <FontAwesomeIcon icon={faFileCode} />
      </button>
      <button onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} title="Table">
        <FontAwesomeIcon icon={faTable} />
      </button>
      <button onClick={() => openPopover('image')} title="Image">
        <FontAwesomeIcon icon={faImage} />
      </button>
    </FloatingMenu>
  );
};

export default MenuFloating;
