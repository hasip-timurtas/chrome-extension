var marketler;
var secilenMarket;

$(document).ready(function() {
  StartModule();
  //getBests();
});

async function StartModule() {

  var getMarketsUrl = "https://www.coinexchange.io/api/v1/getmarkets";
  var resultMar = await axios(getMarketsUrl);
  marketler = resultMar.data.result;
  var yuzdeBuyukOlanlar;
  var market;
  var fark;
  var html = "";

  var summariesUrl = "https://www.coinexchange.io/api/v1/getmarketsummaries";

  var resultSum = await axios(summariesUrl);
  var marketOzetler = resultSum.data.result;

  yuzdeBuyukOlanlar = $.grep(marketOzetler, function(e) {
    return ((e.AskPrice - e.BidPrice) / e.BidPrice * 100) > 30 && e.Volume > 0.0001 && e.BidPrice > 0.00000004 && e.AskPrice > 0.00000004;
  });



  yuzdeBuyukOlanlar.sort(function(a, b) {
    return b.TradeCount - a.TradeCount;
  });

  html += "<thead><tr><th>Market</th><th>Buy</th><th>Sell</th><th>Yuzde</th><th>Vol</th><th>Trade</th></tr></thead>";

  for (let mar of yuzdeBuyukOlanlar) {
    market = $.grep(marketler, function(e) {
      return e.MarketID == mar.MarketID;
    })[0];

    var marketName = market.MarketAssetCode + " / " + market.BaseCurrencyCode;

    fark = Math.round((mar.AskPrice - mar.BidPrice) / mar.BidPrice * 100);
    html += "<tr><td class='market' market-id='" + mar.MarketID + "' style='cursor:pointer; color:blue;'>" +
      market.MarketAssetCode + " / " + market.BaseCurrencyCode +
      "</td> <td style='color:#5cb85c'>" + mar.BidPrice + " </td> <td style='color:red;'>" + mar.AskPrice + "</td> <td style='color:black;'> " + fark + "</td> <td style='color:brown;'>" + mar.Volume + "</td>" +
      "<td style='color:black'>" + mar.TradeCount + "</td></tr>";

  }


  $("#sonuclar").html(html);
  $(".market").click(function() {
    var marketId = $(this).attr("market-id");
    var market = $.grep(marketler, function(e) {
      return e.MarketID == marketId;
    })[0];

    chrome.tabs.create({
      active: false,
      url: 'https://www.coinexchange.io/market/' + market.MarketAssetCode + '/' + market.BaseCurrencyCode
    });

  });

  $('#sonuclar').DataTable();
}