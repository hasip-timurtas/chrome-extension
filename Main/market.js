var orderType = "";
var cancelOrderID = 0;

function updateBuyOrderForm() {
  var b_amount = $("#buy-form #inputAmount").val();
  var b_price = $("#buy-form #inputPrice").val();
  var b_total = b_amount * b_price;
  var b_fee = b_total * 0.0015;
  var b_net_total = parseFloat(b_total + b_fee).toFixed(8);
  b_total = b_total.toFixed(8);
  b_fee = b_fee.toFixed(8);
  $("#buy-form #inputTotal").val(b_total);
  $("#buy-form #inputFee").val(b_fee);
  $("#buy-form #inputNetTotal").val(b_net_total);
  checkBuyOverBalance(b_net_total);
}

function checkBuyOverBalance(netTotal) {
  var userBalance = $("#secondary-balance-clickable").html();
  userBalance = parseFloat(userBalance);
  if (netTotal > userBalance) {
    $('#buy-form #buy-net-total').addClass('has-error');
  } else {
    $('#buy-form #buy-net-total').removeClass('has-error');
  }
}
$(document).on('click', '.buy-price', function() {
  var price = this.id;
  $('#buy-form input#inputPrice').val(price);
  $('#sell-form input#inputPrice').val(price);
  var b_total = $("#buy-form #inputTotal").val();
  var b_amount = $("#buy-form #inputAmount").val();
  var s_total = $("#sell-form #inputTotal").val();
  var s_amount = $("#sell-form #inputAmount").val();
  if (b_amount !== "" && b_amount !== 0 && !isNaN(b_amount)) {
    updateBuyOrderForm();
  } else {
    if (b_total !== "" && b_total !== 0 && !isNaN(b_total)) {
      b_amount = b_total / price;
      $("#buy-form #inputAmount").val(b_amount);
      updateBuyOrderForm();
    }
  }
  if (s_amount !== "" && s_amount !== 0 && !isNaN(s_amount)) {
    updateSellOrderForm();
  } else {
    if (s_total !== "" && s_total !== 0 && !isNaN(s_total)) {
      s_amount = s_total / price;
      $("#sell-form #inputAmount").val(s_amount);
      updateSellOrderForm();
    }
  }
});
$(document).on('click', '.buy-amount', function(e) {
  var ref_price = e.target.id;
  var total = 0;
  $('.buy-amount').each(function(i, j) {
    var sub_price = parseFloat(this.id);
    var sub_amount = parseFloat(j.innerHTML);
    if (sub_price <= ref_price) {
      total = total + sub_amount;
    }
  });
  total = Number(total).toFixed(8);
  $('#buy-form input#inputAmount').val(total);
  $('#buy-form input#inputPrice').val(ref_price);
  updateBuyOrderForm();
  $('#sell-form input#inputAmount').val(total);
  $('#sell-form input#inputPrice').val(ref_price);
  updateSellOrderForm();
});
$("#buy-form #inputTotal").on('keyup', function() {
  var b_price = $("#buy-form #inputPrice").val();
  b_price = parseFloat(b_price);
  var b_total = $("#buy-form #inputTotal").val();
  b_total = parseFloat(b_total);
  if (b_price === "" || b_price === 0 || isNaN(b_price)) {
    return;
  }
  if (b_total !== "" && b_total !== 0 && !isNaN(b_total)) {
    var b_amount = b_total / b_price;
    var b_fee = b_total * 0.0015;
    var b_net_total = b_total + b_fee;
  } else {
    b_amount = 0;
    b_fee = 0;
    b_net_total = 0;
  }
  b_amount = b_amount.toFixed(8);
  b_fee = b_fee.toFixed(8);
  b_net_total = b_net_total.toFixed(8);
  $("#buy-form #inputFee").val(b_fee);
  $("#buy-form #inputNetTotal").val(b_net_total);
  $("#buy-form #inputAmount").val(b_amount);
  checkBuyOverBalance(b_net_total);
});
$("#buy-form #inputAmount").on('keyup', function() {
  var b_price = $("#buy-form #inputPrice").val();
  b_price = parseFloat(b_price);
  if (b_price === "" || b_price === 0 || isNaN(b_price)) {
    return;
  }
  var b_amount = $("#buy-form #inputAmount").val();
  b_amount = parseFloat(b_amount);
  if (b_amount === "" || b_amount === 0 || isNaN(b_amount)) {
    return;
  }
  updateBuyOrderForm();
});
$("#buy-form #inputPrice").on('keyup', function() {
  var b_price = $("#buy-form #inputPrice").val();
  var b_amount = $("#buy-form #inputAmount").val();
  var b_total = $("#buy-form #inputTotal").val();
  b_price = parseFloat(b_price);
  b_amount = parseFloat(b_amount);
  b_total = parseFloat(b_total);
  if (b_price === "" || b_price === 0 || isNaN(b_price)) {
    return;
  }
  if (b_amount !== "" && b_amount !== 0 && !isNaN(b_amount)) {
    updateBuyOrderForm();
  } else {
    if (b_total === "" || b_total === 0 || isNaN(b_total)) {
      return;
    } else {
      b_amount = b_total / b_price;
      $("#buy-form #inputAmount").val(b_amount);
      updateBuyOrderForm();
    }
  }
});
$(document).on('click', '#secondary-balance-clickable', function() {
  var b_price = $("#buy-form #inputPrice").val();
  var userBalance = $("#secondary-balance-clickable").html();
  var userBalance = parseFloat(userBalance);
  var fee = userBalance * 0.0015;
  var b_total = userBalance - fee;
  var b_amount = (b_total / b_price).toFixed(8);
  fee = fee.toFixed(8);
  b_total = b_total.toFixed(8);
  $("#buy-form #inputAmount").val(b_amount);
  $("#buy-form #inputTotal").val(b_total);
  $("#buy-form#inputPrice").val(b_price);
  $("#buy-form #inputFee").val(fee);
  $("#buy-form #inputNetTotal").val(userBalance);
  checkBuyOverBalance(userBalance);
});
$(document).on('click', '#buy-order-submit', function() {
  var userBalance = $("#secondary-balance-clickable").html();
  var b_price = $("#buy-form #inputPrice").val();
  var b_amount = $("#buy-form #inputAmount").val();
  var b_net_total = $("#buy-form #inputNetTotal").val();
  userBalance = parseFloat(userBalance);
  b_net_total = parseFloat(b_net_total);
  b_amount = parseFloat(b_amount);
  var value_total = +b_price * +b_amount;
  if (b_net_total > userBalance) {
    showBuyError("Insufficient Balance. Please try again.");
    ion.sound.play("error1");
    return;
  }
  if (value_total < 0.00010000) {
    showBuyError("Minimum order value: 0.00010000");
    ion.sound.play("error1");
    return;
  }
  if (b_price <= 0 || b_amount <= 0 || b_net_total <= 0 || b_price < 0.00000001) {
    $("#buy-form #inputAmount").focus();
    $('#buy-form #inputAmount').parent().parent().parent().addClass("has-error");
    $('#buy-form #inputPrice').parent().parent().parent().addClass("has-error");
    showBuyError("Invalid amounts entered, please try again.");
    ion.sound.play("error1");
    return;
  }
  orderType = "1";
  $('#modal-amount').html(b_amount);
  $('#modal-amount').removeClass("red");
  $('#modal-amount').addClass("green");
  $('#modal-price').html(b_price);
  $('#modal-price').addClass("blue");
  $('#modal-net-total').html(b_net_total);
  $('#modal-net-total').removeClass("green");
  $('#modal-net-total').addClass("red");
  $('#modal-order-type').html("Buy");
  $('#modal-order-type').removeClass("red");
  $('#modal-order-type').addClass("green");
  $('#orderConfirmModal').modal();
  return false;
});

