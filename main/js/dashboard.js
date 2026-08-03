/* ---------- tab navigation ---------- */
  function showTab(tab){
    document.querySelectorAll('.tab-panel').forEach(function(p){ p.classList.remove('active'); });
    document.getElementById(tab).classList.add('active');
    document.querySelectorAll('.tab-btn').forEach(function(b){
      b.classList.toggle('active', b.dataset.tab === tab);
    });
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }

  /* ---------- gallery lightbox ---------- */
  function openLightbox(photoClass, caption){
    var lb = document.getElementById('lightbox');
    var photo = document.getElementById('lightboxPhoto');
    photo.className = 'lightbox-photo photo ' + photoClass;
    document.getElementById('lightboxCaption').textContent = caption;
    lb.classList.remove('hidden');
  }
  function closeLightbox(e){
    document.getElementById('lightbox').classList.add('hidden');
  }

  /* ---------- free board (in-memory) ---------- */
  var posts = [
    { id:3, name:'운영진', title:'[필독] 7월 정기모임 안내', content:'7월 10일(목) 오후 5시, 3층 세미나실에서 정기모임이 있습니다. 다들 늦지 않게 참석해주세요!', date:'07.05' },
    { id:2, name:'김로직', title:'신입 부원 환영합니다 :)', content:'이번에 새로 들어온 신입 부원분들 환영해요! 다음 모임 때 반갑게 인사 나눠요~', date:'07.03' },
    { id:1, name:'박논리', title:'스터디 팀원 구합니다', content:'알고리즘 스터디 같이 하실 분 있나요? 매주 화요일 저녁에 진행 예정입니다.', date:'06.29' }
  ];
  var nextId = 4;

  function renderPosts(){
    var list = document.getElementById('postList');
    document.getElementById('boardCount').textContent = '전체 ' + posts.length + '개의 글';
    if(posts.length === 0){
      list.innerHTML = '<div class="empty-state">아직 등록된 글이 없어요. 첫 글을 남겨보세요!</div>';
      return;
    }
    list.innerHTML = posts.map(function(p){
      return (
        '<div class="post" onclick="togglePost(' + p.id + ')" id="post-' + p.id + '">' +
          '<div class="post-head">' +
            '<span class="post-title">' + escapeHtml(p.title) + '</span>' +
            '<span class="post-meta">' + escapeHtml(p.name) + ' · ' + p.date + '</span>' +
          '</div>' +
          '<div class="post-body">' + escapeHtml(p.content) + '</div>' +
          '<div class="post-actions"><button onclick="deletePost(event, ' + p.id + ')">삭제</button></div>' +
        '</div>'
      );
    }).join('');
  }

  function togglePost(id){
    var el = document.getElementById('post-' + id);
    el.classList.toggle('open');
  }

  function deletePost(e, id){
    e.stopPropagation();
    if(!confirm('이 글을 삭제할까요?')) return;
    posts = posts.filter(function(p){ return p.id !== id; });
    renderPosts();
  }

  function toggleWriteForm(force){
    var form = document.getElementById('writeForm');
    var open = typeof force === 'boolean' ? force : !form.classList.contains('open');
    form.classList.toggle('open', open);
    if(!open){
      document.getElementById('postName').value = '';
      document.getElementById('postTitle').value = '';
      document.getElementById('postContent').value = '';
    }
  }

  function submitPost(){
    var name = document.getElementById('postName').value.trim();
    var title = document.getElementById('postTitle').value.trim();
    var content = document.getElementById('postContent').value.trim();
    if(!name || !title || !content){
      alert('이름, 제목, 내용을 모두 입력해주세요.');
      return;
    }
    var today = new Date();
    var dateStr = String(today.getMonth()+1).padStart(2,'0') + '.' + String(today.getDate()).padStart(2,'0');
    posts.unshift({ id: nextId++, name: name, title: title, content: content, date: dateStr });
    toggleWriteForm(false);
    renderPosts();
  }

  function escapeHtml(str){
    return str
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;');
  }

  /* ---------- contact form ---------- */
  function submitContact(e){
    e.preventDefault();
    var name = document.getElementById('cName').value.trim();
    var email = document.getElementById('cEmail').value.trim();
    var msg = document.getElementById('cMessage').value.trim();
    if(!name || !email || !msg){
      alert('모든 항목을 입력해주세요.');
      return false;
    }
    document.getElementById('contactSuccess').classList.add('show');
    e.target.reset();
    return false;
  }

  /* ---------- logout ---------- */
  function handleLogout(){
    if(confirm('로그아웃 하시겠습니까?')){
      alert('로그인 화면으로 돌아갑니다.');
      window.location.href = 'index.html';
    }
  }

  renderPosts();