# Canvas Features Reference

## Element Behaviors

### Lock/Unlock System
- **Locked**: Element placed, cannot be moved/edited
- **Unlock**: Click element once → becomes editable
- **Lock**: Click outside or finish editing → becomes locked again
- Visual feedback: Border changes, control panel visible when selected

### Text Elements
**When Unlocked:**
- ✏️ Click in text area to edit content
- **B** Bold button - Apply bold formatting
- **I** Italic button - Apply italic formatting
- **U** Underline button - Apply underline formatting
- 🔄 Drag to move
- 📏 Bottom-right corner resize handle
- Click outside to lock

**When Locked:**
- Display only, cannot interact
- Green border indicates locked state
- Click once to unlock

### Image Elements
**When Unlocked:**
- 🔄 Drag to move
- 📏 Corner resize handle
- ↻ Rotation handle (top-left) - Click and drag to rotate
- Click outside to lock

**When Locked:**
- Display only
- Green border indicates locked state
- Click once to unlock

### Control Panel (Always Visible When Selected)
- Floating panel above element
- Contains: Delete button
- Delete removes from canvas and Firebase instantly

## Color Customization
- Color picker in toolbar
- Applies to new text added
- Click text element to apply different color on edit

## Real-Time Sync Features
- ✅ Automatic sync on every action
- ✅ Real-time updates between users
- ✅ Persistent cloud storage (Firebase Firestore)
- ✅ Sync status indicator (top toolbar)
- ✅ Fallback support (works offline with localStorage)

## Keyboard Shortcuts
- **Enter** (in text field) - Add text
- **Escape** - Deselect element (click canvas instead)
- **Delete** - Use control panel button

## Browser Compatibility
- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (touch support via mouse events)

## Data Persistence
- All canvas data stored in Firebase Firestore
- Survives page refresh
- Syncs across devices/users in real-time
- Deleted items removed from all Firebase copies

## Technical Details

### Firebase Collections
```
/canvas
  /v-v-canvas-canvas (document)
    /elements (sub-collection)
      /{elementId}
        type: "text" | "image"
        ... (element data)
```

### Element IDs
- Format: `element-{timestamp}-{random}`
- Unique per element
- Used to track in both DOM and Firebase

### Styling State Classes
- `.canvas-item` - Base styling
- `.selected` - Element is selected (highlighted)
- `.canvas-text` - Text-specific styles
- `.canvas-image` - Image-specific styles

### Event Handling
- Mouse down/up: Drag operations
- Mouse move: Drag/resize/rotate updates
- Content editable: Text editing
- Document click: Deselection
- Keyboard: Text input

## Limitations & Notes
- Max element size: Browser viewport size
- Max text length: No hard limit (but impacts performance)
- Image formats: All modern formats (JPG, PNG, GIF, WebP, etc.)
- Firebase storage: Base64 images (consider Cloud Storage for optimization)
- Collaborative conflicts: Last-write-wins (simple but effective for casual use)

## Future Enhancements
- [ ] Undo/Redo functionality
- [ ] Layer ordering (Z-index control)
- [ ] Grid snapping for precise alignment
- [ ] Text shadow/outline options
- [ ] Curved text paths
- [ ] Collaboration cursors (show other user's mouse)
- [ ] Chat alongside canvas
- [ ] Export as image/PDF
- [ ] Multi-user permission levels

## Debug Commands (in browser console)
```javascript
// View all canvas elements
document.querySelectorAll('.canvas-item')

// Get element data
db.collection('canvas').doc('v-v-canvas-canvas')
  .collection('elements').get()

// Clear local selection
selectedElement = null

// Check Firebase connection
isFirebaseReady // true/false

// View element IDs
document.querySelectorAll('[data-element-id]').forEach(el => 
  console.log(el.dataset.elementId)
)
```

---
Generated: Feb 14, 2026 | Version: 1.0
