const tradeHistoryParams = { "sEcho": "1", "iColumns": "8", "sColumns": ",,,,,,,", "iDisplayStart": "0", "iDisplayLength": "25000", "mDataProp_0": "0", "sSearch_0": "", "bRegex_0": "false", "bSearchable_0": "true", "bSortable_0": "true", "mDataProp_1": "1", "sSearch_1": "", "bRegex_1": "false", "bSearchable_1": "true", "bSortable_1": "true", "mDataProp_2": "2", "sSearch_2": "", "bRegex_2": "false", "bSearchable_2": "true", "bSortable_2": "true", "mDataProp_3": "3", "sSearch_3": "", "bRegex_3": "false", "bSearchable_3": "true", "bSortable_3": "true", "mDataProp_4": "4", "sSearch_4": "", "bRegex_4": "false", "bSearchable_4": "true", "bSortable_4": "true", "mDataProp_5": "5", "sSearch_5": "", "bRegex_5": "false", "bSearchable_5": "true", "bSortable_5": "true", "mDataProp_6": "6", "sSearch_6": "", "bRegex_6": "false", "bSearchable_6": "true", "bSortable_6": "true", "mDataProp_7": "7", "sSearch_7": "", "bRegex_7": "false", "bSearchable_7": "true", "bSortable_7": "true", "sSearch": "", "bRegex": "false", "iSortCol_0": "0", "sSortDir_0": "desc", "iSortingCols": "1", "__RequestVerificationToken": token }

function GetTradeHistory() {
    const url = "https://www.cryptopia.co.nz/UserExchange/GetTradeHistory"

    $.post(url, tradeHistoryParams).done(data => {
        ProcessTradeHistory(data)
    });
}

var _markets;
var duzenliMarketler
function ProcessTradeHistory(result) {
    var result = JSON.parse(result);
    result = result["aaData"];
    var markets = new Set();
    result.forEach((o) => markets.add(o[1]))
    _markets = markets
    duzenliMarketler = []
    markets.forEach(m => {
        var tempMarketler = result.filter(r => r[1] == m)
        var yeniMarkets = [], yeniMarket, ayrac, miktar, buy = 0, sell = 0, kar, marketId = 0

        tempMarketler.sort((a, b) => Number(a[0]) - Number(b[0]))
        tempMarketler.forEach((e, i, array) => {

            const ayracEkle = () => {
                sell = miktar
                kar = sell - buy
                marketId++
                ayrac = { marketId, ayrac: "-", buy: buy.toFixed(8), sell: sell.toFixed(8), kar: kar.toFixed(8) } // Buy ve sell gruplarını ayırmak için ayraç
                sell = 0
                kar = 0
                buy = 0
            }

            ayrac = null
            miktar = Number(e[5])
            marketId++
            yeniMarket = { marketId, Total: e[5], Type: e[2], Rate: e[3], Amount: e[4], Time: e[7] }

            if (e[2] == "Sell") { // Eğer SELL İSE
                if (tempMarketler[i + 1] && tempMarketler[i + 1][2] == "Buy") { // Eğer burdan sonraki işlemde buy ise sell den önce birden fazla buy almış bunları topla
                    ayracEkle()
                } else {
                    sell += miktar
                }
            } else {
                buy += miktar
            }

            i == array.length - 1 && ayracEkle()

            yeniMarkets.push(yeniMarket)
            ayrac && yeniMarkets.push(ayrac)

        });
        yeniMarkets.sort((a, b) => Number(b.marketId) - Number(a.marketId))
        duzenliMarketler.push({ name: m, data: yeniMarkets })
        marketId++
    })
    console.log(duzenliMarketler);
}

GetTradeHistory()
