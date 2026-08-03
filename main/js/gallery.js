/* ---------- storage ---------- */
var STORAGE_KEY = 'logic_gallery_folders_v2';
var GRADIENTS = ['g0','g1','g2','g3','g4','g5'];

var folders = loadFolders();
var currentFolderId = null;
var currentIndex = 0;

function loadFolders(){
  var saved = null;
  try{
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  }catch(e){
    saved = null;
  }
  if(Array.isArray(saved)) return saved;

  return [
    { id: 'f_demo1', name: '7월 정기모임', date: '2026-07-10', photos: [] },
    { id: 'f_demo2', name: '여름 MT', date: '2026-07-20', photos: [] }
  ];
}

function saveFolders(){
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(folders));
  }catch(e){
    alert('사진 저장 공간이 가득 찼어요. 사진 수나 용량을 줄여주세요.');
  }
}

function formatDate(dateStr){
  if(!dateStr) return '';
  var parts = dateStr.split('-');
  if(parts.length !== 3) return dateStr;
  return parts[0] + '.' + parts[1] + '.' + parts[2];
}

function getFolder(id){
  return folders.find(function(f){ return f.id === id; });
}

/* ---------- folder grid render ---------- */
function renderFolders(){
  var grid = document.getElementById('folderGrid');
  var sorted = folders.slice().sort(function(a, b){
    return (b.date || '').localeCompare(a.date || '');
  });

  var cardsHtml = sorted.map(function(f, i){
    var count = f.photos.length;
    var cover = count > 0 ? f.photos[0] : null;
    var bgStyle = cover ? ' style="background-image:url(' + cover + ')"' : '';
    var gradientClass = cover ? '' : ' ' + GRADIENTS[i % GRADIENTS.length];
    return (
      '<div class="folder-card' + gradientClass + '"' + bgStyle + ' onclick="openFolder(\'' + f.id + '\')">' +
        '<label class="folder-upload" onclick="event.stopPropagation()" title="사진 추가">' +
          '📤' +
          '<input type="file" accept="image/*" multiple hidden onchange="handleUpload(event, \'' + f.id + '\')">' +
        '</label>' +
        '<div class="folder-overlay">' +
          '<span class="folder-name">' + escapeHtml(f.name) + '</span>' +
          '<span class="folder-date">' + formatDate(f.date) + '</span>' +
          '<span class="folder-count">사진 ' + count + '장</span>' +
        '</div>' +
      '</div>'
    );
  }).join('');

  var addCardHtml =
    '<div class="add-folder-card" onclick="openAddFolder()">' +
      '<span class="add-folder-plus">＋</span>' +
      '<span class="add-folder-label">새 폴더 만들기</span>' +
    '</div>';

  var emptyHtml = sorted.length === 0
    ? '<div class="empty-gallery">아직 만든 폴더가 없어요. 위에서 새 폴더를 만들어보세요.</div>'
    : '';

  grid.innerHTML = addCardHtml + cardsHtml + emptyHtml;
}

