
async function CryFbSaveBasla(){
    var userName = $('.profile-usertitle-name').text().trim()
    var users = [{
        name: 'nervvagus_61',
        id: 2
    }]
    var user = users.find(e=> e.name == userName)

    if(user){
        await LoadSettings()
        SaveTradeHistory(user.id)
        SaveOpenOrders(user.id)
    }
}

async function LoadSettings(){
    await $.getScript('https://www.gstatic.com/firebasejs/4.12.0/firebase.js')
    var config = {
        apiKey: "AIzaSyDxDY2_n2XA4mF3RWTFXRuu0XrLCkYYG4s",
        authDomain: "firem-b3432.firebaseapp.com",
        databaseURL: "https://firem-b3432.firebaseio.com",
        projectId: "firem-b3432",
        storageBucket: "firem-b3432.appspot.com",
        messagingSenderId: "866789153670"
    };
    firebase.initializeApp(config);
    firebase.auth().signInWithEmailAndPassword('hasip@gmail.com', '6359718');
    _db = firebase.database()
    
    Array.prototype.groupBy = function(prop) {
        return this.reduce(function(groups, item) {
            const val = item[prop]
            groups[val] = groups[val] || []
            groups[val].push(item)
            return groups
        }, {})
    }
}

function SaveTradeHistory(userId){
    const tradeHistoryParams = {
        "sEcho": "1",
        "iColumns": "8",
        "sColumns": ",,,,,,,",
        "iDisplayStart": "0",
        "iDisplayLength": "25000",
        "mDataProp_0": "0",
        "sSearch_0": "",
        "bRegex_0": "false",
        "bSearchable_0": "true",
        "bSortable_0": "true",
        "mDataProp_1": "1",
        "sSearch_1": "",
        "bRegex_1": "false",
        "bSearchable_1": "true",
        "bSortable_1": "true",
        "mDataProp_2": "2",
        "sSearch_2": "",
        "bRegex_2": "false",
        "bSearchable_2": "true",
        "bSortable_2": "true",
        "mDataProp_3": "3",
        "sSearch_3": "",
        "bRegex_3": "false",
        "bSearchable_3": "true",
        "bSortable_3": "true",
        "mDataProp_4": "4",
        "sSearch_4": "",
        "bRegex_4": "false",
        "bSearchable_4": "true",
        "bSortable_4": "true",
        "mDataProp_5": "5",
        "sSearch_5": "",
        "bRegex_5": "false",
        "bSearchable_5": "true",
        "bSortable_5": "true",
        "mDataProp_6": "6",
        "sSearch_6": "",
        "bRegex_6": "false",
        "bSearchable_6": "true",
        "bSortable_6": "true",
        "mDataProp_7": "7",
        "sSearch_7": "",
        "bRegex_7": "false",
        "bSearchable_7": "true",
        "bSortable_7": "true",
        "sSearch": "",
        "bRegex": "false",
        "iSortCol_0": "0",
        "sSortDir_0": "desc",
        "iSortingCols": "1",
        "__RequestVerificationToken": token
    }
    
    const url = "https://www.cryptopia.co.nz/UserExchange/GetTradeHistory"
    $.post(url, tradeHistoryParams).done(data => {
        var result = JSON.parse(data);
        result = result["aaData"];
        var historim = result.map(e => e = {
            TradeId: e[0],
            Date: e[7],
            Type: e[2],
            Rate: Number(e[3]),
            Amount: Number(e[4]),
            Total: Number(e[5]),
            Market: e[1].replace(/\//g, '-').replace(/\$/g, '-')
        })
        _db.ref('cry-bot/trade-history-' + userId).set(historim.groupBy('Market'))
        console.log('Trade History Kaydedildi');
    });
}





function SaveOpenOrders(userId){
    var orderParams = {
        "sEcho": "1",
        "iColumns": "8",
        "sColumns": ",,,,,,,",
        "iDisplayStart": "0",
        "iDisplayLength": "1000",
        "mDataProp_0": "0",
        "sSearch_0": "",
        "bRegex_0": "false",
        "bSearchable_0": "true",
        "bSortable_0": "true",
        "mDataProp_1": "1",
        "sSearch_1": "",
        "bRegex_1": "false",
        "bSearchable_1": "true",
        "bSortable_1": "true",
        "mDataProp_2": "2",
        "sSearch_2": "",
        "bRegex_2": "false",
        "bSearchable_2": "true",
        "bSortable_2": "true",
        "mDataProp_3": "3",
        "sSearch_3": "",
        "bRegex_3": "false",
        "bSearchable_3": "true",
        "bSortable_3": "true",
        "mDataProp_4": "4",
        "sSearch_4": "",
        "bRegex_4": "false",
        "bSearchable_4": "true",
        "bSortable_4": "true",
        "mDataProp_5": "5",
        "sSearch_5": "",
        "bRegex_5": "false",
        "bSearchable_5": "true",
        "bSortable_5": "true",
        "mDataProp_6": "6",
        "sSearch_6": "",
        "bRegex_6": "false",
        "bSearchable_6": "true",
        "bSortable_6": "true",
        "mDataProp_7": "7",
        "sSearch_7": "",
        "bRegex_7": "false",
        "bSearchable_7": "true",
        "bSortable_7": "true",
        "sSearch": "",
        "bRegex": "false",
        "iSortCol_0": "0",
        "sSortDir_0": "desc",
        "iSortingCols": "1",
        "__RequestVerificationToken": token
    }
    var _orders
    
    
    var toplam = 0;
    var url = "https://www.cryptopia.co.nz/UserExchange/GetTrades"
    
    $.post(url, orderParams).done(data => {
        _orders = JSON.parse(data)["aaData"]
    
        var openOrders = _orders.map(e => ({
            OrderId: e[0],
            Type: e[3],
            Rate: e[4],
            Amount: e[5],
            Total: e[6],
            Remaining: e[7],
            TimeStamp: e[9],
            Market: e[2].replace(/\//g, '-').replace(/\$/g, '-'),
        }))
        _db.ref('cry-bot/open-orders-' + userId).set(openOrders.groupBy('Market'))
        console.log('Open Orders Kaydedildi');
    });
}