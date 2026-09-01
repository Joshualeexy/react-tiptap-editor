import { Image } from '@tiptap/extension-image';
import { ReactNodeViewRenderer } from '@tiptap/react';
import ImageResizer from './ImageResizer.jsx';

const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element) => {
          const width = element.getAttribute('width') || element.style.width;
          return width ? parseInt(width, 10) : null;
        },
        renderHTML: (attributes) => {
          if (!attributes.width) {
            return {};
          }
          return {
            width: attributes.width,
            style: `width: ${attributes.width}px; height: auto;`,
          };
        },
      },
      aspectRatio: {
        default: null,
        parseHTML: (element) => {
          const ratio = element.getAttribute('data-aspect-ratio');
          return ratio ? parseFloat(ratio) : null;
        },
        renderHTML: (attributes) => {
          if (!attributes.aspectRatio) {
            return {};
          }
          return {
            'data-aspect-ratio': attributes.aspectRatio,
          };
        },
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageResizer);
  },
});

export default ResizableImage;