function escapeHtml(str){
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ---------- add folder modal ---------- */
function openAddFolder(){
  document.getElementById('newFolderName').value = '';
  var today = new Date();
  var todayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
  document.getElementById('newFolderDate').value = todayStr;
  document.getElementById('folderModal').classList.remove('hidden');
}

function closeAddFolder(){
  document.getElementById('folderModal').classList.add('hidden');
}

function closeAddFolderOnBackdrop(e){
  closeAddFolder();
}

function createFolder(){
  var name = document.getElementById('newFolderName').value.trim();
  var date = document.getElementById('newFolderDate').value;
  if(!name){
    alert('행사 이름을 입력해주세요.');
    return;
  }
  if(!date){
    alert('날짜를 선택해주세요.');
    return;
  }
  var id = 'f_' + Date.now();
  folders.push({ id: id, name: name, date: date, photos: [] });
  saveFolders();
  closeAddFolder();
  renderFolders();
}

/* ---------- file -> base64 helper ---------- */
function filesToDataUrls(fileList, callback){
  var files = Array.prototype.slice.call(fileList).filter(function(f){
    return f.type.indexOf('image/') === 0;
  });
  if(files.length === 0){ callback([]); return; }
  var results = [];
  var remaining = files.length;
  files.forEach(function(file){
    var reader = new FileReader();
    reader.onload = function(e){
      results.push(e.target.result);
      remaining--;
      if(remaining === 0) callback(results);
    };
    reader.onerror = function(){
      remaining--;
      if(remaining === 0) callback(results);
    };
    reader.readAsDataURL(file);
  });
}

/* ---------- upload from folder card ---------- */
function handleUpload(e, folderId){
  var input = e.target;
  filesToDataUrls(input.files, function(urls){
    if(urls.length === 0) return;
    var folder = getFolder(folderId);
    if(!folder) return;
    folder.photos = folder.photos.concat(urls);
    saveFolders();
    renderFolders();
  });
  input.value = '';
}

/* ---------- upload from inside viewer ---------- */
function handleUploadInViewer(e){
  if(!currentFolderId) return;
  var input = e.target;
  filesToDataUrls(input.files, function(urls){
    if(urls.length === 0) return;
    var folder = getFolder(currentFolderId);
    if(!folder) return;
    folder.photos = folder.photos.concat(urls);
    currentIndex = folder.photos.length - urls.length;
    saveFolders();
    renderFolders();
    renderViewer();
  });
  input.value = '';
}

/* ---------- viewer ---------- */
function openFolder(folderId){
  currentFolderId = folderId;
  currentIndex = 0;
  document.getElementById('viewer').classList.remove('hidden');
  renderViewer();
}

function closeViewer(){
  document.getElementById('viewer').classList.add('hidden');
  currentFolderId = null;
}

function closeViewerOnBackdrop(e){
  closeViewer();
}

function navPhoto(dir){
  var folder = getFolder(currentFolderId);
  if(!folder) return;
  var total = folder.photos.length;
  if(total === 0) return;
  currentIndex = (currentIndex + dir + total) % total;
  renderViewer();
}

function deleteCurrentPhoto(){
  var folder = getFolder(currentFolderId);
  if(!folder || folder.photos.length === 0) return;
  if(!confirm('이 사진을 삭제할까요?')) return;

  folder.photos.splice(currentIndex, 1);
  if(currentIndex >= folder.photos.length){
    currentIndex = Math.max(0, folder.photos.length - 1);
  }
  saveFolders();
  renderFolders();
  renderViewer();
}

function deleteCurrentFolder(){
  var folder = getFolder(currentFolderId);
  if(!folder) return;
  if(!confirm('"' + folder.name + '" 폴더를 삭제할까요? 안에 있는 사진도 함께 삭제돼요.')) return;
  folders = folders.filter(function(f){ return f.id !== currentFolderId; });
  saveFolders();
  closeViewer();
  renderFolders();
}

function renderViewer(){
  var folder = getFolder(currentFolderId);
  var photos = folder ? folder.photos : [];
  var total = photos.length;

  document.getElementById('viewerFolderName').textContent = folder ? folder.name : '';
  document.getElementById('viewerFolderDate').textContent = folder ? formatDate(folder.date) : '';
  document.getElementById('viewerCount').textContent = (total === 0 ? '0' : (currentIndex + 1)) + ' / ' + total;

  var photoEl = document.getElementById('viewerPhoto');
  var emptyEl = document.getElementById('viewerEmpty');

  if(total === 0){
    photoEl.style.backgroundImage = 'none';
    emptyEl.style.display = 'block';
  }else{
    photoEl.style.backgroundImage = 'url(' + photos[currentIndex] + ')';
    emptyEl.style.display = 'none';
  }

  var disableNav = total <= 1;
  document.getElementById('prevBtn').disabled = disableNav;
  document.getElementById('nextBtn').disabled = disableNav;
  document.getElementById('deletePhotoBtn').disabled = total === 0;
}

/* ---------- logout ---------- */
function handleLogout(){
  if(confirm('로그아웃 하시겠습니까?')){
    alert('로그인 화면으로 돌아갑니다.');
    window.location.href = 'index.html';
  }
}

renderFolders();