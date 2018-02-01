var secilenMarket;
var buySirasi;
var sellSirasi;
var timerim;
var sayacTimer;
var marketOrderBook;
var activeBuy;
var activeSell;
var sayfaKapanmaSuresi = 10
var _sellSirasi = 9 // Sell Sirasi 5 Den büyükse 6 veya üstüyse selii bozar öne alır.

function SayfayiTemizle() {
  console.log("Sayfayi Temizle");

  /*
  $(".row")[2].remove();
  $(".row")[2].remove();
  $(".row")[8].remove();
  $(".row")[8].remove();

  $(".row")[8].remove();
  $(".row")[2].remove();
  $(".row")[4].remove();
  $(".row")[5].remove();
  */

  $(".col-xs-12")[9].remove();
  $(".bottom-alert-box").remove();
  $(".custom-hr-margin").remove();
  $(".float-message").remove();

  $(".trade-table").remove();
  $("#chart-container").remove();
  $("link").remove();
}

function LoadViews() {
  console.log("LoadViews");
  UserMarketOrdersViewModel();
  UserRecentTradesViewModel(); // son işlemler

  var activeMarketOrders = user_market_orders(); // Market Datalarını doldur. Bu foksyion sell ve buy datalarını dolduruyor. user_market_orders(); ve bu fonksiyonla dündürüyor.
  activeBuy = $.grep(activeMarketOrders, function (e) {
    return e.direction == "buy"
  });

  activeSell = $.grep(activeMarketOrders, function (e) {
    return e.direction == "sell"
  });

}

function paneliEkle() {
  $("body").append(`
      <div id='divim' style='padding:20px; width:251px; height:130px; background-color:#8fcaab; color:black; position:fixed; right:0; bottom:0; z-index:999;'>
        <span id="spSayac" style="font-weight:bold;">0</span>
        <div> <span>Durum: </span><span id="spnDurum">Henüz Başlatılmadı</span> </div>
      </div>
      `);
}

async function getBests() {

  SayfayiTemizle();
  LoadViews();

  $.get(
    "/api/v1/getmarketsummary?market_id=" + $("#buy-form #market_id").val(),
    function (data) {
      secilenMarket = data.result;
      paneliEkle();
      DbGuncelle();
      SayaciAktifEt(); // Sayacı Aktif Et
      AlimSatimKontrol();
      setTimeout(SayfayiKapat, 1000 * sayfaKapanmaSuresi) // 1 dakika sonra refresh atılacak
    }
  );
}

function SayfayiKapat() {
  window.close()
}

function SayaciAktifEt() {
  console.log("SayaciAktifEt");
  var sayac = sayfaKapanmaSuresi;
  sayacTimer = setInterval(function () {
    if (sayac < 1) {
      sayac = sayfaKapanmaSuresi;
    }
    $("#spSayac").html(sayac);
    sayac--;
  }, 1000);
}

function DbGuncelle() {
  // Eğer satılacak tutar varsa veritabanına bunu yansıtacak. ve bu coin ile ilgili işlemde olduğunu belli edecek. böylelikle bakcgound.js bu coin sayfasını kapatmayacak. satış bittiğinde de aynı.
  let toplam = 0;
  const sellAmount = parseFloat($("#primary-balance-clickable").html()); // Sell Amount

  if (sellAmount > 0) {
    toplam += sellAmount;
  }

  var activeSellOrder = $.grep(user_market_orders(), function (e) {
    return e.direction == "sell";
  });

  var alimisCoinMiktari = 0;

  if (activeSellOrder.length > 0) {
    alimisCoinMiktari = activeSellOrder[0].quantity;
  }

  toplam += parseFloat(alimisCoinMiktari);

  var marketId = GetParameterByName("marketId");
  var url = "https://keskinmedia.com/apim/changeamount/" + marketId + "/" + toplam;


  $.get(
    url,
    function (data) {
      if (data.result == true) {
        console.log("Tutar güncellendi");
      }
    }
  );

}


function AlimSatimKontrol() {
  console.log("AlimSatimKontrol");
  var orderSellCount = user_sell_order_prices.length;
  var orderBuyCount = user_buy_order_prices.length;

  const sellAmount = parseFloat($("#primary-balance-clickable").html()); // Sell Amount
  const buyAmount = parseFloat($("#secondary-balance-clickable").html()); // Buy Amount

  if (sellAmount > 0) { // sell değeri varsa direk sat.
    if (orderSellCount > 0) {
      SellIptalveRefresh(); // Eğer sell amount 0dan büyük se ve aktif işlem varsa yeni satım yapılmış demek. onuda ekle
    } else {
      sell();
    }
  }

  if (buyAmount > 0) { // bakiyemiz varsa
    if (orderBuyCount < 1) { // aktif buy yoksa buy aç
      buy();
    }
  }

  var type = GetParameterByName("type");
  // TYPE SADECE S İSE BUYU İPTAL EDER. SADECE B İSE SELLİ Yİ İPTAL EDER.
  if (type == "S") {
    BuyIptalveRefresh();
  } else if (type == "B") {
    SellIptalveRefresh();
  }

  OneGecenVarmiKontrol();

}

