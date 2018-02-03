var orderParams = { "sEcho": "1", "iColumns": "8", "sColumns": ",,,,,,,", "iDisplayStart": "0", "iDisplayLength": "100", "mDataProp_0": "0", "sSearch_0": "", "bRegex_0": "false", "bSearchable_0": "true", "bSortable_0": "true", "mDataProp_1": "1", "sSearch_1": "", "bRegex_1": "false", "bSearchable_1": "true", "bSortable_1": "true", "mDataProp_2": "2", "sSearch_2": "", "bRegex_2": "false", "bSearchable_2": "true", "bSortable_2": "true", "mDataProp_3": "3", "sSearch_3": "", "bRegex_3": "false", "bSearchable_3": "true", "bSortable_3": "true", "mDataProp_4": "4", "sSearch_4": "", "bRegex_4": "false", "bSearchable_4": "true", "bSortable_4": "true", "mDataProp_5": "5", "sSearch_5": "", "bRegex_5": "false", "bSearchable_5": "true", "bSortable_5": "true", "mDataProp_6": "6", "sSearch_6": "", "bRegex_6": "false", "bSearchable_6": "true", "bSortable_6": "true", "mDataProp_7": "7", "sSearch_7": "", "bRegex_7": "false", "bSearchable_7": "true", "bSortable_7": "true", "sSearch": "", "bRegex": "false", "iSortCol_0": "0", "sSortDir_0": "desc", "iSortingCols": "1", "__RequestVerificationToken": token }

function GetTrades() {
    var _orders, toplam = 0, url = "https://www.cryptopia.co.nz/UserExchange/GetTrades"

    $.post(url, orderParams).done(data => {
        _orders = JSON.parse(data)["aaData"]
        _orders.forEach(e => {
            toplam += Number(e[6])
        })

        var sonuc = {
            "Orders Toplam": Number(toplam.toFixed(8)),
            "BTC Toplam": Number($(".balancedata-1").html()),
            "Toplam BTC": Number(toplam.toFixed(8)) + Number($(".balancedata-1").html())
        }

        console.table(sonuc)
    });
}

setTimeout(() => {
    GetTrades();
}, 5000);