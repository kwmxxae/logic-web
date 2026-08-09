/* ---------- notice board (공지사항, in-memory) ---------- */
var noticePosts = [
  { id:1, name:'운영진', title:'[필독] 7월 정기모임 안내', content:'7월 10일(목) 오후 5시, 3층 세미나실에서 정기모임이 있습니다. 다들 늦지 않게 참석해주세요!', date:'07.05' }
];
var nextNoticeId = 2;

function renderNoticePosts(){
  var list = document.getElementById('noticeList');
  document.getElementById('noticeCount').textContent = '전체 ' + noticePosts.length + '개의 글';
  if(noticePosts.length === 0){
    list.innerHTML = '<div class="empty-state">아직 등록된 공지가 없어요.</div>';
    return;
  }
  list.innerHTML = noticePosts.map(function(p){
    return (
      '<div class="post" onclick="toggleNoticePost(' + p.id + ')" id="notice-' + p.id + '">' +
        '<div class="post-head">' +
          '<span class="post-title">' + escapeHtml(p.title) + '</span>' +
          '<span class="post-meta">' + escapeHtml(p.name) + ' · ' + p.date + '</span>' +
        '</div>' +
        '<div class="post-body">' + escapeHtml(p.content) + '</div>' +
        '<div class="post-actions"><button onclick="deleteNotice(event, ' + p.id + ')">삭제</button></div>' +
      '</div>'
    );
  }).join('');
}

function toggleNoticePost(id){
  var el = document.getElementById('notice-' + id);
  el.classList.toggle('open');
}

function deleteNotice(e, id){
  e.stopPropagation();
  if(!confirm('이 공지를 삭제할까요?')) return;
  noticePosts = noticePosts.filter(function(p){ return p.id !== id; });
  renderNoticePosts();
}

function toggleNoticeForm(force){
  var form = document.getElementById('noticeForm');
  var open = typeof force === 'boolean' ? force : !form.classList.contains('open');
  form.classList.toggle('open', open);
  if(!open){
    document.getElementById('noticeName').value = '';
    document.getElementById('noticeTitle').value = '';
    document.getElementById('noticeContent').value = '';
  }
}

function submitNotice(){
  var name = document.getElementById('noticeName').value.trim();
  var title = document.getElementById('noticeTitle').value.trim();
  var content = document.getElementById('noticeContent').value.trim();
  if(!name || !title || !content){
    alert('이름, 제목, 내용을 모두 입력해주세요.');
    return;
  }
  var today = new Date();
  var dateStr = String(today.getMonth()+1).padStart(2,'0') + '.' + String(today.getDate()).padStart(2,'0');
  noticePosts.unshift({ id: nextNoticeId++, name: name, title: title, content: content, date: dateStr });
  toggleNoticeForm(false);
  renderNoticePosts();
}

function escapeHtml(str){
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

/* ---------- logout ---------- */
function handleLogout(){
  if(confirm('로그아웃 하시겠습니까?')){
    alert('로그인 화면으로 돌아갑니다.');
    window.location.href = 'index.html';
  }
}

renderNoticePosts();