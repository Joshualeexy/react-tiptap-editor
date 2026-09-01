import { Extension } from '@tiptap/core';

/**
 * ExitBlockHelper Extension
 * Enables seamless breakout from Code Blocks, Blockquotes, and Lists:
 * 1. Shift+Enter / Mod+Enter: Immediately exits any code block or blockquote to a clean paragraph below.
 * 2. Double-Enter on empty line: Exits code blocks and blockquotes automatically.
 * 3. ArrowDown at the end of the last block: Inserts a new paragraph below so the user is never trapped.
 */
export const ExitBlockHelper = Extension.create({
  name: 'exitBlockHelper',

  addKeyboardShortcuts() {
    return {
      // 1. Shift-Enter to break out of CodeBlock or Blockquote into a clean paragraph below
      'Shift-Enter': ({ editor }) => {
        const { state } = editor;
        const { selection } = state;
        const { $from } = selection;
        const parentType = $from.parent.type.name;

        if (parentType === 'codeBlock' || parentType === 'blockquote') {
          return editor.chain().exitCode().unsetAllMarks().run();
        }
        return false;
      },

      // 2. Mod-Enter (Ctrl+Enter / Cmd+Enter) to break out of any block into a paragraph below
      'Mod-Enter': ({ editor }) => {
        const { state } = editor;
        const { selection } = state;
        const { $from } = selection;
        const parentType = $from.parent.type.name;

        if (parentType === 'codeBlock' || parentType === 'blockquote') {
          return editor.chain().exitCode().unsetAllMarks().run();
        }

        const after = $from.after();
        if (after !== undefined) {
          return editor
            .chain()
            .insertContentAt(after, { type: 'paragraph' })
            .focus(after + 1)
            .unsetAllMarks()
            .run();
        }
        return false;
      },

      // 3. Double Enter on empty line in code block or blockquote
      'Enter': ({ editor }) => {
        const { state } = editor;
        const { selection } = state;
        const { $from, empty } = selection;
        if (!empty) return false;

        const parentType = $from.parent.type.name;

        // Inside code block: if previous character is newline (empty line), break out!
        if (parentType === 'codeBlock') {
          const text = $from.parent.textContent;
          const isAtEnd = $from.parentOffset === $from.parent.nodeSize - 2;
          if (isAtEnd && text.endsWith('\n')) {
            return editor
              .chain()
              .command(({ tr }) => {
                // Delete the dangling newline
                tr.delete($from.pos - 1, $from.pos);
                return true;
              })
              .exitCode()
              .unsetAllMarks()
              .run();
          }
        }

        // Inside blockquote: if empty line, lift to paragraph
        if (parentType === 'blockquote') {
          if ($from.parent.textContent.length === 0) {
            return editor.chain().lift('blockquote').unsetAllMarks().run();
          }
        }

        return false;
      },

      // 4. ArrowDown at the end of a block node if it's the last node in the document
      'ArrowDown': ({ editor }) => {
        const { state } = editor;
        const { selection, doc } = state;
        const { $from, empty } = selection;
        if (!empty) return false;

        const parentType = $from.parent.type.name;
        if (['codeBlock', 'blockquote', 'table'].includes(parentType)) {
          const isAtEnd = $from.parentOffset === $from.parent.nodeSize - 2;
          if (isAtEnd) {
            const after = $from.after();
            const nodeAfter = after !== undefined ? doc.nodeAt(after) : null;
            if (!nodeAfter) {
              return editor
                .chain()
                .insertContentAt(doc.content.size, { type: 'paragraph' })
                .focus(doc.content.size + 1)
                .unsetAllMarks()
                .run();
            }
          }
        }
        return false;
      },
    };
  },
});

export default ExitBlockHelper;
