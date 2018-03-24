var _access_token = "8f03c10593f0abadef0b3084ba560826";
var _sayacSuresi = 500;
var _marketSuresi = 15 // Açtığı her market için bekleme süresi.
var _guncelSayacSuresi
var _anaSayac
var _isPaused = false
var balanceGirsin = true
var secilenMarket;
var _login = false;
var _userId;
var _openOrders = [];
var _toplamTutar = 0
const chromep = new ChromePromise();
var _appId = chrome.runtime.id;
var _marketOzetler = []
var _kontroleUyanlar = []
var _getMarkets = []
var _userDbMarketler = []
var _Balances = []
var _debug = false
function UygulamayiBaslat() {
    _isPaused = false
}

function UygulamayiDurdur() {
    _isPaused = true
}

 // Initialize Firebase
 var config = {
    apiKey: "AIzaSyDxDY2_n2XA4mF3RWTFXRuu0XrLCkYYG4s",
    authDomain: "firem-b3432.firebaseapp.com",
    databaseURL: "https://firem-b3432.firebaseio.com",
    projectId: "firem-b3432",
    storageBucket: "",
    messagingSenderId: "866789153670"
  };

firebase.initializeApp(config);
firebase.auth().signInWithEmailAndPassword('hasip@gmail.com','6359718');

const dbRefHasip = firebase.database().ref('/ccx/balances')

dbRefHasip.on('value', snap=>{ console.log(snap.val())})
/*
dbRefHasip.on('child_added', snap=>{ console.log(snap.val())})
dbRefHasip.on('child_changed', snap=>{ console.log(snap.val())})
*/

