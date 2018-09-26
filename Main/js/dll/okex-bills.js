var _db;
Array.prototype.groupBy = function(prop) {
    return this.reduce(function(groups, item) {
      const val = item[prop]
      groups[val] = groups[val] || []
      groups[val].push(item)
      return groups
    }, {})
}
async function Basla(){
    await LoadFireBase()
    var bills = await fetch('https://www.okex.com/v2/spot/bills/bills', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem("token")
          },
        body: JSON.stringify({"page":{"page":1,"perPage":9999},"currencyId":-1,"recordType":0,"isHistory":false,"beginDate":0,"endDate":0}),
        credentials: "include"
    }).then(e=>e.json())
    
    var datam = bills.data.billList.groupBy('createTime');
    datam = Object.keys(datam).map(e=> datam[e])
    console.log('datam', datam)
    var mappedData = datam.map(e => {
        var data = {}
        var totalTotal = 0
        var mainMarkets = ['USDT', 'BTC', 'ETH']
        var totalAmount = 0
        var totalAltBalance = 0
        var totalAnaBalance = 0

        if(mainMarkets.includes(e[0].currency)){ // sell
            data.marketName = e[1].currency+ '/' +e[0].currency;
            data.type = 'Sell'
            data.price = Number(e[1].price.replace('-',''))
        }else {
            data.marketName = e[0].currency+ '/' +e[1].currency;
            data.type = 'Buy'
            data.price = Number(e[0].price.replace('-',''))
        }
    
        for (let i = 0; i < e.length; i++) {
            var total = 0
            var amount = 0
            var altBalance = 0
            var anaBalance = 0
            if(mainMarkets.includes(e[i].currency)){
                total = e[i].size.replace('-','')
                anaBalance = e[i].afterBalance
            }else{
                altBalance = e[i].afterBalance
                amount = e[i].size.replace('-','')
                /*
                if(!e[i+1]) continue
                total = e[i+1].size.replace('-','')
                */
            }

            totalAltBalance = totalAltBalance + Number(altBalance)
            totalAnaBalance = totalAnaBalance + Number(anaBalance)
            totalAmount = totalAmount + Number(amount)
            totalTotal = totalTotal + Number(total)
        }
        
        data.amount = totalAmount
        data.total = totalTotal
        data.baseBalance = totalAnaBalance
        data.altBalance = totalAltBalance
        data.createDate = new Date(e[0].createTime).toLocaleString()
        data.id = e[0].id
        return data
    })
    _db.ref('/okex/abdullati56-history').set(mappedData)
    console.table(mappedData)
    var dataForTradeHistory = mappedData.map(e=> [e.id, e.marketName, e.type, e.price, e.amount, e.total, 0, e.createDate ])
    console.log(dataForTradeHistory)
    ProcessTradeHistory(dataForTradeHistory)
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

setTimeout(()=> Basla(), 2000) 



////////////////////////////////  TRADE DETAY #######################################################################################################################
var _result = []
var _markets;
var _html
var duzenliMarketler
function ProcessTradeHistory(data) {
    _result = data
    console.log(_result);
    var markets = new Set();
    _result.forEach((o) => markets.add(o[1].split('/')[0]))
    _markets = markets
    duzenliMarketler = []
    markets.forEach(m => {
        
        /*
        if (userName != "hasip4441" && (!m.includes("/BTC") || m.includes("DOGE") || m.includes("USDT") || m.includes("CTR") )){//(!m.includes("/BTC") || m.includes("DOGE")) {
            return false
        }
        */

        var tempMarketler = _result.filter(r => r[1].includes(m))
        var yeniMarkets = [], yeniMarket, ayrac, miktar, amount, buy = 0, sell = 0, kar, marketId = 0, toplamBuy = 0, toplamSell = 0, toplamKar = 0
        var buyAmount = 0, sellAmount = 0, amount, toplamBuyAmount = 0, toplamSellAmount = 0
        tempMarketler.sort((a, b) => Number(a[0]) - Number(b[0]))
        tempMarketler.forEach((e, i, array) => {

            const ayracEkle = () => {
                kar = sell - buy
                marketId++
                buy = Number(buy.toFixed(8))
                sell = Number(sell.toFixed(8))
                kar = Number(kar.toFixed(8))
                sellAmount = Number(sellAmount.toFixed(8))
                buyAmount = Number(buyAmount.toFixed(8))
                amount = buyAmount - sellAmount
                amount = Number(amount.toFixed(8))
                ayrac = { marketId, ayrac: "-", buy, sell, kar, amount } // Buy ve sell gruplarını ayırmak için ayraç
                toplamBuy += buy, toplamSell += sell, toplamKar += kar, toplamSellAmount += sellAmount, toplamBuyAmount += buyAmount
                sell = 0, kar = 0, buy = 0, buyAmount = 0, sellAmount = 0

            }

            ayrac = null
            miktar = Number(e[5])
            amount = Number(e[4])
            marketId++
            yeniMarket = { market: e[1], marketId, id: e[0], Total: e[5], Type: e[2], Rate: e[3], Amount: e[4], Time: e[7] }

            if (e[2] == "Sell") { // Eğer SELL İSE
                sell += miktar
                sellAmount += amount
                if (tempMarketler[i + 1] && tempMarketler[i + 1][2] == "Buy") { // Eğer burdan sonraki işlemde buy ise sell den önce birden fazla buy almış bunları topla
                    ayracEkle()
                }
            } else {
                buy += miktar
                buyAmount += amount
            }

            i == array.length - 1 && e[2] == "Sell" && ayracEkle() // Sonra kayıt sell ise rapor yazsın.

            yeniMarkets.push(yeniMarket)
            ayrac && yeniMarkets.push(ayrac)

        });
        toplamBuy = Number(toplamBuy.toFixed(8))
        toplamSell = Number(toplamSell.toFixed(8))
        toplamKar = Number(toplamKar.toFixed(8))

        yeniMarkets.sort((a, b) => Number(b.marketId) - Number(a.marketId))
        let kalanAmount = toplamBuyAmount - toplamSellAmount
        kalanAmount = Number(kalanAmount.toFixed(8))
        duzenliMarketler.push({ name: m, toplamBuy, toplamSell, toplamKar, data: yeniMarkets, kalanAmount })
        marketId++
    })
    console.log(duzenliMarketler);

    //FillTable();
}