function getKacinci(saniye) {
  return new Promise(resolve => {
    $.get(
      "/api/v1/getorderbook?market_id=" + $("#buy-form #market_id").val(),
      function (data) {
        marketOrderBook = data.result;

        var result = {
          buySirasi: 0,
          sellSirasi: 0
        }

        if (user_buy_order_prices.length > 0) {
          var secilenBuyPrice = $.grep(marketOrderBook.BuyOrders, function (e) {
            return parseFloat(e.Price) == user_buy_order_prices[0]
          });

          if (secilenBuyPrice && secilenBuyPrice.length > 0) {
            result.buySirasi = marketOrderBook.BuyOrders.indexOf(secilenBuyPrice[0]) + 1;
          }
        }

        if (user_sell_order_prices.length > 0) {
          var secilenSellPrice = $.grep(marketOrderBook.SellOrders, function (e) {
            return parseFloat(e.Price) == user_sell_order_prices[0]
          });

          if (secilenSellPrice && secilenSellPrice.length > 0) {
            result.sellSirasi = marketOrderBook.SellOrders.indexOf(secilenSellPrice[0]) + 1;
          }
        }

        resolve(result)
      }
    );
  })
}


async function OneGecenVarmiKontrol() {
  console.log("OneGecenVarmiKontrol");
  var data = await getKacinci();
  console.log(data);

  // Buy varsa ama var olan buy alım satım farkı yüzdemizden küçükse iptal edilsin.
  var alimSatimYuzdeFarki = Math.round((secilenMarket.AskPrice - secilenMarket.BidPrice) / secilenMarket.BidPrice * 100);

  if (data.buySirasi > 1 || alimSatimYuzdeFarki < 10) {
    BuyIptalveRefresh()
  }

  if (data.sellSirasi > _sellSirasi) {
    SellIptalveUsteKoy()
    return
  }


  if (data.sellSirasi > 1) {
    var result = BuyFarkKontrolSellIcin(data.sellSirasi); // 0 değilse yeni fiyatı gir.
    if (result.yuzde10Fark) { // alım ile satım arasında %10 fark yoksa zaten arkalarda kalmalı. O yüzden iplemi iptal edip öne almaya gerek yok.
      SellIptalveRefresh();
    }
  }


}


function OrantiliBuyAlKontrolu() {
  console.log("OrantiliBuyAlKontrolu");
  var sellAmount = parseFloat($("#primary-balance-clickable").html());
  var orderSellCount = user_sell_order_prices.length;
  var tutar = parseFloat(GetParameterByName("tutar"));

  if (sellAmount > 0 || orderSellCount > 0) { // sell amount 0 dan büyükse yada sell amount 0 dan daha büyükse daha önce alım yapmış
    if (sellAmount > 0) {
      return false; // Sell Amount 0 dan büyükse buy almasın bıraksın bi sell amountu selle koysun. kafa karışmasın. Sell amount boş olduktan sonra hesaplamayı açık orderlerdan alıcaz
    }

    // son buy un pricesini alıyoruz bu örnekte 0.03610202
    var recentTrades = user_recent_trades();
    var recentBuys = $.grep(recentTrades, function (e) {
      return e.trade_direction == "buy"
    });

    var sonBuyPrice = parseFloat(recentBuys[0].trade_price);
    // tutarımızı alıyoruz bu örnekte 10000


    // tutar / sonBuyPrice Yaptığımızda bize girdiğimiz tutar ile ne kadarlık coin alacağımızı gösterir
    var alinacakCoinMiktari = tutar / sonBuyPrice;
    // active sell orderdan elimizde bulunan satın alınmış coinin miktarını alıyoruz
    var activeSellOrder = $.grep(user_market_orders(), function (e) {
      return e.direction == "sell";
    });

    var alimisCoinMiktari = 0;

    if (activeSellOrder.length > 0) {
      alimisCoinMiktari = activeSellOrder[0].quantity;
    }

    // Alınmış coin alınacaktan küçükse almaya devam et ne zamanki 10 bini geçti o zaman dur.
    if (alimisCoinMiktari < alinacakCoinMiktari) {
      var yeniTutar = alinacakCoinMiktari - alimisCoinMiktari;
      // Burada tutar doge değilde diğer coinden girdiği için amounta ekledik. eğer bunu aşağıdaki gibi totale ekleseydik. 3000 doluk değilde 3000 bin diğer coinlik değeri doga yazar alırdı. örnek 3000 god 30 coin ise 30 dogluk alırdı.
      $("#sell-form #inputAmount").val(yeniTutar);
      return true;
    } else {
      return false;
    }


  } else { // sell amount 0 dan büyük değilse zaten daha önce buy almamış devam et.
    // Normal buy girilecek ama tutar doge üzerinden girilecek.
    $("#buy-form #inputTotal").val(tutar);
    return true;
  }

}