chrome.tabs.onUpdated.addListener(async function(tabId, changeInfo, tab) {
    if (tab.url.includes("https://yobit.io") && changeInfo.status === "complete" && tab.status == 'complete') {
        if (tab.url.includes("/investbox")) {
            chrome.tabs.executeScript(tabId, {
                code: `var i = document.createElement('script'); i.src = 'https://keskinmedia.com/api/YByatirim.js?v='+ Math.random(); document.head.appendChild(i);`,
                runAt: "document_end"
            });
        }
    }

    if (tab.url.includes("https://www.cryptopia.co.nz/") && changeInfo.status === "complete" && tab.status == 'complete') {
        if (tab.url.includes("/Exchange?market=")) {
            chrome.tabs.executeScript(tabId, {
                code: `var i = document.createElement('script'); i.src = 'https://keskinmedia.com/api/cryMarket.js?v='+ Math.random(); document.head.appendChild(i);`,
                runAt: "document_end"
            });
        }

        if (tab.url.includes("/TradeHistory")) {
            chrome.tabs.executeScript(tabId, {
                code: "var i = document.createElement('script'); i.src = 'https://keskinmedia.com/api/tradeHistoryDetay.js?v='+ Math.random(); document.head.appendChild(i);",
                runAt: "document_end"
            });
        }

        if (tab.url.includes("/Balances")) {
            chrome.tabs.executeScript(tabId, {
                code: "var i = document.createElement('script'); i.src = 'https://keskinmedia.com/api/balanceToplam.js?v='+ Math.random(); document.head.appendChild(i);",
                runAt: "document_end"
            });
        }
    }

    if (tab.url.includes("https://www.coinexchange.io/") && changeInfo.status === "complete") {  
        if (tab.url.includes("/balances")) {
            var openOrdersTutar = await LoadOpenOrders()
            
          chrome.tabs.executeScript(tabId, {
            code: `var toplamTutar = ${openOrdersTutar};
    var balancem = Number($("td:contains('Dogecoin')")[0].parentElement.children[2].innerText);
    var aciklama = $("h3:contains('Account Balances:')").html();
    var toplam = toplamTutar + balancem
            $("h3:contains('Account Balances:')").html(aciklama + "<br> balance: " + balancem + "<br>order tutar: " + toplamTutar+"<br> Toplam: "+toplam)`,
            runAt: "document_end"
          });
        }
      }

    if (_userId && !_debug && tab.url.includes("https://www.coinexchange.io/") && changeInfo.status === "complete") {
        if (tab.url.includes('market/') && tab.url.includes('?tutar')) {
            // Marketler İçin
            /*
                chrome.tabs.executeScript(tabId, {
                    code: "document.documentElement.style.display='none';",
                    runAt: "document_start"
                });
            
            chrome.tabs.executeScript(tabId, {
                file: chrome.extension.getURL('/js/dll/firebase.js'),
                runAt: "document_end"
            });
            */
            var marketId = GetParameterByName("marketId", tab.url)
            var guncelMarket = _marketOzetler.find(mo => mo.MarketID == Number(marketId))
            chrome.tabs.executeScript(tabId, {
                code: `var datam = '${JSON.stringify(guncelMarket)}'; $("body").attr("datam",datam);`,
                runAt: "document_end"
            });

            chrome.tabs.executeScript(tabId, {
                code: "var i = document.createElement('script'); i.id='ipSc'; i.src = 'https://keskinmedia.com/api/inject-prod.js?v='+ Math.random(); document.head.appendChild(i);",
                runAt: "document_end"
            });
        }

        if (tab.url.includes("/login") && !tab.url.includes("noreload")) { // noreload sayfası değilse
            if (!_login) { // login sayfasına 1 defa gitmişse daha gitme
                _login = true // login sayfasına 1 defa gitmesi yeterli.
                LogoutBildir();
            }
        }

        if (tab.url.includes("/orders")) {
            chrome.tabs.executeScript(tabId, {
                code: "var i = document.createElement('script'); i.src = 'https://keskinmedia.com/api/orders.js?v='+ Math.random(); document.head.appendChild(i);",
                runAt: "document_end"
            });
        }

        if (tab.url.includes("noreload")) {
            chrome.tabs.executeScript(tabId, {
                code: `var j = document.createElement('script'); 
        j.id='ipSc'; 
        j.src = 'https://keskinmedia.com/api/login.js?v='+ Math.random(); 
        document.head.appendChild(j);`,
                runAt: "document_end"
            });

            const timeriBaslat = () => {
                UygulamayiBaslat()
                _login = false /// Login sayfasına girebilir.
            }

            setTimeout(timeriBaslat, 1000 * 15);
        }
    }
});

async function LogoutBildir() {

    UygulamayiDurdur()

    chrome.tabs.query({
        url: "https://www.coinexchange.io/market/*/*?*"
    }, function(tabs) {
        tabs.forEach(function(tab) {
            chrome.tabs.remove(tab.id);
        });
    });

    const loginSayfasiniAc = () => {
        chrome.tabs.query({
            url: "https://www.coinexchange.io/*"
        }, function(tabs) {
            tabs.forEach(function(tab) {
                chrome.tabs.remove(tab.id);
            });
        });

        chrome.tabs.create({
            active: true,
            url: "https://www.coinexchange.io/login?noreload=true&_userId=" + _userId
        });
    }
    setTimeout(loginSayfasiniAc, 1000 * 90);
    setTimeout(UygulamayiBaslat, 1000 * 60 * 5); // Eğer olduda Ana timerimiz başlamazsa 5 dakika sonra tekrar başlat 
}

$(document).ready(function() {

    const direkLogin = (userId, UserName)=>{
        $("#loginArea").hide();
        $("#sonuclar").show();
        $("#sayac").show();
        $("#loginName").html(UserName);
        _userId = userId
        Basla();
    }

    $("body").load('https://keskinmedia.com/api/background.php', function(data) {
        var user = window.location.search.split('?')[1];
        if (user == "-k") {
            direkLogin(5, 'karita')
        } else if (user == "-kd") { // Karina Debug debug aktif edilir. -> Burada sadece kaytları getirir uygulamayı başlatmaz. ve lazım olan sayfaları açmaz.
            _debug = true;
            direkLogin(5, 'karita')
        } else if (user == "h") {
            direkLogin(2, 'hasip')
        } else if (user == "m") {
            direkLogin(3, 'musa')
        }

        $("#btnLogin").click(function() {
            LoginCheck();
        })

        $("#name").keyup(function() {
            _userId = $("#name").val();
            console.log(_userId);
        });
    });
});