function showBuyError(message) {
  $('#buy-success').hide();
  $('#buy-error').show();
  $('#buy-error-message').text(message);
  error_timeout = window.setTimeout(function() {
    $('#buy-error-message').empty();
    $("#buy-error").fadeOut(1000);
  }, 10000);
}

function updateSellOrderForm() {
  var s_amount = $("#sell-form #inputAmount").val();
  var s_price = $("#sell-form #inputPrice").val();
  var s_total = s_amount * s_price;
  var s_fee = s_total * 0.0015;
  var s_net_total = parseFloat(s_total - s_fee).toFixed(8);
  s_total = s_total.toFixed(8);
  s_fee = s_fee.toFixed(8);
  $("#sell-form #inputTotal").val(s_total);
  $("#sell-form #inputFee").val(s_fee);
  $("#sell-form #inputNetTotal").val(s_net_total);
  checkSellOverBalance(s_amount);
}

function checkSellOverBalance(amount) {
  var userBalance = $("#primary-balance-clickable").html();
  userBalance = parseFloat(userBalance);
  if (amount > userBalance) {
    $('#sell-form #sell-amount-div').addClass('has-error');
  } else {
    $('#sell-form #sell-amount-div').removeClass('has-error');
  }
}
$(document).on('click', '.sell-price', function() {
  var price = this.id;
  $('#buy-form input#inputPrice').val(price);
  $('#sell-form input#inputPrice').val(price);
  var b_total = $("#buy-form #inputTotal").val();
  var b_amount = $("#buy-form #inputAmount").val();
  var s_total = $("#sell-form #inputTotal").val();
  var s_amount = $("#sell-form #inputAmount").val();
  if (b_amount !== "" && b_amount !== 0 && !isNaN(b_amount)) {
    updateBuyOrderForm();
  } else {
    if (b_total !== "" && b_total !== 0 && !isNaN(b_total)) {
      b_amount = b_total / price;
      $("#buy-form #inputAmount").val(b_amount);
      updateBuyOrderForm();
    }
  }
  if (s_amount !== "" && s_amount !== 0 && !isNaN(s_amount)) {
    updateSellOrderForm();
  } else {
    if (s_total !== "" && s_total !== 0 && !isNaN(s_total)) {
      s_amount = s_total / price;
      $("#sell-form #inputAmount").val(s_amount);
      updateSellOrderForm();
    }
  }
});
$(document).on('click', '.sell-amount', function(e) {
  var ref_price = e.target.id;
  var total = 0;
  $('.sell-amount').each(function(k, m) {
    var sub_price = parseFloat(this.id);
    var sub_amount = parseFloat(m.innerHTML);
    if (sub_price >= ref_price) {
      total = total + sub_amount;
    }
  });
  total = Number(total).toFixed(8);
  $('#buy-form input#inputAmount').val(total);
  $('#buy-form input#inputPrice').val(ref_price);
  updateBuyOrderForm();
  $('#sell-form input#inputAmount').val(total);
  $('#sell-form input#inputPrice').val(ref_price);
  updateSellOrderForm();
});
$("#sell-form #inputTotal").on('keyup', function() {
  var s_price = $("#sell-form #inputPrice").val();
  s_price = parseFloat(s_price);
  var s_total = $("#sell-form #inputTotal").val();
  s_total = parseFloat(s_total);
  if (s_price === "" || s_price === 0 || isNaN(s_price)) {
    return;
  }
  if (s_total !== "" && s_total !== 0 && !isNaN(s_total)) {
    var s_amount = s_total / s_price;
    var s_fee = s_total * 0.0015;
    var s_net_total = s_total - s_fee;
  } else {
    s_amount = 0;
    s_fee = 0;
    s_net_total = 0;
  }
  s_amount = s_amount.toFixed(8);
  s_fee = s_fee.toFixed(8);
  s_net_total = s_net_total.toFixed(8);
  $("#sell-form #inputFee").val(s_fee);
  $("#sell-form #inputNetTotal").val(s_net_total);
  $("#sell-form #inputAmount").val(s_amount);
  checkSellOverBalance(s_net_total);
});
$("#sell-form #inputAmount").on('keyup', function() {
  var s_price = $("#sell-form #inputPrice").val();
  s_price = parseFloat(s_price);
  if (s_price === "" || s_price === 0 || isNaN(s_price)) {
    return;
  }
  var s_amount = $("#sell-form #inputAmount").val();
  s_amount = parseFloat(s_amount);
  if (s_amount === "" || s_amount === 0 || isNaN(s_amount)) {
    return;
  }
  updateSellOrderForm();
});
$("#sell-form #inputPrice").on('keyup', function() {
  var s_price = $("#sell-form #inputPrice").val();
  var s_amount = $("#sell-form #inputAmount").val();
  var s_total = $("#sell-form #inputTotal").val();
  s_price = parseFloat(s_price);
  s_amount = parseFloat(s_amount);
  s_total = parseFloat(s_total);
  if (s_price === "" || s_price === 0 || isNaN(s_price)) {
    return;
  }
  if (s_amount !== "" && s_amount !== 0 && !isNaN(s_amount)) {
    updateSellOrderForm();
  } else {
    if (s_total === "" || s_total === 0 || isNaN(s_total)) {
      return;
    } else {
      s_amount = s_total / s_price;
      $("#sell-form #inputAmount").val(s_amount);
      updateSellOrderForm();
    }
  }
});
$(document).on('click', '#primary-balance-clickable', function() {
  var s_price = $("#sell-form #inputPrice").val();
  var userBalance = $("#primary-balance-clickable").html();
  var userBalance = parseFloat(userBalance);
  var s_total = userBalance * s_price;
  var fee = s_total * 0.0015;
  var net_total = s_total - fee;
  fee = fee.toFixed(8);
  s_total = s_total.toFixed(8);
  net_total = net_total.toFixed(8);
  $("#sell-form #inputAmount").val(userBalance);
  $("#sell-form #inputTotal").val(s_total);
  $("#sell-form#inputPrice").val(s_price);
  $("#sell-form #inputFee").val(fee);
  $("#sell-form #inputNetTotal").val(net_total);
  checkSellOverBalance(userBalance);
});
$(document).on('click', '#sell-order-submit', function() {
  orderType = "0";
  var userBalance = $("#primary-balance-clickable").text();
  var s_price = $("#sell-form #inputPrice").val();
  var s_amount = $("#sell-form #inputAmount").val();
  var s_net_total = $("#sell-form #inputNetTotal").val();
  s_amount = +s_amount;
  var value_total = +s_amount * +s_price;
  if (userBalance < s_amount) {
    showSellError("insufficient balance, please try again");
    ion.sound.play("error1");
    return;
  }
  if (value_total < 0.00010000) {
    showSellError("Minimum order value: 0.00010000");
    ion.sound.play("error1");
    return;
  }
  if (s_price <= 0 || s_amount <= 0 || s_net_total <= 0 || s_price < 0.00000001) {
    $("#sell-form #inputAmount").focus();
    $('#sell-form #inputAmount').parent().parent().parent().addClass("has-error");
    $('#sell-form #inputPrice').parent().parent().parent().addClass("has-error");
    showSellError("Invalid amounts entered, please try again.");
    ion.sound.play("error1");
    return;
  }
  $('#modal-amount').html(s_amount);
  $('#modal-amount').removeClass("green");
  $('#modal-amount').addClass("red");
  $('#modal-price').html(s_price);
  $('#modal-price').addClass("blue");
  $('#modal-net-total').html(s_net_total);
  $('#modal-net-total').removeClass("red");
  $('#modal-net-total').addClass("green");
  $('#modal-order-type').html("Sell");
  $('#modal-order-type').addClass('green');
  $('#modal-order-type').addClass('red');
  $('#orderConfirmModal').modal();
  return false;
});

