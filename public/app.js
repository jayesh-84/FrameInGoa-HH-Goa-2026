/**
 * FrameInGoa — HH Goa 2026 Builder Card Generator
 * Application Logic, Image Processing & Canvas Generation
 */

document.addEventListener('DOMContentLoaded', () => {
  
  // Elements Selectors
  const photoInput = document.getElementById('photo-input');
  const uploadZone = document.getElementById('upload-zone');
  const uploadPrompt = document.getElementById('upload-prompt');
  const uploadLoader = document.getElementById('upload-loader');
  const uploadPreviewContainer = document.getElementById('upload-preview-container');
  const photoPreview = document.getElementById('photo-preview');
  const btnChangePhoto = document.getElementById('btn-change-photo');
  
  const form = document.getElementById('builder-form');
  const inputName = document.getElementById('input-name');
  const inputStack = document.getElementById('input-stack');
  const inputTitle = document.getElementById('input-title');
  const btnRandomTitle = document.getElementById('btn-random-title');
  const btnGenerate = document.getElementById('btn-generate');
  
  const generatorOverlay = document.getElementById('generator-overlay');
  const loaderPct = document.getElementById('loader-pct');
  const loadingBarInner = document.getElementById('loading-bar-inner');
  const genStatusText = document.getElementById('gen-status-text');
  
  const cardPlaceholder = document.getElementById('card-placeholder');
  const cardCanvas = document.getElementById('card-canvas');
  const resultContainer = document.getElementById('result-container');
  const finalCardImg = document.getElementById('final-card-img');
  const previewStatusBadge = document.getElementById('preview-status-badge');
  
  const btnDownload = document.getElementById('btn-download');
  const btnShareX = document.getElementById('btn-share-x');
  const btnReset = document.getElementById('btn-reset');
  
  const errorToast = document.getElementById('error-toast');
  const toastMessage = document.getElementById('toast-message');
  const btnCloseToast = document.getElementById('btn-close-toast');

  const btnHeroCta = document.getElementById('btn-hero-cta');
  const generatorTool = document.getElementById('generator-tool');

  // Application State
  let uploadedImageSrc = null;
  let currentTitleIndex = -1;

  // Funny Title Presets
  const FUN_TITLES = [
    "Rust Evangelist & Coffee Destroyer",
    "Solidity Spellcaster",
    "Gas Fee Optimizer",
    "Centered Div Specialist",
    "AI Wrapper Architect",
    "Prod DB Breaker",
    "Legacy Code Explorer",
    "git commit -m 'fix' Enthusiast",
    "Keyboard Click-Clack Maestro",
    "CSS Grid Survivor",
    "YAML Configuration Specialist",
    "Typescript Compiler Arguer",
    "10x Caffeine-to-Code Unit",
    "StackOverflow Copypasta Chef",
    "Bounty Hunter & Redbull Addict",
    "Underpaid Prompt Engineer",
    "Uncaught TypeError Enjoyer",
    "Goa Beach Hackathon Legend",
    "Zero-Knowledge Proof Cook",
    "Smart Contract Arbitrageur",
    "Docker Escape Artist",
    "Meme-Driven Developer",
    "Infinite Loop Creator",
    "Async/Await Procrastinator",
    "Vibe-Coding Professional"
  ];

  // Fonts pre-load verification helper
  // Draw canvas elements only after fonts are ready
  let fontsLoaded = false;
  document.fonts.ready.then(() => {
    fontsLoaded = true;
  });

  // Asynchronous Script Loader for Lazy-loading CDN assets
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Failed to load dynamic script asset: ${src}`));
      document.head.appendChild(script);
    });
  }

  // Client-Side Image Compressor & Resizer (Max dimension 1200px)
  function resizeImage(imgSrc, maxDimension = 1200) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        
        if (width <= maxDimension && height <= maxDimension) {
          resolve(imgSrc); // Return original if already small
          return;
        }

        let newW = width;
        let newH = height;
        if (width > height) {
          newW = maxDimension;
          newH = (height * maxDimension) / width;
        } else {
          newH = maxDimension;
          newW = (width * maxDimension) / height;
        }

        const helperCanvas = document.createElement('canvas');
        helperCanvas.width = newW;
        helperCanvas.height = newH;
        const helperCtx = helperCanvas.getContext('2d');
        helperCtx.drawImage(img, 0, 0, newW, newH);
        
        // Export as compressed JPEG at 85% quality to save massive memory
        resolve(helperCanvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = () => {
        resolve(imgSrc); // Fallback to original
      };
      img.src = imgSrc;
    });
  }

  // Toast Helper
  function showToast(msg, isSuccess = false) {
    toastMessage.textContent = msg;
    const toastIcon = errorToast.querySelector('.toast-icon');
    if (isSuccess) {
      if (toastIcon) toastIcon.textContent = '🏝️';
      errorToast.style.borderColor = '#f5c242'; // Gold/Yellow border
      errorToast.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(245, 194, 66, 0.2)';
    } else {
      if (toastIcon) toastIcon.textContent = '⚠️';
      errorToast.style.borderColor = 'var(--color-error)';
      errorToast.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(255, 51, 95, 0.15)';
    }
    
    errorToast.classList.remove('hidden');
    
    if (window.toastTimeout) {
      clearTimeout(window.toastTimeout);
    }
    
    const delay = isSuccess ? 9000 : 5000;
    window.toastTimeout = setTimeout(() => {
      errorToast.classList.add('hidden');
    }, delay);
  }

  function showError(msg) {
    showToast(msg, false);
  }

  function showInstruction(msg) {
    showToast(msg, true);
  }

  btnCloseToast.addEventListener('click', () => {
    errorToast.classList.add('hidden');
  });

  // Smooth Scroll for Hero CTA
  if (btnHeroCta && generatorTool) {
    btnHeroCta.addEventListener('click', () => {
      generatorTool.scrollIntoView({ behavior: 'smooth' });
      // Focus shift for accessibility
      setTimeout(() => {
        inputName.focus();
      }, 600);
    });
  }

  // Fun Title Generator Click Handler
  btnRandomTitle.addEventListener('click', () => {
    let index;
    do {
      index = Math.floor(Math.random() * FUN_TITLES.length);
    } while (index === currentTitleIndex && FUN_TITLES.length > 1);
    
    currentTitleIndex = index;
    inputTitle.value = FUN_TITLES[index];
    
    // Quick micro-animation to indicate update
    inputTitle.classList.add('active');
    setTimeout(() => inputTitle.classList.remove('active'), 150);
  });

  // File Upload Handlers
  uploadZone.addEventListener('click', () => {
    photoInput.click();
  });

  // Keyboard navigation for upload zone
  uploadZone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      photoInput.click();
    }
  });

  // Drag and drop event listeners
  ['dragenter', 'dragover'].forEach(eventName => {
    uploadZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      uploadZone.classList.add('dragover');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    uploadZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      uploadZone.classList.remove('dragover');
    }, false);
  });

  uploadZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  });

  photoInput.addEventListener('change', (e) => {
    if (photoInput.files.length > 0) {
      handleFile(photoInput.files[0]);
    }
  });

  btnChangePhoto.addEventListener('click', (e) => {
    e.stopPropagation(); // Avoid triggering parent click
    photoInput.click();
  });

  // Handle uploaded file (validations & HEIC conversion)
  async function handleFile(file) {
    // Check type & extension
    const nameLower = file.name.toLowerCase();
    const isHEIC = nameLower.endsWith('.heic') || nameLower.endsWith('.heif') || file.type === 'image/heic' || file.type === 'image/heif';
    const isStandard = file.type.startsWith('image/') && (nameLower.endsWith('.png') || nameLower.endsWith('.jpg') || nameLower.endsWith('.jpeg'));

    if (!isHEIC && !isStandard) {
      showError("Unsupported format. Please upload JPG, PNG, or HEIC.");
      return;
    }

    // Size limit 10MB
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      showError("File is too large. Max size allowed is 10MB.");
      return;
    }

    // Update UI to loading
    uploadPrompt.classList.add('hidden');
    uploadPreviewContainer.classList.add('hidden');
    uploadLoader.classList.remove('hidden');

    if (isHEIC) {
      document.getElementById('loader-sub').classList.remove('hidden');
      try {
        if (typeof heic2any === 'undefined') {
          // Lazy-load heic2any CDN library on demand to save 1MB initial bandwidth
          await loadScript('https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js');
        }
        
        // Convert HEIC to JPEG blob
        const convertedBlob = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.8
        });

        const imageBlob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
        loadBlobImage(imageBlob);
      } catch (err) {
        console.error(err);
        showError("HEIC Conversion failed: " + err.message);
        resetUploadZone();
      }
    } else {
      document.getElementById('loader-sub').classList.add('hidden');
      loadBlobImage(file);
    }
  }

  function loadBlobImage(blob) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const rawSrc = e.target.result;
      
      try {
        // Compress and resize image locally to max bounding box of 1200px
        uploadedImageSrc = await resizeImage(rawSrc, 1200);
      } catch (err) {
        console.warn("Local compression failed, using original size:", err);
        uploadedImageSrc = rawSrc;
      }
      
      photoPreview.src = uploadedImageSrc;
      
      // Update UI
      uploadLoader.classList.add('hidden');
      uploadPreviewContainer.classList.remove('hidden');
      document.getElementById('photo-error').classList.add('hidden');

      // Update badge progress
      updateFormProgress();
    };
    reader.onerror = () => {
      showError("Error reading image file.");
      resetUploadZone();
    };
    reader.readAsDataURL(blob);
  }

  function resetUploadZone() {
    uploadedImageSrc = null;
    photoPreview.src = '';
    uploadLoader.classList.add('hidden');
    uploadPreviewContainer.classList.add('hidden');
    uploadPrompt.classList.remove('hidden');
  }

  // Validate form details
  function validateForm() {
    let isValid = true;

    if (!uploadedImageSrc) {
      document.getElementById('photo-error').classList.remove('hidden');
      isValid = false;
    } else {
      document.getElementById('photo-error').classList.add('hidden');
    }

    if (!inputName.value.trim()) {
      document.getElementById('name-error').classList.remove('hidden');
      isValid = false;
    } else {
      document.getElementById('name-error').classList.add('hidden');
    }

    if (!inputStack.value) {
      document.getElementById('stack-error').classList.remove('hidden');
      isValid = false;
    } else {
      document.getElementById('stack-error').classList.add('hidden');
    }

    if (!inputTitle.value.trim()) {
      document.getElementById('title-error').classList.remove('hidden');
      isValid = false;
    } else {
      document.getElementById('title-error').classList.add('hidden');
    }

    return isValid;
  }

  // Button Generate Card click listener
  btnGenerate.addEventListener('click', async () => {
    if (!validateForm()) {
      showError("Please fill out all required fields and upload a photo.");
      return;
    }

    // Play visual rendering animation
    generatorOverlay.classList.remove('hidden');
    loaderPct.textContent = "0%";
    loadingBarInner.style.width = "0%";
    genStatusText.textContent = "INITIALIZING CORE RENDERING...";

    const animationSteps = [
      { pct: 15, text: "LOAD_COMPRESSED_USER_IMAGE..." },
      { pct: 35, text: "CALCULATING_GRID_COORDINATES..." },
      { pct: 60, text: "COMPILING_VECTOR_BACKGROUND..." },
      { pct: 85, text: "WRAPPING_BUILDER_TEXT..." },
      { pct: 100, text: "ACCESS GRANTED. BADGE SECURED!" }
    ];

    let currentStep = 0;
    const duration = 700; // total 700ms compile animation for instant feel
    const intervalTime = 35;
    const increment = 100 / (duration / intervalTime);
    let currentPct = 0;

    const timer = setInterval(async () => {
      currentPct += increment;
      if (currentPct >= 100) {
        currentPct = 100;
        clearInterval(timer);
      }

      // Update text status based on step bracket
      const step = animationSteps.find(s => currentPct <= s.pct) || animationSteps[animationSteps.length - 1];
      
      loaderPct.textContent = `${Math.floor(currentPct)}%`;
      loadingBarInner.style.width = `${currentPct}%`;
      genStatusText.textContent = step.text;

      if (currentPct === 100) {
        try {
          await generateCardImage();
          setTimeout(() => {
            // Transition preview screen
            generatorOverlay.classList.add('hidden');
            cardPlaceholder.classList.add('hidden');
            resultContainer.classList.remove('hidden');
            previewStatusBadge.textContent = "GENERATED";
            previewStatusBadge.style.color = "var(--color-gold)";
            previewStatusBadge.style.borderColor = "rgba(245, 194, 66, 0.3)";
            previewStatusBadge.style.boxShadow = "var(--glow-sunset)";
            
            // Update badge progress
            updateFormProgress();

            // Scroll to preview container on mobile
            if (window.innerWidth <= 900) {
              resultContainer.scrollIntoView({ behavior: 'smooth' });
            }
          }, 200);
        } catch (err) {
          console.error(err);
          generatorOverlay.classList.add('hidden');
          showError("Rendering failure: " + err.message);
        }
      }
    }, intervalTime);
  });

  // Helper to draw a stylized tropical palm leaf
  function drawPalmLeaf(ctx, x, y, size, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.strokeStyle = 'rgba(245, 194, 66, 0.08)'; // Subtle gold leaf silhouette
    ctx.lineWidth = 3;
    
    // Draw leaf stem
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(size * 0.4, size * 0.1, size, 0);
    ctx.stroke();

    // Draw individual fronds
    const fronds = 11;
    for (let i = 1; i < fronds; i++) {
      const t = i / fronds;
      const px = size * t;
      const py = size * 0.1 * Math.sin(t * Math.PI);
      
      const length = size * 0.45 * Math.sin(t * Math.PI);
      
      // Upper frond
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.quadraticCurveTo(px - length * 0.2, py - length * 0.8, px - length * 0.5, py - length);
      ctx.stroke();

      // Lower frond
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.quadraticCurveTo(px - length * 0.2, py + length * 0.8, px - length * 0.5, py + length);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Canvas Image Rendering Engine
  function generateCardImage() {
    return new Promise(async (resolve, reject) => {
      try {
        // Guarantee custom web fonts are loaded before drawing on canvas to avoid fallback font render
        await document.fonts.ready;
      } catch (e) {
        console.warn("Fonts loading failed, proceeding with fallbacks:", e);
      }

      const ctx = cardCanvas.getContext('2d');
      if (!ctx) {
        reject(new Error("Unable to obtain 2D canvas context."));
        return;
      }

      // Output size: 1200 x 1500 (aspect ratio 4:5 optimized for social sharing)
      const canvasWidth = 1200;
      const canvasHeight = 1500;
      cardCanvas.width = canvasWidth;
      cardCanvas.height = canvasHeight;

      // Draw Background Gradient (Deep Tropical Forest/Emerald Green)
      const bgGrad = ctx.createLinearGradient(0, 0, 0, canvasHeight);
      bgGrad.addColorStop(0, '#061d11');   // Deep tropical emerald green
      bgGrad.addColorStop(0.4, '#04150c'); // Dark forest green
      bgGrad.addColorStop(1, '#020b06');   // Deepest green-black
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Background Circular Goa Sunset Glow (Radial Gold to Translucent Pink)
      const sunGlow = ctx.createRadialGradient(canvasWidth / 2, canvasHeight * 0.35, 30, canvasWidth / 2, canvasHeight * 0.35, 750);
      sunGlow.addColorStop(0, 'rgba(245, 194, 66, 0.16)'); // Warm Gold
      sunGlow.addColorStop(0.4, 'rgba(216, 17, 89, 0.08)'); // Sunset Pink/Magenta
      sunGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = sunGlow;
      ctx.beginPath();
      ctx.arc(canvasWidth / 2, canvasHeight * 0.35, 750, 0, Math.PI * 2);
      ctx.fill();

      // Technical Golden Background Grid Overlay
      ctx.strokeStyle = 'rgba(245, 194, 66, 0.03)'; // Faint gold grid lines
      ctx.lineWidth = 1.5;
      const gridSize = 60;
      
      for (let x = 0; x < canvasWidth; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasHeight);
        ctx.stroke();
      }
      for (let y = 0; y < canvasHeight; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasWidth, y);
        ctx.stroke();
      }

      // Draw Main Card Border (Collectible outer frame)
      const borderPadding = 45;
      const cardX = borderPadding;
      const cardY = borderPadding;
      const cardW = canvasWidth - borderPadding * 2;
      const cardH = canvasHeight - borderPadding * 2;
      const cutSize = 45; // Event-pass diagonal corners

      // Draw decorative palm leaves in background corners (behind the frame)
      drawPalmLeaf(ctx, cardX + 60, cardY + 60, 220, Math.PI * 0.12);
      drawPalmLeaf(ctx, cardX + cardW - 60, cardY + 60, 220, -Math.PI * 0.62);
      drawPalmLeaf(ctx, cardX + 60, cardY + cardH - 60, 220, Math.PI * 0.78);
      drawPalmLeaf(ctx, cardX + cardW - 60, cardY + cardH - 60, 220, -Math.PI * 0.28);

      // Outer Glowing pass frame (Warm Gold)
      ctx.beginPath();
      ctx.moveTo(cardX + cutSize, cardY);
      ctx.lineTo(cardX + cardW - cutSize, cardY);
      ctx.lineTo(cardX + cardW, cardY + cutSize);
      ctx.lineTo(cardX + cardW, cardY + cardH - cutSize);
      ctx.lineTo(cardX + cardW - cutSize, cardY + cardH);
      ctx.lineTo(cardX + cutSize, cardY + cardH);
      ctx.lineTo(cardX, cardY + cardH - cutSize);
      ctx.lineTo(cardX, cardY + cutSize);
      ctx.closePath();
      ctx.strokeStyle = '#e5b83b'; // Warm Gold Border
      ctx.lineWidth = 4.5;
      ctx.shadowColor = 'rgba(229, 184, 59, 0.2)';
      ctx.shadowBlur = 15;
      ctx.stroke();
      ctx.shadowBlur = 0; // reset shadow

      // Inner Border (inset by 10px in Goa Sunset Pink)
      const innerPadding = 10;
      ctx.beginPath();
      ctx.moveTo(cardX + cutSize + innerPadding, cardY + innerPadding);
      ctx.lineTo(cardX + cardW - cutSize - innerPadding, cardY + innerPadding);
      ctx.lineTo(cardX + cardW - innerPadding, cardY + cutSize + innerPadding);
      ctx.lineTo(cardX + cardW - innerPadding, cardY + cardH - cutSize - innerPadding);
      ctx.lineTo(cardX + cardW - cutSize - innerPadding, cardY + cardH - innerPadding);
      ctx.lineTo(cardX + cutSize + innerPadding, cardY + cardH - innerPadding);
      ctx.lineTo(cardX + innerPadding, cardY + cardH - cutSize - innerPadding);
      ctx.lineTo(cardX + innerPadding, cardY + cutSize + innerPadding);
      ctx.closePath();
      ctx.strokeStyle = 'rgba(216, 17, 89, 0.35)'; // Faint sunset pink inner border
      ctx.lineWidth = 2;
      ctx.stroke();

      // --- HEADER SECTION (Y: 90 to 220) ---
      
      // Left side: HACKER HOUSE GOA Event Branding
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      
      ctx.font = '800 22px "JetBrains Mono"';
      ctx.fillStyle = '#f5c242'; // Warm Gold
      ctx.letterSpacing = '5px';
      ctx.fillText("HACKER HOUSE", cardX + 45, cardY + 45);

      ctx.font = '900 68px "Syne", "Outfit"';
      ctx.fillStyle = '#fcfaf2'; // Cream
      ctx.letterSpacing = '0px';
      ctx.fillText("GOA 2026", cardX + 45, cardY + 75);

      // Right side: Date, Pass Type, Location
      ctx.textAlign = 'right';
      ctx.font = '800 20px "JetBrains Mono"';
      ctx.fillStyle = '#d81159'; // Goa Sunset Pink
      ctx.letterSpacing = '2px';
      ctx.fillText("BUILDER PASS", cardX + cardW - 45, cardY + 48);

      ctx.font = '600 18px "JetBrains Mono"';
      ctx.fillStyle = 'rgba(252, 250, 242, 0.65)'; // Semi-translucent cream
      ctx.letterSpacing = '1px';
      ctx.fillText("28-31 OCT 2026", cardX + cardW - 45, cardY + 82);
      ctx.fillText("GOA, INDIA", cardX + cardW - 45, cardY + 110);

      // Warm Gold Accent Line
      const dividerY = cardY + 155;
      ctx.strokeStyle = 'rgba(245, 194, 66, 0.25)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cardX + 40, dividerY);
      ctx.lineTo(cardX + cardW - 40, dividerY);
      ctx.stroke();

      // --- USER PHOTO PORTRAIT FRAME (Y: 240 to 920) ---
      // Aspect: 840 width by 640 height
      const photoW = 840;
      const photoH = 640;
      const photoX = canvasWidth / 2 - photoW / 2;
      const photoY = cardY + 195;
      const photoCornerCut = 30;

      // Photo border drawing function
      function drawPhotoPath(offset = 0) {
        const x = photoX - offset;
        const y = photoY - offset;
        const w = photoW + offset * 2;
        const h = photoH + offset * 2;
        ctx.beginPath();
        ctx.moveTo(x + photoCornerCut, y);
        ctx.lineTo(x + w - photoCornerCut, y);
        ctx.lineTo(x + w, y + photoCornerCut);
        ctx.lineTo(x + w, y + h);
        ctx.lineTo(x, y + h);
        ctx.lineTo(x, y + photoCornerCut);
        ctx.closePath();
      }

      // Draw gold photo frame container
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#e5b83b'; // Warm Gold Border
      ctx.shadowColor = 'rgba(229, 184, 59, 0.2)';
      ctx.shadowBlur = 10;
      drawPhotoPath(2);
      ctx.stroke();
      ctx.shadowBlur = 0; // reset

      // Crop and render photo
      ctx.save();
      drawPhotoPath(0);
      ctx.clip(); // Clip drawing into frame

      const userImg = new Image();
      userImg.onload = () => {
        // Cover Crop Math
        const imgW = userImg.naturalWidth;
        const imgH = userImg.naturalHeight;
        let drawW = photoW;
        let drawH = photoH;
        let cropX = 0;
        let cropY = 0;

        const containerRatio = photoW / photoH;
        const imgRatio = imgW / imgH;

        if (imgRatio > containerRatio) {
          drawW = imgH * containerRatio;
          drawH = imgH;
          cropX = (imgW - drawW) / 2;
        } else {
          drawW = imgW;
          drawH = imgW / containerRatio;
          cropY = (imgH - drawH) / 2;
        }

        ctx.drawImage(userImg, cropX, cropY, drawW, drawH, photoX, photoY, photoW, photoH);

        // Ambient overlay (Goa dark forest-green sunset gradient)
        const overlayGrad = ctx.createLinearGradient(photoX, photoY, photoX, photoY + photoH);
        overlayGrad.addColorStop(0, 'rgba(7, 29, 17, 0.05)');
        overlayGrad.addColorStop(0.75, 'rgba(7, 29, 17, 0.0)');
        overlayGrad.addColorStop(1, 'rgba(4, 21, 12, 0.45)');
        ctx.fillStyle = overlayGrad;
        ctx.fillRect(photoX, photoY, photoW, photoH);

        ctx.restore(); // Restore context settings

        // Premium credential corner notches instead of high-tech cyber brackets
        ctx.strokeStyle = '#e5b83b'; // Warm gold
        ctx.lineWidth = 4;
        const brLen = 25;

        // Top Left Notch
        ctx.beginPath();
        ctx.moveTo(photoX + photoCornerCut + 5, photoY);
        ctx.lineTo(photoX, photoY + photoCornerCut + 5);
        ctx.lineTo(photoX, photoY + photoCornerCut + brLen);
        ctx.stroke();

        // Top Right Notch
        ctx.beginPath();
        ctx.moveTo(photoX + photoW - photoCornerCut - 5, photoY);
        ctx.lineTo(photoX + photoW, photoY + photoCornerCut + 5);
        ctx.lineTo(photoX + photoW, photoY + photoCornerCut + brLen);
        ctx.stroke();

        // Bottom Left Notch
        ctx.beginPath();
        ctx.moveTo(photoX, photoY + photoH - brLen);
        ctx.lineTo(photoX, photoY + photoH);
        ctx.lineTo(photoX + brLen, photoY + photoH);
        ctx.stroke();

        // Bottom Right Notch
        ctx.beginPath();
        ctx.moveTo(photoX + photoW - brLen, photoY + photoH);
        ctx.lineTo(photoX + photoW, photoY + photoH);
        ctx.lineTo(photoX + photoW, photoY + photoH - brLen);
        ctx.stroke();

        // Draw Builder Details & Metadata columns
        drawBuilderDetails(ctx, photoY, photoH);

        resolve();
      };

      userImg.onerror = () => {
        reject(new Error("Failed to load image on Canvas drawing."));
      };

      userImg.src = uploadedImageSrc;
    });
  }

  // Draw details (Name, Stack, Title, Barcode) on redesigned Card
  function drawBuilderDetails(ctx, photoY, photoH) {
    const canvasWidth = 1200;
    const canvasHeight = 1500;

    // Calculate Name Y relative to photo bottom: nameY = photoY + photoHeight + gap (25px)
    const gapPhotoToName = 25;
    const nameY = photoY + photoH + gapPhotoToName;

    // --- 1. BUILDER NAME ---
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const name = inputName.value.trim().toUpperCase();

    // Adjust font size dynamically to fit within safe limits
    let nameSize = 74;
    ctx.font = `900 ${nameSize}px "Outfit"`;
    let nameWidth = ctx.measureText(name).width;
    
    // Width limit is 860px (photo container width is 840, keep margin)
    while (nameWidth > 860 && nameSize > 44) {
      nameSize -= 4;
      ctx.font = `900 ${nameSize}px "Outfit"`;
      nameWidth = ctx.measureText(name).width;
    }

    // Draw Name Text with a small gold shadow
    ctx.fillStyle = '#fcfaf2'; // Cream
    ctx.shadowColor = 'rgba(245, 194, 66, 0.25)'; // Gold shadow glow
    ctx.shadowBlur = 8;
    ctx.fillText(name, canvasWidth / 2, nameY);
    ctx.shadowBlur = 0; // reset glow

    // --- 2. STACK / ROLE BADGE ---
    // Positioned relative to Name: stackY = nameY + nameSize + gap (12px)
    const stack = inputStack.value.toUpperCase();
    const gapNameToRole = 12;
    const stackY = nameY + nameSize + gapNameToRole;

    ctx.font = '800 24px "JetBrains Mono"';
    ctx.fillStyle = '#f5c242'; // Warm Gold
    ctx.textAlign = 'center';
    ctx.letterSpacing = '1px';
    ctx.fillText(`[ STACK // ${stack} ]`, canvasWidth / 2, stackY);

    // --- 3. BUILDER TITLE CAPSULE ---
    // Positioned relative to Stack Badge: titleY = stackY + 45
    const rawTitle = inputTitle.value.trim().toUpperCase();
    const formattedTitle = `"${rawTitle}"`;
    const titleY = stackY + 45;

    let titleSize = 32;
    ctx.font = `italic 700 ${titleSize}px "Outfit"`;

    // Maximum width allowed inside the title badge capsule
    const maxCapsuleWidth = 840;
    const textPadding = 24;
    const lineHeight = 40;

    // Simple word-wrapping algorithm for dynamic titles
    const words = formattedTitle.split(' ');
    const wrappedLines = [];
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
      const testWidth = ctx.measureText(testLine).width;
      if (testWidth > maxCapsuleWidth - textPadding * 2) {
        wrappedLines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      wrappedLines.push(currentLine);
    }

    const numLines = wrappedLines.length;
    let maxRenderedLineWidth = 0;
    for (let i = 0; i < numLines; i++) {
      const lineWidth = ctx.measureText(wrappedLines[i]).width;
      if (lineWidth > maxRenderedLineWidth) {
        maxRenderedLineWidth = lineWidth;
      }
    }

    const titleBadgeW = maxRenderedLineWidth + textPadding * 2;
    const titleBadgeH = 34 + numLines * lineHeight;
    const titleBadgeX = canvasWidth / 2 - titleBadgeW / 2;

    // Draw Capsule (solid Goa Sunset Pink with Gold border)
    ctx.fillStyle = '#d81159'; // Pink/Magenta
    ctx.strokeStyle = '#f5c242'; // Warm Gold
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(titleBadgeX, titleY, titleBadgeW, titleBadgeH, 12); // smooth rounded corners
    ctx.fill();
    ctx.stroke();

    // Render each wrapped line centered inside the badge capsule in cream/off-white
    ctx.fillStyle = '#fcfaf2';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const startTextY = titleY + titleBadgeH / 2 - ((numLines - 1) * lineHeight) / 2;
    for (let i = 0; i < numLines; i++) {
      ctx.fillText(wrappedLines[i], canvasWidth / 2, startTextY + i * lineHeight);
    }

    // --- 4. DETAILS FOOTER (Y: 1220 to 1420) ---
    // Set baseline divider coordinates
    const footerY = canvasHeight - 210;

    // Faint Gold horizontal divider line
    ctx.strokeStyle = 'rgba(245, 194, 66, 0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(180, footerY);
    ctx.lineTo(canvasWidth - 180, footerY);
    ctx.stroke();

    const contentY = footerY + 30;

    // A. Left column: Barcode scan graphic
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    const barcodeX = 180;
    const barcodeY = contentY;
    const barcodeH = 65;

    ctx.fillStyle = '#fcfaf2'; // Cream barcode lines
    // Pre-calculated clean barcode lines
    const pattern = [4, 8, 2, 6, 2, 8, 12, 4, 2, 10, 6, 4, 8, 2, 4, 6, 12, 2, 8, 6, 4, 10, 2];
    let currentX = barcodeX;
    for (let i = 0; i < pattern.length; i++) {
      const width = pattern[i];
      if (i % 2 === 0) {
        ctx.fillRect(currentX, barcodeY, width, barcodeH);
      }
      currentX += width + 2;
    }

    // Barcode identifier log
    const uniqueId = `HHG-26-${generateHash(name || 'BUILDER')}`;
    ctx.font = '600 18px "JetBrains Mono"';
    ctx.fillStyle = 'rgba(252, 250, 242, 0.4)'; // Muted cream
    ctx.fillText(uniqueId, barcodeX, barcodeY + barcodeH + 10);

    // B. Right column: Verified Stamp (Gold and cream event pass markings)
    const stampX = canvasWidth - 180;
    const stampY = contentY;

    ctx.textAlign = 'right';
    ctx.font = '800 20px "JetBrains Mono"';
    ctx.fillStyle = '#f5c242'; // Gold
    ctx.fillText("VERIFIED PASS // HH GOA 26", stampX, stampY + 8);

    ctx.font = '500 18px "JetBrains Mono"';
    ctx.fillStyle = 'rgba(252, 250, 242, 0.45)'; // Muted cream
    ctx.fillText("GOA • INDIA", stampX, stampY + 40);

    // C. Center graphic: Mini Beach Waves
    const centerX = canvasWidth / 2;
    const centerY = contentY + 25;

    ctx.strokeStyle = 'rgba(245, 194, 66, 0.45)'; // Gold outer circle
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(centerX, centerY - 15, 35, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(216, 17, 89, 0.7)'; // Goa Pink/Magenta waves
    ctx.beginPath();
    ctx.moveTo(centerX - 18, centerY - 12);
    ctx.bezierCurveTo(centerX - 10, centerY - 24, centerX - 8, centerY - 4, centerX, centerY - 12);
    ctx.bezierCurveTo(centerX + 8, centerY - 24, centerX + 10, centerY - 4, centerX + 18, centerY - 12);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.font = '800 16px "JetBrains Mono"';
    ctx.fillStyle = 'rgba(252, 250, 242, 0.7)'; // Cream label
    ctx.fillText("HH GOA 26", centerX, centerY + 38);

    // Render Canvas out to image preview source
    finalCardImg.src = cardCanvas.toDataURL('image/png');
  }

  // Generate a simple alphanumeric checksum hash from string
  function generateHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).substring(0, 6).toUpperCase();
  }

  // Action Buttons Handlers

  // Download Button handler
  btnDownload.addEventListener('click', () => {
    const name = inputName.value.trim().replace(/\s+/g, '_') || 'Builder';
    const link = document.createElement('a');
    link.download = `HH_Goa_2026_Builder_Card_${name}.png`;
    link.href = finalCardImg.src;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  async function shareOnX() {
    const name = inputName.value.trim();
    const role = inputStack.value;
    const title = inputTitle.value.trim();
    
    // Temporarily indicate loading state on the button
    const originalText = btnShareX.innerHTML;
    btnShareX.disabled = true;
    btnShareX.innerHTML = `<span>Uploading...</span>`;

    let cardId = '';
    try {
      // 1. Post generated base64 card image and details to local server
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image: finalCardImg.src, // Canvas base64 data-url
          name: name,
          role: role
        })
      });

      if (!response.ok) {
        throw new Error("Server rejected card share request.");
      }

      const data = await response.json();
      cardId = data.id;
    } catch (err) {
      console.error("Failed to generate dynamic share URL:", err);
      showError("Failed to save card to server. Please try again or download the PNG directly.");
      
      // Restore button text and abort share
      btnShareX.disabled = false;
      btnShareX.innerHTML = originalText;
      return;
    }

    // Restore button text
    btnShareX.disabled = false;
    btnShareX.innerHTML = originalText;

    // Trigger automated download of the generated card PNG to user's local disk
    try {
      const downloadLink = document.createElement('a');
      downloadLink.download = 'hh-goa-2026-builder-card.png';
      downloadLink.href = finalCardImg.src;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (downloadErr) {
      console.warn("Auto-download failed inside X share routine:", downloadErr);
    }

    // Display clear visual instructions to guide the user on manual upload attachment
    showInstruction("Your Builder Card has been downloaded. Attach it to your X post using the image button.");

    // 2. Dynamic Share URL
    let publicUrl = 'https://frameingoa-hh-goa-2026.onrender.com'; // Default fallback
    try {
      const configRes = await fetch('/api/config');
      if (configRes.ok) {
        const configData = await configRes.json();
        publicUrl = configData.publicUrl;
      }
    } catch (err) {
      console.warn("Failed to fetch public config, using location fallback:", err);
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (!isLocal) {
        publicUrl = window.location.origin;
      }
    }

    // If upload was successful, target the share page URL; else fall back to home page URL
    const targetShareUrl = cardId ? `${publicUrl}/share/${cardId}` : publicUrl;

    // 3. Build pre-filled caption dynamically with URL embedded on a new line
    const caption = `🚀 I just created my HH Goa 2026 Builder Card with FrameInGoa!\n\nFrame your identity. Showcase your builder story. ⚡\n\n#FrameInGoa #HHGoa2026\n\n${targetShareUrl}`;

    const encodedText = encodeURIComponent(caption);
    
    // Official X intent URL
    const xUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;
    
    // Open in a new tab safely
    const newTab = window.open(xUrl, '_blank', 'noopener,noreferrer');
    
    // Fallback notification if popup blocker blocks it
    if (!newTab) {
      showError("Unable to open X compose window. Please check your browser popup blocker settings.");
    }
  }

  btnShareX.addEventListener('click', shareOnX);

  // Dynamic Progress Indicator Calculations
  function updateFormProgress() {
    const progressFill = document.getElementById('progress-fill');
    const progressVal = document.getElementById('progress-val');
    if (!progressFill || !progressVal) return;

    let progress = 0;
    
    // 1. Photo uploaded (25%)
    if (uploadedImageSrc) {
      progress += 25;
    }
    // 2. Name entered (25%)
    if (inputName.value.trim().length > 0) {
      progress += 25;
    }
    // 3. Stack selected (25%)
    if (inputStack.value) {
      progress += 25;
    }
    // 4. Card generated (25%)
    const isGenerated = !resultContainer.classList.contains('hidden');
    if (isGenerated) {
      progress += 25;
    } else if (inputTitle.value.trim().length > 0) {
      progress += 15; // partial credit if title exists but not generated yet
    }

    progressFill.style.width = `${progress}%`;
    progressVal.textContent = `${progress}% READY`;
  }

  // Reset Button handler
  btnReset.addEventListener('click', () => {
    // Reset Form
    form.reset();
    resetUploadZone();
    
    // Toggle screens
    resultContainer.classList.add('hidden');
    cardPlaceholder.classList.remove('hidden');
    
    // Reset status badge
    previewStatusBadge.textContent = "STANDBY";
    previewStatusBadge.style.color = "var(--color-text-muted)";
    previewStatusBadge.style.borderColor = "rgba(255, 255, 255, 0.1)";
    previewStatusBadge.style.boxShadow = "none";
    
    // Scroll back to form on mobile
    if (window.innerWidth <= 900) {
      document.getElementById('input-section').scrollIntoView({ behavior: 'smooth' });
    }

    updateFormProgress();
  });

  // Attach progress calculation listeners
  inputName.addEventListener('input', updateFormProgress);
  inputStack.addEventListener('change', updateFormProgress);
  inputTitle.addEventListener('input', updateFormProgress);

  // Initialize form progress
  updateFormProgress();

});