function buy() {
  console.log("buy");
  var yuzde = GetParameterByName("yuzde");
  var type = GetParameterByName("type");
  if (type == "S") {
    $("#spnDurum").html("Alış iptal çünkü sadece satış girildi");
    return;
  }

  var alimSatimYuzdeFarki = ((secilenMarket.AskPrice - secilenMarket.BidPrice) / secilenMarket.BidPrice * 100);

  if (alimSatimYuzdeFarki < parseFloat(yuzde)) {
    $("#spnDurum").html("Alış iptal çünkü % farkı " + yuzde + " den küçük. Fark : " + alimSatimYuzdeFarki);
    return;
  }

  if (!OrantiliBuyAlKontrolu()) {
    $("#spnDurum").html("Yeterince buy aldı daha fazla alma. Satış yap. Böylelikle tutar 10 bin girilmişse 10 bin dogelik coin alır ve satana kadar durmaz.satınca iş biter.");
    return;
  }

  $("#spnDurum").html("Alımda");

  orderType = '1';
  var yeniFiyat = parseFloat(secilenMarket.BidPrice) + 0.00000001;
  yeniFiyat = yeniFiyat.toFixed(8);
  $("#buy-form #inputPrice").val(yeniFiyat);
  InputPriceKeyUpBuy();
  confirmOrderSubmitCore();

}

function sell() {
  console.log("sell");
  var tutar = $("#primary-balance-clickable").html() //
  var yuzde = GetParameterByName("yuzde");
  var type = GetParameterByName("type");

  if (type == "B") {
    $("#spnDurum").html("Satış iptal çünkü sadece alış girildi");
    return;
  }


  var result = BuyFarkKontrolSellIcin(); // 0 değilse yeni fiyatı gir.

  var yeniFiyat = 0;

  if (result.yuzde10Fark) { // Alım satıl arasında %10 ve üstü fark varsa normal olarak ekler oda en önde olur.
    yeniFiyat = parseFloat(secilenMarket.AskPrice) - 0.00000001;
    $("#spnDurum").html("Alım satım arasında %10 dan fazla fark var, satış 1. sırada");
  } else {
    // Alım ile satım arasındaki fark %10 dan düşükse  aldığı fiyata %10 ekleyip satışa koyar oda arka sıraya ekler.
    yeniFiyat = result.yeniUcret;
    $("#spnDurum").html("Alım satım arasında %10 fark yok o yüzden %10 ekleyip satışa sürüldü o yüzden satış 1. sırada değil.");
  }

  orderType = '0';
  yeniFiyat = yeniFiyat.toFixed(8);
  $("#sell-form #inputPrice").val(yeniFiyat);
  $("#sell-form #inputAmount").val(tutar);
  InputPriceKeyUpSell();
  confirmOrderSubmitCore();
}

function BuyFarkKontrolSellIcin() {
  console.log("BuyFarkKontrolSellIcin");
  // Zararına Sat : Eğerbu aktifse kaç paraya aldığına bakmaz direk en üste koyar.
  var satacagiFiyat = parseFloat(secilenMarket.AskPrice) - 0.00000001;
  var zararinaSat = GetParameterByName("zararinaSat");

  if (zararinaSat == "A") {
    return result = {
      yuzde10Fark: true, // Eğer öne geçen varsa pazarı boz bu öne geçen varmı kontolü için 
      yeniUcret: satacagiFiyat // Bu sell fonksiyonu için 
    }
  }

  // Bu fonksiyon eğer alım satım arasında %10 ve üstü fark varsa 0 döndürür fark %10 dan düşürse aldıüı fiyata %10 ekler o ücreti döndürür.
  var recentTrades = user_recent_trades();
  var recentBuys = $.grep(recentTrades, function (e) {
    return e.trade_direction == "buy"
  });

  if (!recentBuys[0]) {
    return result = {
      yuzde10Fark: false,
      yeniUcret: satacagiFiyat
    }
  }

  var aldigiFiyat = parseFloat(recentBuys[0].trade_price);

  var alimSatimYuzdeFarki = ((satacagiFiyat - aldigiFiyat) / aldigiFiyat * 100);
  var result = {};

  if (alimSatimYuzdeFarki >= 10) {
    result = {
      yuzde10Fark: true
    }
  } else {
    result = {
      yuzde10Fark: false,
      yeniUcret: aldigiFiyat + (aldigiFiyat / 100 * 10)
    }
  }

  return result;
}

