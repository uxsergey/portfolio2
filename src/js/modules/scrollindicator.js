window.addEventListener('scroll', () => {

    const windowScroll = document.body.scrollTop || document.documentElement.scrollTop,
        height = document.documentElement.scrollHeight - document.documentElement.clientHeight,
        scroll = (windowScroll / height) * 100;
    document.querySelector('.progress-bar').style.width = scroll + '%';
    console.log(scroll);
});