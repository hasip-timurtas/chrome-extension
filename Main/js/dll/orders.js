var orders = $("table").children().children();
var toplamTutar = 0, openOrders = []
for (i = 1; i < orders.length; i++) {
    toplamTutar += Number(orders[i].children[9].innerText.replace(",", ""));
    openOrders.push(orders[i].children[2].innerText)
}

var appId = new URL(document.URL).searchParams.get("appId");
$("h3").html(`All Open Orders <br> Total : ${toplamTutar} DOGE`)
chrome.runtime.sendMessage(appId, { type: "orders", openOrders, toplamTutar });

setTimeout('window.location.reload()', 1000 * 30) // 30 saniye sonra refreshle


// RESPONSE İLE ÖRNEK MESAJ

/*
chrome.runtime.sendMessage(appId, { type: "orders", openOrders, toplamTutar }, response => {
    if (response) {
        console.log(response)
    }
});
*/