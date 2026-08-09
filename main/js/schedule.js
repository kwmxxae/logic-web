/* ---------- schedule (활동 일정, in-memory) ---------- */
var events = [
  { id:1, date:'2026-07-10', title:'정기모임', info:'목요일 오후 5시 · 3층 세미나실' },
  { id:2, date:'2026-07-20', title:'여름 MT', info:'일요일 오전 9시 · 강촌 리조트' },
  { id:3, date:'2026-08-01', title:'여름 세미나: 알고리즘과 논리', info:'토요일 오후 2시 · 온라인 (Zoom)' },
  { id:4, date:'2026-08-15', title:'신입 부원 환영회', info:'토요일 오후 6시 · 학생회관 대강당' }
];
var nextEventId = 5;
var editingEventId = null;

function formatBadge(dateStr){
  var parts = dateStr.split('-');
  if(parts.length !== 3) return { month:'', day:'' };
  return { month: parseInt(parts[1], 10) + '월', day: parts[2] };
}

function renderEvents(){
  var list = document.getElementById('eventList');
  var sorted = events.slice().sort(function(a, b){
    return a.date.localeCompare(b.date);
  });
  document.getElementById('eventCount').textContent = '총 ' + events.length + '개의 일정';

  if(sorted.length === 0){
    list.innerHTML = '<div class="empty-state">등록된 일정이 없어요. 새 일정을 추가해보세요.</div>';
    return;
  }

  list.innerHTML = sorted.map(function(ev){
    var badge = formatBadge(ev.date);
    return (
      '<div class="event">' +
        '<div class="badge">' + badge.month + '<b>' + badge.day + '</b></div>' +
        '<div class="info"><h4>' + escapeHtml(ev.title) + '</h4><p>' + escapeHtml(ev.info) + '</p></div>' +
        '<div class="event-actions">' +
          '<button onclick="startEditEvent(' + ev.id + ')">수정</button>' +
          '<button class="danger" onclick="deleteEvent(' + ev.id + ')">삭제</button>' +
        '</div>' +
      '</div>'
    );
  }).join('');
}

function escapeHtml(str){
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

function resetEventForm(){
  editingEventId = null;
  document.getElementById('eventFormTitle').textContent = '새 일정 추가';
  document.getElementById('eventDate').value = '';
  document.getElementById('eventTitle').value = '';
  document.getElementById('eventInfo').value = '';
  document.getElementById('eventSubmitBtn').textContent = '등록';
}

function toggleEventForm(force){
  var form = document.getElementById('eventForm');
  var open = typeof force === 'boolean' ? force : !form.classList.contains('open');
  form.classList.toggle('open', open);
  if(!open){
    resetEventForm();
  }
}

function openAddEvent(){
  resetEventForm();
  toggleEventForm(true);
}

function startEditEvent(id){
  var ev = events.find(function(e){ return e.id === id; });
  if(!ev) return;
  editingEventId = id;
  document.getElementById('eventFormTitle').textContent = '일정 수정';
  document.getElementById('eventDate').value = ev.date;
  document.getElementById('eventTitle').value = ev.title;
  document.getElementById('eventInfo').value = ev.info;
  document.getElementById('eventSubmitBtn').textContent = '수정 완료';
  toggleEventForm(true);
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
}

function submitEvent(){
  var date = document.getElementById('eventDate').value;
  var title = document.getElementById('eventTitle').value.trim();
  var info = document.getElementById('eventInfo').value.trim();
  if(!date || !title || !info){
    alert('날짜, 제목, 상세 정보를 모두 입력해주세요.');
    return;
  }

  if(editingEventId !== null){
    var ev = events.find(function(e){ return e.id === editingEventId; });
    if(ev){
      ev.date = date;
      ev.title = title;
      ev.info = info;
    }
  } else {
    events.push({ id: nextEventId++, date: date, title: title, info: info });
  }

  toggleEventForm(false);
  renderEvents();
}

function deleteEvent(id){
  if(!confirm('이 일정을 삭제할까요?')) return;
  events = events.filter(function(e){ return e.id !== id; });
  if(editingEventId === id){
    toggleEventForm(false);
  }
  renderEvents();
}

/* ---------- logout ---------- */
function handleLogout(){
  if(confirm('로그아웃 하시겠습니까?')){
    alert('로그인 화면으로 돌아갑니다.');
    window.location.href = 'index.html';
  }
}

renderEvents();