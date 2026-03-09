import { createIcons, Play, Plus, Search, Check, ChevronLeft, MoreVertical, LayoutGrid, Clock, CheckCircle2, Edit, Trash2, X } from 'lucide';
import { animate } from 'motion';
import './index.css';

// Utility to prevent XSS
const escapeHTML = (str) => {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
};

// State
let currentPlaylist = null;
let currentVideo = null;
let playlists = [];
let videos = [];

// Elements
const root = document.getElementById('root');

// Router
function navigate(path) {
  const url = new URL(window.location.href);
  if (path === '/') {
    url.searchParams.delete('playlist');
    url.searchParams.delete('video');
  } else if (path.startsWith('/playlist/')) {
    const id = path.split('/')[2];
    url.searchParams.set('playlist', id);
    url.searchParams.delete('video');
  }
  window.history.pushState({}, '', url);
  render();
}

window.onpopstate = () => render();

// API Helpers
async function fetchPlaylists() {
  const res = await fetch('/api/playlists');
  playlists = await res.json();
}

async function fetchVideos(playlistId) {
  const res = await fetch(`/api/playlists/${playlistId}/videos`);
  videos = await res.json();
}

async function fetchStats() {
  const res = await fetch('/api/stats');
  return await res.json();
}

// YouTube Helper
function getYouTubeId(url) {
  if (!url) return null;
  // Decode HTML entities in case the URL was sanitized
  const decodedUrl = url.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
  const match = decodedUrl.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

// Components
function Header(isDashboard = false, stats = null) {
  return `
    <header>
      <div class="logo" onclick="navigate('/')" style="cursor: pointer">
        <div class="logo-icon"><img src="src/assets/TtraWatch.png" alt="Logo" width="42px"></div>
        <span>TtraWatch</span>
      </div>
      <div class="header-actions" style="display: flex; align-items: center; gap: 2rem">
        ${isDashboard ? `
          <div class="stats-container">
            <div class="stat-card">
              <div class="stat-label">Total Videos</div>
              <div class="stat-value">${stats?.total_videos || 0}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Completed</div>
              <div class="stat-value completed">${stats?.completed_videos || 0}</div>
            </div>
          </div>
          <button class="btn-primary" onclick="window.openModal('playlist')">
            <i data-lucide="plus"></i> New Playlist
          </button>
        ` : `
           <div style="color: var(--text-muted); font-size: 0.9rem; font-weight: 500">${escapeHTML(currentPlaylist?.name) || ''}</div>
        `}
      </div>
    </header>
  `;
}

async function Dashboard() {
  const [, stats] = await Promise.all([fetchPlaylists(), fetchStats()]);
  
  const activePlaylists = playlists.filter(p => p.total_videos > 0);

  root.innerHTML = `
    <div class="app-container">
      <div class="animate-fade-in">
        ${Header(true, stats)}
      </div>
      
      <main>
        <section class="continue-section animate-fade-in" style="animation-delay: 0.1s">
          <h1 class="section-title">Your Playlists</h1>
          <p class="section-subtitle">Organize and track your learning journey.</p>
          
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem; color: var(--accent)">
            <i data-lucide="clock" style="width: 18px"></i>
            <span style="font-weight: 600; font-size: 0.9rem">Continue Learning</span>
          </div>
          
          <div class="continue-grid">
            ${activePlaylists.slice(0, 2).map((p, i) => `
              <div class="continue-card animate-scale-in" style="animation-delay: ${0.2 + i * 0.1}s" onclick="navigate('/playlist/${p.id}')">
                <div class="thumbnail-mini" style="background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; overflow: hidden;">
                   ${p.thumbnail ? `<img src="${p.thumbnail}" style="width: 100%; height: 100%; object-fit: cover;" />` : `<i data-lucide="play" style="color: var(--accent)"></i>`}
                </div>
                <div class="continue-info">
                  <h4>${escapeHTML(p.name)} Fundamentals</h4>
                  <p>${escapeHTML(p.name)}</p>
                </div>
              </div>
            `).join('')}
            ${activePlaylists.length === 0 ? '<p style="color: var(--text-muted)">No active playlists. Add some videos to get started!</p>' : ''}
          </div>
        </section>

        <div class="search-box animate-fade-in" style="margin-bottom: 2rem; max-width: 400px; animation-delay: 0.3s">
          <input type="text" id="playlist-search" placeholder="Search playlists..." oninput="window.debouncedFilterPlaylists(this.value)">
          <i data-lucide="search" class="search-icon"></i>
          <button class="clear-search-btn" onclick="window.clearSearch('playlist-search', window.filterPlaylists)"><i data-lucide="x" style="width: 16px; height: 16px;"></i></button>
        </div>

        <div class="playlists-grid animate-fade-in" id="playlists-grid" style="animation-delay: 0.4s">
          ${playlists.map((p, i) => {
            const progress = p.total_videos > 0 ? (p.completed_videos / p.total_videos) * 100 : 0;
            return `
              <div class="playlist-card animate-scale-in" style="animation-delay: ${0.5 + i * 0.05}s" onclick="navigate('/playlist/${p.id}')">
                <div class="playlist-header">
                  <h3>${escapeHTML(p.name)}</h3>
                  <div class="card-actions" onclick="if(event) event.stopPropagation()">
                    <button class="icon-btn" onclick="window.openModal(event, 'edit-playlist', ${p.id})"><i data-lucide="edit"></i></button>
                    <button class="icon-btn delete" onclick="window.openModal(event, 'delete-playlist', ${p.id})"><i data-lucide="trash2"></i></button>
                  </div>
                </div>
                <p class="playlist-desc">${escapeHTML(p.description) || 'No description'}</p>
                <div class="playlist-footer">
                  <span><i data-lucide="play" style="width: 14px; display: inline; vertical-align: middle; margin-right: 4px"></i> ${p.total_videos} videos</span>
                  <span style="color: ${progress === 100 ? 'var(--success)' : 'var(--text-muted)'}">${Math.round(progress)}%</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </main>

      
    </div>
  `;
  createIcons({ icons: { Play, Plus, Search, Check, ChevronLeft, MoreVertical, LayoutGrid, Clock, CheckCircle2, Edit, Trash2, X } });
}

async function PlayerPage(playlistId) {
  await Promise.all([fetchVideos(playlistId), fetchPlaylists()]);
  currentPlaylist = playlists.find(p => p.id === playlistId) || null;
  
  const videoId = new URLSearchParams(window.location.search).get('video');
  currentVideo = videos.find(v => v.id === Number(videoId)) || videos[0] || null;

  const activeVideos = videos.filter(v => v.status === 'active');
  const completedVideos = videos.filter(v => v.status === 'completed');

  root.innerHTML = `
    <div class="app-container">
      <div class="animate-fade-in">
        ${Header(false)}
      </div>
      
      <main class="player-layout">
        <div class="player-main animate-fade-in" style="animation-delay: 0.1s">
          <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem">
            <button class="btn-secondary" style="padding: 0.5rem; border-radius: 50%" onclick="navigate('/')">
              <i data-lucide="chevron-left"></i>
            </button>
            <div>
              <h2>${escapeHTML(currentPlaylist?.name) || 'Playlist'}</h2>
              <p class="subtitle">${escapeHTML(currentPlaylist?.description) || ''}</p>
            </div>
          </div>

          <div class="video-container animate-scale-in" style="animation-delay: 0.2s">
            ${currentVideo ? `
              <iframe 
                width="100%" 
                height="100%" 
                src="https://www.youtube.com/embed/${getYouTubeId(currentVideo.url)}" 
                frameborder="0" 
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
              </iframe>
            ` : `
              <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text-muted)">
                <i data-lucide="play" style="width: 48px; height: 48px; margin-bottom: 1rem"></i>
                <p>Select a video to start watching</p>
              </div>
            `}
          </div>

          <div class="video-info animate-fade-in" style="animation-delay: 0.3s">
            <h3>${escapeHTML(currentVideo?.title) || 'No video selected'}</h3>
            <p>Added on ${currentVideo ? new Date(currentVideo.added_at).toLocaleDateString() : '-'}</p>
          </div>
        </div>

        <aside class="sidebar animate-slide-in" style="animation-delay: 0.4s">
          <div class="sidebar-header">
            <h3>Playlist</h3>
            <button class="add-video-btn" onclick="window.openModal('video')">
              <i data-lucide="plus" style="width: 16px"></i> Add Video
            </button>
          </div>

          <div class="search-box">
            <input type="text" id="video-search" placeholder="Search videos..." oninput="window.debouncedFilterVideos(this.value)">
            <i data-lucide="search" class="search-icon"></i>
            <button class="clear-search-btn" onclick="window.clearSearch('video-search', window.filterVideos)"><i data-lucide="x" style="width: 16px; height: 16px;"></i></button>
          </div>

          <div class="video-list-section">
            <h4>Active Videos (${activeVideos.length})</h4>
            <div class="video-list">
              ${activeVideos.map((v, i) => `
                <div class="video-item animate-fade-in ${currentVideo?.id === v.id ? 'active' : ''}" style="animation-delay: ${0.5 + i * 0.05}s" onclick="selectVideo(${v.id})">
                  <div class="check-btn" onclick="window.toggleComplete(event, ${v.id}, 'completed')"></div>
                  <img src="${v.thumbnail}" loading="lazy" class="video-item-thumb" onerror="this.src='https://picsum.photos/seed/${v.id}/120/80'">
                  <div class="video-item-info">
                    <h5>${escapeHTML(v.title)}</h5>
                    <p>YouTube</p>
                  </div>
                  <div class="item-actions" onclick="if(event) event.stopPropagation()">
                    <button class="icon-btn-sm" onclick="window.openModal(event, 'edit-video', ${v.id})"><i data-lucide="edit"></i></button>
                    <button class="icon-btn-sm delete" onclick="window.openModal(event, 'delete-video', ${v.id})"><i data-lucide="trash2"></i></button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="video-list-section">
            <h4 style="color: #3fb950">Completed (${completedVideos.length})</h4>
            <div class="video-list">
              ${completedVideos.map((v, i) => `
                <div class="video-item animate-fade-in ${currentVideo?.id === v.id ? 'active' : ''}" style="animation-delay: ${0.6 + i * 0.05}s" onclick="selectVideo(${v.id})">
                  <div class="check-btn completed" onclick="window.toggleComplete(event, ${v.id}, 'active')">
                    <i data-lucide="check" style="width: 12px"></i>
                  </div>
                  <img src="${v.thumbnail}" loading="lazy" class="video-item-thumb" style="opacity: 0.5" onerror="this.src='https://picsum.photos/seed/${v.id}/120/80'">
                  <div class="video-item-info">
                    <h5 style="text-decoration: line-through; color: var(--text-muted)">${escapeHTML(v.title)}</h5>
                    <p>YouTube</p>
                  </div>
                  <div class="item-actions" onclick="if(event) event.stopPropagation()">
                    <button class="icon-btn-sm delete" onclick="window.openModal(event, 'delete-video', ${v.id})"><i data-lucide="trash2"></i></button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </aside>
      </main>

    </div>
  `;
  createIcons({ icons: { Play, Plus, Search, Check, ChevronLeft, MoreVertical, LayoutGrid, Clock, CheckCircle2, Edit, Trash2, X } });
}

// Actions
async function confirmDeletePlaylist(id) {
  console.log('confirmDeletePlaylist called with id:', id);
  try {
    const res = await fetch(`/api/playlists/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete playlist');
    
    window.closeModal();
    // If we are currently viewing this playlist, navigate home
    const url = new URL(window.location.href);
    if (url.searchParams.get('playlist') === id.toString()) {
      navigate('/');
    } else {
      render();
    }
  } catch (err) {
    console.error(err);
    alert('Error deleting playlist: ' + err.message);
  }
}

async function confirmDeleteVideo(id) {
  console.log('confirmDeleteVideo called with id:', id);
  try {
    const res = await fetch(`/api/videos/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete video');
    
    window.closeModal();
    // If we are currently viewing this video, clear it from URL
    const url = new URL(window.location.href);
    if (url.searchParams.get('video') === id.toString()) {
      url.searchParams.delete('video');
      window.history.pushState({}, '', url);
    }
    render();
  } catch (err) {
    console.error(err);
    alert('Error deleting video: ' + err.message);
  }
}

window.navigate = navigate;
window.confirmDeletePlaylist = confirmDeletePlaylist;
window.confirmDeleteVideo = confirmDeleteVideo;

window.selectVideo = (id) => {
  const url = new URL(window.location.href);
  url.searchParams.set('video', id.toString());
  window.history.pushState({}, '', url);
  render();
};

window.toggleComplete = async (e, id, status) => {
  if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
  await fetch(`/api/videos/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  render();
};

window.openModal = (e, type, id = null) => {
  if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
  
  // Handle case where openModal is called without event
  if (typeof e === 'string') {
    id = type;
    type = e;
  }
  let modalHtml = '';
  
  if (type === 'playlist') {
    modalHtml = `
      <div class="modal">
        <h3>New Playlist</h3>
        <form onsubmit="createPlaylist(event)">
          <div class="form-group">
            <label>Playlist Name</label>
            <input type="text" name="name" required placeholder="e.g. Advanced Calculus">
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea name="description" rows="3" placeholder="What will you learn?"></textarea>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
            <button type="submit" class="btn-primary">Create Playlist</button>
          </div>
        </form>
      </div>
    `;
  } else if (type === 'edit-playlist') {
    const p = playlists.find(p => p.id === id);
    modalHtml = `
      <div class="modal">
        <h3>Edit Playlist</h3>
        <form onsubmit="updatePlaylist(event, ${id})">
          <div class="form-group">
            <label>Playlist Name</label>
            <input type="text" name="name" required value="${escapeHTML(p?.name) || ''}">
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea name="description" rows="3">${escapeHTML(p?.description) || ''}</textarea>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
            <button type="submit" class="btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
    `;
  } else if (type === 'video') {
    modalHtml = `
      <div class="modal">
        <h3>Add Video</h3>
        <form onsubmit="addVideo(event)">
          <div class="form-group">
            <label>YouTube URL</label>
            <input type="url" name="url" required placeholder="https://www.youtube.com/watch?v=...">
          </div>
          <div class="form-group">
            <label>Video Title (Optional)</label>
            <input type="text" name="title" placeholder="Leave blank to auto-fetch (simulated)">
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
            <button type="submit" class="btn-primary">Add to Playlist</button>
          </div>
        </form>
      </div>
    `;
  } else if (type === 'edit-video') {
    const v = videos.find(v => v.id === id);
    modalHtml = `
      <div class="modal">
        <h3>Edit Video</h3>
        <form onsubmit="updateVideo(event, ${id})">
          <div class="form-group">
            <label>YouTube URL</label>
            <input type="url" name="url" required value="${escapeHTML(v?.url) || ''}">
          </div>
          <div class="form-group">
            <label>Video Title</label>
            <input type="text" name="title" required value="${escapeHTML(v?.title) || ''}">
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
            <button type="submit" class="btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
    `;
  } else if (type === 'delete-playlist') {
    modalHtml = `
      <div class="modal">
        <h3>Delete Playlist</h3>
        <p style="color: var(--text-muted); margin-bottom: 1.5rem;">Are you sure you want to delete this playlist and all its videos? This action cannot be undone.</p>
        <div class="modal-actions">
          <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="button" class="btn-primary" style="background: linear-gradient(135deg, #ff4b4b 0%, #d32f2f 100%); box-shadow: 0 4px 15px rgba(255, 75, 75, 0.3);" onclick="confirmDeletePlaylist(${id})">Delete</button>
        </div>
      </div>
    `;
  } else if (type === 'delete-video') {
    modalHtml = `
      <div class="modal">
        <h3>Delete Video</h3>
        <p style="color: var(--text-muted); margin-bottom: 1.5rem;">Are you sure you want to delete this video? This action cannot be undone.</p>
        <div class="modal-actions">
          <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="button" class="btn-primary" style="background: linear-gradient(135deg, #ff4b4b 0%, #d32f2f 100%); box-shadow: 0 4px 15px rgba(255, 75, 75, 0.3);" onclick="confirmDeleteVideo(${id})">Delete</button>
        </div>
      </div>
    `;
  }

  let overlay = document.querySelector('.modal-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.onclick = (e) => { if (e.target === overlay) window.closeModal(); };
    document.body.appendChild(overlay);
  }
  overlay.innerHTML = modalHtml;
  overlay.classList.add('open');
};

window.closeModal = () => {
  const overlay = document.querySelector('.modal-overlay');
  if (overlay) overlay.classList.remove('open');
};

window.updatePlaylist = async (e, id) => {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  await fetch(`/api/playlists/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: formData.get('name'),
      description: formData.get('description')
    })
  });
  window.closeModal();
  render();
};

window.updateVideo = async (e, id) => {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const url = formData.get('url');
  const videoId = getYouTubeId(url);
  
  await fetch(`/api/videos/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: formData.get('title'),
      url: url,
      thumbnail: videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null
    })
  });
  window.closeModal();
  render();
};

window.createPlaylist = async (e) => {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  await fetch('/api/playlists', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: formData.get('name'),
      description: formData.get('description')
    })
  });
  window.closeModal();
  render();
};

