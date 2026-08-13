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
  function showError(msg) {
    toastMessage.textContent = msg;
    errorToast.classList.remove('hidden');
    // Auto hide after 5 seconds
    setTimeout(() => {
      errorToast.classList.add('hidden');
    }, 5000);
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
            previewStatusBadge.style.color = "var(--color-green)";
            previewStatusBadge.style.borderColor = "rgba(57, 255, 20, 0.3)";
            previewStatusBadge.style.boxShadow = "var(--glow-green)";
            
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

      // Draw Background Gradient (Deep Indigo to Dark Purple Space)
      const bgGrad = ctx.createLinearGradient(0, 0, 0, canvasHeight);
      bgGrad.addColorStop(0, '#06040a');
      bgGrad.addColorStop(0.3, '#0b0816');
      bgGrad.addColorStop(0.8, '#140c24');
      bgGrad.addColorStop(1, '#050308');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Background Circular Ambient Neon Glows
      // Orange Sunset Glow (Top Right)
      const orangeGlow = ctx.createRadialGradient(canvasWidth * 0.9, canvasHeight * 0.1, 50, canvasWidth * 0.9, canvasHeight * 0.1, 650);
      orangeGlow.addColorStop(0, 'rgba(255, 83, 53, 0.22)');
      orangeGlow.addColorStop(0.5, 'rgba(255, 83, 53, 0.05)');
      orangeGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = orangeGlow;
      ctx.beginPath();
      ctx.arc(canvasWidth * 0.9, canvasHeight * 0.1, 650, 0, Math.PI * 2);
      ctx.fill();

      // Cyan Cyber Glow (Bottom Left)
      const cyanGlow = ctx.createRadialGradient(canvasWidth * 0.1, canvasHeight * 0.9, 50, canvasWidth * 0.1, canvasHeight * 0.9, 650);
      cyanGlow.addColorStop(0, 'rgba(0, 240, 255, 0.20)');
      cyanGlow.addColorStop(0.5, 'rgba(0, 240, 255, 0.04)');
      cyanGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = cyanGlow;
      ctx.beginPath();
      ctx.arc(canvasWidth * 0.1, canvasHeight * 0.9, 650, 0, Math.PI * 2);
      ctx.fill();

      // Cybernetic Background Grid Overlay
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.04)';
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
      const cutSize = 45; // Cyberpunk cut diagonal corners

      // Outer Glowing Frame
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
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
      ctx.lineWidth = 4;
      ctx.shadowColor = 'rgba(0, 240, 255, 0.25)';
      ctx.shadowBlur = 15;
      ctx.stroke();
      ctx.shadowBlur = 0; // reset shadow

      // Inner Sunset Border (inset by 10px)
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
      ctx.strokeStyle = 'rgba(255, 83, 53, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // --- HEADER SECTION (Y: 90 to 220) ---
      
      // Left side: HH GOA 2026 Title
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      
      ctx.font = '800 20px "JetBrains Mono"';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.letterSpacing = '6px';
      ctx.fillText("B U I L D E R   I D E N T I T Y", cardX + 45, cardY + 40);

      ctx.font = '900 64px "Syne", "Outfit"';
      ctx.fillStyle = '#ffffff';
      ctx.letterSpacing = '0px';
      ctx.fillText("HH GOA 2026", cardX + 45, cardY + 75);

      // Right side: Telemetry & Status Readouts
      ctx.textAlign = 'right';
      ctx.font = '600 20px "JetBrains Mono"';
      ctx.fillStyle = 'rgba(0, 240, 255, 0.9)';
      ctx.letterSpacing = '1px';
      ctx.fillText("LOC: 15.2993° N // 73.9859° E", cardX + cardW - 45, cardY + 45);

      ctx.font = '800 20px "JetBrains Mono"';
      ctx.fillStyle = 'rgba(57, 255, 20, 0.9)';
      ctx.fillText("STATUS: ACTIVE_MEMBER", cardX + cardW - 45, cardY + 80);

      ctx.font = '500 18px "JetBrains Mono"';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.fillText("PORT_GOA_26 // COMPILER_OK", cardX + cardW - 45, cardY + 110);

      // Glowing Divider Line
      const dividerY = cardY + 165;
      const dividerGrad = ctx.createLinearGradient(cardX + 40, 0, cardX + cardW - 40, 0);
      dividerGrad.addColorStop(0, 'rgba(0, 240, 255, 0)');
      dividerGrad.addColorStop(0.2, 'rgba(0, 240, 255, 0.45)');
      dividerGrad.addColorStop(0.8, 'rgba(255, 83, 53, 0.45)');
      dividerGrad.addColorStop(1, 'rgba(255, 83, 53, 0)');
      ctx.fillStyle = dividerGrad;
      ctx.fillRect(cardX + 40, dividerY, cardW - 80, 2);

      // --- USER PHOTO PORTRAIT FRAME (Y: 240 to 920) ---
      // Aspect: 840 width by 680 height (landscape-box to accommodate faces cleanly)
      const photoW = 840;
      const photoH = 640; // Slightly reduced by 5.88% for better vertical layout balance
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

      // Draw glowing photo frame container
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = 'rgba(255, 83, 53, 0.65)';
      ctx.shadowColor = 'rgba(255, 83, 53, 0.3)';
      ctx.shadowBlur = 12;
      drawPhotoPath(3);
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

        // Ambient overlay (Goa dark-sunset gradient)
        const overlayGrad = ctx.createLinearGradient(photoX, photoY, photoX, photoY + photoH);
        overlayGrad.addColorStop(0, 'rgba(6, 4, 10, 0.05)');
        overlayGrad.addColorStop(0.75, 'rgba(6, 4, 10, 0.0)');
        overlayGrad.addColorStop(1, 'rgba(6, 4, 10, 0.55)');
        ctx.fillStyle = overlayGrad;
        ctx.fillRect(photoX, photoY, photoW, photoH);

        // Tech grid lines on photo (Subtle)
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
        ctx.lineWidth = 1;
        const photoGrid = 40;
        for (let px = photoX; px < photoX + photoW; px += photoGrid) {
          ctx.beginPath();
          ctx.moveTo(px, photoY);
          ctx.lineTo(px, photoY + photoH);
          ctx.stroke();
        }
        for (let py = photoY; py < photoY + photoH; py += photoGrid) {
          ctx.beginPath();
          ctx.moveTo(photoX, py);
          ctx.lineTo(photoX + photoW, py);
          ctx.stroke();
        }

        ctx.restore(); // Restore context settings

        // Corner technical brackets drawn on top of the image container
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.8)';
        ctx.lineWidth = 5;
        const brLen = 35; // length

        // Top Left Bracket
        ctx.beginPath();
        ctx.moveTo(photoX + photoCornerCut + 4, photoY);
        ctx.lineTo(photoX, photoY + photoCornerCut + 4);
        ctx.lineTo(photoX, photoY + photoCornerCut + brLen);
        ctx.stroke();

        // Top Right Bracket
        ctx.beginPath();
        ctx.moveTo(photoX + photoW - photoCornerCut - 4, photoY);
        ctx.lineTo(photoX + photoW, photoY + photoCornerCut + 4);
        ctx.lineTo(photoX + photoW, photoY + photoCornerCut + brLen);
        ctx.stroke();

        // Bottom Left
        ctx.beginPath();
        ctx.moveTo(photoX, photoY + photoH - brLen);
        ctx.lineTo(photoX, photoY + photoH);
        ctx.lineTo(photoX + brLen, photoY + photoH);
        ctx.stroke();

        // Bottom Right
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

    // Draw Name Text with a small glow
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0, 240, 255, 0.35)';
    ctx.shadowBlur = 10;
    ctx.fillText(name, canvasWidth / 2, nameY);
    ctx.shadowBlur = 0; // reset glow

    // --- 2. STACK / ROLE BADGE ---
    // Positioned relative to Name: stackY = nameY + nameSize + gap (12px)
    const stack = inputStack.value.toUpperCase();
    const gapNameToRole = 12;
    const stackY = nameY + nameSize + gapNameToRole;

    ctx.font = '800 24px "JetBrains Mono"';
    ctx.fillStyle = '#00f0ff'; // High-contrast neon cyber cyan hex value for readability
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
    const textPadding = 48; // padding inside capsule
    const maxTextWidth = maxCapsuleWidth - textPadding * 2; // ~740px

    // Setup wrapping variables
    const words = formattedTitle.split(' ');
    let currentLine = '';
    const wrappedLines = [];

    for (let n = 0; n < words.length; n++) {
      const testLine = currentLine + words[n] + ' ';
      ctx.font = `italic 700 ${titleSize}px "Outfit"`;
      const testWidth = ctx.measureText(testLine).width;
      
      if (testWidth > maxTextWidth && n > 0) {
        wrappedLines.push(currentLine.trim());
        currentLine = words[n] + ' ';
      } else {
        currentLine = testLine;
      }
    }
    wrappedLines.push(currentLine.trim());

    // Calculate badge size properties dynamically based on lines
    const lineHeight = 42;
    const numLines = wrappedLines.length;
    
    // Find the longest rendered line to fit the capsule width closely
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

    // Draw Capsule (glassmorphic neon-orange bordered pill box)
    ctx.fillStyle = 'rgba(255, 83, 53, 0.05)';
    ctx.strokeStyle = 'rgba(255, 83, 53, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(titleBadgeX, titleY, titleBadgeW, titleBadgeH, titleBadgeH / 2 > 30 ? 20 : titleBadgeH / 2);
    ctx.fill();
    ctx.stroke();

    // Render each wrapped line centered inside the badge capsule
    ctx.fillStyle = '#ff745c'; // High-contrast neon sunset orange hex value for readability
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const startTextY = titleY + titleBadgeH / 2 - ((numLines - 1) * lineHeight) / 2;
    for (let i = 0; i < numLines; i++) {
      ctx.fillText(wrappedLines[i], canvasWidth / 2, startTextY + i * lineHeight);
    }

    // --- 4. DETAILS FOOTER (Y: 1220 to 1420) ---
    // Set baseline divider coordinates
    const footerY = canvasHeight - 210;

    // Tech horizontal divider line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
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

    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
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
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.fillText(uniqueId, barcodeX, barcodeY + barcodeH + 10);

    // B. Right column: Verified Stamp
    const stampX = canvasWidth - 180;
    const stampY = contentY;

    ctx.textAlign = 'right';
    ctx.font = '800 20px "JetBrains Mono"';
    ctx.fillStyle = 'rgba(57, 255, 20, 0.85)';
    ctx.shadowColor = 'rgba(57, 255, 20, 0.35)';
    ctx.shadowBlur = 8;
    ctx.fillText("VERIFIED_MEMBER // OK", stampX, stampY + 8);
    ctx.shadowBlur = 0; // reset

    ctx.font = '500 18px "JetBrains Mono"';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.fillText("DEV ACCESS: GRANTED", stampX, stampY + 40);

    // C. Center graphic: Mini Beach Waves
    const centerX = canvasWidth / 2;
    const centerY = contentY + 25;

    ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(centerX, centerY - 15, 35, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX - 18, centerY - 12);
    ctx.bezierCurveTo(centerX - 10, centerY - 24, centerX - 8, centerY - 4, centerX, centerY - 12);
    ctx.bezierCurveTo(centerX + 8, centerY - 24, centerX + 10, centerY - 4, centerX + 18, centerY - 12);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.font = '800 16px "JetBrains Mono"';
    ctx.fillStyle = 'rgba(0, 240, 255, 0.55)';
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
      console.warn("Failed to generate dynamic share URL, falling back to homepage:", err);
    }

    // Restore button text
    btnShareX.disabled = false;
    btnShareX.innerHTML = originalText;

    // 2. Build pre-filled caption dynamically
    const caption = `🚀 I just created my HH Goa 2026 Builder Card with FrameInGoa!\n\nFrame your identity. Showcase your builder story. ⚡\n\n#FrameInGoa #HHGoa2026`;

    // 3. Dynamic Share URL
    const publicUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
      ? 'https://frameingoa.com' // Fallback for local testing or mock domain
      : window.location.origin;

    // If upload was successful, target the share page URL; else fall back to home page URL
    const targetShareUrl = cardId ? `${publicUrl}/share/${cardId}` : publicUrl;

    const encodedText = encodeURIComponent(caption);
    const encodedUrl = encodeURIComponent(targetShareUrl);
    
    // Official X intent URL
    const xUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
    
    // Open in a new tab safely
    const newTab = window.open(xUrl, '_blank', 'noopener,noreferrer');
    
    // Fallback notification if popup blocker blocks it
    if (!newTab) {
      showError("Unable to open X compose window. Please check your browser popup blocker settings.");
    }
  }

  btnShareX.addEventListener('click', shareOnX);

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
  });

});
