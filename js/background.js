var _access_token = "8f03c10593f0abadef0b3084ba560826";
var _sayacSuresi = 15;
var _isPaused = false

var secilenMarket;
var _login = false;
var _userId;


chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (tab.url.indexOf("https://www.coinexchange.io/") > -1 && changeInfo.status === "complete") {

    if (tab.url.split('?')[1] !== undefined) {
      // Marketler İçin
      chrome.tabs.executeScript(tabId, {
        code: "var i = document.createElement('script'); i.id='ipSc'; i.src = 'https://keskinmedia.com/api/inject-prod.js?v='+ Math.random(); document.head.appendChild(i);",
        runAt: "document_end"
      });
      console.log("Site coinexchange ve ? dan sonrası varsa");
    }

    if (tab.url.split("/")[3] == "trades") {
      chrome.tabs.executeScript(tabId, {
        code: "setTimeout('window.location.reload()', 1000 * 200)",
        runAt: "document_end"
      });

      console.log("Site coinexchange ve trades ise");
    }

    if (tab.url.split("/")[3] == "balances") {

      _isPaused = false // Balance Sayfasına giderse kaldığıyerden devam et.
      console.log("Timer Kaldığı Yerden devam ediyor.")
    }

    if (tab.url.split("/")[3] == "login") {

      LogoutBildir();
      console.log("Site coinexchange ve Login");
    }

    /*
    if (tab.url.split("/")[3] == "login#noreload") {
      chrome.tabs.executeScript(tabId, {
        code: `setTimeout("setTimeout("document.getElementById('username').click(); document.getElementById('password').click(); document.getElementById('remember_me').checked = true; document.getElementById('_submit').click();", 1000 * 5)`,
        runAt: "document_end"
      });
    }

*/

  }
});




async function LogoutBildir() {

  _isPaused = true

  const SendSms = async () => {
    //  http://keskinmedia.com/apim/sendlogout/2/8f03c10593f0abadef0b3084ba560826
    var url = "http://keskinmedia.com/apim/sendlogout/";
    url += _userId;
    url += "/";
    url += _access_token;

    await axios(url);

    chrome.tabs.create({
      active: true,
      url: "https://www.coinexchange.io/login#noreload"
    });
  }

  setTimeout(SendSms, 1000 * 60);

  chrome.tabs.query({
    url: "https://www.coinexchange.io/market/*/*?*"
  }, function (tabs) {
    tabs.forEach(function (tab) {
      chrome.tabs.remove(tab.id);
    });
  });

  /*
    chrome.tabs.query({
      url: "https://www.coinexchange.io/login"
    }, function (tabs) {
      tabs.forEach(function (tab) {
        chrome.tabs.remove(tab.id);
      });
    });
  */
  chrome.tabs.query({
    url: "https://www.coinexchange.io/trades/*"
  }, function (tabs) {
    tabs.forEach(function (tab) {
      chrome.tabs.remove(tab.id);
    });
  });
}

$(document).ready(function () {
  $("body").load('https://keskinmedia.com/api/background.php', function (data) {
    var user = window.location.search.split('?')[1];
    if (user == "k") {
      $("#name").val("kari");
      $("#pass").val("12345");
      LoginCheck();
    } else if (user == "h") {
      $("#name").val("hasip");
      $("#pass").val("123456");
      LoginCheck();
    }

    $("#btnLogin").click(function () {
      LoginCheck();
    })
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

function Basla() {
  GetMarkets(); // With UserName
  SayaciAktifEt();
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
    if (userName == "musa") {
      // Eğer test ise bütün uygun coinleri gir. DB de olmayanları.

    } else {
      Basla();
    }
  }
}

async function KontroleUyan(markets) { // DB dekileri çektik bunların arasında yüzde koşuluna uyanları eleyip öyle tabları açıcaz.

  var summariesUrl = "https://www.coinexchange.io/api/v1/getmarketsummaries";

  var resultSum = await axios(summariesUrl);
  var marketOzetler = resultSum.data.result;

  const findInSummaries = (market) => {
    return $.grep(marketOzetler, function (e) {
      if (e.MarketID == market.marketId && parseFloat(market.amount) > 0.00001) { // Amount 0 dan büyükse direk bunu döndür. satmak için.
        return true
      }
      return e.MarketID == market.marketId && ((e.AskPrice - e.BidPrice) / e.BidPrice * 100) >= parseFloat(market.yuzde) && market.type != 'S'
    }).length > 0;
  }

  var kontroleUyanlar = $.grep(markets, function (e) {
    return findInSummaries(e);
  });

  return kontroleUyanlar;
}

async function GetMarkets() {
  if (!_isPaused) {// pause edilmemişse gir
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

function TabKontrol(dbMarkets) {
  // https://www.coinexchange.io/market/SHND/DOGE?tutar=12345&type=S&yuzde=20
  TradeHistoryKapatac();
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
      url: 'https://www.coinexchange.io/trades/page/1'
    });
  }

  chrome.tabs.query({
    url: "https://www.coinexchange.io/trades/page/*"
  }, function (tabs) {
    if (tabs.length == 0) {
      yeniHistoryAc();
    }
  });



}

function TabiDbdekilerdeArat(tabs, dbMarkets) {

  tabs.forEach(function (tab) {

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
      CreateMarketTab(market);
    }
  });
}


function DbdekileriTabdaArat(dbMarkets, tabs) {
  dbMarkets.forEach(function (dbMarket) {
    // dbdeki Marketin tablar içinde aranması
    var tabMarkets = $.grep(tabs, function (e) {
      var tabMarket = GetMarketInfoFromUrl(e.url);
      return tabMarket.name == dbMarket.name
    });

    if (tabMarkets.length == 0) {
      CreateMarketTab(dbMarket);
    }

  });
}


async function CreateMarketTab(market) {
  var randomSaniye = Math.floor(Math.random() * _sayacSuresi - 10) + 1;
  // Yeni tab açmadan önce 1 ile 10 saniye arası bekler. Bunun amacı 10 tane kayıt varsa aynı anda açmaması için.
  //  aynı anda açarsa bütün işlemler aynı anda yapılır. buda botu belli eder.
  // await sleep(randomSaniye);
  chrome.tabs.create({
    active: false,
    url: 'https://www.coinexchange.io/market/' + market.name + "?tutar=" + market.tutar + "&type=" + market.type + "&yuzde=" + market.yuzde + "&userId=" + _userId + "&marketId=" + market.id
  });
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

function LoadMarketsForHasip() {
  /*
  marketler = [{
      name: "name",
      tutar = 1234,
      type = 'SB',
      yuzde = 10
    },
    {
      name: "name",
      tutar = 1234,
      type = 'SB',
      yuzde = 10
    },
  ]
  */
  return marketler;
}

function sleep(saniye) {
  return new Promise(resolve => setTimeout(resolve, saniye * 1000)); // saniyeyi 1000 e çarptım milisaniye ile çalışıyor çünkü
}
