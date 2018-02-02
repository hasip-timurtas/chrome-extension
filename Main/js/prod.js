
$(document).ready(function () {
  StartModule();
});

async function StartModule() {
  $("#divim").css("height", "455px")
  $("body").css("height", "450px")
  Init()
}


function Init() {
  $("#divim").html(`<button id='btnCx'>CoinExchange</button>
  <button id="btnCry" style='margin-left:10px; margin-bottom:10px;'>Cryptopia</button>`);

  $("#divim").append(`<table id="sonuclar" class="display nowrap dataTable dtr-inline" style="font-size:11px; font-family:arial; width: 100%;">
  </table>`);

  $("#btnCx").on("click", () => {
    GetCoinExchangeMarkets()
  })

  $("#btnCry").on("click", () => {
    GetCryptopiaMarkets()
  })
}


async function GetCryptopiaMarkets() {
  Init()
  var getMarketsUrl = "https://www.cryptopia.co.nz/api/GetMarkets/BTC";
  var resultMar = await axios(getMarketsUrl);
  var marketler = resultMar.data.Data;
  var market;
  var fark;

  var yuzdeBuyukOlanlar = $.grep(marketler, function (e) {
    return ((e.AskPrice - e.BidPrice) / e.BidPrice * 100) > 10 && e.BaseVolume > 0.0001 && e.BidPrice > 0.00000004 && e.AskPrice > 0.00000004;
  });


  yuzdeBuyukOlanlar.sort(function (a, b) {
    return Number(b.BaseVolume) - Number(a.BaseVolume);
  });

  var html = "<thead><tr><th>Market</th><th>Buy</th><th>Sell</th><th>Yuzde</th><th>Vol</th></tr></thead>";

  for (let mar of yuzdeBuyukOlanlar) {
    fark = Math.round((mar.AskPrice - mar.BidPrice) / mar.BidPrice * 100);
    html += `<tr>
      <td class='market' style='cursor:pointer; color:blue;'>${mar.Label}</td> 
      <td style='color:#5cb85c'> ${mar.BidPrice.toFixed(8)} </td> 
      <td style='color:red;'> ${mar.AskPrice.toFixed(8)}</td> 
      <td style='color:black;'> ${fark}</td> 
      <td style='color:brown;'>${mar.BaseVolume}</td>
      </tr>`;
  }


  $("#sonuclar").html(html);
  $(".market").click(function () {
    var marketName = $(this).html()
    marketName = marketName.replace("/", "_")

    chrome.tabs.create({
      active: false,
      url: 'https://www.cryptopia.co.nz/Exchange?market=' + marketName
    });

  });

  $('#sonuclar').DataTable();
}


async function GetCoinExchangeMarkets() {
  Init()
  var getMarketsUrl = "https://www.coinexchange.io/api/v1/getmarkets";
  var resultMar = await axios(getMarketsUrl);
  var marketler = resultMar.data.result;
  var market;
  var fark;
  var html = "";

  var summariesUrl = "https://www.coinexchange.io/api/v1/getmarketsummaries";

  var resultSum = await axios(summariesUrl);
  var marketOzetler = resultSum.data.result;

  var yuzdeBuyukOlanlar = $.grep(marketOzetler, function (e) {
    return ((e.AskPrice - e.BidPrice) / e.BidPrice * 100) > 10 && e.Volume > 0.0001 && e.BidPrice > 0.00000004 && e.AskPrice > 0.00000004;
  });


  yuzdeBuyukOlanlar = yuzdeBuyukOlanlar.sort(function (a, b) {
    return Number(b.Trade) - Number(a.Trade);
  });

  var html = "<thead><tr><th>Market</th><th>Buy</th><th>Sell</th><th>Yuzde</th><th>Vol</th><th>Trade</th></tr></thead>";

  for (let mar of yuzdeBuyukOlanlar) {
    market = $.grep(marketler, function (e) {
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
  $(".market").click(function () {
    var marketId = $(this).attr("market-id");
    var market = $.grep(marketler, function (e) {
      return e.MarketID == marketId;
    })[0];

    chrome.tabs.create({
      active: false,
      url: 'https://www.coinexchange.io/market/' + market.MarketAssetCode + '/' + market.BaseCurrencyCode
    });

  });

  $('#sonuclar').DataTable();
}