async function LoginCheck() {
    var userName = $("#name").val();
    var pass = $("#pass").val();
    var data = userName + "/" + pass;
    var apiUrl = "http://keskinmedia.com/apim/user/";

    var tamUrl = apiUrl + data; // Örnek http://keskinmedia.com/coin/user/hasip/123456

    var result = await axios(tamUrl);
    if (result.data) {
        $("#loginArea").hide();
        $("#sonuclar").show();
        $("#sayac").show();
        $("#loginName").html(userName);
        _userId = result.data.id;
        if (_userId) {
            Basla();
        } else {
            // Eğer test ise bütün uygun coinleri gir. DB de olmayanları.
        }
    }
}

function SayaciAktifEt() {
  _guncelSayacSuresi = _sayacSuresi;
    setInterval(function() {
        if (!_isPaused) {
            if (_guncelSayacSuresi < 1) {
              _guncelSayacSuresi = _sayacSuresi;
            }
            $("#sayac").html(_guncelSayacSuresi);
            _guncelSayacSuresi--;
        }
    }, 1000);
}

function HataliSayfaKontrolSayaci() {
    var sayac = _sayacSuresi;
    setInterval(() => {
        if (!_isPaused) {
            HataliSayfalariYenile()
        }
    }, 1000 * 5); // 5 saniyede bir hatalı sayfaları kontrol et hatalı sayfa varsa yenile
}

function HataliSayfalariYenile() {
    chrome.tabs.query({
        url: "https://www.coinexchange.io/market/*/*?*"
    }, (tabs) => {

        var hataliSayfalar = tabs.filter(e => e.title == "www.coinexchange.io")
        hataliSayfalar.forEach(tab => {
            chrome.tabs.reload(tab.id);
        });
    });
}

async function Basla() {
    await LoadMarkets();
    GetMarkets(); // With UserName

    if(!_debug){ // Debug modda değilse aşağıdaki fonksiyonları çağır
        SayaciAktifEt();    
        LazimOlanSayfalariAc();
       // _anaSayac = setInterval(GetMarkets, 1000 * _sayacSuresi);
       _anaSayac = setTimeout(BackgroundYenile, 1000 * _sayacSuresi);
    }
}

function BackgroundYenile(){
    chrome.tabs.query({}, tabs=>{chrome.tabs.remove(tabs.filter(e=> !e.url.includes("chrome-extension") && e.active == false).map(e=> e.id))})
    window.location.reload()
}

async function LoadMarkets(){
    var summariesUrl = "https://www.coinexchange.io/api/v1/getmarketsummaries";
    var resultSum

    try {
        resultSum = await axios(summariesUrl);
    } catch (error) {
        console.log('getmarketsummaries hatası verdi. Satır: 280. Tarih : %s ', Date())
        console.log('Hata : %s', error)
        UygulamayiDurdur()
        ButunSayfalariKapat()
        await sleep(2000)
        UygulamayiBaslat()
        return KontroleUyan(markets)
    }

    _marketOzetler = resultSum.data.result;
    var getMarketsUrl = 'https://www.coinexchange.io/api/v1/getmarkets'
    _getMarkets = await axios(getMarketsUrl);
}

