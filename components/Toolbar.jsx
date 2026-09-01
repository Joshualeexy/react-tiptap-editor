import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBold, faItalic, faUnderline, faEraser, faPlus, faMinus,
  faSubscript, faSuperscript, faList, faListOl, faCheckSquare,
  faAlignLeft, faAlignCenter, faAlignRight, faAlignJustify,
  faTable, faFileExport, faTrashAlt, faLink, faImage, faVideo,
  faPalette, faHighlighter, faUndo, faRedo, faWandMagicSparkles
} from '@fortawesome/free-solid-svg-icons';

const Toolbar = ({ editor, openPopover, changeFontSize, highlightColor }) => {
  if (!editor) return null;

  return (
    <div className="main-toolbar">
      <div className="toolbar-fade-left" />
      <div className="toolbar-inner">
        <div className="group">
          <button onClick={() => openPopover('ai')} title="AI Draft" className="!bg-gradient-to-r !from-cyan-500 !to-blue-500 !text-white hover:!shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all duration-300">
            <FontAwesomeIcon icon={faWandMagicSparkles} />
          </button>
        </div>

        <div className="divider" />

        <div className="group">
          <button onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'active' : ''} title="Bold">
            <FontAwesomeIcon icon={faBold} />
          </button>
          <button onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'active' : ''} title="Italic">
            <FontAwesomeIcon icon={faItalic} />
          </button>
          <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive('underline') ? 'active' : ''} title="Underline">
            <FontAwesomeIcon icon={faUnderline} />
          </button>
          <button onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} title="Clear Formatting">
            <FontAwesomeIcon icon={faEraser} />
          </button>
        </div>

        <div className="divider" />

        <div className="group">
          <button onClick={() => changeFontSize(-2)} title="Decrease Font Size">
            <FontAwesomeIcon icon={faMinus} />
          </button>
          <div className="size-display">{(editor.getAttributes('textStyle').fontSize || '16px').replace('px', '')}</div>
          <button onClick={() => changeFontSize(2)} title="Increase Font Size">
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>

        <div className="divider" />

        <div className="group">
          <button onClick={() => editor.chain().focus().toggleSubscript().run()} className={editor.isActive('subscript') ? 'active' : ''} title="Subscript">
            <FontAwesomeIcon icon={faSubscript} />
          </button>
          <button onClick={() => editor.chain().focus().toggleSuperscript().run()} className={editor.isActive('superscript') ? 'active' : ''} title="Superscript">
            <FontAwesomeIcon icon={faSuperscript} />
          </button>
          <button onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule">
            <FontAwesomeIcon icon={faMinus} className="rotate-90 scale-x-150" />
          </button>
        </div>

        <div className="divider" />

        <div className="group">
          <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'active' : ''} title="Bullets">
            <FontAwesomeIcon icon={faList} />
          </button>
          <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'active' : ''} title="Numbers">
            <FontAwesomeIcon icon={faListOl} />
          </button>
          <button onClick={() => editor.chain().focus().toggleTaskList().run()} className={editor.isActive('taskList') ? 'active' : ''} title="Tasks">
            <FontAwesomeIcon icon={faCheckSquare} />
          </button>
        </div>

        <div className="divider" />

        <div className="group">
          <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={editor.isActive({ textAlign: 'left' }) ? 'active' : ''} title="Align Left">
            <FontAwesomeIcon icon={faAlignLeft} />
          </button>
          <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={editor.isActive({ textAlign: 'center' }) ? 'active' : ''} title="Align Center">
            <FontAwesomeIcon icon={faAlignCenter} />
          </button>
          <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={editor.isActive({ textAlign: 'right' }) ? 'active' : ''} title="Align Right">
            <FontAwesomeIcon icon={faAlignRight} />
          </button>
          <button onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={editor.isActive({ textAlign: 'justify' }) ? 'active' : ''} title="Align Justify">
            <FontAwesomeIcon icon={faAlignJustify} />
          </button>
        </div>

        <div className="divider" />

        <div className="group">
          <button onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} title="Insert Table">
            <FontAwesomeIcon icon={faTable} />
          </button>
          <button onClick={() => editor.chain().focus().addColumnAfter().run()} disabled={!editor.isActive('table')} className={!editor.isActive('table') ? 'opacity-20 pointer-events-none' : ''} title="Add Column">
            <FontAwesomeIcon icon={faFileExport} />
          </button>
          <button onClick={() => editor.chain().focus().addRowAfter().run()} disabled={!editor.isActive('table')} className={!editor.isActive('table') ? 'opacity-20 pointer-events-none' : ''} title="Add Row">
            <FontAwesomeIcon icon={faFileExport} style={{ transform: 'rotate(90deg)' }} />
          </button>
          <button onClick={() => editor.chain().focus().deleteTable().run()} disabled={!editor.isActive('table')} className={!editor.isActive('table') ? 'opacity-20 pointer-events-none' : (editor.isActive('table') ? 'hover:!text-red-500' : '')} title="Delete Table">
            <FontAwesomeIcon icon={faTrashAlt} />
          </button>
        </div>

        <div className="divider" />

        <div className="group">
          <button onClick={() => openPopover('link')} className={editor.isActive('link') ? 'active' : ''} title="Link">
            <FontAwesomeIcon icon={faLink} />
          </button>
          <button onClick={() => openPopover('image')} title="Image">
            <FontAwesomeIcon icon={faImage} />
          </button>
          <button onClick={() => openPopover('youtube')} title="YouTube Video">
            <FontAwesomeIcon icon={faVideo} />
          </button>

        </div>

        <div className="spacer" />

        <div className="group">
          <button className="color-picker-btn">
            <FontAwesomeIcon icon={faPalette} style={{ color: editor.getAttributes('textStyle').color || 'inherit' }} />
            <input type="color" onInput={(e) => editor.chain().focus().setColor(e.target.value).run()} value={editor.getAttributes('textStyle').color || '#000000'} />
          </button>
          <button onClick={() => editor.chain().focus().toggleHighlight({ color: highlightColor }).run()} className={editor.isActive('highlight') ? 'active' : ''} title="Highlight">
            <FontAwesomeIcon icon={faHighlighter} />
          </button>
        </div>

        <div className="divider" />

        <div className="group">
          <button onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">
            <FontAwesomeIcon icon={faUndo} />
          </button>
          <button onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">
            <FontAwesomeIcon icon={faRedo} />
          </button>
        </div>
      </div>
      <div className="toolbar-fade-right" />
    </div>
  );
};

export default Toolbar;
