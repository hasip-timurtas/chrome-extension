var search = `draw=1&columns%5B0%5D%5Bdata%5D=0&columns%5B0%5D%5Bname%5D=&columns%5B0%5D%5Bsearchable%5D=true&columns%5B0%5D%5Borderable%5D=false&columns%5B0%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B0%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B1%5D%5Bdata%5D=1&columns%5B1%5D%5Bname%5D=&columns%5B1%5D%5Bsearchable%5D=true&columns%5B1%5D%5Borderable%5D=false&columns%5B1%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B1%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B2%5D%5Bdata%5D=2&columns%5B2%5D%5Bname%5D=&columns%5B2%5D%5Bsearchable%5D=true&columns%5B2%5D%5Borderable%5D=false&columns%5B2%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B2%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B3%5D%5Bdata%5D=3&columns%5B3%5D%5Bname%5D=&columns%5B3%5D%5Bsearchable%5D=true&columns%5B3%5D%5Borderable%5D=false&columns%5B3%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B3%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B4%5D%5Bdata%5D=4&columns%5B4%5D%5Bname%5D=&columns%5B4%5D%5Bsearchable%5D=true&columns%5B4%5D%5Borderable%5D=false&columns%5B4%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B4%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B5%5D%5Bdata%5D=5&columns%5B5%5D%5Bname%5D=&columns%5B5%5D%5Bsearchable%5D=true&columns%5B5%5D%5Borderable%5D=false&columns%5B5%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B5%5D%5Bsearch%5D%5Bregex%5D=false&start=0&length=35&search%5Bvalue%5D=&search%5Bregex%5D=false&action=list_boxes&csrf_token=` + $('#csrf_token').val();
var params = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}');
var _access_token = "8f03c10593f0abadef0b3084ba560826", investBoxUrl = "/ajax/system_investbox.php"

const SendInvestBoxNumber = async (number) => {
    //  http://keskinmedia.com/apim/sendlogout/2/8f03c10593f0abadef0b3084ba560826
    var userId = $("body").attr("datam"); 
    var sendSmsUrl = `https://keskinmedia.com/apim/sendInvest/${userId}/${number}/${_access_token}`;
    $.get(sendSmsUrl).done(data=> {
        console.log(data)
        /*
            setTimeout(() => {
                window.location.reload()
            }, 1000*60);
        */
    });
}

$.post(investBoxUrl, params).done(data => {
    var result = JSON.parse(data);
    console.log('Invests Total: ' + result.recordsTotal)
    SendInvestBoxNumber(result.recordsTotal)
})




// Background.js de SendSms fonksiyonunu kullan. 
/*
    Yapılacaklar : 
    Background.js ye yobit sayfasını ekle. uzak masaüstünde çalışsın yani _userId dolu ise çalışsın.
    Background.js de listeyi güncel tutsun, yobit sayfası her güncellendiğinde bu liste kontrol edilsin.
    Artış olduğunda Sendsms fonksiyonu kullanılarak sms gönderilsin.

*/ 