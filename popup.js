let currentTab = null;
let currentDomain = null;

async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function getDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return null;
  }
}

async function loadSettings() {
  currentTab = await getCurrentTab();
  currentDomain = await getDomain(currentTab.url);
  
  if (currentDomain) {
    document.getElementById('siteInfo').textContent = `現在のサイト: ${currentDomain}`;
    
    const siteSettings = await chrome.storage.sync.get(currentDomain);
    const settings = siteSettings[currentDomain] || {
      rightClick: true,
      select: true,
      copy: true,
      paste: true
    };
    
    document.getElementById('rightClickToggle').checked = settings.rightClick;
    document.getElementById('selectToggle').checked = settings.select;
    document.getElementById('copyToggle').checked = settings.copy;
    document.getElementById('pasteToggle').checked = settings.paste;
  }
  
  const savedSites = await chrome.storage.sync.get('savedSites');
  if (savedSites.savedSites && savedSites.savedSites.length > 0) {
    document.getElementById('savedSites').textContent = 
      `保存済みサイト: ${savedSites.savedSites.length}個`;
  }
}

async function saveSettings() {
  if (!currentDomain) return;
  
  const settings = {
    rightClick: document.getElementById('rightClickToggle').checked,
    select: document.getElementById('selectToggle').checked,
    copy: document.getElementById('copyToggle').checked,
    paste: document.getElementById('pasteToggle').checked
  };
  
  await chrome.storage.sync.set({ [currentDomain]: settings });
  
  const savedSites = await chrome.storage.sync.get('savedSites');
  const sites = savedSites.savedSites || [];
  if (!sites.includes(currentDomain)) {
    sites.push(currentDomain);
    await chrome.storage.sync.set({ savedSites: sites });
  }
  
  chrome.tabs.sendMessage(currentTab.id, {
    action: 'updateSettings',
    settings: settings
  });
}

document.addEventListener('DOMContentLoaded', loadSettings);

document.getElementById('rightClickToggle').addEventListener('change', saveSettings);
document.getElementById('selectToggle').addEventListener('change', saveSettings);
document.getElementById('copyToggle').addEventListener('change', saveSettings);
document.getElementById('pasteToggle').addEventListener('change', saveSettings);

document.getElementById('rememberSite').addEventListener('click', async () => {
  await saveSettings();
  document.getElementById('rememberSite').textContent = '保存しました！';
  setTimeout(() => {
    document.getElementById('rememberSite').textContent = 'このサイトの設定を保存';
  }, 2000);
});