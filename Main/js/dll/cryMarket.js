var _TradePairInfo, _TradePairUserData;
function getTradePairInfo(n) {
    tradePairLoadStart();
    getTradePairDataRequest = postJson(actionTradePairData, {
        tradePairId: n
    }, function(n) {
    _TradePairInfo = n
        selectedTradePair = n.TradePair;
        selectedMarket = selectedTradePair.Symbol + "/" + selectedTradePair.BaseSymbol;
        $(".tradepair-basefee").text(n.TradePair.BaseFee.toFixed(2));
        $(".tradepair-basemintrade").text(n.TradePair.BaseMinTrade.toFixed(8));
        updateSelectedChart();
        updateTitle(n.TradePair, !1);
        updateTicker(n.Ticker);
        updateStatusMessage(n.TradePair);
        updateBuyOrdersTable(n.Buys);
        updateSellOrdersTable(n.Sells);
        updateMarketHistoryTable(n.History);
        tradePairLoadComplete()
    });
    isAuthenticated && (createUserOpenOrdersTable(),
    createUserOrderHistoryTable(),
    updateBalance(n, !1),
    getUserTradePairDataRequest = postJson(actionTradePairUserData, {
        tradePairId: n
    }, function(n) {
    _TradePairUserData=n
        updateUserOpenOrdersTable(n.Open);
        updateUserOrderHistoryTable(n.History)
    }))
}

async function Basla (){
    getTradePairInfo(selectedTradePair.TradePairId)
    await sleep(2)
    var buyPrice = Number(_TradePairInfo.Buys[0][1])
    var sellPrice = Number(_TradePairInfo.Sells[0][1])
    var openSellPrice = Number(_TradePairUserData.Open.find(e=> e[1]=="Sell")[2])
    var lastBuyPrice = Number(_TradePairUserData.History.find(e=> e[1]=="Buy")[2])
    var guncelYuzde = (sellPrice - buyPrice) / buyPrice * 100
    var bizimSellLastBuyFarki = (openSellPrice - lastBuyPrice) / lastBuyPrice * 100
    var guncelSellBuyFarki = (sellPrice - lastBuyPrice) / lastBuyPrice * 100
    var bizimSellOnceGecerseFark = ((sellPrice - 0.00000001) - lastBuyPrice) / lastBuyPrice * 100
    var sonuc = {
      "Güncel Yüzde ": Number(guncelYuzde.toFixed(8)),
      "Bizim Sell ve Last Buy Farkı": Number(bizimSellLastBuyFarki.toFixed(8)),
      "Güncel Sell ve Last Buy Farkı": Number(guncelSellBuyFarki.toFixed(8)),
      "Bizim Sell En Önce Geçerse Last Buy Farkı": Number(bizimSellOnceGecerseFark.toFixed(8))
    }
    console.table(sonuc)
}


function sleep(saniye) {
  return new Promise(resolve => setTimeout(resolve, saniye * 1000)); // saniyeyi 1000 e çarptım milisaniye ile çalışıyor çünkü
}

Basla ();