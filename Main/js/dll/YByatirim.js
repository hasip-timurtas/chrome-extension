var search = `draw=1&columns%5B0%5D%5Bdata%5D=0&columns%5B0%5D%5Bname%5D=&columns%5B0%5D%5Bsearchable%5D=true&columns%5B0%5D%5Borderable%5D=false&columns%5B0%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B0%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B1%5D%5Bdata%5D=1&columns%5B1%5D%5Bname%5D=&columns%5B1%5D%5Bsearchable%5D=true&columns%5B1%5D%5Borderable%5D=false&columns%5B1%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B1%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B2%5D%5Bdata%5D=2&columns%5B2%5D%5Bname%5D=&columns%5B2%5D%5Bsearchable%5D=true&columns%5B2%5D%5Borderable%5D=false&columns%5B2%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B2%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B3%5D%5Bdata%5D=3&columns%5B3%5D%5Bname%5D=&columns%5B3%5D%5Bsearchable%5D=true&columns%5B3%5D%5Borderable%5D=false&columns%5B3%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B3%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B4%5D%5Bdata%5D=4&columns%5B4%5D%5Bname%5D=&columns%5B4%5D%5Bsearchable%5D=true&columns%5B4%5D%5Borderable%5D=false&columns%5B4%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B4%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B5%5D%5Bdata%5D=5&columns%5B5%5D%5Bname%5D=&columns%5B5%5D%5Bsearchable%5D=true&columns%5B5%5D%5Borderable%5D=false&columns%5B5%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B5%5D%5Bsearch%5D%5Bregex%5D=false&start=0&length=35&search%5Bvalue%5D=&search%5Bregex%5D=false&action=list_boxes&csrf_token=` + $('#csrf_token').val();
var params = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}');
var _access_token = "8f03c10593f0abadef0b3084ba560826", investBoxUrl = "/ajax/system_investbox.php"

var investCoinler = []
$.post(investBoxUrl, params).done(data => {
    var result = JSON.parse(data);
    //SendInvestBoxNumber(result.recordsFiltered)
    Basla(result.recordsFiltered)
})

async function Basla(sayfa){
    for(var i =0; i < sayfa; i++){
        await InvestCoinTopla()
        $( "#investbox_boxes_list_next" ).click()
    }
    SendInvestBoxNumber()
    console.log(investCoinler.join(','))
}

function InvestCoinTopla(){
    // Her sayfayı tek tek gezerek o sayfadaki coinlerin adını alır.
    $("#investbox_boxes_list tbody tr span").each(function() {
        var coinName = $(this).children().html()
        if(!investCoinler.includes(coinName)){
            investCoinler.push(coinName)
        }
    })
}

async function SendInvestBoxNumber() {
    var userId = $("body").attr("datam");
    var sendSmsUrl = `https://keskinmedia.com/apim/sendInvest/${userId}/${investCoinler}/${_access_token},`;

    $.get(sendSmsUrl).done(result => {
        console.log(result);
    })
}

function sleep(saniye) {
    return new Promise(resolve => setTimeout(resolve, saniye * 1000)); // saniyeyi 1000 e çarptım milisaniye ile çalışıyor çünkü
}



// Background.js de SendSms fonksiyonunu kullan. 
/*
    Yapılacaklar : 
    Background.js ye yobit sayfasını ekle. uzak masaüstünde çalışsın yani _userId dolu ise çalışsın.
    Background.js de listeyi güncel tutsun, yobit sayfası her güncellendiğinde bu liste kontrol edilsin.
    Artış olduğunda Sendsms fonksiyonu kullanılarak sms gönderilsin.

*/ 