(() => {
  'use strict';

  // Saved pages can contain duplicated navigation/control fragments created by
  // the original site's runtime. Keep only one copy of each visible control.
  const navBars = [...document.querySelectorAll('#page-navbar .navlinks')];
  navBars.slice(1).forEach(node => node.remove());
  if (navBars[0]) {
    const seen = new Set();
    navBars[0].querySelectorAll('.nav-level2').forEach(item => {
      const key = item.textContent.replace(/\s+/g, ' ').trim().toLowerCase();
      if (seen.has(key)) item.remove();
      else seen.add(key);
    });
    const globalControls = [...navBars[0].querySelectorAll(':scope > .global-controls')];
    globalControls.slice(1).forEach(node => node.remove());
  }

  const headerSelector = '.hfold-header, .panel-fold-header, .sfold-header, .tree-fold-header';
  const contentSelector = '.hfold-content, .panel-fold-content, .sfold-content, .tree-fold-content';

  document.querySelectorAll(headerSelector).forEach(header => {
    const groups = [...header.querySelectorAll(':scope > .controls')];
    groups.slice(1).forEach(node => node.remove());
    if (groups[0]) {
      const buttonTypes = new Set();
      groups[0].querySelectorAll('button').forEach(button => {
        const key = button.className;
        if (buttonTypes.has(key)) button.remove();
        else buttonTypes.add(key);
      });
    }
  });

  const contentAfter = header => {
    const next = header && header.nextElementSibling;
    return next && next.matches(contentSelector)
      ? next
      : null;
  };

  const setFold = (header, expanded) => {
    const content = contentAfter(header);
    if (!content) return;
    const display = content.dataset.foldDisplay || 'block';
    content.style.setProperty('display', expanded ? display : 'none', 'important');
    header.toggleAttribute('open', expanded);
    header.setAttribute('aria-expanded', String(expanded));
    content.setAttribute('aria-hidden', String(!expanded));
  };

  const toggleFold = header => {
    const content = contentAfter(header);
    if (!content) return;
    setFold(header, getComputedStyle(content).display === 'none');
  };

  const setAllFolds = expanded => {
    document.querySelectorAll(contentSelector).forEach(content => {
      const display = content.dataset.foldDisplay || 'block';
      const isTopLevelContent = content.classList.contains('hfold-content');
      const shouldShow = expanded || isTopLevelContent;
      content.style.setProperty('display', shouldShow ? display : 'none', 'important');
      content.setAttribute('aria-hidden', String(!shouldShow));
    });
    document.querySelectorAll('.hfold, .panel-fold, .sfold, .tree-fold').forEach(header => {
      const isTopLevelHeader = header.classList.contains('hfold');
      const shouldOpen = expanded || isTopLevelHeader;
      header.toggleAttribute('open', shouldOpen);
      header.setAttribute('aria-expanded', String(shouldOpen));
    });
  };

  document.querySelectorAll(contentSelector).forEach(content => {
    content.dataset.foldDisplay = content.style.display && content.style.display !== 'none'
      ? content.style.display
      : 'block';
  });

  document.querySelectorAll(headerSelector).forEach(header => {
    const content = contentAfter(header);
    if (!content) return;
    header.setAttribute('role', 'button');
    header.setAttribute('tabindex', '0');
    header.setAttribute('aria-expanded', String(getComputedStyle(content).display !== 'none'));

    header.addEventListener('click', event => {
      if (event.target.closest('button')) return;
      toggleFold(header);
    });
    header.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      toggleFold(header);
    });
  });

  document.querySelectorAll('button.ctrl-nav-collapse, button.ctrl-nav-expand').forEach(button => {
    button.type = 'button';
    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      const header = button.closest(headerSelector);
      const expand = button.classList.contains('ctrl-nav-expand');
      if (!header) {
        setAllFolds(expand);
        return;
      }
      setFold(header, expand);

      const content = contentAfter(header);
      if (content) {
        content.querySelectorAll(headerSelector).forEach(child => setFold(child, expand));
      }
    });
  });

  const sectionHeaders = [...document.querySelectorAll('section.main > .hfold-header')];
  document.querySelectorAll('#page-navbar .nav-level2').forEach((item, index) => {
    const target = sectionHeaders[index];
    if (!target) return;
    item.setAttribute('role', 'link');
    item.setAttribute('tabindex', '0');
    item.setAttribute('title', `跳转到 ${target.textContent.trim()}`);

    const jump = () => {
      setFold(target, true);
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', `#${target.id}`);
    };
    item.addEventListener('click', jump);
    item.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      jump();
    });
  });

  if (location.hash) {
    const target = document.querySelector(location.hash);
    if (target && target.matches(headerSelector)) setFold(target, true);
  }

  // In-page pan/zoom image viewer.
  const viewer = document.createElement('div');
  viewer.className = 'image-viewer';
  viewer.setAttribute('aria-hidden', 'true');
  viewer.innerHTML = `
    <div class="image-viewer__toolbar" role="toolbar" aria-label="图片查看工具">
      <button type="button" data-viewer="zoom-out" aria-label="缩小">−</button>
      <output class="image-viewer__scale">100%</output>
      <button type="button" data-viewer="zoom-in" aria-label="放大">+</button>
      <button type="button" data-viewer="reset">复位</button>
      <button type="button" data-viewer="close" aria-label="关闭">×</button>
    </div>
    <div class="image-viewer__stage">
      <img class="image-viewer__image" alt="">
    </div>`;
  document.body.appendChild(viewer);

  const stage = viewer.querySelector('.image-viewer__stage');
  const fullImage = viewer.querySelector('.image-viewer__image');
  const scaleOutput = viewer.querySelector('.image-viewer__scale');
  let scale = 1;
  let x = 0;
  let y = 0;
  let dragging = false;
  let dragX = 0;
  let dragY = 0;

  const renderImage = () => {
    fullImage.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    scaleOutput.value = `${Math.round(scale * 100)}%`;
    scaleOutput.textContent = scaleOutput.value;
  };
  const resetImage = () => {
    const imageWidth = fullImage.naturalWidth;
    const imageHeight = fullImage.naturalHeight;
    if (!imageWidth || !imageHeight) return;
    scale = .3;
    x = (stage.clientWidth - imageWidth * scale) / 2;
    y = (stage.clientHeight - imageHeight * scale) / 2;
    renderImage();
  };
  const zoomImage = (factor, originX = stage.clientWidth / 2, originY = stage.clientHeight / 2) => {
    const next = Math.min(8, Math.max(.2, scale * factor));
    const ratio = next / scale;
    x = originX - (originX - x) * ratio;
    y = originY - (originY - y) * ratio;
    scale = next;
    renderImage();
  };
  const closeViewer = () => {
    viewer.classList.remove('is-open');
    viewer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('viewer-open');
    fullImage.removeAttribute('src');
  };
  const openViewer = img => {
    const thumbnail = img.currentSrc || img.src;
    fullImage.alt = img.alt || '大图预览';
    viewer.classList.add('is-open');
    viewer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('viewer-open');
    fullImage.onload = resetImage;
    fullImage.src = thumbnail;
    if (fullImage.complete) resetImage();
    viewer.querySelector('[data-viewer="close"]').focus();
  };

  document.querySelectorAll('a > img').forEach(img => {
    img.closest('a').addEventListener('click', event => {
      event.preventDefault();
      openViewer(img);
    });
  });

  viewer.addEventListener('click', event => {
    const action = event.target.closest('[data-viewer]')?.dataset.viewer;
    if (action === 'close') closeViewer();
    if (action === 'reset') resetImage();
    if (action === 'zoom-in') zoomImage(1.25);
    if (action === 'zoom-out') zoomImage(.8);
    if (event.target === viewer) closeViewer();
  });
  stage.addEventListener('wheel', event => {
    event.preventDefault();
    const bounds = stage.getBoundingClientRect();
    zoomImage(event.deltaY < 0 ? 1.12 : .89, event.clientX - bounds.left, event.clientY - bounds.top);
  }, { passive: false });
  stage.addEventListener('pointerdown', event => {
    dragging = true;
    dragX = event.clientX - x;
    dragY = event.clientY - y;
    stage.setPointerCapture(event.pointerId);
    stage.classList.add('is-dragging');
  });
  stage.addEventListener('pointermove', event => {
    if (!dragging) return;
    x = event.clientX - dragX;
    y = event.clientY - dragY;
    renderImage();
  });
  stage.addEventListener('pointerup', event => {
    dragging = false;
    stage.releasePointerCapture(event.pointerId);
    stage.classList.remove('is-dragging');
  });
  stage.addEventListener('dblclick', resetImage);
  window.addEventListener('resize', () => {
    if (viewer.classList.contains('is-open')) resetImage();
  });
  document.addEventListener('keydown', event => {
    if (!viewer.classList.contains('is-open')) return;
    if (event.key === 'Escape') closeViewer();
    if (event.key === '+' || event.key === '=') zoomImage(1.25);
    if (event.key === '-') zoomImage(.8);
    if (event.key === '0') resetImage();
  });
})();
