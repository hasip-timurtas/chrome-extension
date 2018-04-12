setInterval(()=>{ 
	if(grecaptcha && grecaptcha.getResponse().length != 0){
		$("#free_play_form_button").click() 
    }
}, 5000)