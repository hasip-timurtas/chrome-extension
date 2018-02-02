const tradeHistoryParams = { "sEcho": "1", "iColumns": "8", "sColumns": ",,,,,,,", "iDisplayStart": "0", "iDisplayLength": "25000", "mDataProp_0": "0", "sSearch_0": "", "bRegex_0": "false", "bSearchable_0": "true", "bSortable_0": "true", "mDataProp_1": "1", "sSearch_1": "", "bRegex_1": "false", "bSearchable_1": "true", "bSortable_1": "true", "mDataProp_2": "2", "sSearch_2": "", "bRegex_2": "false", "bSearchable_2": "true", "bSortable_2": "true", "mDataProp_3": "3", "sSearch_3": "", "bRegex_3": "false", "bSearchable_3": "true", "bSortable_3": "true", "mDataProp_4": "4", "sSearch_4": "", "bRegex_4": "false", "bSearchable_4": "true", "bSortable_4": "true", "mDataProp_5": "5", "sSearch_5": "", "bRegex_5": "false", "bSearchable_5": "true", "bSortable_5": "true", "mDataProp_6": "6", "sSearch_6": "", "bRegex_6": "false", "bSearchable_6": "true", "bSortable_6": "true", "mDataProp_7": "7", "sSearch_7": "", "bRegex_7": "false", "bSearchable_7": "true", "bSortable_7": "true", "sSearch": "", "bRegex": "false", "iSortCol_0": "0", "sSortDir_0": "desc", "iSortingCols": "1", "__RequestVerificationToken": token }

function GetTradeHistory() {
    const url = "https://www.cryptopia.co.nz/UserExchange/GetTradeHistory"

    $.post(url, tradeHistoryParams).done(data => {
        ProcessTradeHistory(data)
    });
}

var _markets;
let _html
var duzenliMarketler
function ProcessTradeHistory(result) {
    var result = JSON.parse(result);
    result = result["aaData"];
    var markets = new Set();
    result.forEach((o) => markets.add(o[1]))
    _markets = markets
    duzenliMarketler = []
    markets.forEach(m => {
        if (!m.includes("/BTC") || m.includes("DOGE")) {
            return false
        }

        var tempMarketler = result.filter(r => r[1] == m)
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
            yeniMarket = { marketId, id: e[0], Total: e[5], Type: e[2], Rate: e[3], Amount: e[4], Time: e[7] }

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

    FillTable();
}

function FillTable() {
    let tbody = ""
    let karRengi
    duzenliMarketler.forEach(dm => {
        karRengi = dm.toplamKar > 0 ? "#75cb75" : "#f48484"
        karRengi = dm.toplamKar == 0 ? "white" : karRengi
        tbody += `<tr onclick="MarketRapoGoster('${dm.name}')"> 
        <td style="color:#feff7f"><a target="_blank" href='/Exchange?market=${dm.name.replace("/", "_")}'>${dm.name}</a</td>
        <td style="color:#f48484">${dm.toplamBuy}</td>
        <td style="color:#75cb75">${dm.toplamSell}</td> 
        <td style="color:${karRengi}">${dm.toplamKar}</td> 
        <td style="color:#f48484">${dm.kalanAmount}</td>
        </tr>`
    });

    _html = `<table id="sonuclarTH" class="table table-striped table-hover table-condensed" style="font-size:15px; font-family:arial; width: 100%;">
    <thead>
    <tr><th>Market</th><th>Toplam Buy</th><th>Toplam Sell</th><th class="sumKar">Toplam Kar</th><th style="width:100px">Kalan</tr></thead>
    <tbody>
    ${tbody}
    </tbody>
    <tfoot id="toplamlar"></tfoot>
    </table>`;

    const btns = `
    <li>
        <a href="#" id="yapilanIslemler">
            <i class="glyphicon glyphicon-shopping-cart pull-right"></i>
            Yapılan İşlemler
        </a>
    </li>`

    $("#tabcontrol").prepend(btns);
    $('#yapilanIslemler').click(e => {
        e.preventDefault();
        TumRaporlariGoster();
        return false;
    });
}

const TumRaporlariGoster = () => {
    $.blockUI({
        message: _html,
        css: {
            width: '60%',
            width: '80%',
            top: '2.5%',
            left: '10%',
            'text-align': 'unset',
            cursor: 'unset',
            opacity: '1'
        },
        onOverlayClick: $.unblockUI
    });

    $(".fa-spinner").remove()

    $('#sonuclarTH').DataTable({
        "ordering": false,
        "footerCallback": function (row, data, start, end, display) {
            TotalHesapla(this.api())
        },
        "scrollY": "500px",
        "scrollCollapse": true,
        "paging": false
    });
}

const TotalHesapla = (api) => {
    let total = api.column(3).data().reduce((a, b) => { return Number(a) + Number(b); }, 0);// Total over all pages
    total = Number(total.toFixed(8))
    const toplamlar = `<tr><th></th><th></th><th></th><th></th><th style="width: 21%;">Toplam: ${total} BTC</th><th></th></tr>`
    $("#toplamlar").html(toplamlar)  // Update footer
}

const MarketRapoGoster = (marketName) => {
    const market = duzenliMarketler.find(e => e.name == marketName)
    console.log(market);
    let tbody = ""
    let karRengi
    let karZarar
    market.data.forEach(m => {
        if (m.ayrac) {
            karRengi = m.kar > 0 ? "#75cb75" : "#f48484"
            karZarar = m.kar > 0 ? "Kar" : "Zarar"
            tbody += `<tr style="background-color: #064564"> 
            <td style="color:#f48484">Buy : ${m.buy}</td>
            <td style="color:#75cb75">Sell: ${m.sell}</td>
            <td style="background-color:${karRengi}">${karZarar} : ${m.kar}</td> 
            <td style="background-color:${karRengi}">Kalan: ${m.amount} </td> 
            <td style="background-color:${karRengi}"> </td> 
            <td style="background-color:${karRengi}"> </td> 
            </tr>`
            return false
        }

        tbody += `<tr> 
        <td>${m.id}</td>
        <td>${m.Type}</td>
        <td>${m.Rate}</td>
        <td>${m.Amount}</td>
        <td>${m.Total}</td>
        <td>${m.Time}</td> 
        </tr>`
    });
    const baslik = `<span style="margin-left: 40%;">${marketName}</span>`
    const geriDonButon = `<button onclick="TumRaporlariGoster()" style="position: absolute; right: 20px; top: 15px; color: #120000; font-size: 18px; width: 147px;"> 
                        Geri Dön     <i class="fa icon-exitalt" style="float: right;"></i></button> `

    const html = `${baslik} ${geriDonButon}<br>
    <table id="sonuclarMarket" class="table table-striped table-hover table-condensed" style="font-size:15px; font-family:arial; width: 100%;">
    <thead>
    <tr><th>Market ID</th><th>Type</th><th>Rate</th><th>Amount</th><th>Total</th><th>Time</th></tr></thead>
    <tbody>
    ${tbody}
    </tbody>
    </table>`;
    $.unblockUI()
    $.blockUI({
        message: html,
        css: {
            width: '60%',
            width: '80%',
            top: '5%',
            left: '10%',
            'text-align': 'unset',
            cursor: 'unset',
            opacity: '1'
        },
        onOverlayClick: $.unblockUI
    });

    $(".fa-spinner").remove()

    $('#sonuclarMarket').DataTable({
        "pageLength": 25,
        "ordering": false
    });
}

GetTradeHistory()