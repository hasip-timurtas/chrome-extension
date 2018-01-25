
const fillAndSubmit = ()=>{
    $('#remember_me').prop('checked', true);
    $("#username").val("karita");
    $("#password").val("merhaba1234");
    $("#_submit").click();
}

setTimeout(fillAndSubmit, 1000 * 5)





//setTimeout("document.getElementById('username').value= 'karita'; document.getElementById('password').vaue='merhaba1234'; 
//document.getElementById('remember_me').checked = true; document.getElementById('_submit').click();", 1000 * 5)