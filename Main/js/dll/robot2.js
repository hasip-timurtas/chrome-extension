"use strict"
// Test amaçlı bu kalsın burda
window.addEventListener("message", function (event) {
    // We only accept messages from ourselves
    if (event.source != window)
        return;

    if (event.data.message) {
        console.log("Mesaj Alındı");

        // Gelen mesaja göre işlem yapılır switch kulanağız şimdilik robot var ama buraya daha farklışeyler yükleyebiiriz.
        switch (event.data.message) {
            case "robot":
                console.log("Mesaj Robot");
                break;
            case "hasip":
                console.log("Mesaj Hasip");
                break;
        }
    }
});

var sid = setInterval(function () {
    if (
        window.location.href.match(/https:\/\/www.google.com\/recaptcha\/api\d\/anchor/) &&
        $("#recaptcha-anchor div.recaptcha-checkbox-checkmark").length
        && $("#recaptcha-anchor div.recaptcha-checkbox-checkmark").is(':visible') &&
        isScrolledIntoView($("#recaptcha-anchor div.recaptcha-checkbox-checkmark").get(0))
    ) {
        var execute = true;

        if (sessionStorage.getItem('accesstime')) {
            if (new Date().getTime() - sessionStorage.getItem('accesstime') < 7000) {
                execute = false;
            }
        }

        if (execute) {
            $("#recaptcha-anchor div.recaptcha-checkbox-checkmark").click();
            sessionStorage.setItem('accesstime', new Date().getTime());
        }

    }
}, 500);

setTimeout(() => {
    clearInterval(sid);
}, 5000);

function isScrolledIntoView(elem) {
    var docViewTop = $(window).scrollTop();
    var docViewBottom = docViewTop + $(window).height();

    var elemTop = $(elem).offset().top;
    var elemBottom = elemTop + $(elem).height();

    return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
}


function ff_extractDomain(url) {
    var domain;
    //find & remove protocol (http, ftp, etc.) and get domain
    if (url.indexOf("://") > -1) {
        domain = url.split('/')[2];
    }
    else {
        domain = url.split('/')[0];
    }

    //find & remove port number
    domain = domain.split(':')[0];

    return domain;
}