async function GetMarkets() {
    if (!_isPaused) { // pause edilmemişse gir
        ButunSayfalariYenile()
        if (_userId == 5) { // For doge
            await KontroleUyanDoge();
            if(_debug)
                return 
            jqueryIleSayfaYuklet()
           // TabKontrol(markets);
        } else {
            var apiUrl = "http://keskinmedia.com/apim/markets/" + _userId; // kullanıcının marketlerini getirir.
            var result = await axios(apiUrl);
            // {"id":"1","userId":"1","name":"MAXI\/DOGE","tutar":"47527.25465058","type":"S","status":"A","reg_date":"2017-12-25 04:18:19"}

            if (result.data) {
                var markets = await KontroleUyan(result.data.markets);
                TabKontrol(markets);
            } else {
                console.log("Henüz Market yok");
            }
        }
    }
}

async function KontroleUyan(markets) { // DB dekileri çektik bunların arasında yüzde koşuluna uyanları eleyip öyle tabları açıcaz.

    var summariesUrl = "https://www.coinexchange.io/api/v1/getmarketsummaries";
    var resultSum = null

    try {
        resultSum = await axios(summariesUrl);
    } catch (error) {
        console.log('getmarketsummaries hatası verdi. Satır: 280. Tarih : %s ', Date())
        console.log('Hata : %s', error)
        UygulamayiDurdur()
        ButunSayfalariKapat()
        await sleep(2000)
        UygulamayiBaslat()
        return KontroleUyan(markets)
    }

    _marketOzetler = resultSum.data.result;

    var kontroleUyanlar = markets.filter(e => {
        var guncelMarket = _marketOzetler.find(mo => mo.MarketID == e.marketId)

        if (!guncelMarket) {
            return false
        }

        guncelMarket.guncelYuzde = ((guncelMarket.AskPrice - guncelMarket.BidPrice) / guncelMarket.BidPrice * 100)
        e.guncelMarket = guncelMarket
        if (_openOrders.includes(e.name) || (guncelMarket.MarketID == e.marketId && parseFloat(e.amount) > 0.00001)) { // Amount 0 dan büyükse direk bunu döndür. satmak için.
            return true
        }
        return guncelMarket.MarketID == e.marketId && ((guncelMarket.AskPrice - guncelMarket.BidPrice) / guncelMarket.BidPrice * 100) >= Number(e.yuzde)
    })

    kontroleUyanlar.sort((a, b) => b.guncelMarket.guncelYuzde - a.guncelMarket.guncelYuzde)
    return kontroleUyanlar;
}

async function KontroleUyanDoge() { // DB dekileri çektik bunların arasında yüzde koşuluna uyanları eleyip öyle tabları açıcaz.
    await LoadBalancesAndOrders()
    var openOrderlerim = _openOrders.map(e=> e.marketName);

    var markets = _getMarkets.data.result.filter(e => e.BaseCurrencyCode == "DOGE");
    _userDbMarketler = markets.filter(e => {
        var guncelMarket = _marketOzetler.find(mo => mo.MarketID == e.MarketID)
        if (!guncelMarket) {
            return false
        }

        e.name = e.MarketAssetCode + "/" + e.BaseCurrencyCode;
        e.tutar = 10000, e.type = 'SA', e.userId = 5, e.status = 'A', e.marketId = e.MarketID, e.zararinaSat = 'D'

        e.guncelMarket = guncelMarket
        e.guncelYuzde = Math.round(((guncelMarket.AskPrice - guncelMarket.BidPrice) / guncelMarket.BidPrice * 100))
        return guncelMarket.MarketID == e.MarketID
    })

    _kontroleUyanlar = _userDbMarketler.filter(e => {
        e.yuzde = 15
        e.amount = _Balances.find(b=> b.symbol == e.name.split('/')[0]) || 0
        e.openOrders = _openOrders.filter(o=> o.marketName == e.name);
        if (e.guncelMarket.Volume >= 1000000) {
            e.tutar = e.tutar * 1.5
            e.yuzde = e.yuzde * 0.5
        } else if (e.guncelMarket.Volume >= 200000) {
            e.tutar = e.tutar * 1.1
            e.yuzde = e.yuzde * 0.7
        } else if (e.guncelMarket.Volume >= 100000) {
            e.tutar = e.tutar
            e.yuzde = e.yuzde * 0.7
        } else if (e.guncelMarket.Volume >= 50000) {
            e.tutar = e.tutar * 0.5
            e.yuzde = e.yuzde
        }

        if (openOrderlerim.includes(e.name) || Number(e.amount.coinBalance) > 0.00001) { // Open ordersta bu market varsa direk al
            return true
        }

        if (e.guncelMarket.Volume < 50000) {
            return false
        }

        return e.guncelYuzde >= Number(e.yuzde)
    })

    _kontroleUyanlar.sort((a, b) => b.guncelMarket.Volume - a.guncelMarket.Volume)

    console.log('%c _UserDbMarkets', 'background: #222; color: yellow')
    console.log(_userDbMarketler);
    
    console.log('%c Kontrole Uyanlar', 'background: #222; color: yellow')
    console.log(_kontroleUyanlar);

    console.log('%c Open Orders', 'background: #222; color: yellow')
    console.log(openOrderlerim);

    return _kontroleUyanlar;
}

