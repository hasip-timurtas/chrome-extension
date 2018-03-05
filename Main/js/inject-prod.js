class InjectProd {
  constructor () { this.secilenMarket, this.marketOrderBook, this.activeBuy, this.activeSell }

  async getBests() {
    this.LoadViews()
    this.secilenMarket = JSON.parse($('body').attr('datam'))
    this.guncelAlimSatimYuzdeFarki = Math.round((this.secilenMarket.AskPrice - this.secilenMarket.BidPrice) / this.secilenMarket.BidPrice * 100)
    this.DbGuncelle()
    this.AlimSatimKontrol()
  }

  LoadViews() {
    UserMarketOrdersViewModel() 
    UserRecentTradesViewModel() // son işlemler
    const activeMarketOrders = user_market_orders() // Market Datalarını doldur. Bu foksyion sell ve buy datalarını dolduruyor. user_market_orders() ve bu fonksiyonla dündürüyor.
    this.activeBuy = $.grep(activeMarketOrders, e => e.direction == 'buy')
    this.activeSell = $.grep(activeMarketOrders, e => e.direction == 'sell')
  }

  async AlimSatimKontrol() {
    const orderSellCount = user_sell_order_prices.length, orderBuyCount = user_buy_order_prices.length, tutar = Number(this.GetParameterByName('tutar')), type = this.GetParameterByName('type')
    const sellAmount = this.secilenMarket.BidPrice *  Number($('#primary-balance-clickable').html())
    const buyAmount = Number($('#secondary-balance-clickable').html()) // Sell ve Buy Amount

    await this.OneGecenVarmiKontrol()

    sellAmount > 0.0001 && orderSellCount > 0 ? this.SellIptalveRefresh() : this.sell() // 1. sell değeri varsa direk sat. ve Eğer sell amount 0dan büyük se ve aktif işlem varsa yeni satım yapılmış demek. onuda ekle
    buyAmount >= tutar && orderBuyCount < 1 && this.buy()  //2. bakiyemiz varsa ve aktif buy yoksa buy aç 
    //3. TYPE SADECE S İSE BUYU İPTAL EDER. SADECE B İSE SELLİ Yİ İPTAL EDER.
    type == 'S' && this.BuyIptalveRefresh()
    type == 'B' && this.SellIptalveRefresh()
  }
    
  GetKacinci() {
    return new Promise(resolve => {
      $.get('/api/v1/getorderbook?market_id=' + $('#buy-form #market_id').val(), data => {
          this.marketOrderBook = data.result
          var result = {buySirasi: 0, ikinciBuyPrice: 0, sellSirasi: 0, ikinciSellPrice: 0}

          if (user_buy_order_prices.length > 0)
            var secilenBuyPrice = $.grep(this.marketOrderBook.BuyOrders, e => Number(e.Price) == user_buy_order_prices[0])
            result.buySirasi = secilenBuyPrice && secilenBuyPrice.length > 0 && this.marketOrderBook.BuyOrders.indexOf(secilenBuyPrice[0]) + 1
            result.ikinciBuyPrice = this.marketOrderBook.BuyOrders[1].Price

          if (user_sell_order_prices.length > 0)
            var secilenSellPrice = $.grep(this.marketOrderBook.SellOrders, e => Number(e.Price) == user_sell_order_prices[0])
            result.sellSirasi = secilenSellPrice && secilenSellPrice.length > 0 && this.marketOrderBook.SellOrders.indexOf(secilenSellPrice[0]) + 1
            result.ikinciSellPrice = this.marketOrderBook.SellOrders[0].Price

          resolve(result)
        }
      )
    })
  }

  async OneGecenVarmiKontrol() {
    var data = await this.GetKacinci()

    // Buy 1. sırada değilse veya. Buy 1. sıradaysa ve bir önceki buy ile arasında 1 satoshi fark yoksa buy boz ve iptal. Birdahakinde düzgün kuracaktır.
    // Cancel buy veya Sell de bekleme yapılabilir bi 10 saniye felan, Bir sonraki değeri düzgün getirsin diye.
    data.buySirasi > 1 || (data.buySirasi == 1 && user_buy_order_prices[0] - data.ikinciBuyPrice != 0.00000001) && await this.BuyIptalveRefresh("1 Satoshi fark buy boz refresh")
    data.sellSirasi == 1 && data.ikinciSellPrice - user_sell_order_prices[0] != 0.00000001 && await this.SellIptalveRefresh("1 Satoshi fark SELL boz refresh")
    if (data.sellSirasi > 1) {
      var result = this.BuyFarkKontrolSellIcin(data.sellSirasi) // 0 değilse yeni fiyatı gir.
      if (result.yuzde10Fark) { // alım ile satım arasında %10 fark yoksa zaten arkalarda kalmalı. O yüzden iplemi iptal edip öne almaya gerek yok.
        await this.SellIptalveRefresh()
      }
    }
  }

  OrantiliBuyAlKontrolu() {
    const sellAmount = this.secilenMarket.BidPrice *  Number($('#primary-balance-clickable').html())
    var orderSellCount = user_sell_order_prices.length
    var tutar = Number(this.GetParameterByName('tutar'))

    if (sellAmount > 0.0001 || orderSellCount > 0) { // sell amount 0 dan büyükse yada sell amount 0 dan daha büyükse daha önce alım yapmış
      if (sellAmount > 0.0001) {
        return false // Sell Amount 0 dan büyükse buy almasın bıraksın bi sell amountu selle koysun. kafa karışmasın. Sell amount boş olduktan sonra hesaplamayı açık orderlerdan alıcaz
      }

      // son buy un pricesini alıyoruz bu örnekte 0.03610202
      var recentTrades = user_recent_trades()
      var recentBuys = $.grep(recentTrades, e => e.trade_direction == 'buy')

      var sonBuyPrice = Number(recentBuys[0].trade_price)
      // tutarımızı alıyoruz bu örnekte 10000

      // tutar / sonBuyPrice Yaptığımızda bize girdiğimiz tutar ile ne kadarlık coin alacağımızı gösterir
      var alinacakCoinMiktari = tutar / sonBuyPrice
      // active sell orderdan elimizde bulunan satın alınmış coinin miktarını alıyoruz
  
      var alimisCoinMiktari = this.activeSell.length > 0 ? this.activeSell[0].quantity : 0

      // Alınmış coin alınacaktan küçükse almaya devam et ne zamanki 10 bini geçti o zaman dur.
      if (alimisCoinMiktari < alinacakCoinMiktari) {
        var yeniTutar = alinacakCoinMiktari - alimisCoinMiktari
        // Burada tutar doge değilde diğer coinden girdiği için amounta ekledik. eğer bunu aşağıdaki gibi totale ekleseydik. 3000 doluk değilde 3000 bin diğer coinlik değeri doga yazar alırdı. örnek 3000 god 30 coin ise 30 dogluk alırdı.
        $('#sell-form #inputAmount').val(yeniTutar)
        return true
      } else {
        return false
      }


    } else { // sell amount 0 dan büyük değilse zaten daha önce buy almamış devam et.
      // Normal buy girilecek ama tutar doge üzerinden girilecek.
      $('#buy-form #inputTotal').val(tutar)
      return true
    }

  }

  buy() {
    console.log('buy')
    var yuzde = this.GetParameterByName('yuzde')
    var type = this.GetParameterByName('type')
    if (type == 'S') {
      console.log('Alış iptal çünkü sadece satış girildi')
      return
    }

    if (this.guncelAlimSatimYuzdeFarki < parseFloat(yuzde)) {
      console.log('Alış iptal çünkü % farkı ' + yuzde + ' den küçük. Fark : ' + this.guncelAlimSatimYuzdeFarki)
      return
    }

    if (!this.OrantiliBuyAlKontrolu()) {
      console.log('Yeterince buy aldı daha fazla alma. Satış yap. Böylelikle tutar 10 bin girilmişse 10 bin dogelik coin alır ve satana kadar durmaz.satınca iş biter.')
      return
    }

    console.log('Alımda')

    orderType = '1'
    var yeniFiyat = parseFloat(this.secilenMarket.BidPrice) + 0.00000001
    yeniFiyat = yeniFiyat.toFixed(8)
    $('#buy-form #inputPrice').val(yeniFiyat)
    this.InputPriceKeyUpBuy()
    confirmOrderSubmitCore()
  }

  sell() {
    console.log('sell')
    var tutar = $('#primary-balance-clickable').html() //
    var type = this.GetParameterByName('type')

    if (type == 'B') {
      console.log('Satış iptal çünkü sadece alış girildi')
      return
    }


    var result = this.BuyFarkKontrolSellIcin() // 0 değilse yeni fiyatı gir.

    var yeniFiyat = 0

    if (result.yuzde10Fark) { // Alım satıl arasında %10 ve üstü fark varsa normal olarak ekler oda en önde olur.
      yeniFiyat = parseFloat(this.secilenMarket.AskPrice) - 0.00000001
      console.log('Alım satım arasında %10 dan fazla fark var, satış 1. sırada')
    } else {
      // Alım ile satım arasındaki fark %10 dan düşükse  aldığı fiyata %10 ekleyip satışa koyar oda arka sıraya ekler.
      yeniFiyat = result.yeniUcret
      console.log('Alım satım arasında %10 fark yok o yüzden %10 ekleyip satışa sürüldü o yüzden satış 1. sırada değil.')
    }

    orderType = '0'
    yeniFiyat = yeniFiyat.toFixed(8)
    $('#sell-form #inputPrice').val(yeniFiyat)
    $('#sell-form #inputAmount').val(tutar)
    this.InputPriceKeyUpSell()
    confirmOrderSubmitCore()
  }

  BuyFarkKontrolSellIcin() {
    console.log('BuyFarkKontrolSellIcin')
    var yuzde = Number(this.GetParameterByName('yuzde')) / 3 * 2  // 3 te 2 si fiyatına pazara koyacak.
    // Zararına Sat : Eğerbu aktifse kaç paraya aldığına bakmaz direk en üste koyar.
    var satacagiFiyat = parseFloat(this.secilenMarket.AskPrice) - 0.00000001
    var zararinaSat = this.GetParameterByName('zararinaSat')

    if (zararinaSat == 'A') {
      return {
        yuzde10Fark: true, // Eğer öne geçen varsa pazarı boz bu öne geçen varmı kontolü için 
        yeniUcret: satacagiFiyat // Bu sell fonksiyonu için 
      }
    }

  // ###### Eğer last buy boşsa en üste koyar satar.
    var recentTrades = user_recent_trades()
    var recentBuys = $.grep(recentTrades, function (e) {
      return e.trade_direction == 'buy'
    })

    if (!recentBuys[0]) {
      return {
        yuzde10Fark: false,
        yeniUcret: satacagiFiyat
      }
    }


    var aldigiFiyat = parseFloat(recentBuys[0].trade_price)

    var alimSatimYuzdeFarki = ((satacagiFiyat - aldigiFiyat) / aldigiFiyat * 100)

    if (alimSatimYuzdeFarki >= yuzde ) {
      return {
        yuzde10Fark: true
      }
    } else {
      return {
        yuzde10Fark: false,
        yeniUcret: aldigiFiyat + (aldigiFiyat / 100 * yuzde)
      }
    }
  }

  async BuyIptalveRefresh() {

    if (this.activeBuy.length == 0) {
      return
    }

    console.log('BuyIptalveRefresh')
    var cancelOrderID = this.activeBuy[0].order_id
    $.ajax({
      type: 'POST',
      url: Routing.generate('deleteorder'),
      data: 'order_id=' + cancelOrderID,
      dataType: 'json',
      timeout: 5000,
      success: async function (data, status) {
        await this.sleep(20)
        window.location.reload()
      }
    })
  }

  async SellIptalveRefresh() {
    if (this.activeSell.length == 0) {
      return
    }

    console.log('SellIptalveRefresh')
    var cancelOrderID = this.activeSell[0].order_id

    $.ajax({
      type: 'POST',
      url: Routing.generate('deleteorder'),
      data: 'order_id=' + cancelOrderID,
      dataType: 'json',
      timeout: 5000,
      success: async function (data, status) {
        await this.sleep(20)
        window.location.reload()
      }
    })
  }

  DbGuncelle() {
    // Eğer satılacak tutar varsa veritabanına bunu yansıtacak. ve bu coin ile ilgili işlemde olduğunu belli edecek. böylelikle bakcgound.js bu coin sayfasını kapatmayacak. satış bittiğinde de aynı.
    let toplam = 0
    const sellAmount = parseFloat($('#primary-balance-clickable').html()) // Sell Amount

    if (sellAmount > 0) {
      toplam += sellAmount
    }

    var alimisCoinMiktari = 0

    if (this.activeSell.length > 0) {
      alimisCoinMiktari = this.activeSell[0].quantity
    }

    toplam += parseFloat(alimisCoinMiktari)

    var marketId = this.GetParameterByName('marketId')
    var url = 'https://keskinmedia.com/apim/changeamount/' + marketId + '/' + toplam


    $.get(url,
      function (data) {
        if (data.result == true) {
          console.log('Tutar güncellendi')
        }
      }
    )
  }

  InputPriceKeyUpBuy() {
    console.log('InputPriceKeyUpBuy')
    var b_price = $('#buy-form #inputPrice').val()
    var b_amount = $('#buy-form #inputAmount').val()
    var b_total = $('#buy-form #inputTotal').val()
    b_price = parseFloat(b_price)
    b_amount = parseFloat(b_amount)
    b_total = parseFloat(b_total)
    if (b_price === '' || b_price === 0 || isNaN(b_price)) {
      return
    }
    if (b_amount !== '' && b_amount !== 0 && !isNaN(b_amount)) {
      updateBuyOrderForm()
    } else {
      if (b_total === '' || b_total === 0 || isNaN(b_total)) {
        return
      } else {
        b_amount = b_total / b_price
        $('#buy-form #inputAmount').val(b_amount)
        updateBuyOrderForm()
      }
    }
  }

  InputPriceKeyUpSell() {
    console.log('InputPriceKeyUpSell')
    var s_price = $('#sell-form #inputPrice').val()
    var s_amount = $('#sell-form #inputAmount').val()
    var s_total = $('#sell-form #inputTotal').val()
    s_price = parseFloat(s_price)
    s_amount = parseFloat(s_amount)
    s_total = parseFloat(s_total)
    if (s_price === '' || s_price === 0 || isNaN(s_price)) {
      return
    }
    if (s_amount !== '' && s_amount !== 0 && !isNaN(s_amount)) {
      updateSellOrderForm()
    } else {
      if (s_total === '' || s_total === 0 || isNaN(s_total)) {
        return
      } else {
        s_amount = s_total / s_price
        $('#sell-form #inputAmount').val(s_amount)
        updateSellOrderForm()
      }
    }
  }

  GetParameterByName(name) {
    console.log('GetParameterByName')
    var url = document.URL
    name = name.replace(/[\[\]]/g, '\\$&')
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url)
    if (!results) return null
    if (!results[2]) return ''
    return decodeURIComponent(results[2].replace(/\+/g, ' '))
  }

  AlimveSatimUyumluMu() { // BU FONKSİYON ÇAĞIRILMIYOR.
    console.log('AlimveSatimUyumluMu')
    /*

    SON 5 SAATLİK ALIM VE SATIM ARASINDA
    */

    var recentTrades = user_recent_trades()
    var neKadardanAldi = 0
    var neKadardanSatti = 0

    var recentTrades = user_recent_trades()
    var recents = $.grep(recentTrades, function (e) {
      return new Date(e.trade_time) > Date.now() - 1000 * 60 * 60 * 5 // son 5 saat önceki alışsatışları getir.
    })


    var recentBuys = $.grep(recents, function (e) {
      return e.trade_direction == 'buy'
    })

    var recentSells = $.grep(recents, function (e) {
      return e.trade_direction == 'sell'
    })


    if (recentBuys.length > 0) {
      neKadardanAldi = recentBuys[0].trade_price
    } else {
      neKadardanAldi = this.SonBuyDegeriniAl()
    }
  }

  sleep(saniye) {
    return new Promise(resolve => setTimeout(resolve, saniye * 1000)) // saniyeyi 1000 e çarptım milisaniye ile çalışıyor çünkü
  }
}

var injectProd = new InjectProd()
 
injectProd.getBests()

