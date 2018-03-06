var _access_token = "8f03c10593f0abadef0b3084ba560826";
var _sayacSuresi = 30;
var _isPaused = false

var secilenMarket;
var _login = false;
var _userId;
var _openOrders = [];
var _toplamTutar = 0
const chromep = new ChromePromise();
var _appId = chrome.runtime.id;
var _marketOzetler = []
var _kontroleUyanlar = []
var _userDbMarketler =[]

function UygulamayiBaslat() {
  _isPaused = false
}

function UygulamayiDurdur() {
  _isPaused = true
}

chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo, tab) {
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

    if (tab.url.includes("/orders")) {
      if (!tab.url.includes("appId")) {
        chrome.tabs.update(tab.id, { url: "https://www.coinexchange.io/orders/page/1?appId=" + _appId })
      }

      chrome.tabs.executeScript(tabId, {
        code: "var i = document.createElement('script'); i.src='https://keskinmedia.com/api/orders.js?v='+ Math.random(); document.head.appendChild(i);",
        runAt: "document_end"
      });
    }

    if (tab.url.includes("/balances")) {
      await TradeHistoryKapatac()
      await sleep(2)
      chrome.tabs.executeScript(tabId, {
        code: `var toplamTutar = ${_toplamTutar};
var balancem = Number($("td:contains('Dogecoin')")[0].parentElement.children[2].innerText);
var aciklama = $("h3:contains('Account Balances:')").html();
var toplam = toplamTutar + balancem
        $("h3:contains('Account Balances:')").html(aciklama + "<br> balance: " + balancem + "<br>order tutar: " + toplamTutar+"<br> Toplam: "+toplam)`,
        runAt: "document_end"
      });
    }
  }

  if (_userId && tab.url.includes("https://www.coinexchange.io/") && changeInfo.status === "complete") {
    if (tab.url.includes('market/') && tab.url.includes('?tutar')) {
      // Marketler İçin
      /*
      chrome.tabs.executeScript(tabId, {
        code: "document.documentElement.style.display='none';",
        runAt: "document_start"
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
        _login = true  // login sayfasına 1 defa gitmesi yeterli.
        LogoutBildir();
      }
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
  }, function (tabs) {
    tabs.forEach(function (tab) {
      chrome.tabs.remove(tab.id);
    });
  });

  const loginSayfasiniAc = () => {
    chrome.tabs.query({
      url: "https://www.coinexchange.io/*"
    }, function (tabs) {
      tabs.forEach(function (tab) {
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


const SendSms = async () => {
  //  http://keskinmedia.com/apim/sendlogout/2/8f03c10593f0abadef0b3084ba560826
  var url = "http://keskinmedia.com/apim/sendlogout/";
  url += _userId;
  url += "/";
  url += _access_token;

  await axios(url);

  loginSayfasiniAc();
}

$(document).ready(function () {
  $("body").load('https://keskinmedia.com/api/background.php', function (data) {
    var user = window.location.search.split('?')[1];
    if (user == "-k") {
      $("#name").val("kari");
      $("#pass").val("12345");
      LoginCheck();
    } else if (user == "h") {
      $("#name").val("hasip");
      $("#pass").val("123456");
      LoginCheck();
    } else if (user == "m") {
      $("#name").val("musa");
      $("#pass").val("12345678");
      LoginCheck();
    }

    $("#btnLogin").click(function () {
      LoginCheck();
    })

    $("#name").keyup(function () {
      _userId = $("#name").val();
      console.log(_userId);
    });
  });
});

function SayaciAktifEt() {
  var sayac = _sayacSuresi;
  setInterval(function () {
    if (!_isPaused) {
      if (sayac < 1) {
        sayac = _sayacSuresi;
      }
      $("#sayac").html(sayac);
      sayac--;
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

function Basla() {
  GetMarkets(); // With UserName
  SayaciAktifEt();
  HataliSayfaKontrolSayaci();
  setInterval(GetMarkets, 1000 * _sayacSuresi);
}

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

async function KontroleUyan(markets) { // DB dekileri çektik bunların arasında yüzde koşuluna uyanları eleyip öyle tabları açıcaz.

  var summariesUrl = "https://www.coinexchange.io/api/v1/getmarketsummaries";

  var resultSum = await axios(summariesUrl);
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

  var getMarketsUrl = 'https://www.coinexchange.io/api/v1/getmarkets'
  var resultMarkets = await axios(getMarketsUrl);
  var markets = resultMarkets.data.result.filter(e=> e.BaseCurrencyCode =="DOGE");
  var summariesUrl = "https://www.coinexchange.io/api/v1/getmarketsummaries";

  var resultSum = await axios(summariesUrl);
  _marketOzetler = resultSum.data.result;

  _userDbMarketler = markets.filter(e => {
    var guncelMarket = _marketOzetler.find(mo => mo.MarketID == e.MarketID)
    if(!guncelMarket){
      return false
    }
    
    e.name = e.MarketAssetCode + "/" + e.BaseCurrencyCode;
    e.tutar = 10000, e.type = 'SA', e.userId = 5, e.status='A', e.marketId=e.MarketID, e.zararinaSat='D'

    e.guncelMarket = guncelMarket
    e.guncelYuzde = Math.round(((guncelMarket.AskPrice - guncelMarket.BidPrice) / guncelMarket.BidPrice * 100))
    return guncelMarket.MarketID == e.MarketID
  })

  _kontroleUyanlar = _userDbMarketler.filter(e => {
    e.yuzde= 10

    if (e.guncelMarket.Volume >= 1000000) {
      e.tutar = e.tutar * 1.9
      e.yuzde = e.yuzde * 0.5
    } else if (e.guncelMarket.Volume >= 200000) {
      e.tutar = e.tutar * 1.4
      e.yuzde = e.yuzde * 0.7
    } else if (e.guncelMarket.Volume >= 100000) {
      e.tutar = e.tutar
      e.yuzde = e.yuzde * 0.7
    } else if (e.guncelMarket.Volume >= 50000) {
      e.tutar = e.tutar * 0.5
      e.yuzde = e.yuzde
    } 

   if (_openOrders.includes(e.name)) { // Open ordersta bu market varsa direk al
      return true
   }

   if(e.guncelMarket.Volume < 50000){
    return false
   }
    
    return e.guncelYuzde >= Number(e.yuzde)
  })

  _kontroleUyanlar.sort((a, b) => b.guncelMarket.Volume - a.guncelMarket.Volume)
  return _kontroleUyanlar;
}


async function GetMarkets() {
  if (!_isPaused) {// pause edilmemişse gir
    ButunSayfalariYenile()
    if(_userId== 5 ){ // For doge
      var markets = await KontroleUyanDoge()
      TabKontrol(markets);
    }else{
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


function ButunSayfalariYenile() {
  chrome.tabs.query({
    url: "https://www.coinexchange.io/market/*/*?*"
  }, function (tabs) {
    SayfalariYenile(tabs)
  });
}

