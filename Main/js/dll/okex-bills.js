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
    var mappedData = datam.map(e => {
        var data = {}
        var totalSize = 0
        var mainMarkets = ['USDT', 'BTC', 'ETH']
        if(mainMarkets.includes(e[0].currency)){ // sell
            data.marketName = e[1].currency+ '/' +e[0].currency;
            data.type = 'Sell'
            data.price = e[1].price.replace('-','')
        }else {
            data.marketName = e[0].currency+ '/' +e[1].currency;
            data.type = 'Buy'
            data.price = e[0].price.replace('-','')
        }
    
        for (let i = 0; i < e.length; i++) {
            var size = 0
            
            if(mainMarkets.includes(e[i].currency)){
                size = e[i].size.replace('-','')
            }else{
                if(!e[i+1]) continue
                size = e[i+1].size.replace('-','')
            }
            
            totalSize = totalSize + Number(size)
        }
        
        //data.total = (data.price * totalSize).toFixed(8)
        data.total =  totalSize
        data.createDate = new Date(e[0].createTime).toLocaleString() 
        return data
    })
    _db.ref('/okex/abdullati56-history').set(mappedData)
    console.table(mappedData)
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