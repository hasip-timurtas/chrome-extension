class InjectProd {
  constructor () { this.secilenMarket, this.marketOrderBook, this.activeBuy, this.activeSell }

  async getBests() {
    this.LoadViews()
    this.userId = this.GetParameterByName('userId')
    this.marketName = document.URL.split('/')[4]+ '/'+document.URL.split('/')[5].split('?')[0]
    this.userName = this.userId  == 2 ? 'hasip4441' : this.userId  == 5 ? 'karita' : 'musa'
    var marketSum = await $.get("/api/v1/getmarketsummary?market_id=" + $("#buy-form #market_id").val()).then()
    this.secilenMarket = marketSum.result // JSON.parse($('body').attr('datam'))
    this.guncelAlimSatimYuzdeFarki = Math.round((this.secilenMarket.AskPrice - this.secilenMarket.BidPrice) / this.secilenMarket.BidPrice * 100)
    this.bizimTutarin3te1i = Number(this.GetParameterByName('yuzde')) / 3 * 1
    this.DbGuncelle()
    this.AlimSatimKontrol()
  }

  LoadViews() {
    UserMarketOrdersViewModel() 
    UserRecentTradesViewModel() // son işlemler
    const activeMarketOrders = user_market_orders() // Market Datalarını doldur. Bu foksyion sell ve buy datalarını dolduruyor. user_market_orders() ve bu fonksiyonla dündürüyor.
    this.activeBuy = activeMarketOrders.filter(e=> e.direction == 'buy')
    this.activeSell = activeMarketOrders.filter(e=> e.direction== 'sell') //$.grep(activeMarketOrders, e => e.direction == 'sell')

    var recentTrades = user_recent_trades()

    this.recentBuys = recentTrades.filter(e=>e.trade_direction == "buy")
    this.recentSells = recentTrades.filter(e=>e.trade_direction == "sell")
    this.sonBuyPrice = Number(this.recentBuys.length && this.recentBuys[0].trade_price)
    
  }

  async AlimSatimKontrol() {
    const orderSellCount = user_sell_order_prices.length, 
    orderBuyCount = user_buy_order_prices.length, 
    tutar = Number(this.GetParameterByName('tutar')), 
    type = this.GetParameterByName('type')
    const sellAmount = this.secilenMarket.BidPrice *  Number($('#primary-balance-clickable').html())
    const buyAmount = Number($('#secondary-balance-clickable').html()) // Sell ve Buy Amount

    // Returnların amacı her refresh te 1 tane işlem yapsın yoksa karışıyor.
    if(type == 'S') {
      await this.BuyIptalveRefresh()
    } 

    if(type == 'B') {
      await this.SellIptalveRefresh()
    } 

    // 1. sell değeri varsa direk sat
    if(sellAmount > 0.0001){
     // Eğer sell amount 0dan büyük se ve aktif işlem varsa yeni satım yapılmış demek. onuda ekle
      if(orderSellCount > 0){
        await this.SellIptalveRefresh()
        return
      } else {
        var result = await this.sell()
        if(result){
          return
        }
      }
    }

    //2. bakiyemiz varsa ve aktif buy yoksa buy aç 
    if(buyAmount >= tutar && orderBuyCount < 1){
      var result = await this.buy()
      if(result){
        return
      }
    }

    await this.OneGecenVarmiKontrol()
  }
    
  async GetKacinci() {
    var marketId = $('#buy-form #market_id').val()
    var data = await $.get('/api/v1/getorderbook?market_id=' + marketId).then()
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

    return result
  }

  async OneGecenVarmiKontrol() {
    console.log("Öne geçen varmı kontrol")
    var data = await this.GetKacinci()

    if (data.buySirasi > 1) {
      return this.OndekiTutarKontrolu('BuyOrders', data.buySirasi)
    }

    if (data.sellSirasi > 1) {
      if (this.SellBozsunMu()) { // alım ile satım arasında %10 fark yoksa zaten arkalarda kalmalı. O yüzden iplemi iptal edip öne almaya gerek yok.
        return this.OndekiTutarKontrolu('SellOrders', data.sellSirasi)
        //return this.SellIptalveRefresh()
      }
    }

    this.BirSatoshiFarkKontrol(data)
  }

  OndekiTutarKontrolu(type, sira){
    var ilkinTutari = this.marketOrderBook[type][0].Quantity * this.marketOrderBook[type][0].Price // Burası 1. sıradaki buy un tutarı yani kaç dogelik pazar kurmuş eğerki 1000 dogenin altındaysa önüne geçme
    var ilkVeIkincininTutari = ilkinTutari + this.marketOrderBook[type][1].Quantity * this.marketOrderBook[type][1].Price // Burası 1. sıradaki buy un tutarı yani kaç dogelik pazar kurmuş eğerki 1000 dogenin altındaysa önüne geçme
    var ilkIkiVeUcuncununTutari = ilkVeIkincininTutari + this.marketOrderBook[type][2].Quantity * this.marketOrderBook[type][2].Price

    if (sira == 2 && ilkinTutari < this.bizimTutarin3te1i) {
        // 2. sıradaysa ve ilk orderin tutarı bizimkinin 3te1inden düşükse kalsın. bu ilerde %5 te olabilir.
    } else if (sira == 3 && ilkVeIkincininTutari < this.bizimTutarin3te1i) {
        // 3. sıradaysa ve ilkin ve ikincinin tutarı bizimkinin 3te1inden düşükse kalsın. bu ilerde %5 te olabilir.
    } else if (sira == 4 && ilkIkiVeUcuncununTutari < this.bizimTutarin3te1i) {
        // 4. sıradaysa ve ilkin ve ikincinin ve ucuncunun tutarı bizimkinin 3te1inden düşükse kalsın. bu ilerde %5 te olabilir.
    } else {
      if(type == "SellOrders"){
        this.SellIptalveRefresh()
      }else if(type == "BuyOrders"){
        this.BuyIptalveRefresh()
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

      // tutar / sonBuyPrice Yaptığımızda bize girdiğimiz tutar ile ne kadarlık coin alacağımızı gösterir
      var alinacakCoinMiktari = tutar / this.sonBuyPrice
      // active sell orderdan elimizde bulunan satın alınmış coinin miktarını alıyoruz
  
      var alimisCoinMiktari = this.activeSell.length > 0 ? this.activeSell[0].quantity : 0

      // Alınmış coin alınacaktan küçükse almaya devam et ne zamanki 10 bini geçti o zaman dur.
      if (alimisCoinMiktari < alinacakCoinMiktari) {
        var yeniTutar = alinacakCoinMiktari - alimisCoinMiktari
        // Burada tutar doge değilde diğer coinden girdiği için amounta ekledik. eğer bunu aşağıdaki gibi totale ekleseydik. 3000 doluk değilde 3000 bin diğer coinlik değeri doga yazar alırdı. örnek 3000 god 30 coin ise 30 dogluk alırdı.
        $('#buy-form #inputAmount').val(yeniTutar)
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

  TepedenAlmamaKontrolu(){
    const uygunPrice = (Number(this.secilenMarket.LowPrice) + Number(this.secilenMarket.HighPrice)) * 0.5
    if(this.secilenMarket.BidPrice < uygunPrice){
      this.marketiKapat = false  // tepeden almama koşulu uygun.
    }else{
      this.marketiKapat = true
    }
  }

  async buy() {
    this.TepedenAlmamaKontrolu()
    if(this.marketiKapat){
      return false
    }

    console.log('buy')
    var yuzde = this.GetParameterByName('yuzde')
    var type = this.GetParameterByName('type')
    const sellAmount = this.secilenMarket.BidPrice *  Number($('#primary-balance-clickable').html())
    
    if (type == 'S' || this.secilenMarket.Volume < 50000) {
      console.log('Alış iptal çünkü sadece satış girildi veya volume 50 binden düşük.')
      return false
    }

    if (this.guncelAlimSatimYuzdeFarki < parseFloat(yuzde)) {
      console.log('Alış iptal çünkü % farkı ' + yuzde + ' den küçük. Fark : ' + this.guncelAlimSatimYuzdeFarki)
      return false
    }

    if (!this.OrantiliBuyAlKontrolu()) {
      console.log('Yeterince buy aldı daha fazla alma. Satış yap. Böylelikle tutar 10 bin girilmişse 10 bin dogelik coin alır ve satana kadar durmaz.satınca iş biter.')
      return false
    }

    var yeniFiyat = parseFloat(this.secilenMarket.BidPrice) + 0.00000001

    if(yeniFiyat < this.sonBuyPrice && (this.activeSell.length > 0 || sellAmount > 0.0001) ){
      // Eğer yeni buy price son buy priceden büyükse ve daha önceden alım yapmış ve henüz satmamışsa buy iptal çünkü elindeki selli eski buy priceye göre değil yeni ve yüksek olana göre hesaplıcak. Kar az olacak yada zarar.
      console.log('Yeni Buy son  buydan küçük, sell var. Sell priceyi yanlış hesaplayacağından buy iptal.')
      return false
    }

    var result = await this.BuyKontrolFromDbFB('BUY')
    if(result){
      console.log(this.marketName + ' %c BUY - Bu market başka bir pazarda Mevcut o yüzden iptal.','color:red');
      return false
    }

    console.log('Alımda')
    orderType = '1'
    yeniFiyat = yeniFiyat.toFixed(8)
    $('#buy-form #inputPrice').val(yeniFiyat)
    this.InputPriceKeyUpBuy()
    confirmOrderSubmitCore()
    LoadOpenOrders()
    return true
  }



  async sell() {
    console.log('sell')
    var tutar = $('#primary-balance-clickable').html() //
    var type = this.GetParameterByName('type')

    if (type == 'B') {
      console.log('Satış iptal çünkü sadece alış girildi')
      return false
    }

    var yeniFiyat = this.GetSellPrice()

    orderType = '0'
    yeniFiyat = yeniFiyat.toFixed(8)
    $('#sell-form #inputPrice').val(yeniFiyat)
    $('#sell-form #inputAmount').val(tutar)
    this.InputPriceKeyUpSell()
    confirmOrderSubmitCore()
    LoadOpenOrders()
    return true
  }

  GetSellPrice() {
    console.log('BuyFarkKontrolSellIcin')
    // Zararına Sat : Eğerbu aktifse kaç paraya aldığına bakmaz direk en üste koyar.
    var satacagiFiyat = parseFloat(this.secilenMarket.AskPrice) - 0.00000001
    //var zararinaSat = this.GetParameterByName('zararinaSat')
    
    var alimSatimYuzdeFarki = ((satacagiFiyat - this.sonBuyPrice) / this.sonBuyPrice * 100)
    if (alimSatimYuzdeFarki >= yuzde ) return satacagiFiyat
      
    // Yukarıdaki değilse kârını koy arka sıralarda dursun
    return this.sonBuyPrice + (this.sonBuyPrice / 100 * this.bizimTutarin3te1i)
  }

  SellBozsunMu() { // Yüzde farkı için
    var satacagiFiyat = parseFloat(this.secilenMarket.AskPrice) - 0.00000001
    var alimSatimYuzdeFarki = ((satacagiFiyat - this.sonBuyPrice) / this.sonBuyPrice * 100)
    if (alimSatimYuzdeFarki > this.bizimTutarin3te1i ) { // Eğer yüzde farkı büyükse pazarı bozsun. çünkü hem yüzde uygun örneğin 27 hemde 1. sırada değil niye arkadarda dursunki ?
      return true
    }else{
      return false
    }
  }

  BirSatoshiFarkKontrol(data){
    var buyBirSatoshiFark = data.buySirasi == 1 && user_buy_order_prices[0] - data.ikinciBuyPrice != 0.00000001
    var sellBirSatoshiFark = data.sellSirasi == 1 && data.ikinciSellPrice - user_sell_order_prices[0] != 0.00000001
    
    if (buyBirSatoshiFark) {
      console.log('1 Satoshi fark BUY boz tekrar kur')
      this.BuyIptalveRefresh()
    }

    if (sellBirSatoshiFark) {
      console.log('1 Satoshi fark SELL boz tekrar kur')
      this.SellIptalveRefresh()
    }
  }

  async BuyIptalveRefresh() {

    if (this.activeBuy.length == 0) {
      return
    }

    console.log('BuyIptalveRefresh')
    var cancelOrderID = this.activeBuy[0].order_id
    // Burda buy iptal edip refresh ediyorduk. Sistem zaten refresh ediyor o yüzden sadece iptal ediyoruz.
    var result = await $.post(Routing.generate('deleteorder'), {order_id : cancelOrderID}).then()
    
    // # Veritabanındaki deüerleri upload ediyoruz burda, veritabanındaki open orderslerden iptal edilen buyu çıkartıyoruz.
    await LoadOpenOrdersFB()
    OrdersUpdateFB()
    await this.sleep(10)
    window.location.reload()
  }

  async SellIptalveRefresh() {
    if (this.activeSell.length == 0) {
      return
    }

    console.log('SellIptalveRefresh')
    var cancelOrderID = this.activeSell[0].order_id
    // Burda buy iptal edip refresh ediyorduk. Sistem zaten refresh ediyor o yüzden sadece iptal ediyoruz.
    var result = await $.post(Routing.generate('deleteorder'), {order_id : cancelOrderID}).then()
    // # Veritabanındaki deüerleri upload ediyoruz burda, veritabanındaki open orderslerden iptal edilen buyu çıkartıyoruz.
    await LoadOpenOrdersFB()
    OrdersUpdateFB()
    await this.sleep(10)
    window.location.reload()
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
    var neKadardanAldi = 0
    var neKadardanSatti = 0

    if (this.recentBuys.length > 0) {
      neKadardanAldi = this.recentBuys[0].trade_price
    } else {
      neKadardanAldi = this.SonBuyDegeriniAl()
    }
  }

  sleep(saniye) {
    return new Promise(resolve => setTimeout(resolve, saniye * 1000)) // saniyeyi 1000 e çarptım milisaniye ile çalışıyor çünkü
  }

  async BuyKontrolFromDbFB(type){
    const openOrdersRef = this.db.ref('/coinexchange/openOrders')
    const snapshot = await openOrdersRef.once('value')
    const openOrders = snapshot.val()

    var concatOrders = []
    Object.values(openOrders).filter(e=> {concatOrders = concatOrders.concat(e)})
    var result = concatOrders.find(e=> e.type == type && e.marketName == this.marketName)
    if(result){
      return true  // Eğer bu kayıt veritabanında zaten varsa true döndür.
    }

    return false
  }
}

var _injectProd, _userName, _openOrders = []
async function Basla(){
  await LoadFireBase()
  _injectProd = new InjectProd()
  _injectProd.db = firebase.database()
  _injectProd.getBests()
  _userName = _injectProd.userName
}


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

async function LoadOpenOrdersFB() {
  const snapshot = await _db.ref('/coinexchange/openOrders').child(_userName).once('value')
  const openOrders = snapshot.val()
  if(openOrders){
    _openOrders = openOrders
  }
}

function OrdersUpdateFB(){
  _db.ref('/coinexchange/openOrders').child(_userName).set(_openOrders)
}

Basla()