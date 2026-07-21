import re

with open('src/components.tsx', 'r') as f:
    content = f.read()

new_keydown = """  const handleKeyDown = (e, rowId, colIndex, dataIdx) => {
    let nextRowIndex = dataIdx;
    let nextColIndex = colIndex;

    switch (e.key) {
      case 'ArrowUp':
        nextRowIndex = Math.max(0, dataIdx - 1);
        break;
      case 'ArrowDown':
        nextRowIndex = Math.min(data.length - 1, dataIdx + 1);
        break;
      case 'Enter':
      case 'ArrowRight':
        if (colIndex < columns.length - 1) {
          nextColIndex = colIndex + 1;
        } else if (dataIdx < data.length - 1) {
          nextRowIndex = dataIdx + 1;
          nextColIndex = 0;
        }
        if (e.key === 'Enter') e.preventDefault();
        break;
      case 'ArrowLeft':
        if (colIndex > 0) {
          nextColIndex = colIndex - 1;
        } else if (dataIdx > 0) {
          nextRowIndex = dataIdx - 1;
          nextColIndex = columns.length - 1;
        }
        break;
      default:
        return;
    }

    if (nextRowIndex !== dataIdx || nextColIndex !== colIndex) {
      e.preventDefault();
      
      // Skip read-only columns when moving left/right
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Enter') {
         const direction = (e.key === 'ArrowLeft') ? -1 : 1;
         while(columns[nextColIndex]?.readOnly) {
             nextColIndex += direction;
             if (nextColIndex < 0 || nextColIndex >= columns.length) {
                 break;
             }
         }
         
         // If we went out of bounds while skipping read-only, revert or wrap (simplified handling)
         if (nextColIndex < 0 || nextColIndex >= columns.length) {
             return;
         }
      }
      
      const targetId = `${data[nextRowIndex].id}-${nextColIndex}`;
      const targetRef = inputRefs.current[targetId];
      if (targetRef) {
        try {
          targetRef.focus();
          setTimeout(() => {
            try {
              if (targetRef && typeof targetRef.select === 'function' && document.activeElement === targetRef) {
                targetRef.select();
              }
            } catch (selectErr) {}
          }, 30);
        } catch (focusErr) {}
      }
    }
  };"""

content = re.sub(
    r"  const handleKeyDown = \(e, rowId, colIndex, dataIdx\) => \{.*?\n  \};\n",
    new_keydown + "\n",
    content,
    flags=re.DOTALL
)

with open('src/components.tsx', 'w') as f:
    f.write(content)

