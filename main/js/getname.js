document.addEventListener('DOMContentLoaded', function () {
    const realName = document.getElementById('real-name');

    const user = JSON.parse(sessionStorage.getItem('user'));
    const userName = user.realName;

    if (userName) {
        realName.textContent = userName;
    }
});