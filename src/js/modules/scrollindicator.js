window.addEventListener('scroll', () => {
    let windowScroll = document.body.scrollTop || document.documentElement.scrollTop,
        height = document.documentElement.scrollHeight - document.documentElement.clientHeight,
        scroll = (windowScroll / height) * 100,
        progessBar = document.querySelector('.progress-bar');

    progessBar.style.width = scroll + '%';


});