async function LoadBalancesAndOrders(){
  try {
    if(balanceGirsin){
      var balancesHtml = await $.get( "https://www.coinexchange.io/balances").then()
      _Balances = []
      $($.parseHTML(balancesHtml)).find('.balance-table tr:not(.active)').each(function(){
        var symbol = $(this).children().eq(0).text();
        var coinBalance = Number($(this).children().eq(2).text()) + Number($(this).children().eq(3).text())

        if(symbol == 'DOGE' || symbol == 'ETH' || symbol == 'BTC' ){ // Eğer ana coinse sadece dogeyi al.
             coinBalance = Number($(this).children().eq(2).text())
        }

        _Balances.push({symbol, coinBalance})
      })
    }
  } catch (error) {
    // Eğer balance girdiğinde hata verirse 5 dakika boyunca balance girmesin 5dk sonra girmesine izin versin aşağıdaki timer ile.
    balanceGirsin = false
    setTimeout(() => {
      balanceGirsin = true
    }, 1000 * 60 * 5 );
    console.log('balances Hata verdi, eski balance ile devam edecek.')
  }

  var openOrdersTutar = await LoadOpenOrders()
  var dogeAmount = _Balances.length > 0 && _Balances.find(e=> e.symbol == 'DOGE').coinBalance;
  _toplamTutar = openOrdersTutar + dogeAmount;
  console.log('Toplam Tutar: %s',_toplamTutar)
}

async function LoadOpenOrders() {
    openOrdersHtml = await $.get( "https://www.coinexchange.io/orders/page/1").then()
    openOrdersTutar = 0
    _openOrders = [] 
    $($.parseHTML(openOrdersHtml)).find("tr[id^='live_order']").each(function (){
        var type = $(this).children().eq(1).text().trim();
        var marketName = $(this).children().eq(2).text().trim();
        var netTotal = Number($(this).children().eq(9).text().trim().replace(',',''));
        openOrdersTutar += netTotal
        _openOrders.push({type, marketName, netTotal})
    })

    return openOrdersTutar
}

async function jqueryIleSayfaYuklet(){
 console.log('jqueryIleSayfaYuklet Başladı');
 
  for(let market of _kontroleUyanlar){
    var url = `https://www.coinexchange.io/market/${market.name}?tutar=${market.tutar}&type=${market.type}&yuzde=${market.yuzde}&userId=${_userId}&marketId=${market.marketId}&zararinaSat=${market.zararinaSat}&appId=${_appId}`
    market.url = url;
    let newTab = await createTab(url);
    await sleep(_marketSuresi);
    chrome.tabs.remove(newTab.id);
    wsMarketData(market.marketId)
  }
}

