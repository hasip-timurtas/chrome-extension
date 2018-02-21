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
    var openSellPrice = _TradePairUserData.Open.length>0 && Number(_TradePairUserData.Open.find(e=> e[1]=="Sell")[2])
    var lastBuyPrice = _TradePairUserData.History.length>0 && Number(_TradePairUserData.History.find(e=> e[1]=="Buy")[2])
    var all ={
        guncelYuzde : Number(((sellPrice - buyPrice) / buyPrice * 100).toFixed(8)),
        bizimSellLastBuyFarki : Number(((openSellPrice - lastBuyPrice) / lastBuyPrice * 100).toFixed(8)),
        guncelSellBuyFarki : Number(((sellPrice - lastBuyPrice) / lastBuyPrice * 100).toFixed(8)),
        bizimSellOnceGecerseFark : Number((((sellPrice - 0.00000001) - lastBuyPrice) / lastBuyPrice * 100).toFixed(8))
    }

    var sonuc = {
      "Güncel Yüzde ": all.guncelYuzde,
      "Bizim Sell ve Last Buy Farkı": all.bizimSellLastBuyFarki,
      "Güncel Sell ve Last Buy Farkı": Number(all.guncelSellBuyFarki.toFixed(8)),
      "Bizim Sell En Önce Geçerse Last Buy Farkı": Number(all.bizimSellOnceGecerseFark.toFixed(8))
    }
    paneliEkle(all)
    console.table(sonuc)
}

function paneliEkle(all) {
    $("body").append(`
        <div id='divim' style='padding:10px; width:385px; height:100px; background-color:#8fcaab; color:black; position:fixed; bottom:0; z-index:999;'>
            Güncel Yüzde: <strong style="float:right"> ${all.guncelYuzde} </strong> <br>
            Bizim Sell ve Last Buy Farkı: <strong style="float:right">  ${all.bizimSellLastBuyFarki}</strong> <br>
            Güncel Sell ve Last Buy Farkı: <strong style="float:right"> ${all.guncelSellBuyFarki}</strong> <br>
            Bizim Sell En Önce Geçerse LBF: <strong style="float:right">  ${all.bizimSellOnceGecerseFark}</strong> <br>
        </div>
        `);
  }

function sleep(saniye) {
  return new Promise(resolve => setTimeout(resolve, saniye * 1000)); // saniyeyi 1000 e çarptım milisaniye ile çalışıyor çünkü
}

Basla ();