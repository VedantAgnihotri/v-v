/*
=============================================================================
CANVAS WITH FIREBASE REAL-TIME SYNC
=============================================================================

SETUP INSTRUCTIONS:
1. Create a Firebase project at https://console.firebase.google.com
2. Enable Firestore Database (Start in test mode for development)
3. Enable Cloud Storage
4. Copy your Firebase config from Project Settings
5. Replace the config object below with your credentials
6. Add the following Firestore rules for testing (CHANGE in production):
   allow read, write: if request.auth != null;
7. Add to your HTML before canvas.js:
   <script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js"></script>
   <script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js"></script>
   <script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-storage.js"></script>
   <script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js"></script>

=============================================================================
*/
console.log('Firebase available?', typeof firebase);
console.log('Window.firebase:', window.firebase);
console.log('All global objects with "fire":', Object.keys(window).filter(k => k.toLowerCase().includes('fire')));
// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBQw3-kUCN06k-_7lrrYgL5FKFaSkdDdvc",
    authDomain: "vv46-803ce.firebaseapp.com",
    projectId: "vv46-803ce",
    storageBucket: "vv46-803ce.firebasestorage.app",
    messagingSenderId: "1005046619211",
    appId: "1:1005046619211:web:9275ed9fbe6d829fdc01ce"
  };

// Check if Firebase is available
let db, storage, auth;
let isFirebaseReady = false;

// Function to initialize Firebase once available
function initializeFirebase() {
  console.log('Attempting Firebase init... firebase type:', typeof firebase);
  
  if (typeof firebase !== 'undefined' && !isFirebaseReady) {
    try {
      console.log('Firebase object found, initializing...');
      firebase.initializeApp(firebaseConfig);
      db = firebase.firestore();
      auth = firebase.auth();
      isFirebaseReady = true;
      console.log('✅ Firebase initialized successfully');
      
      // Anonymous auth
      auth.signInAnonymously().catch(error => {
        console.log('Auth error:', error);
      });
    } catch (error) {
      console.error('Firebase init error:', error);
    }
  } else if (typeof firebase === 'undefined') {
    // Firebase not loaded yet, retry
    console.log('Firebase SDK not loaded yet, retrying in 500ms...');
    setTimeout(initializeFirebase, 500);
  }
}

// Try to initialize immediately
console.log('Canvas.js loaded, starting Firebase init...');
initializeFirebase();

