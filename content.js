(function() {
  'use strict';

  let settings = {
    rightClick: true,
    select: true,
    copy: true,
    paste: true
  };

  async function loadSettings() {
    const domain = window.location.hostname;
    const siteSettings = await chrome.storage.sync.get(domain);
    
    if (siteSettings[domain]) {
      settings = siteSettings[domain];
    } else {
      const globalSettings = await chrome.storage.sync.get('globalSettings');
      if (globalSettings.globalSettings) {
        settings = globalSettings.globalSettings;
      }
    }
    
    applySettings();
  }

  function applySettings() {
    if (settings.rightClick) enableRightClick();
    if (settings.select) enableSelection();
    if (settings.copy) enableCopy();
    if (settings.paste) enablePaste();
  }

  function enableRightClick() {
    document.addEventListener('contextmenu', function(e) {
      e.stopPropagation();
    }, true);

    document.addEventListener('mousedown', function(e) {
      if (e.button === 2) {
        e.stopPropagation();
      }
    }, true);

    document.addEventListener('mouseup', function(e) {
      if (e.button === 2) {
        e.stopPropagation();
      }
    }, true);
  }

  function enableSelection() {
    document.addEventListener('selectstart', function(e) {
      e.stopPropagation();
    }, true);

    document.addEventListener('dragstart', function(e) {
      e.stopPropagation();
    }, true);

    const style = document.createElement('style');
    style.id = 'enable-selection-style';
    style.textContent = `
      * {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
        -webkit-touch-callout: default !important;
      }
    `;
    
    if (document.head) {
      document.head.appendChild(style);
    } else {
      document.addEventListener('DOMContentLoaded', function() {
        document.head.appendChild(style);
      });
    }
  }

  function enableCopy() {
    document.addEventListener('copy', function(e) {
      e.stopPropagation();
    }, true);

    document.addEventListener('cut', function(e) {
      e.stopPropagation();
    }, true);

    document.addEventListener('keydown', function(e) {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'x' || e.key === 'a')) {
        e.stopPropagation();
      }
    }, true);
  }

  function enablePaste() {
    document.addEventListener('paste', function(e) {
      e.stopPropagation();
    }, true);

    document.addEventListener('keydown', function(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.stopPropagation();
      }
    }, true);
  }

  function removeRestrictions() {
    const elements = document.getElementsByTagName('*');
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      element.oncontextmenu = null;
      element.onselectstart = null;
      element.ondragstart = null;
      element.onmousedown = null;
      element.onmouseup = null;
      element.oncopy = null;
      element.oncut = null;
      element.onpaste = null;
      element.onkeydown = null;
      element.onkeyup = null;
      element.onkeypress = null;
    }

    document.oncontextmenu = null;
    document.onselectstart = null;
    document.ondragstart = null;
    document.onmousedown = null;
    document.onmouseup = null;
    document.oncopy = null;
    document.oncut = null;
    document.onpaste = null;
    document.onkeydown = null;
    document.onkeyup = null;
    document.onkeypress = null;

    window.oncontextmenu = null;
    window.onselectstart = null;
    window.ondragstart = null;
    window.onmousedown = null;
    window.onmouseup = null;
    window.oncopy = null;
    window.oncut = null;
    window.onpaste = null;
  }

  function enableAllFeatures() {
    removeRestrictions();
    applySettings();
    
    const scripts = document.querySelectorAll('script');
    scripts.forEach(script => {
      if (script.textContent.includes('contextmenu') || 
          script.textContent.includes('selectstart') ||
          script.textContent.includes('copy') ||
          script.textContent.includes('cut') ||
          script.textContent.includes('paste')) {
        script.remove();
      }
    });
  }

  function init() {
    loadSettings();
    enableAllFeatures();

    const observer = new MutationObserver(function(mutations) {
      removeRestrictions();
    });

    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeOldValue: true
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'updateSettings') {
      settings = request.settings;
      enableAllFeatures();
    } else if (request.action === 'checkSettings') {
      loadSettings();
    }
  });

  setTimeout(enableAllFeatures, 1000);
  setTimeout(enableAllFeatures, 3000);

  if (window.self === window.top) {
    console.log('スーパーコピー: 右クリックとコピー&ペーストが有効化されました');
  }
})();