window.addVideo = async (e) => {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const url = formData.get('url');
  const videoId = getYouTubeId(url);
  
  if (!videoId) {
    alert('Invalid YouTube URL');
    return;
  }

  await fetch('/api/videos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      playlist_id: currentPlaylist?.id,
      title: formData.get('title') || `Video ${videoId}`,
      url: url,
      thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
    })
  });
  window.closeModal();
  render();
};

window.clearSearch = (inputId, filterFn) => {
  const input = document.getElementById(inputId);
  if (input) {
    input.value = '';
    filterFn('');
    input.focus();
  }
};

window.filterPlaylists = (query) => {
  const grid = document.getElementById('playlists-grid');
  if (!grid) return;
  const cards = grid.querySelectorAll('.playlist-card');
  let hasVisible = false;
  const lowerQuery = query.toLowerCase();
  
  cards.forEach(card => {
    const title = card.querySelector('h3')?.textContent?.toLowerCase() || '';
    const desc = card.querySelector('.playlist-desc')?.textContent?.toLowerCase() || '';
    if (title.includes(lowerQuery) || desc.includes(lowerQuery)) {
      card.style.display = 'block';
      hasVisible = true;
    } else {
      card.style.display = 'none';
    }
  });
  
  let emptyState = grid.querySelector('.empty-search-state');
  if (!hasVisible && cards.length > 0) {
    if (!emptyState) {
      emptyState = document.createElement('div');
      emptyState.className = 'empty-search-state';
      emptyState.innerHTML = '<i data-lucide="search" style="width: 32px; height: 32px; margin-bottom: 1rem; opacity: 0.5;"></i><p>No playlists found matching your search.</p>';
      grid.appendChild(emptyState);
      createIcons({ icons: { Search } });
    }
    emptyState.style.display = 'block';
  } else if (emptyState) {
    emptyState.style.display = 'none';
  }
};

window.filterVideos = (query) => {
  const lists = document.querySelectorAll('.video-list');
  const lowerQuery = query.toLowerCase();
  
  lists.forEach(list => {
    const items = list.querySelectorAll('.video-item');
    items.forEach(item => {
      const title = item.querySelector('h5')?.textContent?.toLowerCase() || '';
      if (title.includes(lowerQuery)) {
        item.style.display = 'flex';
      } else {
        item.style.display = 'none';
      }
    });
  });
};

let searchTimeout;
window.debouncedFilterPlaylists = (query) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => window.filterPlaylists(query), 300);
};

let videoSearchTimeout;
window.debouncedFilterVideos = (query) => {
  clearTimeout(videoSearchTimeout);
  videoSearchTimeout = setTimeout(() => window.filterVideos(query), 300);
};

// Main Render
async function render() {
  const params = new URLSearchParams(window.location.search);
  const playlistId = params.get('playlist');

  if (playlistId) {
    await PlayerPage(Number(playlistId));
  } else {
    await Dashboard();
  }
}

// Initial Load
render();