const CANVAS_ID = 'v-and-v-canvas'; // Shared canvas ID

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas-container');
  const textInput = document.getElementById('text-input');
  const addTextBtn = document.getElementById('add-text-btn');
  const textColor = document.getElementById('text-color');
  const imageUpload = document.getElementById('image-upload');
  const uploadBtn = document.getElementById('upload-btn');
  const syncStatus = document.getElementById('sync-status');

  let selectedElement = null;
  const elements = new Map(); // Store element data by ID

  // Draw dot background
  function drawDotBackground() {
    canvas.style.backgroundImage = `
      radial-gradient(circle, rgba(0, 0, 0, 0.08) 1px, transparent 1px)
    `;
    canvas.style.backgroundSize = '30px 30px';
    canvas.style.backgroundPosition = '0 0';
  }

  // Update sync status
  function updateSyncStatus(status, message) {
    const statusEl = document.getElementById('sync-status');
    if (status === 'syncing') {
      statusEl.textContent = '🔄 Syncing...';
      statusEl.style.color = '#f7a8b8';
    } else if (status === 'synced') {
      statusEl.textContent = '✓ Synced';
      statusEl.style.color = '#4caf50';
      setTimeout(() => {
        if (statusEl.textContent === '✓ Synced') {
          statusEl.textContent = '✓ Ready';
        }
      }, 2000);
    } else if (status === 'error') {
      statusEl.textContent = '✗ Error';
      statusEl.style.color = '#ff6b6b';
    }
  }

  // Create unique ID
  function generateId() {
    return `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Create control panel
  function createControlPanel(isMobileOnly = false) {
    const panel = document.createElement('div');
    panel.className = 'control-panel';
    
    const dragHandle = document.createElement('button');
    dragHandle.className = 'control-btn drag-handle';
    dragHandle.innerHTML = '⇅⇄';
    dragHandle.title = 'Drag to move';
    dragHandle.style.display = isMobileOnly ? 'flex' : (window.innerWidth <= 768 ? 'flex' : 'none');
    dragHandle.setAttribute('data-drag-handle', 'true');
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'control-btn delete-btn';
    deleteBtn.innerHTML = '🗑️';
    deleteBtn.title = 'Delete';
    
    panel.appendChild(dragHandle);
    panel.appendChild(deleteBtn);
    return { panel, dragHandle, deleteBtn };
  }

  // Create text element
  function createTextElement(text, data = {}, elementId = null) {
    const id = elementId || generateId();
    const textEl = document.createElement('div');
    textEl.className = 'canvas-item canvas-text';
    textEl.dataset.elementId = id;
    
    // Create contenteditable div
    const content = document.createElement('div');
    content.className = 'text-content';
    content.contentEditable = 'false';
    content.textContent = text;
    
    textEl.appendChild(content);
    
    // Styling
    textEl.style.position = 'absolute';
    textEl.style.left = (data.x || Math.random() * (canvas.clientWidth - 150)) + 'px';
    textEl.style.top = (data.y || Math.random() * (canvas.clientHeight - 100)) + 'px';
    textEl.style.color = data.color || textColor.value;
    textEl.style.fontSize = data.fontSize || '16px';
    textEl.style.fontWeight = data.bold ? '700' : '400';
    textEl.style.fontStyle = data.italic ? 'italic' : 'normal';
    textEl.style.textDecoration = data.underline ? 'underline' : 'none';
    textEl.style.cursor = 'move';
    textEl.style.userSelect = 'none';
    textEl.style.wordWrap = 'break-word';
    textEl.style.backgroundColor = 'transparent';
    textEl.style.border = 'none';
    textEl.style.display = 'block';
    textEl.style.width = data.width || '200px';
    textEl.style.height = data.height || 'auto';
    textEl.style.padding = '0';
    textEl.style.margin = '0';
    textEl.dataset.locked = 'true';
    
    // Control panel with drag handle
    const { panel, dragHandle, deleteBtn } = createControlPanel(true);
    textEl.appendChild(panel);
    
    // Store element data
    elements.set(id, {
        type: 'text',
        text: text,
        color: data.color || textColor.value,
        fontSize: data.fontSize || '16px',
        bold: data.bold || false,
        italic: data.italic || false,
        underline: data.underline || false,
        x: data.x || Math.random() * (canvas.clientWidth - 150),
        y: data.y || Math.random() * (canvas.clientHeight - 100),
        width: data.width || '200px',
        height: data.height || 'auto',
        locked: true
    });

    // Click to select/unlock
    textEl.addEventListener('click', (e) => {
      e.stopPropagation();
      selectElement(textEl);
      if (textEl.dataset.locked === 'true') {
        unlockText(textEl, content);
      }
    });

    // Delete button
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteElement(id);
    });

    // Draggable when unlocked
    makeDraggable(textEl);

    // Resizable
    makeResizable(textEl);

    canvas.appendChild(textEl);
    saveToFirebase(id);
    
    return textEl;
  }

  // Unlock text for editing
  function unlockText(textEl, content) {
    textEl.dataset.locked = 'false';
    content.contentEditable = 'true';
    content.focus();
    
    // Remove old toolbar if exists
    const oldToolbar = textEl.querySelector('.text-toolbar');
    if (oldToolbar) oldToolbar.remove();
    
    // Create toolbar
    const toolbar = document.createElement('div');
    toolbar.className = 'text-toolbar';
    toolbar.style.pointerEvents = 'auto';
    let isInteractingWithToolbar = false;
    
    // Button row container
    const buttonRow = document.createElement('div');
    buttonRow.style.display = 'flex';
    buttonRow.style.gap = '6px';
    buttonRow.style.marginBottom = '8px';
    
    // Bold button
    const boldBtn = document.createElement('button');
    boldBtn.className = 'text-toolbar-btn';
    boldBtn.textContent = 'B';
    boldBtn.type = 'button';
    boldBtn.onmousedown = (e) => {
      e.preventDefault();
      e.stopPropagation();
      isInteractingWithToolbar = true;
      textEl.style.fontWeight = textEl.style.fontWeight === '700' ? '400' : '700';
      setTimeout(() => { isInteractingWithToolbar = false; }, 0);
    };
    buttonRow.appendChild(boldBtn);
    
    // Italic button
    const italicBtn = document.createElement('button');
    italicBtn.className = 'text-toolbar-btn';
    italicBtn.textContent = 'I';
    italicBtn.type = 'button';
    italicBtn.onmousedown = (e) => {
      e.preventDefault();
      e.stopPropagation();
      isInteractingWithToolbar = true;
      textEl.style.fontStyle = textEl.style.fontStyle === 'italic' ? 'normal' : 'italic';
      setTimeout(() => { isInteractingWithToolbar = false; }, 0);
    };
    buttonRow.appendChild(italicBtn);
    
    // Underline button
    const underlineBtn = document.createElement('button');
    underlineBtn.className = 'text-toolbar-btn';
    underlineBtn.textContent = 'U';
    underlineBtn.type = 'button';
    underlineBtn.onmousedown = (e) => {
      e.preventDefault();
      e.stopPropagation();
      isInteractingWithToolbar = true;
      textEl.style.textDecoration = textEl.style.textDecoration === 'underline' ? 'none' : 'underline';
      setTimeout(() => { isInteractingWithToolbar = false; }, 0);
    };
    buttonRow.appendChild(underlineBtn);
    
    toolbar.appendChild(buttonRow);
    
    // Font size slider row
    const sliderRow = document.createElement('div');
    sliderRow.style.display = 'flex';
    sliderRow.style.alignItems = 'center';
    sliderRow.style.gap = '8px';
    sliderRow.style.width = '100%';
    sliderRow.style.pointerEvents = 'auto';
    sliderRow.style.zIndex = '1000';
    
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.className = 'text-toolbar-slider';
    slider.min = '8';
    slider.max = '72';
    const currentFontSize = parseFloat(textEl.style.fontSize) || 16;
    slider.value = currentFontSize;
    slider.style.flex = '1';
    slider.style.pointerEvents = 'auto';
    slider.style.touchAction = 'none';
    slider.style.zIndex = '1001';
    slider.style.cursor = 'pointer';
    
    const sizeDisplay = document.createElement('span');
    sizeDisplay.textContent = currentFontSize + 'px';
    sizeDisplay.style.fontSize = '0.85rem';
    sizeDisplay.style.fontWeight = '600';
    sizeDisplay.style.color = '#6b3750';
    sizeDisplay.style.minWidth = '40px';
    sizeDisplay.style.textAlign = 'right';
    sizeDisplay.style.pointerEvents = 'none';
    
    // Handle input (for mouse and touch drag)
    const handleSliderInput = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const newSize = parseInt(slider.value);
      textEl.style.fontSize = newSize + 'px';
      sizeDisplay.textContent = newSize + 'px';
      
      // Update element data
      const id = textEl.dataset.elementId;
      const data = elements.get(id);
      if (data) {
        data.fontSize = newSize + 'px';
        elements.set(id, data);
      }
    };
    
    // Handle mouse/touch end (save to Firebase)
    const handleSliderEnd = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const id = textEl.dataset.elementId;
      saveToFirebase(id);
    };
    
    // Add both mouse and touch events for better compatibility
    slider.addEventListener('input', handleSliderInput, true);
    slider.addEventListener('change', handleSliderInput, true);
    slider.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
    }, true);
    slider.addEventListener('mouseup', handleSliderEnd, true);
    slider.addEventListener('touchend', handleSliderEnd, true);
    
    sliderRow.appendChild(slider);
    sliderRow.appendChild(sizeDisplay);
    toolbar.appendChild(sliderRow);
    
    textEl.appendChild(toolbar);
    
    content.onblur = () => {
      if (!isInteractingWithToolbar) {
        lockText(textEl, content, toolbar);
      } else {
        content.focus();
      }
    };
  }

  // Lock text
  function lockText(textEl, content, toolbar) {
    const id = textEl.dataset.elementId;
    textEl.dataset.locked = 'true';
    textEl.style.backgroundColor = 'transparent';
    textEl.style.border = 'none';
    
    content.contentEditable = 'false';
    if (toolbar) toolbar.remove();
    
    const data = elements.get(id);
    data.text = content.textContent;
    data.bold = textEl.style.fontWeight === '700';
    data.italic = textEl.style.fontStyle === 'italic';
    data.underline = textEl.style.textDecoration.includes('underline');
    data.fontSize = textEl.style.fontSize;
    data.width = textEl.style.width;
    data.height = textEl.style.height;
    
    saveToFirebase(id);
  }

  // Apply text styling
  function applyTextStyle(textEl, style) {
    if (style === 'bold') {
      const isBold = textEl.style.fontWeight === '700';
      textEl.style.fontWeight = isBold ? '400' : '700';
    } else if (style === 'italic') {
      const isItalic = textEl.style.fontStyle === 'italic';
      textEl.style.fontStyle = isItalic ? 'normal' : 'italic';
    } else if (style === 'underline') {
      const isUnderline = textEl.style.textDecoration === 'underline';
      textEl.style.textDecoration = isUnderline ? 'none' : 'underline';
    }
  }

  // Create image element
  function createImageElement(src, data = {}, elementId = null) {
    const id = elementId || generateId();
    const imgWrapper = document.createElement('div');
    imgWrapper.className = 'canvas-item canvas-image';
    imgWrapper.dataset.elementId = id;
    imgWrapper.style.position = 'absolute';
    imgWrapper.style.left = (data.x || Math.random() * (canvas.clientWidth - 200)) + 'px';
    imgWrapper.style.top = (data.y || Math.random() * (canvas.clientHeight - 200)) + 'px';
    imgWrapper.style.cursor = 'move';
    imgWrapper.dataset.locked = 'true';
    imgWrapper.dataset.rotation = data.rotation || 0;
    
    const img = document.createElement('img');
    img.src = src;
    img.style.display = 'block';
    img.style.width = data.width || '150px';
    img.style.height = data.height || 'auto';
    img.style.borderRadius = '8px';
    img.style.userSelect = 'none';
    
    imgWrapper.appendChild(img);
    
    // Control panel with drag handle
    const { panel, dragHandle, deleteBtn } = createControlPanel(true);
    imgWrapper.appendChild(panel);
    
    // Resize handles
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'resize-handle';
    imgWrapper.appendChild(resizeHandle);
    
    // Rotation handle
    const rotateHandle = document.createElement('div');
    rotateHandle.className = 'rotate-handle';
    rotateHandle.innerHTML = '↻';
    imgWrapper.appendChild(rotateHandle);
    
    // Store element data
    elements.set(id, {
        type: 'image',
        src: src,
        x: data.x || Math.random() * (canvas.clientWidth - 200),
        y: data.y || Math.random() * (canvas.clientHeight - 200),
        width: data.width || '150px',
        height: data.height || 'auto',
        rotation: data.rotation || 0,
        locked: true
    });

    // Click to select/unlock
    imgWrapper.addEventListener('click', (e) => {
      e.stopPropagation();
      selectElement(imgWrapper);
      if (imgWrapper.dataset.locked === 'true') {
        imgWrapper.dataset.locked = 'false';
        imgWrapper.style.border = '2px solid #f7a8b8';
      }
    });

    // Delete button
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteElement(id);
    });

    // Draggable
    makeDraggable(imgWrapper);

    // Resizable
    makeResizable(imgWrapper, true);

    // Rotatable
    makeRotatable(imgWrapper, rotateHandle);

    canvas.appendChild(imgWrapper);
    saveToFirebase(id);
    
    return imgWrapper;
  }

  // Select element
  function selectElement(el) {
    if (selectedElement) {
      selectedElement.classList.remove('selected');
    }
    selectedElement = el;
    el.classList.add('selected');
  }

  // Make element draggable
  function makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    let isDragging = false;
    let isMobile = window.innerWidth <= 768;

    element.addEventListener('mousedown', dragMouseDown, false);
    element.addEventListener('touchstart', dragTouchStart, false);

    function dragMouseDown(e) {
      // Only allow drag from drag handle on mobile, anywhere on desktop
      if (isMobile) {
        if (!e.target.closest('[data-drag-handle="true"]')) {
          return;
        }
      } else {
        // Check if clicking on handle, control button, or toolbar
        if (e.target.closest('.resize-handle') ||
            e.target.closest('.rotate-handle') ||
            e.target.closest('.control-btn') ||
            e.target.closest('.text-toolbar-btn')) {
          return;
        }
      }
      
      if (element.dataset.locked === 'true') return;
      
      e.preventDefault();
      e.stopPropagation();
      isDragging = true;
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.addEventListener('mousemove', elementDrag, false);
      document.addEventListener('mouseup', closeDragElement, false);
    }

    function dragTouchStart(e) {
      // On mobile, only drag from handle
      if (!e.target.closest('[data-drag-handle="true"]')) {
        return;
      }
      
      if (element.dataset.locked === 'true') return;
      
      e.preventDefault();
      e.stopPropagation();
      isDragging = true;
      const touch = e.touches[0];
      pos3 = touch.clientX;
      pos4 = touch.clientY;
      document.addEventListener('touchmove', elementTouchDrag, false);
      document.addEventListener('touchend', closeDragElement, false);
    }

    function elementDrag(e) {
      if (!isDragging) return;
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      element.style.top = (element.offsetTop - pos2) + 'px';
      element.style.left = (element.offsetLeft - pos1) + 'px';
      updateSyncStatus('syncing');
    }

    function elementTouchDrag(e) {
      if (!isDragging) return;
      e.preventDefault();
      const touch = e.touches[0];
      pos1 = pos3 - touch.clientX;
      pos2 = pos4 - touch.clientY;
      pos3 = touch.clientX;
      pos4 = touch.clientY;
      element.style.top = (element.offsetTop - pos2) + 'px';
      element.style.left = (element.offsetLeft - pos1) + 'px';
      updateSyncStatus('syncing');
    }

    function closeDragElement() {
        document.removeEventListener('mousemove', elementDrag);
        document.removeEventListener('mouseup', closeDragElement);
        document.removeEventListener('touchmove', elementTouchDrag);
        document.removeEventListener('touchend', closeDragElement);
        isDragging = false;
        
        // Lock element when released
        if (element.dataset.locked !== 'true') {
            element.dataset.locked = 'true';
            element.style.border = 'none';
            element.style.backgroundColor = '';
        }
        const id = element.dataset.elementId;
        const data = elements.get(id);
        if (data) {
        data.x = element.offsetLeft;
        data.y = element.offsetTop;
        elements.set(id, data);
        }
      saveToFirebase(element.dataset.elementId);
    }
  }

  // Make element resizable
  function makeResizable(element, isImage = false) {
    // Create resize handle
    let resizeHandle = element.querySelector('.resize-handle');
    if (!resizeHandle) {
      resizeHandle = document.createElement('div');
      resizeHandle.className = 'resize-handle';
      element.appendChild(resizeHandle);
    }

    let isResizing = false;
    let startX, startY, startWidth, startHeight;

    // Use capture phase to intercept before drag handler
    resizeHandle.addEventListener('mousedown', function(e) {
      if (element.dataset.locked === 'true') return;
      e.preventDefault();
      e.stopPropagation();
      
      isResizing = true;
      startX = e.clientX;
      startY = e.clientY;
      
      // Force element to have a width if it doesn't
      if (!element.style.width || element.style.width === 'auto') {
        element.style.width = element.offsetWidth + 'px';
      }
      if (!element.style.height || element.style.height === 'auto') {
        element.style.height = element.offsetHeight + 'px';
      }
      
      startWidth = parseFloat(element.style.width);
      startHeight = parseFloat(element.style.height);

      const onMove = (e) => {
        if (!isResizing) return;
        e.preventDefault();
        const newWidth = Math.max(30, startWidth + (e.clientX - startX));
        const newHeight = Math.max(30, startHeight + (e.clientY - startY));
        
        element.style.width = newWidth + 'px';
        element.style.height = newHeight + 'px';
        
        const img = element.querySelector('img');
        if (img) {
          img.style.width = '100%';
          img.style.height = '100%';
        }
      };

      const onUp = (e) => {
        if (!isResizing) return;
        isResizing = false;
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        
        const id = element.dataset.elementId;
        const data = elements.get(id);
        if (data) {
          data.width = element.style.width;
          data.height = element.style.height;
          elements.set(id, data);
        }
        saveToFirebase(id);
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    }, true); // Use capture phase

    // Touch support for mobile resize
    resizeHandle.addEventListener('touchstart', function(e) {
      if (element.dataset.locked === 'true') return;
      e.preventDefault();
      e.stopPropagation();
      
      isResizing = true;
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      
      // Force element to have a width if it doesn't
      if (!element.style.width || element.style.width === 'auto') {
        element.style.width = element.offsetWidth + 'px';
      }
      if (!element.style.height || element.style.height === 'auto') {
        element.style.height = element.offsetHeight + 'px';
      }
      
      startWidth = parseFloat(element.style.width);
      startHeight = parseFloat(element.style.height);

      const onTouchMove = (e) => {
        if (!isResizing) return;
        e.preventDefault();
        const touch = e.touches[0];
        const newWidth = Math.max(30, startWidth + (touch.clientX - startX));
        const newHeight = Math.max(30, startHeight + (touch.clientY - startY));
        
        element.style.width = newWidth + 'px';
        element.style.height = newHeight + 'px';
        
        const img = element.querySelector('img');
        if (img) {
          img.style.width = '100%';
          img.style.height = '100%';
        }
      };

      const onTouchEnd = (e) => {
        if (!isResizing) return;
        isResizing = false;
        document.removeEventListener('touchmove', onTouchMove);
        document.removeEventListener('touchend', onTouchEnd);
        
        const id = element.dataset.elementId;
        const data = elements.get(id);
        if (data) {
          data.width = element.style.width;
          data.height = element.style.height;
          elements.set(id, data);
        }
        saveToFirebase(id);
      };

      document.addEventListener('touchmove', onTouchMove, false);
      document.addEventListener('touchend', onTouchEnd, false);
    }, true); // Use capture phase
  }

  // Make image rotatable
  function makeRotatable(element, rotateHandle) {
    let isRotating = false;
    let startX, startY, startRotation;

    // Mouse events
    rotateHandle.addEventListener('mousedown', (e) => {
      if (element.dataset.locked === 'true') return;
      
      e.preventDefault();
      e.stopPropagation();
      isRotating = true;
      startX = e.clientX;
      startY = e.clientY;
      startRotation = parseFloat(element.dataset.rotation) || 0;
      updateSyncStatus('syncing');
      
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', stopRotate);
    }, true); // capture phase

    // Touch events
    rotateHandle.addEventListener('touchstart', (e) => {
      if (element.dataset.locked === 'true') return;
      
      e.preventDefault();
      e.stopPropagation();
      isRotating = true;
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      startRotation = parseFloat(element.dataset.rotation) || 0;
      updateSyncStatus('syncing');
      
      document.addEventListener('touchmove', onTouchMove);
      document.addEventListener('touchend', stopRotate);
    }, true); // capture phase

    function onMouseMove(e) {
      if (!isRotating) return;
      e.preventDefault();
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      const newRotation = startRotation + angle;
      
      element.dataset.rotation = newRotation;
      const img = element.querySelector('img');
      if (img) {
        img.style.transform = `rotate(${newRotation}deg)`;
      }
    }

    function onTouchMove(e) {
      if (!isRotating) return;
      e.preventDefault();
      const touch = e.touches[0];
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      const newRotation = startRotation + angle;
      
      element.dataset.rotation = newRotation;
      const img = element.querySelector('img');
      if (img) {
        img.style.transform = `rotate(${newRotation}deg)`;
      }
    }

    function stopRotate() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', stopRotate);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', stopRotate);
      
      isRotating = false;
      const id = element.dataset.elementId;
      const data = elements.get(id);
      if (data) {
        data.rotation = parseFloat(element.dataset.rotation) || 0;
        elements.set(id, data);
      }
      saveToFirebase(element.dataset.elementId);
    }
  }

  // Add text
  addTextBtn.addEventListener('click', () => {
    if (textInput.value.trim()) {
      createTextElement(textInput.value, {
        color: textColor.value
      });
      textInput.value = '';
    }
  });

  // Enter key to add text
  textInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addTextBtn.click();
    }
  });

  // Add image
  uploadBtn.addEventListener('click', () => {
    if (imageUpload.files.length > 0) {
      const file = imageUpload.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        createImageElement(e.target.result);
        imageUpload.value = '';
      };
      reader.readAsDataURL(file);
    }
  });

  // Delete element
  function deleteElement(id) {
    const element = document.querySelector(`[data-element-id="${id}"]`);
    if (element) {
      element.remove();
      elements.delete(id);
      deleteFromFirebase(id);
    }
  }

  // Click anywhere else to deselect
  canvas.addEventListener('click', (e) => {
    if (e.target === canvas) {
      if (selectedElement) {
        selectedElement.classList.remove('selected');
        selectedElement = null;
      }
    }
  });

  // Save to Firebase
  function saveToFirebase(elementId) {
    if (!isFirebaseReady) {
      updateSyncStatus('error');
      return;
    }

    const data = elements.get(elementId);
    if (!data) return;

    updateSyncStatus('syncing');

    db.collection('canvas').doc(CANVAS_ID)
      .collection('elements').doc(elementId)
      .set(data, { merge: true })
      .then(() => {
        updateSyncStatus('synced');
      })
      .catch((error) => {
        console.error('Save error:', error);
        updateSyncStatus('error');
      });
  }

  // Delete from Firebase
  function deleteFromFirebase(elementId) {
    if (!isFirebaseReady) return;

    db.collection('canvas').doc(CANVAS_ID)
      .collection('elements').doc(elementId)
      .delete()
      .catch((error) => {
        console.error('Delete error:', error);
      });
  }

  // Listen to Firebase changes
  function listenToFirebase() {
    if (!isFirebaseReady) return;

    db.collection('canvas').doc(CANVAS_ID)
      .collection('elements')
      .onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const id = change.doc.id;
          const data = change.doc.data();

          if (change.type === 'added' || change.type === 'modified') {
            // Check if element already exists
            const existing = document.querySelector(`[data-element-id="${id}"]`);
            
            if (!existing) {
              if (data.type === 'text') {
                createTextElement(data.text, data, id);
              } else if (data.type === 'image') {
                createImageElement(data.src, data, id);
              }
            } else {
              // Update existing element
              if (data.type === 'text') {
                const content = existing.querySelector('.text-content');
                if (content && content.textContent !== data.text) {
                  content.textContent = data.text;
                }
                existing.style.left = data.x + 'px';
                existing.style.top = data.y + 'px';
                existing.style.color = data.color;
                existing.style.fontWeight = data.bold ? '700' : '400';
                existing.style.fontStyle = data.italic ? 'italic' : 'normal';
                existing.style.textDecoration = data.underline ? 'underline' : 'none';
                if (data.fontSize) {
                  existing.style.fontSize = data.fontSize;
                }
                if (data.width) {
                  existing.style.width = data.width;
                }
                if (data.height) {
                  existing.style.height = data.height;
                }
              } else if (data.type === 'image') {
                existing.style.left = data.x + 'px';
                existing.style.top = data.y + 'px';
                existing.style.width = data.width;
                existing.style.height = data.height;
                existing.dataset.rotation = data.rotation;
                const img = existing.querySelector('img');
                if (img) {
                  img.style.transform = `rotate(${data.rotation}deg)`;
                }
              }
            }
          } else if (change.type === 'removed') {
            const existing = document.querySelector(`[data-element-id="${id}"]`);
            if (existing) {
              existing.remove();
              elements.delete(id);
            }
          }
        });
      });
  }

  // Initialize
  drawDotBackground();
  if (isFirebaseReady) {
    listenToFirebase();
  } else {
    updateSyncStatus('error');
  }
});

