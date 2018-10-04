var _db;
var _ws;

setTimeout(()=>Start(), 5000)


async function Start(){
    await LoadFireBase()
    WebSocketInit() // ilk başta çalıştır.
    var saat = 1
    var dakika = 60
    var saniye = 60
    var milisaniye = 1000
    setInterval(()=> WebSocketInit() , saat * dakika * saniye * milisaniye) // 60 dakikada  bir çalıştır
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
  
  
function WebSocketInit(){
        console.log('Websocket başlatılıyor.')
        const wsUrl = $.connection.notificationHub.connection.socket.url;
          if(_ws) _ws.close()
          
          _ws = new WebSocket(wsUrl);
          
          _ws.onerror = (error) => {
              console.log(error)
              _db.ref('cry/ws-error').set(error)
          }

          _ws.onclose =() => window.location.reload()

          var mainMarkets = ['BTC', 'LTC', 'DOGE']
          _ws.onmessage = (message) => {
              var data = JSON.parse(message.data)
              if(data && data.M && data.M.length > 0 && data.M[0].M == "SendTradeDataUpdate"){

                  var coin = data.M[0].A[0].Market.split('_')[0]
                  if(!mainMarkets.includes(coin)){
                      console.log(coin)
                    _db.ref('cry/ws').set(coin)
                  }

              }
          }
}