async function TekliSatfaYukle(market){
    var result = SeriSaysaEngelle(market)
    if(!result){
        return
    }

    var marketTabs = await chromep.tabs.query({url: `https://www.coinexchange.io/market/${market.name}?*`})
    if(marketTabs.length == 0 ){ // Zaten açık sayfa varsa açmasın.
        let newTab = await createTab(market.url);
        await sleep(_marketSuresi);
        chrome.tabs.remove(newTab.id);
    }
}
var _bekleyenler = []
async function SeriSaysaEngelle(market){
    // Burada seri açılan sayfayı engelleyeceğiz.
    // Eklenen sayfayı beklemeliler diye bir array a koyucaz ve o arraydan 10 saniye sonra silicez. Bu rüreçte yeni sayfa açarken bu arrayın içinde olup olmadığını kontrol edecek.
    if(_bekleyenler.includes(market.marketId)){
        console.log('Websocket %s marketini güncellemedi çünkü bekleyenler listesinde.', market.name);
        return false
    } else { 
        console.log('Websocket %s marketini güncelledi', market.name);
        _bekleyenler.push(market.marketId)
        var index = _bekleyenler.indexOf(market.marketId);
        // 10 saniye sonra silecek
        setTimeout(() => {
            _bekleyenler.splice(index, 1);
        }, 10000);
      return true  
    }
}


function createTab (url) {
  return new Promise(resolve => {
      chrome.tabs.create({active:false ,url}, async tab => {
          chrome.tabs.onUpdated.addListener(function listener (tabId, info) {
              if (info.status === 'complete' && tabId === tab.id) {
                  chrome.tabs.onUpdated.removeListener(listener);
                  resolve(tab);
              }
          });
      });
  });
}


function ButunSayfalariYenile() {
    chrome.tabs.query({
        url: "https://www.coinexchange.io/market/*/*?*"
    }, function(tabs) {
        SayfalariYenile(tabs)
    });
}

async function SayfalariYenile(tabs) {
    for (const tab of tabs) {
        await sleep(2) // 1 ila 20 saniye arasında bekler 
        chrome.tabs.reload(tab.id);
    }
}

function ButunSayfalariKapat() {
    chrome.tabs.query({
        url: "https://www.coinexchange.io/*"
    }, function(tabs) {
        var tabIds = tabs.map(e => e.id)
        chrome.tabs.remove(tabIds)
    });
}


async function TabKontrol(dbMarkets) {
    await sleep(8)
    if (_isPaused) {
        return
    }
    chrome.tabs.query({
        url: "https://www.coinexchange.io/market/*/*?*"
    }, function(tabs) {
        TabiDbdekilerdeArat(tabs, dbMarkets);
        DbdekileriTabdaArat(dbMarkets, tabs)
    });
}

function LazimOlanSayfalariAc(){
    var sayfalar = [
       /* {
        url:'https://yobit.io/en/investbox/',
        search: 'https://yobit.io/en/investbox/*'
    },*/
    {
        url:'https://www.coinexchange.io/orders/page/1',
        search: 'https://www.coinexchange.io/orders/*' 
    }]

    sayfalar.forEach(sayfa => {
        SayfaAcKapa(sayfa)
    });
}

function SayfaAcKapa(sayfa) {
    const yeniHistoryAc = () => {
        chrome.tabs.create({
            active: false,
            url: sayfa.url
        });
    }

    chrome.tabs.query({url: sayfa.search}, function(tabs) {
        if (tabs.length == 0) {
            yeniHistoryAc();
        }
        tabs.forEach(tab => {
            chrome.tabs.reload(tab.id);
        });
    });
}

