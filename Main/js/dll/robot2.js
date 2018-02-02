"use strict"
// Test amaçlı bu kalsın burda
window.addEventListener("message", function (event) {
    // We only accept messages from ourselves
    if (event.source != window)
        return;

    if (event.data.message) {
        console.log("Mesaj Alındı");

        // Gelen mesaja göre işlem yapılır switch kulanağız şimdilik robot var ama buraya daha farklışeyler yükleyebiiriz.
        switch (event.data.message) {
            case "robot":
                //window.postMessage({message:"robot"},"*");
                console.log("Mesaj Robot");
                break;
            case "hasip":
                //window.postMessage({message:"hasip" },"*");
                console.log("Mesaj Hasip");
                break;
            case "bg":

                /*
                //Örnek Gönderilen Mesaj
                var appId = new URL(document.URL).searchParams.get("appId");
                window.postMessage({message:"bg", appId, data:{a:1,b:2} },"*");
                */


                /*
                console.log('Content script mesaj alındı. Backgrounda gönderiliyor.');
                chrome.runtime.sendMessage(event.data.appId, { command: "start" }, function (response) {
                    console.log(response);
                });
*/
                //code to send message to open notification. This will eventually move into my extension logic
                chrome.runtime.sendMessage({
                    type: "notification", options: {
                        type: "basic",
                        // iconUrl: chrome.extension.getURL("icon128.png"),
                        title: "Test",
                        message: "Test"
                    }
                });

                break;
        }
    }
});

