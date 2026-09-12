import React, { useCallback, useRef, useState, useEffect } from 'react';
import { NodeViewWrapper } from '@tiptap/react';

const ImageResizer = (props) => {
  const { node, updateAttributes, selected, getPos, editor } = props;
  const imageRef = useRef(null);
  const [resizing, setResizing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isNodeSelected = selected || isFocused;
  
  // Default to 100% if not set, so banners fill the canvas
  const rawWidth = node.attrs.width;
  const displayWidth = rawWidth || 800;

  // Handle clicking outside to un-focus
  useEffect(() => {
    const handleOutside = (e) => {
      if (imageRef.current && !imageRef.current.contains(e.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleSelect = (e) => {
    e.stopPropagation();
    setIsFocused(true);
    if (editor && typeof getPos === 'function') {
      try {
        const pos = getPos();
        if (typeof pos === 'number') {
          editor.commands.setNodeSelection(pos);
        }
      } catch (_) {}
    }
  };

  const handleMouseDown = useCallback((e, direction) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startWidth = imageRef.current?.offsetWidth || displayWidth;
    
    setResizing(true);

    const onMouseMove = (moveEvent) => {
      const deltaX = direction.includes('right') 
        ? moveEvent.clientX - startX 
        : startX - moveEvent.clientX;
      
      const newWidth = Math.max(120, Math.min(1200, Math.round(startWidth + deltaX)));

      requestAnimationFrame(() => {
        updateAttributes({ width: newWidth });
      });
    };

    const onMouseUp = () => {
      setResizing(false);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [displayWidth, updateAttributes]);

  // Quick Preset Widths
  const setPresetWidth = (widthPercent) => {
    const parentWidth = imageRef.current?.parentElement?.offsetWidth || 800;
    const targetPx = Math.round(parentWidth * (widthPercent / 100));
    updateAttributes({ width: targetPx });
  };

  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [node.attrs.src]);

  return (
    <NodeViewWrapper 
      className={`image-resizer-wrapper my-4 block text-center ${isNodeSelected ? 'is-selected' : ''}`}
    >
      <div 
        className={`image-resizer-container group cursor-pointer ${isNodeSelected ? 'is-selected' : ''}`}
        onClick={handleSelect}
        onMouseDown={(e) => {
          e.stopPropagation();
          setIsFocused(true);
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        ref={imageRef}
        style={{ 
          width: rawWidth ? `${displayWidth}px` : '100%',
          maxWidth: '100%',
        }}
      >
        {hasError ? (
          <div className="p-4 bg-slate-900 text-slate-200 rounded-xl border border-red-500/40 text-center my-2 shadow-lg">
            <div className="text-xl mb-1">⚠️ Image Link Blocked or Invalid</div>
            <div className="text-xs text-slate-400 max-w-md mx-auto truncate" title={node.attrs.src}>
              {node.attrs.src}
            </div>
            <div className="text-[11px] text-slate-400 mt-2">
              The external web server blocked hotlinking (ORB/CORS) or the URL points to a web page instead of a direct raw image file (.jpg, .png, .webp).
            </div>
          </div>
        ) : (
          <img
            src={node.attrs.src}
            alt={node.attrs.alt || ''}
            title={node.attrs.title || ''}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setHasError(true)}
          />
        )}

        {/* Quick Size Preset Toolbar on Selection (Positioned at bottom of image) */}
        {isNodeSelected && (
          <div 
            className="image-preset-toolbar"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPresetWidth(25)}
              title="25% width"
            >
              25%
            </button>
            <button
              type="button"
              onClick={() => setPresetWidth(50)}
              title="50% width"
            >
              50%
            </button>
            <button
              type="button"
              onClick={() => setPresetWidth(75)}
              title="75% width"
            >
              75%
            </button>
            <button
              type="button"
              className="active-preset"
              onClick={() => setPresetWidth(100)}
              title="100% Full Width Banner"
            >
              100% Full
            </button>
            <span className="preset-dim">
              {Math.round(imageRef.current?.offsetWidth || displayWidth)}px
            </span>
          </div>
        )}

        {/* Corner & Side Handles */}
        {isNodeSelected && (
          <>
            <div
              onMouseDown={(e) => handleMouseDown(e, 'top-left')}
              className="image-resize-handle top-left"
            />
            <div
              onMouseDown={(e) => handleMouseDown(e, 'top-right')}
              className="image-resize-handle top-right"
            />
            <div
              onMouseDown={(e) => handleMouseDown(e, 'bottom-left')}
              className="image-resize-handle bottom-left"
            />
            <div
              onMouseDown={(e) => handleMouseDown(e, 'bottom-right')}
              className="image-resize-handle bottom-right"
            />

            {/* Left and Right Edge Drag Handles */}
            <div
              onMouseDown={(e) => handleMouseDown(e, 'left')}
              className="image-resize-handle side-left"
              title="Drag to resize width"
            />
            <div
              onMouseDown={(e) => handleMouseDown(e, 'right')}
              className="image-resize-handle side-right"
              title="Drag to resize width"
            />

            {/* Overlay while actively dragging */}
            {resizing && (
              <div className="absolute inset-0 bg-blue-500/10 backdrop-blur-[1px] flex items-center justify-center rounded-xl pointer-events-none">
                <span className="bg-slate-900/90 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border border-white/20">
                  {Math.round(imageRef.current?.offsetWidth || displayWidth)}px
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </NodeViewWrapper>
  );
};

export default ImageResizer;
