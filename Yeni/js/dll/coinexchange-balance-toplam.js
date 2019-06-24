
var _openOrders = []
async function LoadOpenOrders() {
    _openOrders = [] 
    const openOrders1Toplam = await LoadOpenOrders1()
    const openOrders2Toplam = await LoadOpenOrders2()
    const toplamOrders = openOrders1Toplam + openOrders2Toplam
    return toplamOrders
}

async function LoadOpenOrders1() {
    openOrdersHtml = await $.get( "https://www.coinexchange.io/orders/page/1").then()
    openOrdersTutar = 0
    
    $($.parseHTML(openOrdersHtml)).find("tr[id^='live_order']").each(function (){
        var type = $(this).children().eq(1).text().trim();
        var marketName = $(this).children().eq(2).text().trim();
        var netTotal = Number($(this).children().eq(9).text().trim().replace(',',''));
        openOrdersTutar += netTotal
        _openOrders.push({type, marketName, netTotal})
    })
    //OrdersUpdateFB()
    return openOrdersTutar
}

async function LoadOpenOrders2() {
    openOrdersHtml = await $.get( "https://www.coinexchange.io/orders/page/2").then()
    openOrdersTutar = 0
    $($.parseHTML(openOrdersHtml)).find("tr[id^='live_order']").each(function (){
        var type = $(this).children().eq(1).text().trim();
        var marketName = $(this).children().eq(2).text().trim();
        var netTotal = Number($(this).children().eq(9).text().trim().replace(',',''));
        openOrdersTutar += netTotal
        _openOrders.push({type, marketName, netTotal})
    })
    //OrdersUpdateFB()
    return openOrdersTutar
}

async function LoadBalance() {
    var openOrdersTutar = await LoadOpenOrders()
    var balancem = Number($("td:contains('Dogecoin')")[0].parentElement.children[2].innerText);
    var aciklama = $("h3:contains('Account Balances:')").html();
    var toplam = openOrdersTutar + balancem
    $("h3:contains('Account Balances:')").html(aciklama + "<br> balance: " + balancem + "<br>order tutar: " + openOrdersTutar.toFixed(8) +"<br> <strong style='border: 1px solid white; padding: 0 10px 0 10px;'> Toplam: "+toplam +"</strong>")
}

LoadBalance();


