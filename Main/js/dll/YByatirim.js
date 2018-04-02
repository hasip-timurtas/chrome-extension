var search = `draw=1&columns%5B0%5D%5Bdata%5D=0&columns%5B0%5D%5Bname%5D=&columns%5B0%5D%5Bsearchable%5D=true&columns%5B0%5D%5Borderable%5D=false&columns%5B0%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B0%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B1%5D%5Bdata%5D=1&columns%5B1%5D%5Bname%5D=&columns%5B1%5D%5Bsearchable%5D=true&columns%5B1%5D%5Borderable%5D=false&columns%5B1%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B1%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B2%5D%5Bdata%5D=2&columns%5B2%5D%5Bname%5D=&columns%5B2%5D%5Bsearchable%5D=true&columns%5B2%5D%5Borderable%5D=false&columns%5B2%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B2%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B3%5D%5Bdata%5D=3&columns%5B3%5D%5Bname%5D=&columns%5B3%5D%5Bsearchable%5D=true&columns%5B3%5D%5Borderable%5D=false&columns%5B3%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B3%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B4%5D%5Bdata%5D=4&columns%5B4%5D%5Bname%5D=&columns%5B4%5D%5Bsearchable%5D=true&columns%5B4%5D%5Borderable%5D=false&columns%5B4%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B4%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B5%5D%5Bdata%5D=5&columns%5B5%5D%5Bname%5D=&columns%5B5%5D%5Bsearchable%5D=true&columns%5B5%5D%5Borderable%5D=false&columns%5B5%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B5%5D%5Bsearch%5D%5Bregex%5D=false&start=0&length=35&search%5Bvalue%5D=&search%5Bregex%5D=false&action=list_boxes&csrf_token=` + $('#csrf_token').val();
var params = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}');
var _access_token = "8f03c10593f0abadef0b3084ba560826", investBoxUrl = "/ajax/system_investbox.php"
var _db
var investCoinler = []


async function Basla(sayfa){

    for(var i =0; i < sayfa; i++){
        await InvestCoinTopla()
        await sleep(2)
        $( "#investbox_boxes_list_next" ).click()
    }
    console.log(investCoinler);
    await CheckInvest()
}

function InvestCoinTopla(){
    // Her sayfayı tek tek gezerek o sayfadaki coinlerin adını alır.
    $("#investbox_boxes_list tbody tr span").each(function() {
        var coinName = $(this).children().html()
        var yuzde = $(this).parent().parent().parent().parent().children().first().text()
        var period = $(this).parent().parent().parent().parent().children().eq(1).text()
        var coin = { coinName, yuzde, period }
        if(!investCoinler.includes(coin)){
            investCoinler.push(coin)
        }
    })
}

async function CheckInvest(){
    const openOrdersRef = _db.ref('/yobit/yatirim')
    const snapshot = await openOrdersRef.once('value')
    const dbInvests = snapshot.val()
    console.log(dbInvests,investCoinler);
    
    const result = await ObjectArrayEqual(dbInvests, investCoinler)
    if(!result){
        // Yenisi ile eskisiyle arasında fark varsa dbye ekle.
        openOrdersRef.set(investCoinler)
    }else{
        console.log('Coinler Eşit');
    }
}
function sleep(saniye) {
    return new Promise(resolve => setTimeout(resolve, saniye * 1000)); // saniyeyi 1000 e çarptım milisaniye ile çalışıyor çünkü
}

async function Start(){
    await LoadFireBase()
    $.post(investBoxUrl, params).done(data => {
        var result = JSON.parse(data);
        //SendInvestBoxNumber(result.recordsFiltered)
        var sayfaSayisi = Math.ceil(result.recordsFiltered / 7) // Her sayfada 7 tane invest coin var, ana toplam invest coin sayısını 7 ye bölüp ceil alıyoruz. örn: 7.2 çıksa bile 8 yapar. buda 8 sayfa var demek.
        _db.ref('/yobit/investCount').set(result.recordsFiltered)
        Basla(sayfaSayisi)
    })
}

Start()

async function LoadFireBase() {
    //chrome.extension.getURL('/js/dll/firebase.js')
    await $.getScript('https://www.gstatic.com/firebasejs/4.12.0/firebase.js')
    //await $.getScript('/js/dll/firebase.js')
    await LoadFireBaseConfig()
    console.log('Firebase Yüklendi')
  }

  
function LoadFireBaseConfig() {
    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyDxDY2_n2XA4mF3RWTFXRuu0XrLCkYYG4s",
        authDomain: "firem-b3432.firebaseapp.com",
        databaseURL: "https://firem-b3432.firebaseio.com",
        projectId: "firem-b3432",
        storageBucket: "firem-b3432.appspot.com",
        messagingSenderId: "866789153670"
    };
    firebase.initializeApp(config);
    firebase.auth().signInWithEmailAndPassword('hasip@gmail.com','6359718');
    _db = firebase.database()
  }

function ObjectArrayEqual(arr1, arr2) {
    try{
        if(arr1.length !== arr2.length){
            return false;
        }
           
        for(var i = arr1.length; i--;) {
            for (const key of Object.keys(arr1[i])){
                if(arr1[i][key] !== arr2[i][key]){
                    return false;
                }
            }
        }
    }catch(e){
        console.log('ObjectArrayEqual Hata verdi Hata:',e);
        
        return false
    }
   
    return true;
}