async function SayfalariYenile(tabs) {
  for (const tab of tabs) {
    await sleep(2) // 1 ila 20 saniye arasında bekler 
    chrome.tabs.reload(tab.id);
  }
}


async function TabKontrol(dbMarkets) {
  // https://www.coinexchange.io/market/SHND/DOGE?tutar=12345&type=S&yuzde=20
  TradeHistoryKapatac();
  await sleep(8)
  if (_isPaused) {
    return
  }
  chrome.tabs.query({
    url: "https://www.coinexchange.io/market/*/*?*"
  }, function (tabs) {
    TabiDbdekilerdeArat(tabs, dbMarkets);
    DbdekileriTabdaArat(dbMarkets, tabs)
  });
}

function TradeHistoryKapatac() {
  const yeniHistoryAc = () => {
    chrome.tabs.create({
      active: false,
      url: `https://www.coinexchange.io/orders/page/1?&appId=${_appId}`
    });
  }

  chrome.tabs.query({
    url: "https://www.coinexchange.io/orders/page/*"
  }, function (tabs) {
    if(tabs.length==0){
      yeniHistoryAc();
    }

    for (const tab of tabs) {
      chrome.tabs.reload(tab.id);
    }
    
  });
}

async function TabiDbdekilerdeArat(tabs, dbMarkets) {

  for (const tab of tabs) {
    var tabMarket = GetMarketInfoFromUrl(tab.url);
    // tabın dbdekiler içinde ismi ile aranması
    var markets = $.grep(dbMarkets, function (e) {
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
    var tabMarkets = $.grep(tabs, function (e) {
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

  return {name,tutar,type,yuzde};
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
    return function () {
      chrome.tabs.executeScript(tabId, injectDetails, innerCallback);
    };
  }

  var callback = null;

  for (var i = injectDetailsArray.length - 1; i >= 0; --i)
    callback = createCallback(tabId, injectDetailsArray[i], callback);

  if (callback !== null)
    callback();   // execute outermost function
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
      openOrdersDataGuncelle(request)  // Open ordersi sayfası açıldığında buraya open odersları gönderir.
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



