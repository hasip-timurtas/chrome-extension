const orderParams = { "sEcho": "1", "iColumns": "8", "sColumns": ",,,,,,,", "iDisplayStart": "0", "iDisplayLength": "1000", "mDataProp_0": "0", "sSearch_0": "", "bRegex_0": "false", "bSearchable_0": "true", "bSortable_0": "true", "mDataProp_1": "1", "sSearch_1": "", "bRegex_1": "false", "bSearchable_1": "true", "bSortable_1": "true", "mDataProp_2": "2", "sSearch_2": "", "bRegex_2": "false", "bSearchable_2": "true", "bSortable_2": "true", "mDataProp_3": "3", "sSearch_3": "", "bRegex_3": "false", "bSearchable_3": "true", "bSortable_3": "true", "mDataProp_4": "4", "sSearch_4": "", "bRegex_4": "false", "bSearchable_4": "true", "bSortable_4": "true", "mDataProp_5": "5", "sSearch_5": "", "bRegex_5": "false", "bSearchable_5": "true", "bSortable_5": "true", "mDataProp_6": "6", "sSearch_6": "", "bRegex_6": "false", "bSearchable_6": "true", "bSortable_6": "true", "mDataProp_7": "7", "sSearch_7": "", "bRegex_7": "false", "bSearchable_7": "true", "bSortable_7": "true", "sSearch": "", "bRegex": "false", "iSortCol_0": "0", "sSortDir_0": "desc", "iSortingCols": "1", "__RequestVerificationToken": token }
var _orders

function GetTrades() {
    var toplam = 0, url = "https://www.cryptopia.co.nz/UserExchange/GetTrades"

    $.post(url, orderParams).done(data => {
        _orders = JSON.parse(data)["aaData"]
		CryFbSaveBasla()
        console.log(_orders);
        _orders.forEach(e => {
            toplam += Number(e[6])
        })

        var sonuc ={
            ordersToplam: Number(toplam.toFixed(8)), 
            btcBalance: Number($(".balancedata-1").html()),
            anaToplam: Number(toplam.toFixed(8)) + Number($(".balancedata-1").html())
        }

        var html =`<div><span>Orders Toplam <span class="text-success">${sonuc.ordersToplam}</span> BTC</span></div>
                   <div><span>BTC Balance <span class="text-success">${sonuc.btcBalance}</span> BTC</span></div>
                   <div><span>Ana Toplam <span class="text-success">${sonuc.anaToplam}</span> BTC</span></div>`

        $(".col-md-4.nopad").append(html);
    });
}

setTimeout(() => {
    GetTrades();
}, 5000);


// ##############  FİREBASE İÇİN

async function CryFbSaveBasla(){
    var userName = $('.profile-usertitle-name').text().trim()
    var users = [{
        name: 'hasip4441',
        id: 1
    },
    {
        name: 'nervvagus_61',
        id: 2
    },
    {
        name: 'ortaklar1453',
        id: 3
    }]
	
    var user = users.find(e=> e.name == userName)

    if(user){
		LoadOpenOrders(user.id)
    }
}

async function LoadOpenOrders(userId){
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
}
