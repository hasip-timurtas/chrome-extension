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
        }
    }
});