function BuyIptalveRefresh() {

  if (activeBuy.length == 0) {
    return;
  }

  console.log("BuyIptalveRefresh");
  var cancelOrderID = activeBuy[0].order_id;
  $.ajax({
    type: "POST",
    url: Routing.generate('deleteorder'),
    data: "order_id=" + cancelOrderID,
    dataType: 'json',
    timeout: 5000,
    success: function (data, status) {
      window.location.reload();
    }
  });
}

function SellIptalveRefresh() {
  if (activeSell.length == 0) {
    return;
  }

  console.log("SellIptalveRefresh");
  var cancelOrderID = activeSell[0].order_id;

  $.ajax({
    type: "POST",
    url: Routing.generate('deleteorder'),
    data: "order_id=" + cancelOrderID,
    dataType: 'json',
    timeout: 5000,
    success: function (data, status) {
      window.location.reload();
    }
  });
}

function SellIptalveUsteKoy() {
  if (activeSell.length == 0) {
    return;
  }

  console.log("Sell Iptal ve ÜSTE KOY");
  var cancelOrderID = activeSell[0].order_id;
  var yeniFiyat = parseFloat(secilenMarket.AskPrice) - 0.00000001;
  var tutar = activeSell[0].quantity;
  $.ajax({
    type: "POST",
    url: Routing.generate('deleteorder'),
    data: "order_id=" + cancelOrderID,
    dataType: 'json',
    timeout: 5000,
    success: function (data, status) {
      orderType = '0';
      yeniFiyat = yeniFiyat.toFixed(8);
      $("#sell-form #inputPrice").val(yeniFiyat);
      $("#sell-form #inputAmount").val(tutar);
      InputPriceKeyUpSell();
      confirmOrderSubmitCore();
    }
  });
}



function InputPriceKeyUpBuy() {
  console.log("InputPriceKeyUpBuy");
  var b_price = $("#buy-form #inputPrice").val();
  var b_amount = $("#buy-form #inputAmount").val();
  var b_total = $("#buy-form #inputTotal").val();
  b_price = parseFloat(b_price);
  b_amount = parseFloat(b_amount);
  b_total = parseFloat(b_total);
  if (b_price === "" || b_price === 0 || isNaN(b_price)) {
    return;
  }
  if (b_amount !== "" && b_amount !== 0 && !isNaN(b_amount)) {
    updateBuyOrderForm();
  } else {
    if (b_total === "" || b_total === 0 || isNaN(b_total)) {
      return;
    } else {
      b_amount = b_total / b_price;
      $("#buy-form #inputAmount").val(b_amount);
      updateBuyOrderForm();
    }
  }
}

function InputPriceKeyUpSell() {
  console.log("InputPriceKeyUpSell");
  var s_price = $("#sell-form #inputPrice").val();
  var s_amount = $("#sell-form #inputAmount").val();
  var s_total = $("#sell-form #inputTotal").val();
  s_price = parseFloat(s_price);
  s_amount = parseFloat(s_amount);
  s_total = parseFloat(s_total);
  if (s_price === "" || s_price === 0 || isNaN(s_price)) {
    return;
  }
  if (s_amount !== "" && s_amount !== 0 && !isNaN(s_amount)) {
    updateSellOrderForm();
  } else {
    if (s_total === "" || s_total === 0 || isNaN(s_total)) {
      return;
    } else {
      s_amount = s_total / s_price;
      $("#sell-form #inputAmount").val(s_amount);
      updateSellOrderForm();
    }
  }
}

function GetParameterByName(name) {
  console.log("GetParameterByName");
  var url = document.URL;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

getBests();


function AlimveSatimUyumluMu() { // BU FONKSİYON ÇAĞIRILMIYOR.
  console.log("AlimveSatimUyumluMu");
  /*

  SON 5 SAATLİK ALIM VE SATIM ARASINDA
  */

  var recentTrades = user_recent_trades();
  var neKadardanAldi = 0;
  var neKadardanSatti = 0;

  var recentTrades = user_recent_trades();
  var recents = $.grep(recentTrades, function (e) {
    return new Date(e.trade_time) > Date.now() - 1000 * 60 * 60 * 5 // son 5 saat önceki alışsatışları getir.
  });


  var recentBuys = $.grep(recents, function (e) {
    return e.trade_direction == "buy"
  });

  var recentSells = $.grep(recents, function (e) {
    return e.trade_direction == "sell"
  });


  if (recentBuys.length > 0) {
    neKadardanAldi = recentBuys[0].trade_price;
  } else {
    neKadardanAldi = SonBuyDegeriniAl();
  }


}


/*
UserMarketOrdersViewModel()
user_market_orders()
*/