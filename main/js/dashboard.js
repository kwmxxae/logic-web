document.addEventListener('DOMContentLoaded', function () {
    const realName = document.getElementById('real-name');

    const userName = sessionStorage.getItem('user');

    if (userName) {
        realName.textContent = userName;
    }
});

/* ---------- tab navigation ---------- */
  function showTab(tab){
    document.querySelectorAll('.tab-panel').forEach(function(p){ p.classList.remove('active'); });
    document.getElementById(tab).classList.add('active');
    document.querySelectorAll('.tab-btn').forEach(function(b){
      b.classList.toggle('active', b.dataset.tab === tab);
    });
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
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