function showSellError(message) {
  $('#sell-success').hide();
  $('#sell-error').show();
  $('#sell-error-message').text(message);
  error_timeout = window.setTimeout(function() {
    $('#sell-error-message').empty();
    $("#sell-error").fadeOut(1000);
  }, 10000);
}
$(document).on('click', '#confirm-order-submit', function() {
  confirmOrderSubmitCore();
});
$(document).on('click', '#confirm-order-submit-flash-buy', function() {
  orderType = '1';
  confirmOrderSubmitCore();
});
$(document).on('click', '#confirm-order-submit-flash-sell', function() {
  orderType = '0';
  confirmOrderSubmitCore();
});

function confirmOrderSubmitCore() {
  var amount;
  var price;
  var market_id;
  var form_token;
  if (orderType === '1') {
    amount = $("#buy-form #inputAmount").val();
    price = $("#buy-form #inputPrice").val();
    market_id = $("#buy-form #market_id").val();
    form_token = $("#buy-form #form_token").val();
  }
  if (orderType === '0') {
    amount = $("#sell-form #inputAmount").val();
    price = $("#sell-form #inputPrice").val();
    market_id = $("#sell-form #market_id").val();
    form_token = $("#sell-form #form_token").val();
  }
  $.ajax({
    type: "POST",
    url: Routing.generate('addorder'),
    data: "market_id=" + market_id + "&type=" + orderType + "&amount=" + amount + "&price=" + price + "&form_token=" + form_token,
    dataType: 'json',
    timeout: 5000,
    success: function(data, status) {
      $('#orderConfirmModal').modal('hide');
      if (orderType === '1') {
        if (data.order_status === '1') {
          $('#buy-error').hide();
          $('#buy-success').show();
          window.setTimeout(function() {
            $("#buy-success").fadeOut(1000);
          }, 5000);
          $("#secondary-balance-clickable").html(data.s_balance);
          $("#primary-balance-clickable").html(data.p_balance);
        } else {
          $('#buy-success').hide();
          $('#buy-error').show();
          $('#buy-error-message').html(data.message);
        }
      }
      if (orderType === '0') {
        if (data.order_status === '1') {
          $('#sell-error').hide();
          $('#sell-success').show();
          window.setTimeout(function() {
            $("#sell-success").fadeOut(1000);
          }, 5000);
          $("#secondary-balance-clickable").html(data.s_balance);
          $("#primary-balance-clickable").html(data.p_balance);
        } else {
          $('#sell-success').hide();
          $('#sell-error').show();
          $('#sell-error-message').html(data.message);
        }
      }
      $('.form_token').val(data.form_token);
    }
  });
}
$(document).on('click', '#confirm-order-cancel', function() {
  $.ajax({
    type: "POST",
    url: Routing.generate('deleteorder'),
    data: "order_id=" + cancelOrderID,
    dataType: 'json',
    timeout: 5000,
    success: function(data, status) {
      $('#cancelOrderModal').modal('hide');
      if (data.error === '1') {
        $("#cancel-success").hide();
        $("#cancel-error").show();
        $("#cancel-error-message").html(data.message);
      } else {
        $("#cancel-success").show();
        window.setTimeout(function() {
          $("#cancel-success").fadeOut(1000);
        }, 5000);
        $("#cancel-error").hide();
      }
    }
  });
});

function showLoader(div_id) {
  $("#" + div_id).html("<img src='/assets/images/gears.gif' />");
}