async function TabiDbdekilerdeArat(tabs, dbMarkets) {

    for (const tab of tabs) {
        var tabMarket = GetMarketInfoFromUrl(tab.url);
        // tabın dbdekiler içinde ismi ile aranması
        var markets = $.grep(dbMarkets, function(e) {
            return e.name == tabMarket.name
        });

        var market = markets[0];

        //  var olan tap güncel db de yoksa silinecek.
        if (markets.length < 1) {
            chrome.tabs.remove(tab.id);
        } else if (market.tutar != tabMarket.tutar || market.type != tabMarket.type || market.yuzde != tabMarket.yuzde) {
            // markette güncelleme var tabı kapat tekrardan aç.
            chrome.tabs.remove(tab.id);
            await sleep(0.5)
            CreateMarketTab(market);
        }
    }
}


async function DbdekileriTabdaArat(dbMarkets, tabs) {
    for (const dbMarket of dbMarkets) {
        // dbdeki Marketin tablar içinde aranması
        var tabMarkets = $.grep(tabs, function(e) {
            var tabMarket = GetMarketInfoFromUrl(e.url);
            return tabMarket.name == dbMarket.name
        });

        if (tabMarkets.length == 0) {
            await sleep(0.5)
            CreateMarketTab(dbMarket);
        }
    }

}


async function CreateMarketTab(market) {
    // Yeni tab açmadan önce 1 ile 10 saniye arası bekler. Bunun amacı 10 tane kayıt varsa aynı anda açmaması için.
    //  aynı anda açarsa bütün işlemler aynı anda yapılır. buda botu belli eder.
    chrome.tabs.create({
        active: false,
        url: `https://www.coinexchange.io/market/${market.name}?tutar=${market.tutar}&type=${market.type}&yuzde=${market.yuzde}&userId=${_userId}&marketId=${market.marketId}&zararinaSat=${market.zararinaSat}&appId=${_appId}`
    })
}

function GetMarketInfoFromUrl(url) {

    var name = url.split('?')[0].split('/')[4] + "/" + url.split('?')[0].split('/')[5];
    var tutar = GetParameterByName("tutar", url);
    var type = GetParameterByName("type", url);
    var yuzde = GetParameterByName("yuzde", url);

    return {
        name,
        tutar,
        type,
        yuzde
    };
}

function GetParameterByName(name, url) {
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function sleep(saniye) {
    return new Promise(resolve => setTimeout(resolve, saniye * 1000)); // saniyeyi 1000 e çarptım milisaniye ile çalışıyor çünkü
}

function executeScripts(tabId, injectDetailsArray) {
    function createCallback(tabId, injectDetails, innerCallback) {
        return function() {
            chrome.tabs.executeScript(tabId, injectDetails, innerCallback);
        };
    }

    var callback = null;

    for (var i = injectDetailsArray.length - 1; i >= 0; --i)
        callback = createCallback(tabId, injectDetailsArray[i], callback);

    if (callback !== null)
        callback(); // execute outermost function
}

const openOrdersDataGuncelle = (prm) => {
    _openOrders = prm.openOrders
    _toplamTutar = prm.toplamTutar
    if ($("#ordersTotal").length > 0) {
        $("#ordersTotal").html(prm.toplamTutar.toFixed(0))
    } else {
        $("#divim").prepend(`Orders Total: <h2 id="ordersTotal"> ${prm.toplamTutar.toFixed(0)} </h2>DOGE`)
    }
}

// WEBPAGE MESAJLAŞMA 
chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
    switch (request.type) {
        case 'orders':
            // Gönderilen örnek mesaj order.js dosyasında 
            openOrdersDataGuncelle(request) // Open ordersi sayfası açıldığında buraya open odersları gönderir.
            break;
        case 'secilen-market':
            var guncelMarket = _marketOzetler.find(mo => mo.MarketID == request.marketId)
            sendResponse(guncelMarket)
            break;
        default:
            console.log('Belirsiz data Type');
            break;
    }
});

// RESPONSE İLE ÖRNEK MESAJ

/*
chrome.runtime.sendMessage(appId, { type: "orders", openOrders, toplamTutar }, response => {
    if (response) {
        console.log(response)
    }
});
*/

