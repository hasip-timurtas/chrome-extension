var _access_token = "8f03c10593f0abadef0b3084ba560826";
var _sayacSuresi = 500;
var _marketSuresi = 15 // Açtığı her market için bekleme süresi.
var _guncelSayacSuresi
var _anaSayac
var _isPaused = false
var balanceGirsin = true
var secilenMarket;
var _login = false;
var _userId
var _bot
var _userName
var _openOrders = [];
var _toplamTutar = 0
var chromep = new ChromePromise();
var _appId = chrome.runtime.id;
var _marketOzetler = []
var _kontroleUyanlar = []
var _getMarkets = []
var _userDbMarketler = []
var _Balances = []
var _debug = false
var _db
var _yobitCsrf

function UygulamayiBaslat() {
    _isPaused = false
}

function UygulamayiDurdur() {
    _isPaused = true
}

chrome.tabs.onUpdated.addListener(async function(tabId, changeInfo, tab) {
    if(_userId && tab.url.includes('https://freedoge.co.in') && changeInfo.status === 'complete' && tab.status == 'complete'){
        if (tab.url.includes("/?op=home")) {
            chrome.tabs.executeScript(tabId, {
                code: `var i = document.createElement('script'); i.src = 'https://keskinmedia.com/api/freedoge.js?v='+ Math.random(); document.head.appendChild(i);`,
                runAt: "document_end"
            });
        }
    }

    if (tab.url.includes("https://www.cryptopia.co.nz/") && changeInfo.status === "complete" && tab.status == 'complete') {
        
        //Her sayfa için
        chrome.tabs.executeScript(tabId, {
            code: `sendNotification = function(){}`, // Şimdilik cry notificationları deaktif ediyoruz.
            runAt: "document_end"
        });

        if(_bot){ // bot aktifse cry-ws de çalıştır
            chrome.tabs.executeScript(tabId, {
                code: `var i = document.createElement('script'); i.src = 'https://keskinmedia.com/api/cry-ws.js?v='+ Math.random(); document.head.appendChild(i);`,
                runAt: "document_end"
            });
        }

        if (tab.url.includes("/Exchange?market=")) {
            chrome.tabs.executeScript(tabId, {
                code: `var i = document.createElement('script'); i.src = 'https://keskinmedia.com/api/cryMarket.js?v='+ Math.random(); document.head.appendChild(i);`,
                runAt: "document_end"
            });
        }
/*
        if (tab.url.includes("/TradeHistory")) {
            chrome.tabs.executeScript(tabId, {
                code: "var i = document.createElement('script'); i.src = 'https://keskinmedia.com/api/tradeHistoryDetay.js?v='+ Math.random(); document.head.appendChild(i);",
                runAt: "document_end"
            });
        }
*/
        if (tab.url.includes("/Balances")) {
            chrome.tabs.executeScript(tabId, {
                code: "var i = document.createElement('script'); i.src = 'https://keskinmedia.com/api/balanceToplam.js?v='+ Math.random(); document.head.appendChild(i);",
                runAt: "document_end"
            });
        }
    }

    if (tab.url.includes("https://www.coinexchange.io/") && changeInfo.status === "complete") {  
        if (tab.url.includes("/balances")) {
            chrome.tabs.executeScript(tabId, {
                code: "var i = document.createElement('script'); i.src = 'https://keskinmedia.com/api/coinexchange-balance-toplam.js?v='+ Math.random(); document.head.appendChild(i);",
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
            
            var marketId = GetParameterByName("marketId", tab.url)
            var guncelMarket = _marketOzetler.find(mo => mo.MarketID == Number(marketId))
            chrome.tabs.executeScript(tabId, {
                code: `var datam = '${JSON.stringify(guncelMarket)}'; $("body").attr("datam",datam);`,
                runAt: "document_end"
            });
            */
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

            var timeriBaslat = () => {
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

    var loginSayfasiniAc = () => {
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

    var direkLogin = (userId, UserName)=>{
        $("#loginArea").hide();
        $("#sonuclar").show();
        $("#sayac").show();
        $("#loginName").html(UserName);
        _userId = userId
        _userName = _userId == 2 ? 'hasip4441' : _userId == 5 ? 'karita' : 'musa'
        Basla();
    }

    $("body").load('https://keskinmedia.com/api/background.php', function(data) {
        var user = GetParameterByName('user', document.URL)
        _bot = GetParameterByName('bot', document.URL)
    
        if (user == "-k") {
            direkLogin(5, 'karita')
            //YobitBasla()
        } else if (user == "-kd") { // Karina Debug debug aktif edilir. -> Burada sadece kaytları getirir uygulamayı başlatmaz. ve lazım olan sayfaları açmaz.
            _debug = true;
            direkLogin(5, 'karita')
        } else if (user == "h") {
            direkLogin(2, 'hasip')
        } else if (user == "m") {
            direkLogin(3, 'musa')
        }else if(user == 'ybt'){
            YobitBasla();
        }

        if(_bot == 'aktif'){
            BilesenleriCalistir()
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
        _userName = _userId == 2 ? 'hasip4441' : _userId == 5 ? 'karita' : 'musa'
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
        //YobitInvestKontrol(); // userId == 5 ise çalışır.
       // _anaSayac = setInterval(GetMarkets, 1000 * _sayacSuresi);
       _anaSayac = setTimeout(BackgroundYenile, 1000 * _sayacSuresi);
    }
}

function BackgroundYenile(){
    var user = GetParameterByName('user', document.URL)

    if(!user){// Eğer user yoksa sadece bileşenleri yenilesin
        BilesenleriCalistir()
        return
    }

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
        if (_userId == 5 || _userId == 2) { // For doge
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
        e.tutar = 10000, e.type = 'SB', e.userId = 2, e.status = 'A', e.marketId = e.MarketID, e.zararinaSat = 'D'

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

        if (openOrderlerim.includes(e.name) || Number(e.amount.total) > 0.00001) { // Open ordersta bu market varsa direk al
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
        var available = Number($(this).children().eq(2).text()) 
        var inOrder = Number($(this).children().eq(3).text())
        var total = available + inOrder
        if(symbol == 'DOGE' || symbol == 'ETH' || symbol == 'BTC' ){ // Eğer ana coinse sadece dogeyi al.
            total = available
        }
        if(total> 0.0005){
            _Balances.push({symbol,available,inOrder,total})
        }
        
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
  var dogeAmount = _Balances.length > 0 && _Balances.find(e=> e.symbol == 'DOGE').total;
  _toplamTutar = openOrdersTutar + dogeAmount;
  BalanceUpdateFB()
  AllBalanceUpdateFB()
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
    OrdersUpdateFB()
    return openOrdersTutar
}

async function LoadOpenOrdersForCoinexchangeBalance() {
    openOrdersHtml = await $.get( "https://www.coinexchange.io/orders/page/1").then()
    openOrdersTutar = 0
    $($.parseHTML(openOrdersHtml)).find("tr[id^='live_order']").each(function (){
        var type = $(this).children().eq(1).text().trim();
        var marketName = $(this).children().eq(2).text().trim();
        var netTotal = Number($(this).children().eq(9).text().trim().replace(',',''));
        openOrdersTutar += netTotal
    })
    return openOrdersTutar
}

async function jqueryIleSayfaYuklet(){
 console.log('jqueryIleSayfaYukvar Başladı');
 
  for(var market of _kontroleUyanlar){
    var url = `https://www.coinexchange.io/market/${market.name}?tutar=${market.tutar}&type=${market.type}&yuzde=${market.yuzde}&userId=${_userId}&marketId=${market.marketId}&zararinaSat=${market.zararinaSat}&appId=${_appId}`
    market.url = url;
    var newTab = await createTab(url);
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
        var newTab = await createTab(market.url);
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
    for (var tab of tabs) {
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
        {
            url:'https://www.coinexchange.io/orders/page/1',
            search: 'https://www.coinexchange.io/orders/*',
            active: false
        }]

    sayfalar.forEach(sayfa => {
        SayfaAcKapa(sayfa)
    });
}

function SayfaAcKapa(sayfa) {
    var yeniHistoryAc = () => {
        chrome.tabs.create({
            active: sayfa.active,
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

    for (var tab of tabs) {
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
    for (var dbMarket of dbMarkets) {
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

var openOrdersDataGuncelle = (prm) => {
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
    var fncSt = fnc.toString()

    var functionBody = fncSt.slice(fncSt.indexOf("{") + 1, fncSt.lastIndexOf("}"));

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

LoadFireBase()
async function LoadFireBase() {
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
    //LoadConsoleTables()
    //LoadMessaging()
}

var _yobitBot
async function LoadConsoleTables(){
    var numberWithCommas = (x) => {
        x = parseInt(x)
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    var _yobitBotRef = _db.ref(`yobit-bot/${_userId}`)
    var snapshot = await _yobitBotRef.once('value')
    _yobitBot = snapshot.val()
    var dogeBalance = _yobitBot["balances"].find(e=> e.Symbol=='DOGE').Available
    var ordersToplam = _yobitBot["open-orders"].map(e=> e.Total).reduce((s,c)=> s+c)
    var ederleri = _yobitBot["open-orders"].map(e=> e.Ederi).reduce((s,c)=> s+c)
    var toplamBalance = dogeBalance + ordersToplam
    var tolamEderi = ederleri + dogeBalance
    var totalEstBalance = _yobitBot["balances"].map(e=> e.EstBtc).reduce((s,c)=> s+c); 
    totalEstBalance = Number(totalEstBalance.toFixed(8))
    var tradeHistoryYobit = _yobitBot["trade-history"].reverse()
    var hatalar = Object.keys(_yobitBot["hatalar"]).map(e=> _yobitBot["hatalar"][e]);
    var cssAyar = "font-weight:bold; font-size:15px"
    // TODO : Bazen değerler farklı geliyor 
  
    console.log('%c HISTORY', 'background: #222; color: yellow')
    console.table(tradeHistoryYobit)
    console.log('%c BALANCES', 'background: #222; color: yellow')
    console.table(_yobitBot["balances"])
    console.log('%c ORDERS', 'background: #222; color: yellow')
    console.table(_yobitBot["open-orders"])
    console.log(tradeHistoryYobit.groupBy('Market'))// son 15 kayıt
    console.log(hatalar.groupBy('err'))
    console.log('%c Total Estimated Balance: %s', cssAyar, totalEstBalance);
    console.log('%c Doge Balance: %s', cssAyar, numberWithCommas(dogeBalance));
    console.log('%c Total DOGE: %s', cssAyar, numberWithCommas(toplamBalance));
    console.log('%c Total Ederi: %s', cssAyar, numberWithCommas(tolamEderi));
}

function BalanceUpdateFB(){
    _db.ref('/coinexchange/balances').child(_userName).set(_toplamTutar)
    _db.ref('/coinexchange/balances').once('value', snapshot => {
        var values = snapshot.val()
        var toplam = Object.values(values).reduce((s,c)=>s+c)
        _db.ref('/coinexchange/Toplam').set(toplam)
    });
}

function OrdersUpdateFB(){
    _db.ref('/coinexchange/openOrders').child(_userName).set(_openOrders)
}

function AllBalanceUpdateFB(){
    _db.ref('/coinexchange/allBalances').child(_userName).set(_Balances)
}

async function getYobitHistory(){
    var search = `draw=1&columns%5B0%5D%5Bdata%5D=0&columns%5B0%5D%5Bname%5D=&columns%5B0%5D%5Bsearchable%5D=true&columns%5B0%5D%5Borderable%5D=false&columns%5B0%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B0%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B1%5D%5Bdata%5D=1&columns%5B1%5D%5Bname%5D=&columns%5B1%5D%5Bsearchable%5D=true&columns%5B1%5D%5Borderable%5D=false&columns%5B1%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B1%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B2%5D%5Bdata%5D=2&columns%5B2%5D%5Bname%5D=&columns%5B2%5D%5Bsearchable%5D=true&columns%5B2%5D%5Borderable%5D=false&columns%5B2%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B2%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B3%5D%5Bdata%5D=3&columns%5B3%5D%5Bname%5D=&columns%5B3%5D%5Bsearchable%5D=true&columns%5B3%5D%5Borderable%5D=false&columns%5B3%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B3%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B4%5D%5Bdata%5D=4&columns%5B4%5D%5Bname%5D=&columns%5B4%5D%5Bsearchable%5D=true&columns%5B4%5D%5Borderable%5D=false&columns%5B4%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B4%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B5%5D%5Bdata%5D=5&columns%5B5%5D%5Bname%5D=&columns%5B5%5D%5Bsearchable%5D=true&columns%5B5%5D%5Borderable%5D=false&columns%5B5%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B5%5D%5Bsearch%5D%5Bregex%5D=false&start=0&length=1075&search%5Bvalue%5D=&search%5Bregex%5D=false&action=bids&pair_id=0&currency_id=0&csrf_token=${_yobitCsrf}`
    var params = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}');
    
    var result = []
    await $.post('https://yobit.io/ajax/system_history.php', params).done((data)=>{
        result = data
    }).fail((jqHRX, textStatus, errorThrown)=>{
        console.log(jqHRX, textStatus, errorThrown)
    })

    var yobitHistory = JSON.parse(result)
    var newYobitHistory = yobitHistory.data
    newYobitHistory = newYobitHistory.map(e=> e = {
            Date: e[0], // html den texe çeviriyorum
            Market: $($.parseHTML(e[1])).text().replace(/\//g, '-').replace(/\$/g, '-'), // aynı 
            Type: $($.parseHTML(e[2])).text() == 'SELL' ? 'Sell' : 'Buy',
            Rate: Number(e[3]),
            Amount: Number(e[4]),
            Total: Number(e[5])
        }
    )
    return newYobitHistory
}

async function getYobitOpenOrders(){
    var urlm='https://yobit.io/en/orders/'
    var html = await $.get(urlm)
    _yobitCsrf = $(html).filter("#csrf_token").val()  /// CsrfTokeni Yeniliyoruz. History Icin
    var openOrders = htmlToOpenOrdersArray(html)
    return openOrders
}

async function getYobitBalances(){
    var urlm='https://yobit.io/en/wallets/'
    var html = await $.get(urlm)
    var balances = htmlToBalancesArray(html)
    return balances
}

async function YobitBasla(){
    $("#loginArea").hide();
    $("#sonuclar").show();
    $("#sayac").show();
    var ybtUserId = GetParameterByName('id', document.URL)
    var sayac = 1 
    while (true) {
        $("#sayac").html(sayac);
        await YobitBalanceYenile(ybtUserId).catch(e=> console.log(e))
        await YobitOpenOrdersYenile(ybtUserId).catch(e=> console.log(e))
        await YobitHistoryYenile(ybtUserId).catch(e=> console.log(e))
        _db.ref(`yobit-bot/${_userId}/sayac`).set(sayac)// bu değer her değiştiğinde serverdeki bot marketler için çalışacak. :) 
        sayac++
        if(sayac == 30){
            window.location.reload()
        }
    }
}

async function YobitHistoryYenile(userId){
    var yobitHistory = await getYobitHistory()
    if(yobitHistory.length > 0){
        _db.ref(`yobit-bot/${_userId}/trade-history`).set(yobitHistory.groupBy('Market'))
        console.log(yobitHistory);
    }
}

async function YobitOpenOrdersYenile(userId){
    var openOrders = await getYobitOpenOrders()
    if(openOrders.length > 0){
        _db.ref(`yobit-bot/${_userId}/open-orders`).set(openOrders.groupBy('Market'))
        console.log(openOrders);
    }
}

async function YobitBalanceYenile(userId){
    var balances = await getYobitBalances()
    if(balances.length > 0){
        _db.ref(`yobit-bot/${_userId}/balances`).set(balances)
        console.log(balances);
    }
}

function htmlToOpenOrdersArray(html){
   return $(html).find('#orders_table tr').map(function (i, row) {
        if(i==0){
            return
        }
        return {
            OrderId: row.id.replace('myo_',''),
            TimeStamp: row.cells[0].textContent,
            Market: $($.parseHTML(row.cells[1].textContent)).text().replace(/\//g, '-').replace(/\$/g, '-'),
            Type: $($.parseHTML(row.cells[2].textContent)).text() == 'SELL' ? 'Sell' : 'Buy',
            Rate: Number(row.cells[3].textContent),
            Amount: Number(row.cells[4].textContent),
            Complated: Number(row.cells[5].textContent),
            Total: Number(row.cells[6].textContent),
            Remaining: Number(row.cells[4].textContent) - Number(row.cells[5].textContent),
            GuncelBuyPrice: Number(row.cells[7].textContent),
            Ederi: Number(row.cells[7].textContent) * Number(row.cells[4].textContent)

        }
    // converting the map into an Array:
    }).get();
}

function htmlToBalancesArray(html){
    return $(html).find('#wallets_table tr').map(function (i, row) {
         if(i==0){
             return
         }
         return {
             Symbol: $($.parseHTML(row.cells[0].textContent)).text(),
             Available: Number(row.cells[1].textContent),
             Total: Number(row.cells[1].textContent) + Number(row.cells[3].textContent),
             EstBtc: Number(row.cells[4].textContent),
             Status: 'OK'
         }
     // converting the map into an Array:
     }).get();
 }

async function getYobitMarketNames(symbol) {
    var abc = await $.get('https://yobit.net/api/3/info')
    abc = JSON.parse(abc)
    return Object.keys(abc.pairs).filter(e => e).filter(e => e.includes('_' + symbol)) // örnek: doge marketleri için _doge
}

async function GetYobitMarkets() {
    var symbols = await getYobitMarketNames('doge');
    var coinler = []
    var tickerUrls = []
    symbols.forEach((e, idx, array) => {
        if (coinler.length > 50) {
            tickerUrls.push(coinler)
            coinler = []
        }
        coinler.push(e)
        if (idx === array.length - 1) { // Eğer son kayıt ise
            tickerUrls.push(coinler)
        }
    })
    var yobitUrl = 'https://yobit.net/api/3/ticker/'
    var allMarkets = []
    for (var tickerUrl of tickerUrls) {
        console.log(tickerUrl);

        var url = tickerUrl.join('-')
        var yeniYobitUrl = yobitUrl + url
        console.log(yeniYobitUrl);
        await $.get(yeniYobitUrl).then(markets => {
            Object.keys(markets).forEach(key => {
                var newMrkt = parseTicker(markets[key])
                var guncelMarket = CommonFormat('market', newMrkt)
                allMarkets.push(guncelMarket)
            })
        }).catch(e => {
            console.log(e)
        })
        break;
    }

    this.markets = allMarkets
    return allMarkets
}

function CommonFormat(type, data) {
    switch (type) {
        case 'market':
            return {
                AskPrice: data.ask,
                BidPrice: data.bid,
                High: data.high,
                Label: data.symbol,
                LastPrice: data.last,
                Low: data.low,
                Change: data.change,
                Volume: data.quoteVolume, //BTCVOLUME
            }
            break;
        case 'balance':
            return {
                "Symbol": data.symbol,
                "Total": data.balance.total,
                "Available": data.balance.free,
                "Status": "OK"
            }
            break;
        case 'orderBook':
            // return Object.keys(response).map(key => this.CommonFormat('orderBook', {market: key, orderBook: response[key]}))
            data.orderBook.asks = data.orderBook.asks.map(e => {
                return {
                    Price: e[0],
                    Amount: e[1]
                }
            })
            data.orderBook.bids = data.orderBook.bids.map(e => {
                return {
                    Price: e[0],
                    Amount: e[1]
                }
            })

            return {
                "Market": data.market,
                "Buy": data.orderBook.bids,
                "Sell": data.orderBook.asks,
            }
            break;
        case 'tradeHistory':
            return {
                "TradeId": data.id,
                "Type": data.side.replace(/\b\w/g, l => l.toUpperCase()),
                "Rate": data.price,
                "Amount": data.amount,
            }
            break;
        case 'orders':
            return {
                "OrderId": data.id,
                "Market": data.symbol,
                "Type": data.side.replace(/\b\w/g, l => l.toUpperCase()),
                "Rate": data.price,
                "Amount": data.remaining,
                "Remaining": data.remaining
            }
            break;
        default:
            break;
    }
}

function parseTicker (ticker, market = undefined) {
    var timestamp = ticker['updated'] * 1000;
    var symbol = undefined;
    if (market)
        symbol = market['symbol'];
    return {
        'symbol': symbol,
        'timestamp': timestamp,
        'datetime': timestamp,
        'high': this.safeFloat (ticker, 'high'),
        'low': this.safeFloat (ticker, 'low'),
        'bid': this.safeFloat (ticker, 'buy'),
        'ask': this.safeFloat (ticker, 'sell'),
        'vwap': undefined,
        'open': undefined,
        'close': undefined,
        'first': undefined,
        'last': this.safeFloat (ticker, 'last'),
        'change': undefined,
        'percentage': undefined,
        'average': this.safeFloat (ticker, 'avg'),
        'baseVolume': this.safeFloat (ticker, 'vol_cur'),
        'quoteVolume': this.safeFloat (ticker, 'vol'),
        'info': ticker,
    };
}

// Groupby örneğin : history.groupBy('Market') --> historyi marketlere göre ayırır.
Array.prototype.groupBy = function(prop) {
    return this.reduce(function(groups, item) {
      var val = item[prop]
      groups[val] = groups[val] || []
      groups[val].push(item)
      return groups
    }, {})
}

function LoadMessaging(){
    var messaging = firebase.messaging();
    messaging.usePublicVapidKey("BMp22N-6qaqEo4dFjN_8xuC0zDuHBIAaR2zOCXnp643VC_Myj2LLpWcUWyks84MgeowXplaDvq8MTZlyqBWStNU");
    messaging.requestPermission().then(function() {
        console.log('Notification permission granted.');
        // TODO(developer): Retrieve an Instance ID token for use with FCM.
        // ...
    }).catch(function(err) {
        console.log('Unable to get permission to notify.', err);
    });


    messaging.getToken().then(function(currentToken) {
        if (currentToken) {
            console.log(currentToken)
        } else {
            // Show permission request.
            console.log('No Instance ID token available. Request permission to generate one.');
        }
    }).catch(function(err) {
        console.log('An error occurred while retrieving token. ', err);
    });


    // Callback fired if Instance ID token is updated.
    messaging.onTokenRefresh(function() {
        messaging.getToken().then(function(refreshedToken) {
            console.log('Token refreshed.');
            console.log(refreshedToken);
            //sendTokenToServer(refreshedToken);
        }).catch(function(err) {
            console.log('Unable to retrieve refreshed token ', err);
        });
    });

    messaging.onMessage(function(payload) {
    console.log('Message received. ', payload);
    // ...
    });
}

function BilesenleriCalistir(){
    setTimeout(BackgroundYenile, 1000 * _sayacSuresi);
    YobitInvestKontrol()
    CryWebsocketAcKapa()
    //freecoinBotBasla()
}

function YobitInvestKontrol(){
    // Investbox coinleri ekler
    var search = `draw=1&columns%5B0%5D%5Bdata%5D=0&columns%5B0%5D%5Bname%5D=&columns%5B0%5D%5Bsearchable%5D=true&columns%5B0%5D%5Borderable%5D=false&columns%5B0%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B0%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B1%5D%5Bdata%5D=1&columns%5B1%5D%5Bname%5D=&columns%5B1%5D%5Bsearchable%5D=true&columns%5B1%5D%5Borderable%5D=false&columns%5B1%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B1%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B2%5D%5Bdata%5D=2&columns%5B2%5D%5Bname%5D=&columns%5B2%5D%5Bsearchable%5D=true&columns%5B2%5D%5Borderable%5D=false&columns%5B2%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B2%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B3%5D%5Bdata%5D=3&columns%5B3%5D%5Bname%5D=&columns%5B3%5D%5Bsearchable%5D=true&columns%5B3%5D%5Borderable%5D=false&columns%5B3%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B3%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B4%5D%5Bdata%5D=4&columns%5B4%5D%5Bname%5D=&columns%5B4%5D%5Bsearchable%5D=true&columns%5B4%5D%5Borderable%5D=false&columns%5B4%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B4%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B5%5D%5Bdata%5D=5&columns%5B5%5D%5Bname%5D=&columns%5B5%5D%5Bsearchable%5D=true&columns%5B5%5D%5Borderable%5D=false&columns%5B5%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B5%5D%5Bsearch%5D%5Bregex%5D=false&start=0&length=350&search%5Bvalue%5D=&search%5Bregex%5D=false&action=list_boxes&csrf_token=`
    var params = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}');
    var investBoxUrl = "https://yobit.net/ajax/system_investbox.php"  
    $.post(investBoxUrl, params).done(data => {
            var result = JSON.parse(data);
            result = result.data.map(e=> {
                return {
                    yuzde: e[0],
                    period: e[1],
                    coinName: $($.parseHTML(e[5])).first().text().trim()
                }
            })
            console.log(result);
            _db.ref('/yobit/yatirim').set(result)
    })
}

function freecoinBotBasla(){
    SayfaAcKapa({
        url:'https://freebitco.in/?op=home',
        search: 'https://freebitco.in/*',
        active: false
    });
}

function CryWebsocketAcKapa(){
    SayfaAcKapa({
        url:'https://www.cryptopia.co.nz',
        search: 'https://www.cryptopia.co.nz/*',
        active: true
    });
}

/*
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

var dbRefHasip = firebase.database().ref('/ccx/balances')

dbRefHasip.on('value', snap=>{ console.log(snap.val())})

dbRefHasip.on('child_added', snap=>{ console.log(snap.val())})
dbRefHasip.on('child_changed', snap=>{ console.log(snap.val())})
*/
