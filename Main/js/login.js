var _userId = new URL(document.URL).searchParams.get("_userId");

const fillAndSubmit = () => {
    if (_userId == 5) {
        $("#username").val("karita");
        $("#password").val("merhaba1234");
        Login()
    } else if (_userId == 2) {
        $("#username").val("hasip4442");
        $("#password").val("hasip3434+");
        Login()
    } else if (_userId == 3) {
        $("#username").val("hasip4442");
        $("#password").val("hasip3434+");
        Login()
    } else {
        $("#username").val("BOŞ");
        $("#password").val("");
    }
}

function Login() {
    $('#remember_me').prop('checked', true);
    //  setTimeout('RobotBasla()', 1000 * 1); // 1 Saniye sonra ben robot değilime tıkla.
    //setTimeout('$("#_submit").click();', 1000 * 5);// 5 saniye sonra login butonuna bas 
}

if ($("a:contains('My Account')").length == 0) { // Eğer zaten login olmamışsa
    setTimeout(fillAndSubmit, 1000 * 1) // sayfa yüklendikten 1 sayine sonra formu doldur.
} else {
    window.close()
}




//setTimeout("document.getElementById('username').value= 'karita'; document.getElementById('password').vaue='merhaba1234'; 
//document.getElementById('remember_me').checked = true; document.getElementById('_submit').click();", 1000 * 5)