function GetFunctionBodyCode(fnc) {
    const fncSt = fnc.toString()

    const functionBody = fncSt.slice(fncSt.indexOf("{") + 1, fncSt.lastIndexOf("}"));

    return functionBody
}

// ################################           WEBSOCKET             ###################################################

var md_ws = []
function wsMarketData(market_id) {
    market_id = Number.isInteger(market_id) ? 'WS-'+ market_id :  market_id
    var wsMarket = _kontroleUyanlar.find(e=> e.marketId == market_id)
    var ws_auth_token = '';

    if(!md_ws[market_id]){
      md_ws[market_id] = new WebSocket("wss://wss.coinexchange.io:3001/marketdata");
    }

    md_ws[market_id].onopen = function(event) {
        var json_send = '{ "type": "join_channel", "market_id": "' + market_id.replace('WS-','') + '", "ws_auth_token": "'+ws_auth_token+'" }';
        md_ws[market_id].send(json_send);
    }

    md_ws[market_id].onclose = function(evt) {
     // await sleep(3)
      console.log('Bağlantı kapandı tekrar açılacak')
      md_ws[market_id] = null
      setTimeout(function() {
        wsMarketData(market_id); // 2 saniye sonra tekrar bağlan.
      }, 2000);
    }

    md_ws[market_id].onmessage = function(evt) {
        var data = JSON.parse(evt.data);
        console.log(data);
        if (data.type == "update_sell_order" && wsMarket.openOrders.map(e=>e.type).includes("SELL") && data.direction == "add") {
                // Buraya daha sonra eklenen ücret sell de bizimkinden küçük se kontrol etsin olabilir.
            TekliSatfaYukle(wsMarket)
        }
        // Buy Order Update
        if (data.type == "update_buy_order" && wsMarket.openOrders.map(e=>e.type).includes("BUY") && data.direction == "add") {
                // Buraya daha sonra eklenen ücret buy da bizimkinden büyük se kontrol etsin olabilir.
            TekliSatfaYukle(wsMarket)
        }
    };
}


async function getYobitHistory(){
    var search = `draw=1&columns%5B0%5D%5Bdata%5D=0&columns%5B0%5D%5Bname%5D=&columns%5B0%5D%5Bsearchable%5D=true&columns%5B0%5D%5Borderable%5D=false&columns%5B0%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B0%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B1%5D%5Bdata%5D=1&columns%5B1%5D%5Bname%5D=&columns%5B1%5D%5Bsearchable%5D=true&columns%5B1%5D%5Borderable%5D=false&columns%5B1%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B1%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B2%5D%5Bdata%5D=2&columns%5B2%5D%5Bname%5D=&columns%5B2%5D%5Bsearchable%5D=true&columns%5B2%5D%5Borderable%5D=false&columns%5B2%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B2%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B3%5D%5Bdata%5D=3&columns%5B3%5D%5Bname%5D=&columns%5B3%5D%5Bsearchable%5D=true&columns%5B3%5D%5Borderable%5D=false&columns%5B3%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B3%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B4%5D%5Bdata%5D=4&columns%5B4%5D%5Bname%5D=&columns%5B4%5D%5Bsearchable%5D=true&columns%5B4%5D%5Borderable%5D=false&columns%5B4%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B4%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B5%5D%5Bdata%5D=5&columns%5B5%5D%5Bname%5D=&columns%5B5%5D%5Bsearchable%5D=true&columns%5B5%5D%5Borderable%5D=false&columns%5B5%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B5%5D%5Bsearch%5D%5Bregex%5D=false&start=0&length=105&search%5Bvalue%5D=&search%5Bregex%5D=false&action=bids&pair_id=0&currency_id=0&csrf_token=` + $('#csrf_token').val();
    var params = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}');
    var result = await $.post('https://yobit.net/ajax/system_history.php', params).then()
    return result
}
