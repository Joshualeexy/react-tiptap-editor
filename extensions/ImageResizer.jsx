import React, { useCallback, useRef, useState } from 'react';
import { NodeViewWrapper } from '@tiptap/react';

const ImageResizer = (props) => {
  const { node, updateAttributes, selected } = props;
  const imageRef = useRef(null);
  const [resizing, setResizing] = useState(false);
  const displayWidth = node.attrs.width || 300;

  const handleMouseDown = useCallback((e, direction) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startWidth = imageRef.current?.offsetWidth || node.attrs.width || 300;
    
    setResizing(true);

    const onMouseMove = (moveEvent) => {
      const deltaX = direction.includes('right') 
        ? moveEvent.clientX - startX 
        : startX - moveEvent.clientX;
      
      const newWidth = Math.max(100, Math.min(1200, startWidth + deltaX));

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
  }, [node.attrs.width, updateAttributes]);

  // Touch support
  const handleTouchStart = useCallback((e, direction) => {
    e.preventDefault();
    const touch = e.touches[0];
    const startX = touch.clientX;
    const startWidth = imageRef.current?.offsetWidth || node.attrs.width || 300;

    setResizing(true);

    const onTouchMove = (moveEvent) => {
      const touchMove = moveEvent.touches[0];
      const deltaX = direction.includes('right') 
        ? touchMove.clientX - startX 
        : startX - touchMove.clientX;
      
      const newWidth = Math.max(100, Math.min(1200, startWidth + deltaX));

      requestAnimationFrame(() => {
        updateAttributes({ width: newWidth });
      });
    };

    const onTouchEnd = () => {
      setResizing(false);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };

    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd);
  }, [node.attrs.width, updateAttributes]);

  return (
    <NodeViewWrapper className={`inline-block relative leading-none group ${selected ? 'is-selected' : ''}`}>
      <div 
        className="relative inline-block transition-shadow"
        ref={imageRef}
        style={{ 
          width: `${displayWidth}px`,
          maxWidth: '100%',
        }}
      >
        <img
          src={node.attrs.src}
          alt={node.attrs.alt || ''}
          title={node.attrs.title || ''}
          width={displayWidth}
          height={Math.max(100, Math.round(displayWidth * 0.75))}
          loading="lazy"
          className={`block w-full h-auto rounded-xl shadow-lg border-2 transition-all duration-300 ${selected ? 'border-cyan-500 shadow-cyan-500/20 ring-4 ring-cyan-500/10' : 'border-transparent shadow-black/10'}`}
        />

        {selected && (
          <>
            {/* Corner Handles */}
            {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((dir) => (
              <div
                key={dir}
                onMouseDown={(e) => handleMouseDown(e, dir)}
                onTouchStart={(e) => handleTouchStart(e, dir)}
                className={`absolute w-3 h-3 bg-cyan-500 border-2 border-white rounded-full z-50 cursor-${dir.includes('left') ? 'nwse' : 'nesw'}-resize hover:scale-125 transition-transform shadow-lg ${
                  dir === 'top-left' ? '-top-1.5 -left-1.5' :
                  dir === 'top-right' ? '-top-1.5 -right-1.5' :
                  dir === 'bottom-left' ? '-bottom-1.5 -left-1.5' :
                  '-bottom-1.5 -right-1.5'
                }`}
              />
            ))}
            
            {/* Status Overlay while resizing */}
            {resizing && (
              <div className="absolute inset-0 bg-cyan-500/10 backdrop-blur-[1px] flex items-center justify-center rounded-xl pointer-events-none">
                <span className="bg-slate-900/80 text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest border border-white/10">
                  {Math.round(displayWidth)}px
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
