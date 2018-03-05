var idRefresh;
var idRefresh2;
var timeToRefresh = 10;
var windowActive = true;
var updatesPaused = false;
var ponyTimer;
var pony_its = [];
var pony_its_i = 0;
var pony_ittime = 0.2;
var pony_distance = 30000;
var pony_stopReplay = 0;
$.ajaxSetup({
    type: "POST",
    cache: false,
    beforeSend: showLoader,
    error: null,
    complete: hideLoader
});

function showLoader() {
    $("#mainLoader").fadeTo(1, 1);
    $("#loaderFade").fadeTo(1, 0.1);
}

function hideLoader() {
    $("#mainLoader").hide();
    $("#loaderFade").hide();
}

function getHash() {
    var curHash = window.location.hash.toLowerCase();
    return curHash != "#realtime" && curHash != "#mem" ? "#realtime" : curHash;
}

function setSystemInfo(jsonData) {
    if (typeof jsonData === "object") {
        if (typeof jsonData.blocked === "number") {
            $(".window").hide();
            $("#window_register .wincont").html("<p class=win_center_success>" + popup_login_error_blocked_hard + "</p>");
            $("#window_register").show();
            $("#mask").show();
            return;
        }
        var info = jsonData.info;
        $("#label_bestsell").html(info.bestsell);
        $("#label_bestbuy").html(info.bestbuy);
        $("#label_last").html(info.last);
        $("#label_last").removeClass("label-type1").removeClass("label-type2").addClass("label-type" + info.last_type);
        $("#label_high24").html(info.high24);
        $("#label_low24").html(info.low24);
        if (parseInt(info.fiat)) {
            $("#label_vol24").html(info.vol1 + " " + currency_name1);
        } else {
            $("#label_vol24").html(info.vol2 + " " + currency_name2);
        }
        if (typeof jsonData.mircohistory === "object") {
            var mircohistory = jsonData.mircohistory;
            var html = "";
            for (var item in mircohistory) {
                var value = mircohistory[item];
                html += "<tr class='" + (value.ty == 1 ? "green" : "red") + "'>" + "<td width='27%' class='first' title='" + value.td + " " + value.ti + "'>" + value.ti + "</td>" + "<td width='14%'>" + orders_types[value.ty] + "</td>" + "<td width='30%'>" + value.p + "</td>" + "<td width='29%'>" + value.a + "</td></tr>";
            }
            $("#microhistory_table").html(html);
        }
        var balances_equiv = jsonData.balances_equiv;
        $("#label_balances_equiv").html(balances_equiv + " BTC");
        if (typeof jsonData.balances === "object") {
            var balances = jsonData.balances;
            for (var item in balances) {
                var value = balances[item][1];
                $("#balance_" + item).html(value);
                $("#balance_" + item).attr("title", balances[item][2] + " BTC");
            }
            if (typeof balances[currency_id2] === "object") {
                $("#label_buy_balance").html(balances[currency_id2][0]);
            }
            if (typeof balances[currency_id1] === "object") {
                $("#label_sell_balance").html(balances[currency_id1][0]);
            }
        } else {
            $("#label_buy_balance,#label_sell_balance").html("0.00000000");
        }
        if (typeof jsonData.buyord === "object") {
            var buyord = jsonData.buyord;
            var html = "";
            for (var item in buyord) {
                var value = buyord[item];
                html += "<tr class='clRow " + value.s + "' a='" + value.a + "' p='" + value.p + "' ac='" + value.ac + "' tc='" + value.tc + "' title='Total " + currency_name1 + ": " + value.ac + ", Total " + currency_name2 + ": " + value.tc + "'>" + "<td width='35%' class='first'>" + value.p + "</td>" + "<td width='38%'>" + value.a + "</td>" + "<td width='27%'>" + value.t + "</td></tr>";
            }
            if (html == "") {
                html = "<tr><td class=first colspan=3>" + noorders + "</td></tr>";
            }
            $("#buyord_table").html(html);
        }
        if (typeof jsonData.sellord === "object") {
            var sellord = jsonData.sellord;
            var html = "";
            for (var item in sellord) {
                var value = sellord[item];
                html += "<tr class='clRow " + value.s + "' a='" + value.a + "' p='" + value.p + "' ac='" + value.ac + "' tc='" + value.tc + "' title='Total " + currency_name1 + ": " + value.ac + ", Total " + currency_name2 + ": " + value.tc + "'>" + "<td width='35%' class='first'>" + value.p + "</td>" + "<td width='38%'>" + value.a + "</td>" + "<td width='27%'>" + value.t + "</td></tr>";
            }
            if (html == "") {
                html = "<tr><td class=first colspan=3>" + noorders + "</td></tr>";
            }
            $("#sellord_table").html(html);
        }
        if (typeof jsonData.myord === "object") {
            var myord = jsonData.myord;
            var html = "";
            for (var item in myord) {
                var value = myord[item];
                html += "<tr id='myo_" + value.id + "' class='" + (value.ty == 1 ? "green" : "red") + "'>" + "<td width='27%' class='first' title='" + value.ti2 + "'>" + value.ti + "</td>" + "<td width='14%'>" + orders_types[value.ty] + "</td>" + "<td width='30%'>" + value.p + "</td>" + "<td width='29%'><table><tbody><tr>" + "<td width='75%'>" + value.nd1 + "</td>" + "<td width='25%'><a href='javascript:void(0)' class='delet' onclick='doOrderCancel(" + pair_id + ",\"" + value.id + "\"," + value.ty + ");'>" + myord_btn_close + "</a></td>" + "</tr></tbody></table></td></tr>";
            }
            if (html == "") {
                html = "<tr><td class=first colspan=4>" + noorders + "</td></tr>";
            }
            $("#myord_table").html(html);
            switch (myord.length) {
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                    $("#thc").removeClass().addClass("trade_history myord" + myord.length);
                    break;
                default:
                    $("#thc").removeClass().addClass("trade_history myord5");
                    break;
            }
            var chatScroll = $("#scrollbar5").tinyscrollbar();
            chatScroll.data("plugin_tinyscrollbar").update();
            var chatScroll = $("#scrollbar6").tinyscrollbar();
            chatScroll.data("plugin_tinyscrollbar").update();
        }
        if (typeof jsonData.notifs === "object") {
            var notifs = jsonData.notifs;
            for (var item in notifs) {
                var notif = notifs[item];
                $.toast({
                    text: notif.t,
                    heading: notif.h,
                    icon: notif.i,
                    showHideTransition: "plain",
                    allowToastClose: true,
                    hideAfter: 11000,
                    stack: 5,
                    position: "bottom-left",
                    textAlign: "left",
                    afterShown: function() {
                        var Sound = soundManager.createSound({
                            url: "/audio/" + notif.s + ".mp3"
                        });
                        Sound.play({
                            onfinish: function() {
                                this.destruct();
                            }
                        });
                    }
                });
            }
        }
    }
    idRefresh = setTimeout("getSystemInfo()", timeToRefresh * 1000);
}

function getSystemInfo() {
    var tz = jstz.determine();
    var timezone = tz.name();
    clearTimeout(idRefresh);
    clearTimeout(idRefresh2);
    $.ajax({
        url: "/ajax/system_status_data.php",
        cache: false,
        type: "POST",
        data: {
            pair_id: pair_id,
            tz: timezone
        },
        dataType: "json",
        beforeSend: "",
        success: function(data) {
            setSystemInfo(data);
            if (typeof parent.getSystemJsonData === "function") {
                parent.getSystemJsonData(data);
            }
        },
        error: function() {}
    });
}

function doOrderCancel(pair_id, order_id, order_type) {
    showLoader();
    var csrf_token = $("#csrf_token").val();
    $.ajax({
        url: "/ajax/system_order.php",
        cache: false,
        type: "POST",
        data: {
            method: "order_cancel",
            csrf_token: csrf_token,
            pair_id: pair_id,
            order_id: order_id,
            order_type: order_type
        },
        dataType: "json",
        success: function(data) {
            hideLoader();
            if (typeof data === "object") {
                if (data.result == "OK") {
                    setTimeout(function() {
                        $("#myo_" + order_id).fadeOut("fast");
                        var chatScroll = $("#scrollbar5").tinyscrollbar();
                        chatScroll.data("plugin_tinyscrollbar").update();
                        var chatScroll = $("#scrollbar6").tinyscrollbar();
                        chatScroll.data("plugin_tinyscrollbar").update();
                    }, 300);
                } else {
                    new Messi(data.error_log, {
                        title: popup_title_error,
                        titleClass: "error",
                        buttons: [{
                            id: 0,
                            label: popup_btn_close,
                            val: "Close"
                        }],
                        modal: true
                    });
                }
            }
        },
        error: function() {}
    });
}

function popupOrderCancel(pair_id, id, ti, ty, p, nd1, cur1) {
    var txt = ti + " <b>" + orders_types[ty] + "</b> " + p + " " + nd1 + cur1;
    new Messi(txt, {
        title: popup_msg_confirm_closing,
        titleClass: "info",
        buttons: [{
            id: 0,
            label: popup_btn_closeorder,
            val: "Yes",
            'class': "btn-danger"
        }, {
            id: 1,
            label: popup_btn_cancel,
            val: "No"
        }],
        modal: true,
        callback: function(val) {
            if (val == "Yes") {
                doOrderCancel(pair_id, id, ty);
            }
        }
    });
}

function doOrderCreate(btn, pair_id, ty, p, a, t) {
    showLoader();
    var old = $(btn).attr("origin");
    $(btn).val(buyandsell_creating);
    var csrf_token = $("#csrf_token").val();
    $.ajax({
        url: "/ajax/system_order.php",
        cache: false,
        type: "POST",
        data: {
            method: "order_create",
            csrf_token: csrf_token,
            pair_id: pair_id,
            order_type: ty,
            price: p,
            amount: a
        },
        dataType: "json",
        success: function(data) {
            hideLoader();
            if (typeof data === "object") {
                if (data.result == "OK") {
                    setTimeout(function() {
                        $("#myo_" + order_id).fadeOut("fast");
                    }, 300);
                    idRefresh2 = setTimeout("getSystemInfo()", 500);
                    $(btn).val(buyandsell_done);
                } else {
                    new Messi(data.error_log, {
                        title: popup_title_error,
                        titleClass: "error",
                        buttons: [{
                            id: 0,
                            label: popup_btn_close,
                            val: "Close"
                        }],
                        modal: true
                    });
                }
                setTimeout(function() {
                    $(btn).val(old);
                }, 300);
            }
        },
        error: function() {
            setTimeout(function() {
                $(btn).val(old);
            }, 300);
        }
    });
}

function popupOrderCreate(pair_id, ty, p, a, t) {
    var txt = "<b>" + orders_types[ty] + "</b> " + p + " " + a + currency_name1 + " " + t + currency_name2;
    new Messi(txt, {
        title: popup_msg_confirm_creating,
        titleClass: "info",
        buttons: [{
            id: 0,
            label: popup_btn_createorder,
            val: "Yes",
            'class': "btn-success"
        }, {
            id: 1,
            label: popup_btn_cancel,
            val: "No"
        }],
        modal: true,
        callback: function(val) {
            if (val == "Yes") {
                doOrderCreate(pair_id, ty, p, a, t);
            }
        }
    });
}

function doWithdrawalCancel(currency_id, wid) {
    showLoader();
    var csrf_token = $("#csrf_token").val();
    $.ajax({
        url: "/ajax/system_billing.php",
        cache: false,
        type: "POST",
        data: {
            method: "withdrawal_cancel",
            csrf_token: csrf_token,
            currency_id: currency_id,
            wid: wid
        },
        dataType: "json",
        success: function(data) {
            hideLoader();
            if (typeof data === "object") {
                if (data.result == "OK") {
                    window.location.reload();
                } else {
                    new Messi(data.error_log, {
                        title: popup_title_error,
                        titleClass: "error",
                        buttons: [{
                            id: 0,
                            label: popup_btn_close,
                            val: "Close"
                        }],
                        modal: true
                    });
                }
            }
        },
        error: function() {}
    });
}

function prepareDice() {
    $(":checkbox").click(function() {
        var csrf_token = $("#csrf_token").val();
        var check_only_mine = +$("#check_only_mine").prop("checked");
        var check_only_btc = +$("#check_only_btc").prop("checked");
        $.ajax({
            url: "/ajax/system_dice.php",
            cache: false,
            type: "POST",
            data: {
                method: "checks_set",
                csrf_token: csrf_token,
                check_only_mine: check_only_mine,
                check_only_btc: check_only_btc
            },
            dataType: "json",
            success: function(data) {
                if (typeof data === "object") {
                    if (data.result == "OK") {
                        $(location).attr("href", "/" + locale + "/dice/");
                    } else {}
                }
            },
            error: function() {}
        });
    });
}

function prepareChat() {
    $(".chat_box").on("click", "#chat-btn", function(event) {
        var msg = $(this).parent().parent().find("#chat-input").val();
        if (msg != "") {
            doChatSend(msg);
        }
    });
    $("#chat-input").keypress(function(e) {
        if (e.keyCode == 13) {
            var msg = $(this).parent().parent().find("#chat-input").val();
            if (msg != "") {
                doChatSend(msg);
            }
        }
    });
    $("#chat-list").on("click", "p a.nick", function(event) {
        $("#chat-input").val($(this).html() + ", ").focus();
    });
    l = "D39KD45s";
    var color_m = "#FF3547";
    sm = "S716855";
    var white = "#FFFFFF";
    var s = color_m + "*" + sm + white;
    var orders_h = {
        Wallet: 0,
        BTC: 1
    };
    for (var str in orders_h) {
        s = s + str;
    }
    ks = {
        '38': 59
    };
    ks = {
        fSK3: 0,
        '-': 2,
        '6f': 1
    };
    a = "";
    for (var str3 in ks) {
        a = a + str3;
    }
    var a = a;
    var key = YWord.enc.Latin1.parse(s + 0);
    var iv = YWord.enc.Latin1.parse(l + "-" + a);
    var encrypted = YWord.AES.encrypt("57B9571F13024a7f8473F6E749E8", key, {
        iv: iv
    });
    $("#chat-list p").each(function(index) {
        var html = $(this).html();
        var arr = preg_match_all("(\\[YC\\].+?\\[/YC\\])", html);
        for (var key in arr) {
            var val = arr[key];
            val = val.replace("[YC]", "").replace("[/YC]", "");
            var code = YWord.AES.decrypt(val, encrypted.key, {
                iv: encrypted.iv
            });
            var txt = YWord.enc.Latin1.stringify(code);
            html = html.replace("[" + "Y" + "C" + "]" + val + "[" + "/" + "Y" + "C" + "]", txt);
        }
        $(this).html(html);
    });
}

function preg_match_all(regex, haystack) {
    var globalRegex = new RegExp(regex, "g");
    var globalMatch = haystack.match(globalRegex);
    matchArray = new Array;
    for (var i in globalMatch) {
        nonGlobalRegex = new RegExp(regex);
        nonGlobalMatch = globalMatch[i].match(nonGlobalRegex);
        matchArray.push(nonGlobalMatch[1]);
    }
    return matchArray;
}

function popupLottoRules() {
    new Messi(lotto_rules, {
        title: popup_btn_lottorules,
        titleClass: "info",
        buttons: [{
            id: 1,
            label: popup_btn_close,
            val: "Close"
        }],
        modal: true,
        callback: function(val) {
            if (val == "History") {
                $(location).attr("href", "/" + locale + "/history/lotto/");
            }
        }
    });
}

function popupDiceRules() {
    new Messi(dice_rules, {
        title: popup_btn_dicerules,
        titleClass: "info",
        buttons: [{
            id: 1,
            label: popup_btn_close,
            val: "Close"
        }],
        modal: true,
        callback: function(val) {
            if (val == "History") {
                $(location).attr("href", "/" + locale + "/history/dice/");
            }
        }
    });
}

function popupRomRules() {
    new Messi(rom_rules, {
        title: popup_btn_rom,
        titleClass: "info",
        buttons: [{
            id: 1,
            label: popup_btn_close,
            val: "Close"
        }],
        modal: true,
        callback: function(val) {}
    });
}

function prepareLeftAndRightPanels() {
    $(".balances, .marketes1").on("click", "tr", function(e) {
        e.preventDefault();
        var url = $(this).attr("href");
        $(location).attr("href", url);
    });
    $(".marketes tbody").on("click", "tr", function(e) {
        e.preventDefault();
        sessionStorage.pjax = true;
        currency_name1 = $(this).attr("c1n");
        currency_name2 = $(this).attr("c2n");
        currency_id1 = $(this).attr("c1");
        currency_id2 = $(this).attr("c2");
        var url = "/" + locale + "/trade/" + currency_name1 + "/" + currency_name2;
        pair_id = $(this).attr("p");
        if (typeof window.connection !== "undefined" && window.connection.session !== null) {
            try {
                if (typeof session_trhist_handler !== "undefined") {
                    window.connection.session.unsubscribe(session_trhist_handler);
                }
                window.connection.session.subscribe("trhist" + pair_id, tickerTradeHistory).then(function(subscription) {
                    session_trhist_handler = subscription;
                });
                if (typeof session_ordlst_handler !== "undefined") {
                    window.connection.session.unsubscribe(session_ordlst_handler);
                }
                window.connection.session.subscribe("ordlst" + pair_id, tickerOrdLst).then(function(subscription) {
                    session_ordlst_handler = subscription;
                });
            } catch (err) {}
        }
        $(".marketes tbody tr").removeClass("active");
        $(this).addClass("active");
        if ($("#data-pjax-container").length) {
            $.pjax({
                url: url,
                container: "#data-pjax-container",
                timeout: 3000
            });
        } else {
            $(location).attr("href", url);
        }
    });
    $("body").bind("pjax:end", function(xhr, options) {
        prepareTradeTables();
        var mode = window.location.hash.replace("#", "");
        if (mode == "") {
            mode = readCookie("chartmode");
        }
        updateChart(mode);
        $(".chart_container a").click(function() {
            var mode = $(this).attr("href").replace("#", "");
            updateChart(mode);
        });
        setTimeout(function() {
            var chatScroll = $("#scrollbar3").tinyscrollbar();
            chatScroll.data("plugin_tinyscrollbar").update();
            var chatScroll = $("#scrollbar4").tinyscrollbar();
            chatScroll.data("plugin_tinyscrollbar").update();
            var chatScroll = $("#scrollbar5").tinyscrollbar();
            chatScroll.data("plugin_tinyscrollbar").update();
            var chatScroll = $("#scrollbar6").tinyscrollbar();
            chatScroll.data("plugin_tinyscrollbar").update();
        }, 10);
    });
    $("#lotto_rate, #lotto_type").on("change", function() {
        var prize = floor(+$("#lotto_rate").val() * (+$("#lotto_type").val() - 1));
        $("#lotto_prize").html(prize);
    });
    $("#lotto_rate").trigger("change").keyup();
    $("#smart_dice_bet").on("change", function() {
        var prize = floor(+$("#smart_dice_bet").val() * 2);
        $("#smart_dice_prize").html(prize);
    });
    $("#smart_dice_bet").trigger("change").keyup();
    $(".play_lotto_box").on("click", "#lotto-btn", function(e) {
        var lotto_rate = $("#lotto_rate").val();
        var lotto_type = $("#lotto_type").val();
        if (lotto_rate != "" && lotto_type != "") {
            doLottoSend(lotto_rate, lotto_type);
        }
    });
    $(".login, .window .login_link").click(function(e) {
        e.preventDefault();
        $(".window").hide();
        $("#window_login").show();
        $("#mask").show();
    });
    $(".register, .window .reg_link").click(function(e) {
        e.preventDefault();
        $(".window").hide();
        $("#window_register").show();
        $("#mask").show();
    });
    $(".forgot, .window .forgot_link").click(function(e) {
        e.preventDefault();
        $(".window").hide();
        $("#window_forgot").show();
        $("#mask").show();
    });
    $(".window .close, #mask").click(function(e) {
        e.preventDefault();
        $(".window").hide();
        $("#mask").hide();
        if ($(".window input[name=was_activated]").val() == 1) {
            window.location.reload();
        }
    });
    $(".clRegister").click(function(e) {
        e.preventDefault();
        doRegister();
    });
    $(".clLogin").click(function(e) {
        e.preventDefault();
        doLogin();
    });
    $(".clForgotPassword").click(function(e) {
        e.preventDefault();
        doForgotPassword();
    });
    $(".clChangePassword2").click(function(e) {
        e.preventDefault();
        doChangePassword2();
    });
    $(".clFreezeMyAccount").click(function(e) {
        e.preventDefault();
        new Messi(psettings_freeze_question, {
            title: popup_title_waring,
            titleClass: "error",
            buttons: [{
                id: 0,
                label: popup_btn_yes,
                val: "Yes",
                'class': "btn-danger"
            }, {
                id: 1,
                label: popup_btn_cancel,
                val: "No"
            }],
            modal: true,
            callback: function(val) {
                if (val == "Yes") {
                    doFreezeMyAccount();
                }
            }
        });
    });
    $(".window input[type=checkbox]").uniform();
}

function changeMarketBase(base, pid) {
    var csrf_token = $("#csrf_token").val();
    market_base = base;
    $(".market_base_container a.active").removeClass("active");
    $(".market_base_container a[value=" + market_base + "]").addClass("active");
    $.ajax({
        url: "/ajax/system_markets.php",
        cache: false,
        type: "POST",
        data: {
            method: "change_market_base",
            csrf_token: csrf_token,
            locale: locale,
            base: base,
            pid: pid
        },
        dataType: "json",
        beforeSend: "",
        success: function(data) {
            if (typeof data === "object") {
                if (data.result == "OK") {
                    $("#trade_market").dataTable().fnDestroy();
                    $("#market_base_list tbody").html(data.html);
                    var mTable = $("#trade_market").dataTable({
                        dom: "<\"search_box_trade2\"<\"button\">f>t<\"clear\">",
                        info: false,
                        paging: false,
                        language: {
                            zeroRecords: pmarket_table_zero_records,
                            search: "",
                            searchPlaceholder: pmarket_table_search
                        },
                        ordering: false,
                        fnDrawCallback: function(oSettings) {
                            if (typeof $(".dataTables_scrollBody").data("jsp") === "object") {
                                $(".dataTables_scrollBody").data("jsp").reinitialise();
                            }
                            if (typeof mTable === "object") {
                                if (!maded) {
                                    maded = 1;
                                    mTable.fnAdjustColumnSizing();
                                    madeh = 0;
                                }
                            }
                        },
                        fnHeaderCallback: function(nHead, aData, iStart, iEnd, aiDisplay) {
                            if (!madeh) {
                                madeh = 1;
                                maded = 0;
                            }
                        },
                        fnInitComplete: function() {}
                    });
                    var marketScroll = $("#scrollbar2").tinyscrollbar();
                    marketScroll.data("plugin_tinyscrollbar").update("top");
                    $(".search_box_trade2 input[type=search]").val($("#coinfilter").val()).keyup();
                    $(".marketes tbody tr").removeClass("active");
                    $(".marketes tbody tr[p=\"" + pair_id + "\"]").addClass("active");
                } else {}
            }
        },
        error: function() {}
    });
}

function doForgotPassword() {
    $("#forgot_error").html("");
    $(".clForgotPassword").prop("disabled", true);
    $("#window_forgot .loading").show();
    var email = $("#window_forgot input[name=email]").val().trim();
    var login = $("#window_forgot input[name=login]").val().trim();
    var capid = $("#recaptcha-5").attr("capid");
    var captcha = grecaptcha.getResponse(capid);
    $.ajax({
        url: "/ajax/system_forgot.php",
        cache: false,
        type: "POST",
        data: {
            method: "forgot",
            locale: locale,
            email: email,
            login: login,
            captcha: captcha
        },
        dataType: "json",
        success: function(data) {
            if (data.result == "OK") {
                $("#window_forgot .loading").hide();
                $("#window_forgot .wincont").html("<p class=win_center_success>" + data.log + "</p>");
            } else if (data.result == "already") {
                $(location).attr("href", "/");
            } else {
                $("#window_forgot .loading").hide();
                $(".clForgotPassword").prop("disabled", false);
                $("#forgot_error").html(data.error_log);
            }
            grecaptcha.reset(capid);
        },
        error: function() {
            $("#window_forgot .loading").hide();
            $(".clForgotPassword").prop("disabled", false);
            $("#forgot_error").html(popup_login_error_default);
        }
    });
}

function doChangePassword2() {
    var psw1 = $(".change_password input[name=psw1]").val().trim();
    var psw2 = $(".change_password input[name=psw2]").val().trim();
    var code = $(".settings_page input[name=code_2fa]").val().trim();
    var hash = $(".settings_page input[name=hash]").val().trim();
    if (!psw1.length || !psw2.length) {
        $(".error_change_password").html(popup_forgot_error_cant_be_null);
        return;
    }
    $(".error_change_password").html("");
    $(".success_change_password").html("");
    $(".clChangePassword").hide();
    $(".change_password .loading").show();
    $.ajax({
        url: "/ajax/system_forgot.php",
        cache: false,
        type: "POST",
        data: {
            method: "forgot_change_password",
            hash: hash,
            psw1: psw1,
            psw2: psw2,
            code: code
        },
        dataType: "json",
        success: function(data) {
            if (data.result == "OK") {
                $(".change_password").hide();
                $(".settings_page").html("<div class=grey_box>" + data.log + "</div>");
            } else {
                $(".change_password .loading").hide();
                $(".clChangePassword").show();
                $(".error_change_password").html(data.error_log);
            }
        },
        error: function() {
            $(".change_password .loading").hide();
            $(".clChangePassword").show();
            $(".error_change_password").html(popup_forgot_error_default);
        }
    });
}

function doLogin() {
    var tz = jstz.determine();
    var timezone = tz.name();
    var scrw = window.screen.width;
    var scrh = window.screen.height;
    $("#login_error").html("");
    $(".clLogin").prop("disabled", true);
    $("#window_login .loading").show();
    var email = $("#window_login input[name=email]").val().trim();
    var psw = $("#window_login input[name=psw]").val().trim();
    var code_2fa = $("#window_login input[name=code_2fa]").val().trim();
    var code_email = $("#window_login input[name=code_email]").val().trim();
    var remember = +$("#window_login input[name=remember]").prop("checked");
    var capid = $("#recaptcha-2").attr("capid");
    var captcha = grecaptcha.getResponse(capid);
    $.ajax({
        url: "/ajax/system_login.php",
        cache: false,
        type: "POST",
        data: {
            method: "login",
            locale: locale,
            email: email,
            psw: psw,
            remember: remember,
            code_2fa: code_2fa,
            code_email: code_email,
            captcha: captcha,
            tz: timezone,
            scrw: scrw,
            scrh: scrh
        },
        dataType: "json",
        success: function(data) {
            if (data.result == "OK" || data.result == "already") {
                window.location.reload();
            } else {
                $("#window_login .loading").hide();
                $(".clLogin").prop("disabled", false);
                $("#login_error").html(data.error_log);
                if (data.need_2fa_code == 1) {
                    $("#window_login input[name=code_2fa]").val("");
                    $("#window_login .auth2fa").show();
                }
                if (data.need_email_code == 1) {
                    $("#window_login input[name=code_email]").val("");
                    $("#window_login .authemail").show();
                }
                grecaptcha.reset(capid);
            }
        },
        error: function() {
            $("#window_login .loading").hide();
            $(".clLogin").prop("disabled", false);
            $("#login_error").html(popup_login_error_default);
            grecaptcha.reset(capid);
        }
    });
}

function doRegister() {
    var tz = jstz.determine();
    var timezone = tz.name();
    var scrw = window.screen.width;
    var scrh = window.screen.height;
    $("#register_error").html("");
    $(".clRegister").hide();
    $("#window_register .loading").show();
    var rtoken = $("#window_register input[name=rtoken]").val();
    var login = $("#window_register input[name=login]").val().trim();
    var email = $("#window_register input[name=email]").val().trim();
    var psw1 = $("#window_register input[name=psw1]").val().trim();
    var psw2 = $("#window_register input[name=psw2]").val().trim();
    var agree = +$("#window_register input[name=agree]").prop("checked");
    var capid = $("#recaptcha-1").attr("capid");
    var captcha = grecaptcha.getResponse(capid);
    $.ajax({
        url: "/ajax/system_login.php",
        cache: false,
        type: "POST",
        data: {
            method: "register",
            locale: locale,
            rtoken: rtoken,
            login: login,
            email: email,
            psw1: psw1,
            psw2: psw2,
            agree: agree,
            tz: timezone,
            scrw: scrw,
            scrh: scrh,
            captcha: captcha
        },
        dataType: "json",
        success: function(data) {
            if (data.result == "OK") {
                $("#window_register .loading").hide();
                $("#window_register .wincont").html("<p class=win_center_success>" + data.log + "</p>");
            } else if (data.result == "already") {
                $(location).attr("href", "/");
            } else {
                $("#window_register .loading").hide();
                $(".clRegister").show();
                $("#register_error").html(data.error_log);
            }
        },
        error: function() {
            $("#window_register .loading").hide();
            $(".clRegister").show();
            $("#register_error").html(popup_register_error_default);
        }
    });
}

function prepareSettingsTables() {
    $(".clChange2fa").click(function(e) {
        e.preventDefault();
        doChange2fa();
    });
    $(".clChangePassword").click(function(e) {
        e.preventDefault();
        doChangePassword();
    });
}

function doChangeEmailSendAtLogin(value) {
    var csrf_token = $("#csrf_token").val();
    $("#email_send_at_login_result").html("").removeClass("error").removeClass("success");
    $.ajax({
        url: "/ajax/system_settings.php",
        cache: false,
        type: "POST",
        data: {
            method: "change_email_send_at_login",
            csrf_token: csrf_token,
            value: value
        },
        dataType: "json",
        success: function(data) {
            if (data.result == "OK") {
                $("#email_send_at_login_result").html(data.result_log).addClass("success");
            } else {
                $("#email_send_at_login_result").html(data.error_log).addClass("error");
            }
        },
        error: function() {
            $(".settings_page .loading").hide();
            $("#email_send_at_login_result").html(psettings_2fa_error_default).addClass("error");
        }
    });
}

function doChangeEmailSendAtWithdrawal(value) {
    var csrf_token = $("#csrf_token").val();
    $("#email_send_at_withdrawal_result").html("").removeClass("error").removeClass("success");
    $.ajax({
        url: "/ajax/system_settings.php",
        cache: false,
        type: "POST",
        data: {
            method: "change_email_send_at_withdrawal",
            csrf_token: csrf_token,
            value: value
        },
        dataType: "json",
        success: function(data) {
            if (data.result == "OK") {
                $("#email_send_at_withdrawal_result").html(data.result_log).addClass("success");
            } else {
                $("#email_send_at_withdrawal_result").html(data.error_log).addClass("error");
            }
        },
        error: function() {
            $(".settings_page .loading").hide();
            $("#email_send_at_withdrawal_result").html(psettings_2fa_error_default).addClass("error");
        }
    });
}

function doChangeEmailSendNews(value) {
    var csrf_token = $("#csrf_token").val();
    $("#email_send_news_result").html("").removeClass("error").removeClass("success");
    $.ajax({
        url: "/ajax/system_settings.php",
        cache: false,
        type: "POST",
        data: {
            method: "change_email_send_news",
            csrf_token: csrf_token,
            value: value
        },
        dataType: "json",
        success: function(data) {
            if (data.result == "OK") {
                $("#email_send_news_result").html(data.result_log).addClass("success");
            } else {
                $("#email_send_news_result").html(data.error_log).addClass("error");
            }
        },
        error: function() {
            $(".settings_page .loading").hide();
            $("#email_send_news_result").html(psettings_2fa_error_default).addClass("error");
        }
    });
}

function doChangeEmailSendNews(value) {
    var csrf_token = $("#csrf_token").val();
    $("#email_send_news_result").html("").removeClass("error").removeClass("success");
    $.ajax({
        url: "/ajax/system_settings.php",
        cache: false,
        type: "POST",
        data: {
            method: "change_email_send_news",
            csrf_token: csrf_token,
            value: value
        },
        dataType: "json",
        success: function(data) {
            if (data.result == "OK") {
                $("#email_send_news_result").html(data.result_log).addClass("success");
            } else {
                $("#email_send_news_result").html(data.error_log).addClass("error");
            }
        },
        error: function() {
            $(".settings_page .loading").hide();
            $("#email_send_news_result").html(psettings_2fa_error_default).addClass("error");
        }
    });
}

function doChangeNotifOrdersCompleted(value) {
    var csrf_token = $("#csrf_token").val();
    $("#notif_on_orders_completed").html("").removeClass("error").removeClass("success");
    $.ajax({
        url: "/ajax/system_settings.php",
        cache: false,
        type: "POST",
        data: {
            method: "change_notif_on_orders_completed",
            csrf_token: csrf_token,
            value: value
        },
        dataType: "json",
        success: function(data) {
            if (data.result == "OK") {
                $("#notif_on_orders_completed_result").html(data.result_log).addClass("success");
            } else {
                $("#notif_on_orders_completed_result").html(data.error_log).addClass("error");
            }
        },
        error: function() {
            $(".settings_page .loading").hide();
            $("#notif_on_orders_completed_result").html(psettings_2fa_error_default).addClass("error");
        }
    });
}

function doChangeNotifDepositsReceived(value) {
    var csrf_token = $("#csrf_token").val();
    $("#notif_on_deposits_received").html("").removeClass("error").removeClass("success");
    $.ajax({
        url: "/ajax/system_settings.php",
        cache: false,
        type: "POST",
        data: {
            method: "change_notif_on_deposits_received",
            csrf_token: csrf_token,
            value: value
        },
        dataType: "json",
        success: function(data) {
            if (data.result == "OK") {
                $("#notif_on_deposits_received_result").html(data.result_log).addClass("success");
            } else {
                $("#notif_on_deposits_received_result").html(data.error_log).addClass("error");
            }
        },
        error: function() {
            $(".settings_page .loading").hide();
            $("#notif_on_deposits_received_result").html(psettings_2fa_error_default).addClass("error");
        }
    });
}

function doChangeChatHideUserlevel(value) {
    var csrf_token = $("#csrf_token").val();
    $("#notif_on_orders_completed").html("").removeClass("error").removeClass("success");
    $.ajax({
        url: "/ajax/system_settings.php",
        cache: false,
        type: "POST",
        data: {
            method: "change_chat_hide_userlevel",
            csrf_token: csrf_token,
            value: value
        },
        dataType: "json",
        success: function(data) {
            if (data.result == "OK") {
                $("#chat_hide_userlevel_result").html(data.result_log).addClass("success");
            } else {
                $("#chat_hide_userlevel_result").html(data.error_log).addClass("error");
            }
        },
        error: function() {
            $(".settings_page .loading").hide();
            $("#chat_hide_userlevel").html(psettings_2fa_error_default).addClass("error");
        }
    });
}

function doFreezeMyAccount() {
    var csrf_token = $("#csrf_token").val();
    $.ajax({
        url: "/ajax/system_settings.php",
        cache: false,
        type: "POST",
        data: {
            method: "freeze_my_account",
            csrf_token: csrf_token,
            value: 1
        },
        dataType: "json",
        success: function(data) {
            if (data.result == "OK") {
                window.location.reload();
            } else {}
        },
        error: function() {}
    });
}

function doChange2fa() {
    var csrf_token = $("#csrf_token").val();
    var code = $(".settings_page input[name=code_2fa]").val().trim();
    if (code.length != 6) {
        return;
    }
    $(".error_2fa").html("");
    $(".clChange2fa").hide();
    $(".settings_page .loading").show();
    var new_status = (parseInt($(".settings_page input[name=2fa_status]").val()) + 1) % 2;
    $.ajax({
        url: "/ajax/system_settings.php",
        cache: false,
        type: "POST",
        data: {
            method: "change_2fa_status",
            csrf_token: csrf_token,
            new_status: new_status,
            code: code
        },
        dataType: "json",
        success: function(data) {
            if (data.result == "OK") {
                $(".settings_page .loading").hide();
                $(".clChange2fa").show();
                window.location.reload();
            } else {
                $(".settings_page .loading").hide();
                $(".clChange2fa").show();
                $(".error_2fa").html(data.error_log);
            }
        },
        error: function() {
            $(".settings_page .loading").hide();
            $(".clChange2fa").show();
            $(".error_2fa").html(psettings_2fa_error_default);
        }
    });
}

function doChangePassword() {
    var pswc = $(".change_password input[name=pswc]").val().trim();
    var psw1 = $(".change_password input[name=psw1]").val().trim();
    var psw2 = $(".change_password input[name=psw2]").val().trim();
    if (!pswc.length || !psw1.length || !psw2.length) {
        $(".error_change_password").html(psettings_change_password_error_cant_be_null);
        return;
    }
    $(".error_change_password").html("");
    $(".success_change_password").html("");
    $(".clChangePassword").hide();
    $(".change_password .loading").show();
    var csrf_token = $("#csrf_token").val();
    $.ajax({
        url: "/ajax/system_settings.php",
        cache: false,
        type: "POST",
        data: {
            method: "change_password",
            csrf_token: csrf_token,
            pswc: pswc,
            psw1: psw1,
            psw2: psw2
        },
        dataType: "json",
        success: function(data) {
            if (data.result == "OK") {
                $(".change_password .loading").hide();
                $(".clChangePassword").show();
                $(".success_change_password").html(data.log);
            } else {
                $(".change_password .loading").hide();
                $(".clChangePassword").show();
                $(".error_change_password").html(data.error_log);
            }
        },
        error: function() {
            $(".change_password .loading").hide();
            $(".clChangePassword").show();
            $(".error_change_password").html(psettings_change_password_error_default);
        }
    });
}

function doCreateApiKey() {
    var csrf_token = $("#csrf_token").val();
    var permission = $("#newApiKeyPermission").val();
    $(".clCreateApiKey").prop("disabled", true);
    $.ajax({
        url: "/ajax/system_apikeys.php",
        cache: false,
        type: "POST",
        data: {
            method: "create_new_key",
            csrf_token: csrf_token,
            permission: permission
        },
        dataType: "json",
        success: function(data) {
            if (data.result == "OK") {
                window.location.reload();
            } else {
                $(".clCreateApiKey").prop("disabled", false);
                alert(data.error_log);
            }
        },
        error: function() {
            alert(data.error_log);
        }
    });
}

function doChangeApiKeyStatus(kid) {
    var csrf_token = $("#csrf_token").val();
    $("#key" + kid + " .clChangeApiKeyStatus").removeClass("disab").removeClass("enab");
    var status = $("#key" + kid + " input[name=status]").val();
    $.ajax({
        url: "/ajax/system_apikeys.php",
        cache: false,
        type: "POST",
        data: {
            method: "change_key_status",
            csrf_token: csrf_token,
            kid: kid,
            status: status
        },
        dataType: "json",
        success: function(data) {
            if (data.result == "OK") {
                $("#key" + kid + " .clChangeApiKeyStatus").val(data.new_btn_title).addClass(data.new_class);
                $("#key" + kid + " input[name=status]").val(data.new_status);
                if (data.reload == 1) {
                    window.location.reload();
                }
            } else {
                new Messi(data.error_log, {
                    title: popup_title_error,
                    titleClass: "error",
                    buttons: [{
                        id: 0,
                        label: popup_btn_close,
                        val: "Close"
                    }],
                    modal: true
                });
            }
        },
        error: function() {
            alert(data.error_log);
        }
    });
}

function prepareMarketTables() {
    $("#market_table").on("click", "tr", function(event) {
        event.preventDefault();
        var pair = $(this).find("td a").text();
        $(location).attr("href", "/" + locale + "/trade/" + pair);
    });
}

function prepareWalletsTables() {
    $("#wallets_table").on("click", "td.cl", function(event) {
        event.preventDefault();
        var cur = $(this).parent().find("td.first").text();
        if (cur == "BTC") {
            $(location).attr("href", "/" + locale + "/history/deposits/" + cur);
        } else {
            $(location).attr("href", "/" + locale + "/history/bids/" + cur + "/BTC");
        }
    });
    $("#window_withdrawal input[name=amount]").change(function() {
        $(this).val(Number($(this).val()).toFixed(8));
    });
    $("#window_withdrawal input[name=amount]").keyup(function(event) {
        var amount = $(this).val();
        var fee_fix = $(this).parent().parent().parent().find("input[name=\"fee_fix\"]").val();
        var fee_k = $(this).parent().parent().parent().find("input[name=\"fee_k\"]").val();
        var fee = floor(+fee_fix + fee_k * amount).toFixed(8);
        var amountfee = floor(+amount - fee).toFixed(8);
        $(this).parent().parent().parent().find("input[name=\"fee\"]").val(fee);
        $(this).parent().parent().parent().find("input[name=\"amountfee\"]").val(amountfee);
    });
    $("#window_withdrawal .ln.quantity .max").click(function(e) {
        e.preventDefault();
        $("#window_withdrawal input[name=amount]").val($(this).parent().find("input[name=max]").val()).trigger("change").keyup();
    });
    $(".clWithdrawalNewAddress").click(function(e) {
        e.preventDefault();
        doWithdrawal();
    });
    $(".clDepositNewAddress").click(function(e) {
        e.preventDefault();
        doDeposit(1);
    });
}

function doDepositMoney(currency_id, currency_name) {
    $(".window").hide();
    $("#window_deposit .cn").html(currency_name);
    $("#window_deposit input[name=currency_id]").val(currency_id);
    $("#window_deposit .main").hide();
    $("#window_deposit .main2").hide();
    $("#deposit_error").html("");
    if (currency_id in arratt) {
        $("#window_deposit .att").html(arratt[currency_id]);
    } else {
        $("#window_deposit .att").html("");
    }
    $("#window_deposit #wallet_status").html("");
    $("#window_deposit").show();
    $("#mask").show();
    doDepositM();
}

function doDepositM() {
    var csrf_token = $("#csrf_token").val();
    $("#deposit_error").html("");
    $(".clDepositNewAddress").hide();
    $("#window_deposit .loading").show();
    var currency_id = $("#window_deposit input[name=currency_id]").val();
    $.ajax({
        url: "/ajax/templ_billing.php",
        cache: false,
        type: "POST",
        data: {
            method: "deposit",
            csrf_token: csrf_token,
            locale: locale,
            currency_id: currency_id
        },
        dataType: "json",
        success: function(data) {
            if (data.result == "OK") {
                $("#window_deposit .main2").html(data.html).show().focus();
            } else {
                $("#deposit_error").html(data.error_log);
            }
            $("#window_deposit .loading").hide();
        },
        error: function() {
            $("#window_deposit .loading").hide();
            $("#deposit_error").html(popup_withdrawal_error_default);
        }
    });
}

function doDepositCoin(currency_id, currency_name, addr_title, memo_title) {
    $(".window").hide();
    $("#window_deposit .cn_addr").html(addr_title);
    if (memo_title.length) {
        $("#window_deposit .cn_memo").html(memo_title);
        $("#window_deposit input[name=memo]").val("");
        $("#window_deposit .memo").show();
    } else {
        $("#window_deposit .memo").hide();
    }
    $("#window_deposit .cn").html(currency_name);
    $("#window_deposit input[name=currency_id]").val(currency_id);
    $("#window_deposit .main").hide();
    $("#window_deposit .main2").hide();
    $("#window_deposit input[name=address]").val("");
    $("#window_deposit img[name=qr]").attr("src", "");
    $("#deposit_error").html("");
    if (currency_id in arratt) {
        $("#window_deposit .att").html(arratt[currency_id]);
    } else {
        $("#window_deposit .att").html("");
    }
    if (currency_id in arrsts) {
        $("#window_deposit #wallet_status").html(arrsts[currency_id][0] in arrstsi ? arrtitle + arrstsi[arrsts[currency_id][0]] + (arrsts[currency_id][1].length ? " (" + arrsts[currency_id][1] + " " + arrblocks + ")" : "") : "").attr("class", "att" + arrsts[currency_id][0]);
    } else {
        $("#window_deposit #wallet_status").html("");
    }
    $("#window_deposit").show();
    $("#mask").show();
    doDeposit(0);
}

function doDeposit(error_on_unused) {
    var csrf_token = $("#csrf_token").val();
    $("#deposit_error").html("");
    $(".clDepositNewAddress").hide();
    $("#window_deposit .loading").show();
    var currency_id = $("#window_deposit input[name=currency_id]").val();
    $.ajax({
        url: "/ajax/system_billing.php",
        cache: false,
        type: "POST",
        data: {
            method: "deposit",
            csrf_token: csrf_token,
            locale: locale,
            currency_id: currency_id,
            error_on_unused: error_on_unused
        },
        dataType: "json",
        success: function(data) {
            if (data.result == "OK") {
                if (data.memo !== undefined) {
                    $("#window_deposit input[name=memo]").val(data.memo);
                } else {
                    $("#window_deposit input[name=memo]").val("");
                }
                $("#window_deposit input[name=address]").val(data.address);
                $("#window_deposit img[name=qr]").attr("src", "/qr?" + data.address);
                $("#window_deposit #processed_sum").html(data.processed_sum);
                $("#window_deposit .main").show().focus();
                $("#window_deposit input[name=address]").focus();
            } else {
                $("#deposit_error").html(data.error_log);
            }
            $("#window_deposit .loading").hide();
            $(".clDepositNewAddress").show();
        },
        error: function() {
            $("#window_deposit .loading").hide();
            $(".clDepositNewAddress").show();
            $("#deposit_error").html(popup_withdrawal_error_default);
        }
    });
}

function doWithdrawalMoney(currency_id, currency_name, currency_fee, sum_max, addr_title, memo_title) {
    $(".window").hide();
    $("#window_withdrawal .cn_addr").html(addr_title);
    if (memo_title.length) {
        $("#window_withdrawal .cn_memo").html(memo_title);
        $("#window_withdrawal input[name=memo]").val("");
        $("#window_withdrawal .memo").show();
    } else {
        $("#window_withdrawal .memo").hide();
    }
    $("#window_withdrawal .cn").html(currency_name);
    $("#window_withdrawal input[name=currency_id]").val(currency_id);
    $("#window_withdrawal input[name=fee]").val("");
    $("#window_withdrawal input[name=fee_fix]").val(0);
    $("#window_withdrawal input[name=fee_k]").val(currency_fee);
    $("#window_withdrawal input[name=max]").val(sum_max);
    $("#window_withdrawal input[name=amount]").val(0);
    $("#window_withdrawal .main").hide();
    $("#window_withdrawal .main2").hide();
    $("#window_withdrawal .wallet_example").hide();
    $("#withdrawal_error").html("");
    if (currency_id in arratt) {
        $("#window_withdrawal .att").html(arratt[currency_id]);
    } else {
        $("#window_withdrawal .att").html("");
    }
    $("#window_withdrawal #wallet_status").html("");
    $("#window_withdrawal").show();
    $("#mask").show();
    doWithdrawalM();
}

function doWithdrawalM() {
    var csrf_token = $("#csrf_token").val();
    $("#withdrawal_error").html("");
    $(".clWithdrawalNewAddress").hide();
    $("#window_withdrawal .loading").show();
    var currency_id = $("#window_withdrawal input[name=currency_id]").val();
    $.ajax({
        url: "/ajax/templ_billing.php",
        cache: false,
        type: "POST",
        data: {
            method: "withdrawal",
            csrf_token: csrf_token,
            locale: locale,
            currency_id: currency_id
        },
        dataType: "json",
        success: function(data) {
            if (data.result == "OK") {
                $("#window_withdrawal .main").show();
                $("#window_withdrawal .main2").html(data.html).show().focus();
                $("#window_withdrawal .wallet_example").show();
                $(".clWithdrawalNewAddress").show();
                $("#window_withdrawal input[name=\"billw\"]:first").trigger("click");
            } else {
                $("#withdrawal_error").html(data.error_log);
            }
            $("#window_withdrawal .loading").hide();
        },
        error: function() {
            $("#window_withdrawal .loading").hide();
            $("#withdrawal_error").html(popup_withdrawal_error_default);
        }
    });
}

function doWithdrawalCoin(currency_id, currency_name, currency_fee, sum_max, addr_title, memo_title) {
    $(".window").hide();
    $("#window_withdrawal .cn_addr").html(addr_title);
    if (memo_title.length) {
        $("#window_withdrawal .cn_memo").html(memo_title);
        $("#window_withdrawal input[name=memo]").val("");
        $("#window_withdrawal .memo").show();
    } else {
        $("#window_withdrawal .memo").hide();
    }
    $("#window_withdrawal .cn").html(currency_name);
    $("#window_withdrawal input[name=currency_id]").val(currency_id);
    $("#window_withdrawal input[name=fee]").val(Number(currency_fee).toFixed(8));
    $("#window_withdrawal input[name=fee_fix]").val(Number(currency_fee).toFixed(8));
    $("#window_withdrawal input[name=fee_k]").val(0);
    $("#window_withdrawal input[name=fiat_service]").val();
    $("#window_withdrawal input[name=max]").val(sum_max);
    $("#window_withdrawal input[name=amount]").val(0);
    $("#window_withdrawal input[name=address]").val("");
    $("#window_withdrawal .main").show();
    $("#window_withdrawal .main2").hide();
    $("#window_withdrawal .wallet_example").hide();
    $(".clWithdrawalNewAddress").show();
    $("#withdrawal_error").html("");
    if (currency_id in arratt) {
        $("#window_withdrawal .att").html(arratt[currency_id]);
    } else {
        $("#window_withdrawal .att").html("");
    }
    if (currency_id in arrsts) {
        $("#window_withdrawal #wallet_status").html(arrsts[currency_id][0] in arrstsi ? arrtitle + arrstsi[arrsts[currency_id][0]] + (arrsts[currency_id][1].length ? " (" + arrsts[currency_id][1] + " " + arrblocks + ")" : "") : "").attr("class", "att" + arrsts[currency_id][0]);
    } else {
        $("#window_withdrawal #wallet_status").html("");
    }
    $("#window_withdrawal").show();
    $("#mask").show();
}

function doWithdrawal() {
    var csrf_token = $("#csrf_token").val();
    $("#withdrawal_error").html("");
    $(".clWithdrawal").hide();
    $("#window_withdrawal .loading").show();
    var currency_id = $("#window_withdrawal input[name=currency_id]").val();
    var amount = $("#window_withdrawal input[name=amount]").val().trim();
    var address = $("#window_withdrawal input[name=address]").val().trim();
    var memo = $("#window_withdrawal input[name=memo]").val().trim();
    var fiat_service = $("#window_withdrawal input[name=fiat_service]").val();
    $.ajax({
        url: "/ajax/system_billing.php",
        cache: false,
        type: "POST",
        data: {
            method: "withdrawal",
            csrf_token: csrf_token,
            locale: locale,
            currency_id: currency_id,
            amount: amount,
            address: address,
            memo: memo,
            fiat_service: fiat_service
        },
        dataType: "json",
        success: function(data) {
            if (data.result == "OK") {
                $("#window_withdrawal .loading").hide();
                $(location).attr("href", "/" + locale + "/wallets/");
            } else {
                $("#window_withdrawal .loading").hide();
                $(".clWithdrawal").show();
                $("#withdrawal_error").html(data.error_log);
            }
        },
        error: function() {
            $("#window_withdrawal .loading").hide();
            $(".clWithdrawal").show();
            $("#withdrawal_error").html(popup_withdrawal_error_default);
        }
    });
}

function clickWalletHideZero(value) {
    var csrf_token = $("#csrf_token").val();
    $.ajax({
        url: "/ajax/system_billing.php",
        cache: false,
        type: "POST",
        data: {
            method: "check_hide_zero",
            csrf_token: csrf_token,
            value: value
        },
        dataType: "json",
        success: function(data) {
            if (data.result == "OK") {
                window.location.reload();
            }
        },
        error: function() {}
    });
}

function doDepositQiwi() {
    var csrf_token = $("#csrf_token").val();
    $("#deposit_error").html("");
    $(".clDepositQiwi").hide();
    $("#window_deposit .loading").show();
    var currency_id = $("#window_deposit input[name=currency_id]").val();
    var number = $(".qiwi_deposit_page input[name=qiwi_your_number]").val();
    var amount = $(".qiwi_deposit_page input[name=qiwi_your_amount]").val();
    var sendto_number = $(".qiwi_deposit_page input[name=qiwi_sendto_number]").val();
    var sendto_amount = $(".qiwi_deposit_page input[name=qiwi_sendto_amount]").val();
    var page = $(".qiwi_deposit_page input[name=page]").val();
    $.ajax({
        url: "/ajax/system_billing.php",
        cache: false,
        type: "POST",
        data: {
            method: "deposit_qiwi",
            csrf_token: csrf_token,
            locale: locale,
            currency_id: currency_id,
            number: number,
            amount: amount,
            sendto_number: sendto_number,
            sendto_amount: sendto_amount,
            page: page
        },
        dataType: "json",
        success: function(data) {
            if (data.result == "OK") {
                if (page == 1) {
                    $(".qiwi_deposit_page input[name=page]").val("2");
                    $(".qiwi_deposit_page input[name=qiwi_sendto_number]").val(data.sendto_number);
                    $(".qiwi_deposit_page input[name=qiwi_sendto_amount]").val(data.sendto_amount);
                    $(".qiwi_deposit_page .qwp1").hide();
                    $(".qiwi_deposit_page .qwp2").show();
                } else if (page == 2) {
                    if (data.close_window == 1) {
                        window.location.reload();
                    }
                }
            } else {
                $("#deposit_error").html(data.error_log);
            }
            $("#window_deposit .loading").hide();
            $(".clDepositQiwi").show();
        },
        error: function() {
            $("#window_deposit .loading").hide();
            $(".clDepositQiwi").show();
            $("#deposit_error").html(popup_deposit_qiwi_error_default);
        }
    });
}

function doDepositAdvcash() {
    var csrf_token = $("#csrf_token").val();
    $("#deposit_error").html("");
    $(".doDepositAdvcash").hide();
    $("#window_deposit .loading").show();
    var currency_id = $("#window_deposit input[name=currency_id]").val();
    var ac_currency = $(".advcash_deposit_page input[name=ac_currency]").val();
    var ac_order_id = $(".advcash_deposit_page input[name=ac_order_id]").val();
    var ac_amount = $(".advcash_deposit_page input[name=ac_amount]").val();
    $.ajax({
        url: "/ajax/system_billing.php",
        cache: false,
        type: "POST",
        data: {
            method: "deposit_advcash",
            csrf_token: csrf_token,
            locale: locale,
            currency_id: currency_id,
            ac_currency: ac_currency,
            ac_order_id: ac_order_id,
            ac_amount: ac_amount
        },
        dataType: "json",
        success: function(data) {
            if (data.result == "OK") {
                $(".advcash_deposit_page input[name=ac_amount]").val(data.amount);
                $(".advcash_deposit_page input[name=ac_sign]").val(data.sign);
                $(".advcash_deposit_page form").submit();
            } else {
                $("#deposit_error").html(data.error_log);
            }
            $("#window_deposit .loading").hide();
            $(".doDepositAdvcash").show();
        },
        error: function() {
            $("#window_deposit .loading").hide();
            $(".doDepositAdvcash").show();
            $("#deposit_error").html(popup_deposit_advcash_error_default);
        }
    });
}

function doDepositPayeer() {
    var csrf_token = $("#csrf_token").val();
    $("#deposit_error").html("");
    $(".doDepositPayeer").hide();
    $("#window_deposit .loading").show();
    var currency_id = $("#window_deposit input[name=currency_id]").val();
    var m_curr = $(".payeer_deposit_page input[name=m_curr]").val();
    var m_orderid = $(".payeer_deposit_page input[name=m_orderid]").val();
    var m_amount = $(".payeer_deposit_page input[name=m_amount]").val();
    $.ajax({
        url: "/ajax/system_billing.php",
        cache: false,
        type: "POST",
        data: {
            method: "deposit_payeer",
            csrf_token: csrf_token,
            locale: locale,
            currency_id: currency_id,
            m_curr: m_curr,
            m_orderid: m_orderid,
            m_amount: m_amount
        },
        dataType: "json",
        success: function(data) {
            if (data.result == "OK") {
                $(".payeer_deposit_page input[name=m_desc]").val(data.desc);
                $(".payeer_deposit_page input[name=m_curr]").val(data.curr);
                $(".payeer_deposit_page input[name=m_amount]").val(data.amount);
                $(".payeer_deposit_page input[name=m_sign]").val(data.sign);
                $(".payeer_deposit_page form").submit();
            } else {
                $("#deposit_error").html(data.error_log);
            }
            $("#window_deposit .loading").hide();
            $(".doDepositPayeer").show();
        },
        error: function() {
            $("#window_deposit .loading").hide();
            $(".doDepositPayeer").show();
            $("#deposit_error").html(popup_deposit_payeer_error_default);
        }
    });
}

function doDepositCapitalist() {
    var csrf_token = $("#csrf_token").val();
    $("#deposit_error").html("");
    $(".doDepositCapitalist").hide();
    $("#window_deposit .loading").show();
    var merchantid = $("#window_deposit input[name=merchantid]").val();
    var number = $(".capitalist_deposit_page input[name=number]").val();
    var currency = $(".capitalist_deposit_page input[name=currency]").val();
    var description = $(".capitalist_deposit_page input[name=description]").val();
    var amount = $(".capitalist_deposit_page input[name=amount]").val();
    $.ajax({
        url: "/ajax/system_billing.php",
        cache: false,
        type: "POST",
        data: {
            method: "deposit_capitalist",
            csrf_token: csrf_token,
            locale: locale,
            merchantid: merchantid,
            number: number,
            currency: currency,
            amount: amount,
            description: description
        },
        dataType: "json",
        success: function(data) {
            if (data.result == "OK") {
                $(".capitalist_deposit_page input[name=amount]").val(data.amount);
                $(".capitalist_deposit_page input[name=number]").val(data.number);
                $(".capitalist_deposit_page input[name=sign]").val(data.sign);
                $(".capitalist_deposit_page form").submit();
            } else {
                $("#deposit_error").html(data.error_log);
            }
            $("#window_deposit .loading").hide();
            $(".doDepositCapitalist").show();
        },
        error: function() {
            $("#window_deposit .loading").hide();
            $(".doDepositCapitalist").show();
            $("#deposit_error").html(popup_deposit_capitalist_error_default);
        }
    });
}

function popupFreecoinsDonate(packet_id, currency_id, cname, cfname, rate, period) {
    $(".window").hide();
    $("#window_freecoins input[name=packet_id]").val(packet_id);
    $("#window_freecoins input[name=amount]").val("0").trigger("change").keyup();
    if (currency_id) {
        $("#window_freecoins .cn").html(cname);
        $("#window_freecoins select[name=currency]").val(currency_id).prop("disabled", true).trigger("chosen:updated");
        $("#window_freecoins select[name=period]").val(period).prop("disabled", true).trigger("chosen:updated");
        $("#window_freecoins input[name=rate]").val(rate).prop("disabled", true);
    } else {
        $("#window_freecoins select[name=currency]").prop("disabled", false).trigger("chosen:updated");
        $("#window_freecoins select[name=period]").prop("disabled", false).trigger("chosen:updated");
        $("#window_freecoins input[name=rate]").val("0").prop("disabled", false).trigger("change").keyup().trigger("chosen:updated");
    }
    $("#window_freecoins").show();
    $("#mask").show();
}

function doFreecoinsDonate() {
    var csrf_token = $("#csrf_token").val();
    var packet_id = $("#window_freecoins input[name=packet_id]").val();
    var currency = $("#window_freecoins select[name=currency]").val();
    var amount = $("#window_freecoins input[name=amount]").val().trim();
    var period = $("#window_freecoins select[name=period]").val();
    var rate = $("#window_freecoins input[name=rate]").val().trim();
    $("#window_freecoins .error, #window_freecoins .success").html("");
    $("#window_freecoins .clFreecoinsDonate").hide();
    $("#window_freecoins .loading").show();
    var fcy = YWord.enc.Latin1.parse(fcm);
    var iv = YWord.enc.Latin1.parse(fciv);
    var fce = YWord.AES.encrypt(fck, fcy, {
        iv: iv
    });
    var fcd = YWord.AES.decrypt(fcv, fce.key, {
        iv: fce.iv
    });
    var fcds = YWord.enc.Latin1.stringify(fcd);
    $.ajax({
        url: "/ajax/sp/" + fcds + "/system_freecoins",
        cache: false,
        type: "POST",
        data: {
            method: "donate_freecoins",
            csrf_token: csrf_token,
            packet_id: packet_id,
            currency: currency,
            amount: amount,
            period: period,
            rate: rate
        },
        dataType: "json",
        success: function(data) {
            $("#window_freecoins .loading").hide();
            $("#window_freecoins .clFreecoinsDonate").show();
            if (data.result == "OK") {
                $("#window_freecoins .success").html(data.log);
                $("#window_freecoins input[name=amount]").val("0").trigger("change").keyup();
                $("#window_freecoins input[name=was_activated]").val(1);
            } else {
                $("#window_freecoins .error").html(data.error_log);
            }
        },
        error: function() {
            $("#window_freecoins .loading").hide();
            $("#window_freecoins .clFreecoinsDonate").show();
            $("#window_freecoins .error").html(popup_freecoins_error_default);
        }
    });
}

function prepareOrdersTables() {
    $("#orders_table").on("click", "td.cl", function(event) {
        event.preventDefault();
        var pair = $(this).parent().find("td a").text();
        $(location).attr("href", "/" + locale + "/trade/" + pair);
    });
}

function prepareHistoryTables() {
    $("#history_table").on("click", "tr", function(event) {
        event.preventDefault();
        var txid = $(this).find("span").attr("txid");
        var date = $(this).find("td:nth-child(1)").html();
        var cur = $(this).find("td:nth-child(2)").html();
        var amount = $(this).find("td:nth-child(3)").html();
        var span = $(this).find("span");
        if (typeof span !== "undefined" && typeof span.attr("txid") !== "undefined") {
            var txid = span.attr("txid");
            if (typeof txid !== "undefined" && txid.length) {
                txt = date + "<br>" + amount + " " + cur + "<br>" + txid;
                new Messi(txt, {
                    title: "Info",
                    titleClass: "info",
                    buttons: [{
                        id: 0,
                        label: popup_btn_close,
                        val: "Close"
                    }],
                    modal: true
                });
            }
        } else {
            var pair = $(this).find("td a").text();
            $(location).attr("href", "/" + locale + "/trade/" + pair);
        }
    });
}

function prepareSupportTables() {
    $("#support_table").on("click", "tr", function(event) {
        event.preventDefault();
        var url = $(this).find("td a").attr("href");
        if ($("#data-pjax-support").length) {
            $.pjax({
                url: url,
                container: "#data-pjax-support",
                timeout: 3000
            });
        } else {
            $(location).attr("href", url);
        }
    });
    $(".back_to_list, .forward_to_view").click(function(event) {
        event.preventDefault();
        var url = $(this).attr("href");
        if ($("#data-pjax-support").length) {
            $.pjax({
                url: url,
                container: "#data-pjax-support",
                timeout: 3000
            });
        } else {
            $(location).attr("href", url);
        }
    });
}

function preparePMTables() {
    $("#pm_table").on("click", "tr", function(event) {
        event.preventDefault();
        var url = $(this).find("td a").attr("href");
        if ($("#data-pjax-pm").length) {
            $.pjax({
                url: url,
                container: "#data-pjax-pm",
                timeout: 3000
            });
        } else {
            $(location).attr("href", url);
        }
    });
    $(".back_to_list, .forward_to_view").click(function(event) {
        event.preventDefault();
        var url = $(this).attr("href");
        if ($("#data-pjax-pm").length) {
            $.pjax({
                url: url,
                container: "#data-pjax-pm",
                timeout: 3000
            });
        } else {
            $(location).attr("href", url);
        }
    });
}

function setRomPrice(price) {
    $(".clSellForm input[name=\"price\"]").val(price);
    $(".messi-box .messi-actions .btn").click();
}

function prepareTradeTables() {
    $(".clBuyForm input[name=\"amount\"], .clBuyForm input[name=\"price\"], .clBuyForm input[name=\"total\"], .clSellForm input[name=\"amount\"], .clSellForm input[name=\"price\"], .clSellForm input[name=\"total\"]").change(function() {
        $(this).parent().parent().parent().find("input[name=\"amount\"]").val(Number($(this).parent().parent().parent().find("input[name=\"amount\"]").val()).toFixed(8));
        $(this).parent().parent().parent().find("input[name=\"price\"]").val(Number($(this).parent().parent().parent().find("input[name=\"price\"]").val()).toFixed(8));
        $(this).parent().parent().parent().find("input[name=\"total\"]").val(Number($(this).parent().parent().parent().find("input[name=\"total\"]").val()).toFixed(8));
    });
    $(".clBuyForm, .clSellForm").on("click", ".clCreateOrder", function(event) {
        event.preventDefault();
        var ty = $(this).parent().find("input[name=\"order_type\"]").val();
        var p = $(this).parent().find("input[name=\"price\"]").val();
        var a = $(this).parent().find("input[name=\"amount\"]").val();
        var t = $(this).parent().find("input[name=\"total\"]").val();
        doOrderCreate(this, pair_id, ty, p, a, t);
    });
    $(".clBuyBalance").click(function(event) {
        var bal = +$("#label_buy_balance").text();
        var price = $(this).parent().parent().find("input[name=\"price\"]").val();
        var total = +bal + 9e-9;
        var amount = floor(floor(total / price) / floor(1 + fee_buyer));
        $(this).parent().parent().find("input[name=\"amount\"]").val(amount).trigger("change").keyup();
    });
    $(".clSellBalance").click(function(event) {
        var bal = $("#label_sell_balance").html();
        $(this).parent().parent().find("input[name=\"amount\"]").val(bal).trigger("change").keyup();
    });
    $(".clBuyForm input[name=\"amount\"], .clBuyForm input[name=\"price\"], .clSellForm input[name=\"amount\"], .clSellForm input[name=\"price\"], .clBuyForm input[name=\"total\"], .clSellForm input[name=\"total\"]").keyup(function(event) {
        if ($(this).attr("name") != "total") {
            var price = $(this).parent().parent().parent().find("input[name=\"price\"]").val();
            var amount = $(this).parent().parent().parent().find("input[name=\"amount\"]").val();
            var total = floor(price * amount).toFixed(8);
            $(this).parent().parent().parent().find("input[name=\"total\"]").val(total);
        } else {
            var price = $(this).parent().parent().parent().find("input[name=\"price\"]").val();
            var total = $(this).parent().parent().parent().find("input[name=\"total\"]").val();
            var amount = floor(total / price).toFixed(8);
            $(this).parent().parent().parent().find("input[name=\"amount\"]").val(amount);
        }
        if ($(this).parent().parent().parent().find("input[name=\"fee_type\"]").val() == 1) {
            var fee = floor(total * fee_buyer);
            $(this).parent().parent().parent().find("input[name=\"fee\"]").attr("value", fee.toFixed(8));
            var totalfee = +total + fee;
            $(this).parent().parent().parent().find("input[name=\"totalfee\"]").attr("value", totalfee.toFixed(8));
            $(this).parent().parent().parent().find("input[name=\"totalfee\"]").val(totalfee.toFixed(8));
        } else {
            var fee = floor(total * fee_seller);
            $(this).parent().parent().parent().find("input[name=\"fee\"]").attr("value", fee.toFixed(8));
            var totalfee = +total - fee;
            $(this).parent().parent().parent().find("input[name=\"totalfee\"]").attr("value", totalfee.toFixed(8));
            $(this).parent().parent().parent().find("input[name=\"totalfee\"]").val(totalfee.toFixed(8));
        }
    });
    $("#buyord_table, #sellord_table").on("click", ".clRow", function(event) {
        event.preventDefault();
        var amount = parseFloat($(this).attr("ac"));
        var price = parseFloat($(this).attr("p"));
        $(".clBuyForm input[name=\"amount\"], .clSellForm input[name=\"amount\"]").val(amount);
        $(".clBuyForm input[name=\"price\"], .clSellForm input[name=\"price\"]").val(price);
        $(".clBuyForm input[name=\"amount\"], .clSellForm input[name=\"amount\"]").trigger("change").keyup();
    });
    $(".clBuyForm input[name=\"amount\"], .clSellForm input[name=\"amount\"]").val(1).trigger("change").keyup();
}

function prepareYobicodesTables() {
    $(".activateYobicode").click(function(e) {
        e.preventDefault();
        $(".window").hide();
        $("#window_yobicode input[name=code]").val("");
        $("#window_yobicode input[name=cau]").val("");
        $("#window_yobicode").show();
        $("#mask").show();
    });
    $(".yobicodes_page input[name=\"amount\"]").change(function() {
        $(this).val(Number($(this).val()).toFixed(8));
    });
    $(".yobicodes_page input[name=\"amount\"]").trigger("change");
}

function doCreateNewYobicode() {
    var csrf_token = $("#csrf_token").val();
    var currency = $(".yobicodes_page select[name=currency]").val().trim();
    var amount = $(".yobicodes_page input[name=amount]").val().trim();
    $(".yobicodes_page .error, .yobicodes_page .success").html("");
    $(".clCreateNewYobicode").hide();
    $(".yobicodes_page .loading").show();
    $.ajax({
        url: "/ajax/system_yobicodes.php",
        cache: false,
        type: "POST",
        data: {
            method: "new_yobicode",
            csrf_token: csrf_token,
            currency: currency,
            amount: amount
        },
        dataType: "json",
        success: function(data) {
            if (data.result == "OK") {
                window.location.reload();
            } else {
                $(".yobicodes_page .loading").hide();
                $(".clCreateNewYobicode").show();
                $(".yobicodes_page .error").html(data.error_log);
            }
        },
        error: function() {
            $(".yobicodes_page .loading").hide();
            $(".clCreateNewYobicode").show();
            $(".yobicodes_page .error").html(pyobicodes_error_default);
        }
    });
}

function doActivateYobicode() {
    var csrf_token = $("#csrf_token").val();
    var code = $("#window_yobicode input[name=code]").val().trim();
    var capid = $("#recaptcha-3").attr("capid");
    var captcha = grecaptcha.getResponse(capid);
    $("#window_yobicode .error, #window_yobicode .success").html("");
    $(".clActivateYobicode").hide();
    $("#window_yobicode .loading").show();
    $.ajax({
        url: "/ajax/system_yobicodes.php",
        cache: false,
        type: "POST",
        data: {
            method: "activate_yobicode",
            csrf_token: csrf_token,
            code: code,
            captcha: captcha
        },
        dataType: "json",
        success: function(data) {
            if (data.result == "OK") {
                grecaptcha.reset(capid);
                $("#window_yobicode .loading").hide();
                $(".clActivateYobicode").show();
                $("#window_yobicode input[name=code]").val("");
                $("#window_yobicode input[name=cau]").val("");
                $("#window_yobicode input[name=was_activated]").val(1);
                $("#window_yobicode .success").html(data.log);
            } else {
                grecaptcha.reset(capid);
                $("#window_yobicode .loading").hide();
                $(".clActivateYobicode").show();
                $("#window_yobicode .error").html(data.error_log);
            }
        },
        error: function() {
            grecaptcha.reset(capid);
            $("#window_yobicode .loading").hide();
            $(".clActivateYobicode").show();
            $("#window_yobicode .error").html(popup_yobicodes_error_default);
        }
    });
}

function doCheckCaptcha() {
    var csrf_token = $("#csrf_token").val();
    var captcha_id = $("#window_captcha input[name=captcha_id]").val().trim();
    var capid = $("#recaptcha-4").attr("capid");
    var captcha = grecaptcha.getResponse(capid);
    $("#window_captcha .error, #window_captcha .success").html("");
    $(".clCheckCaptcha").hide();
    $("#window_captcha .loading").show();
    $.ajax({
        url: "/ajax/system_captcha.php",
        cache: false,
        type: "POST",
        data: {
            method: "check_captcha",
            csrf_token: csrf_token,
            captcha_id: captcha_id,
            captcha: captcha
        },
        dataType: "json",
        success: function(data) {
            if (data.result == "OK") {
                grecaptcha.reset(capid);
                $("#window_captcha .loading").hide();
                $(".clCheckCaptcha").show();
                $(".window").hide();
                $("#mask").hide();
            } else {
                grecaptcha.reset(capid);
                $("#window_captcha .loading").hide();
                $(".clCheckCaptcha").show();
                $("#window_captcha .error").html(data.error_log);
            }
        },
        error: function() {
            grecaptcha.reset(capid);
            $("#window_captcha .loading").hide();
            $(".clActivateCaptcha").show();
            $("#window_captcha .error").html(popup_yobicodes_error_default);
        }
    });
}

function doCreateNewTicket() {
    var csrf_token = $("#csrf_token").val();
    var localec = $(".contacts_page input[name=locale]").val().trim();
    var email = $(".contacts_page input[name=email]").val().trim();
    var type = $(".contacts_page select[name=type]").val();
    var currency = $(".contacts_page select[name=currency]").val().trim();
    var txid = $(".contacts_page input[name=txid]").val().trim();
    var subject = $(".contacts_page input[name=subject]").val().trim();
    var message = $(".contacts_page textarea[name=message]").val().trim();
    $(".contacts_page .error, .contacts_page .success").html("");
    $(".clCreateNewTicket").hide();
    $(".contacts_page .loading").show();
    $.ajax({
        url: "/ajax/system_support.php",
        cache: false,
        type: "POST",
        data: {
            method: "new_ticket",
            csrf_token: csrf_token,
            locale: localec,
            email: email,
            type: type,
            currency: currency,
            txid: txid,
            subject: subject,
            message: message
        },
        dataType: "json",
        success: function(data) {
            if (data.result == "OK") {
                $(".contacts_page input[name=subject]").val("");
                $(".contacts_page textarea[name=message]").val("");
                $(".contacts_page .success").html(data.log);
                $(".contacts_page .loading").hide();
                $(".clCreateNewTicket").show();
            } else {
                $(".contacts_page .loading").hide();
                $(".clCreateNewTicket").show();
                $(".contacts_page .error").html(data.error_log);
            }
        },
        error: function() {
            $(".contacts_page .loading").hide();
            $(".clCreateNewTicket").show();
            $(".contacts_page .error").html(pcontacts_error_default);
        }
    });
}

function doCreateNewSupportTicket() {
    var csrf_token = $("#csrf_token").val();
    var localec = $(".contacts_page select[name=locale]").val().trim();
    var email = $(".contacts_page input[name=email]").val().trim();
    var type = $(".contacts_page select[name=type]").val();
    var currency = $(".contacts_page select[name=currency]").val().trim();
    var txid = $(".contacts_page input[name=txid]").val().trim();
    var subject = $(".contacts_page input[name=subject]").val().trim();
    var message = $(".contacts_page textarea[name=message]").val().trim();
    $(".contacts_page .error, .contacts_page .success").html("");
    $(".clCreateNewTicket").hide();
    $(".contacts_page .loading").show();
    $.ajax({
        url: "/ajax/system_support.php",
        cache: false,
        type: "POST",
        data: {
            action: "new_support_ticket",
            csrf_token: csrf_token,
            locale: localec,
            email: email,
            type: type,
            currency: currency,
            txid: txid,
            subject: subject,
            message: message
        },
        dataType: "json",
        success: function(data) {
            if (data.result == "OK") {
                if (data.redirect) {
                    var url = "/" + localec + "/support/";
                    $(location).attr("href", url);
                } else {
                    $(".contacts_page input[name=subject]").val("");
                    $(".contacts_page textarea[name=message]").val("");
                    $(".contacts_page .success").html(data.log);
                    $(".contacts_page .loading").hide();
                    $(".clCreateNewTicket").show();
                }
            } else {
                $(".contacts_page .loading").hide();
                $(".clCreateNewTicket").show();
                $(".contacts_page .error").html(data.error_log);
            }
        },
        error: function() {
            $(".contacts_page .loading").hide();
            $(".clCreateNewTicket").show();
            $(".contacts_page .error").html(pcontacts_error_default);
        }
    });
}

function doAddSupportTicket() {
    var csrf_token = $("#csrf_token").val();
    var hash = $(".support_page input[name=topic_hash]").val().trim();
    var message = $(".support_page textarea[name=message]").val().trim();
    $(".support_page .error, .support_page .success").html("");
    $(".clCreateNewTicket").hide();
    $(".support_page .loading").show();
    $.ajax({
        url: "/ajax/system_support.php",
        cache: false,
        type: "POST",
        data: {
            action: "add_support_message",
            csrf_token: csrf_token,
            hash: hash,
            message: message
        },
        dataType: "json",
        success: function(data) {
            if (data.result == "OK") {
                var url = "/" + locale + "/support/" + hash;
                if ($("#data-pjax-support").length) {
                    $.pjax({
                        url: url,
                        container: "#data-pjax-support",
                        timeout: 3000
                    });
                } else {
                    $(location).attr("href", url);
                }
            } else {
                $(".support_page .loading").hide();
                $(".clCreateNewTicket").show();
                $(".support_page .error").html(data.error_log);
            }
        },
        error: function() {
            $(".support_page .loading").hide();
            $(".clCreateNewTicket").show();
            $(".support_page .error").html(pcontacts_error_default);
        }
    });
}

function doCreateNewPMTicket() {
    var csrf_token = $("#csrf_token").val();
    var localec = $(".contacts_page input[name=locale]").val().trim();
    var nick = $(".contacts_page input[name=nick]").val().trim();
    var subject = $(".contacts_page input[name=subject]").val().trim();
    var message = $(".contacts_page textarea[name=message]").val().trim();
    $(".contacts_page .error, .contacts_page .success").html("");
    $(".clCreateNewTicket").hide();
    $(".contacts_page .loading").show();
    $.ajax({
        url: "/ajax/system_pm.php",
        cache: false,
        type: "POST",
        data: {
            action: "new_pm_ticket",
            csrf_token: csrf_token,
            locale: localec,
            nick: nick,
            subject: subject,
            message: message
        },
        dataType: "json",
        success: function(data) {
            if (data.result == "OK") {
                if (data.redirect) {
                    var url = "/" + localec + "/pm/";
                    $(location).attr("href", url);
                } else {
                    $(".contacts_page input[name=subject]").val("");
                    $(".contacts_page textarea[name=message]").val("");
                    $(".contacts_page .success").html(data.log);
                    $(".contacts_page .loading").hide();
                    $(".clCreateNewTicket").show();
                }
            } else {
                $(".contacts_page .loading").hide();
                $(".clCreateNewTicket").show();
                $(".contacts_page .error").html(data.error_log);
            }
        },
        error: function() {
            $(".contacts_page .loading").hide();
            $(".clCreateNewTicket").show();
            $(".contacts_page .error").html(pcontacts_error_default);
        }
    });
}

function doAddPMTicket() {
    var csrf_token = $("#csrf_token").val();
    var hash = $(".pm_page input[name=topic_hash]").val().trim();
    var message = $(".pm_page textarea[name=message]").val().trim();
    $(".pm_page .error, .pm_page .success").html("");
    $(".clCreateNewTicket").hide();
    $(".pm_page .loading").show();
    $.ajax({
        url: "/ajax/system_pm.php",
        cache: false,
        type: "POST",
        data: {
            action: "add_pm_message",
            csrf_token: csrf_token,
            hash: hash,
            message: message
        },
        dataType: "json",
        success: function(data) {
            if (data.result == "OK") {
                var url = "/" + locale + "/pm/" + hash;
                if ($("#data-pjax-pm").length) {
                    $.pjax({
                        url: url,
                        container: "#data-pjax-pm",
                        timeout: 3000
                    });
                } else {
                    $(location).attr("href", url);
                }
            } else {
                $(".pm_page .loading").hide();
                $(".clCreateNewTicket").show();
                $(".pm_page .error").html(data.error_log);
            }
        },
        error: function() {
            $(".pm_page .loading").hide();
            $(".clCreateNewTicket").show();
            $(".pm_page .error").html(pcontacts_error_default);
        }
    });
}

function doSayThanksToSupport(message_id) {
    var csrf_token = $("#csrf_token").val();
    var amount = $("#amount" + message_id).val().trim();
    $.ajax({
        url: "/ajax/system_s_support.php",
        cache: false,
        type: "POST",
        data: {
            action: "say_thanks_to_support",
            csrf_token: csrf_token,
            message_id: message_id,
            amount: amount
        },
        dataType: "json",
        success: function(data) {
            if (data.result == "OK") {
                window.location.reload();
            } else {
                new Messi(data.error_log, {
                    title: popup_title_error,
                    titleClass: "error",
                    buttons: [{
                        id: 0,
                        label: popup_btn_close,
                        val: "Close"
                    }],
                    modal: true
                });
            }
        },
        error: function() {}
    });
}

function doCreateNewAddCoinRequest() {
    var csrf_token = $("#csrf_token").val();
    var localec = $(".addcoin_page input[name=locale]").val().trim();
    var email = $(".addcoin_page input[name=email]").val().trim();
    var coinname = $(".addcoin_page input[name=coinname]").val().trim();
    var ticker = $(".addcoin_page input[name=ticker]").val().trim();
    var algo = $(".addcoin_page input[name=algo]").val().trim();
    var blocks = $(".addcoin_page input[name=blocks]").val().trim();
    var supply = $(".addcoin_page input[name=supply]").val().trim();
    var mincommission = $(".addcoin_page input[name=mincommission]").val().trim();
    var blocktime = $(".addcoin_page input[name=blocktime]").val().trim();
    var devlang = $(".addcoin_page input[name=devlang]").val().trim();
    var type = $(".addcoin_page select[name=type]").val();
    var secp256k1ver = $(".addcoin_page select[name=secp256k1ver]").val();
    var src = $(".addcoin_page input[name=src]").val().trim();
    var explorer = $(".addcoin_page input[name=explorer]").val().trim();
    var bitcointalk = $(".addcoin_page input[name=bitcointalk]").val().trim();
    var ltype = $(".addcoin_page select[name=ltype]").val();
    var yobicode = $(".addcoin_page input[name=yobicode]").val().trim();
    var message = $(".addcoin_page textarea[name=message]").val().trim();
    $(".addcoin_page .error, .addcoin_page .success").html("");
    $(".clCreateNewAddCoinRequest").hide();
    $(".addcoin_page .loading").show();
    $.ajax({
        url: "/ajax/system_support.php",
        cache: false,
        type: "POST",
        data: {
            method: "new_addcoin_request",
            csrf_token: csrf_token,
            locale: localec,
            email: email,
            coinname: coinname,
            ticker: ticker,
            algo: algo,
            blocks: blocks,
            supply: supply,
            mincommission: mincommission,
            blocktime: blocktime,
            devlang: devlang,
            type: type,
            secp256k1ver: secp256k1ver,
            src: src,
            explorer: explorer,
            bitcointalk: bitcointalk,
            ltype: ltype,
            yobicode: yobicode,
            message: message
        },
        dataType: "json",
        success: function(data) {
            if (data.result == "OK") {
                $(".addcoin_page input[name=coinname]").val("");
                $(".addcoin_page input[name=ticker]").val("");
                $(".addcoin_page input[name=algo]").val("");
                $(".addcoin_page input[name=blocks]").val("");
                $(".addcoin_page input[name=supply]").val("");
                $(".addcoin_page input[name=mincommission]").val("");
                $(".addcoin_page input[name=blocktime]").val("");
                $(".addcoin_page input[name=devlang]").val("");
                $(".addcoin_page select[name=type]").val();
                $(".addcoin_page select[name=secp256k1ver]").val();
                $(".addcoin_page input[name=src]").val("");
                $(".addcoin_page input[name=explorer]").val("");
                $(".addcoin_page input[name=bitcointalk]").val("");
                $(".addcoin_page select[name=ltype]").val();
                $(".addcoin_page input[name=yobicode]").val("");
                $(".addcoin_page textarea[name=message]").val("");
                $(".addcoin_page .success").html(data.log);
                $(".addcoin_page .loading").hide();
                $(".clCreateNewAddCoinRequest").show();
            } else {
                $(".addcoin_page .loading").hide();
                $(".clCreateNewAddCoinRequest").show();
                $(".addcoin_page .error").html(data.error_log);
            }
        },
        error: function() {
            $(".addcoin_page .loading").hide();
            $(".clCreateNewAddCoinRequest").show();
            $(".addcoin_page .error").html(pcontacts_error_default);
        }
    });
}

function doCreateMaintenanceRequest() {
    var csrf_token = $("#csrf_token").val();
    var localec = $(".addcoin_page input[name=locale]").val().trim();
    var email = $(".addcoin_page input[name=email]").val().trim();
    var ltype = $(".addcoin_page select[name=ltype]").val();
    var ltype2 = $(".addcoin_page select[name=ltype2]").val();
    var yobicode = $(".addcoin_page input[name=yobicode]").val().trim();
    var ticker_old = $(".addcoin_page input[name=ticker_old]").val().trim();
    var ticker_new = $(".addcoin_page input[name=ticker_new]").val().trim();
    var src = $(".addcoin_page input[name=src]").val().trim();
    var bitcointalk = $(".addcoin_page input[name=bitcointalk]").val().trim();
    var nodes = $(".addcoin_page textarea[name=nodes]").val().trim();
    var message = $(".addcoin_page textarea[name=message]").val().trim();
    $(".addcoin_page .error, .addcoin_page .success").html("");
    $(".clCreateNewAddCoinRequest").hide();
    $(".addcoin_page .loading").show();
    $.ajax({
        url: "/ajax/system_support.php",
        cache: false,
        type: "POST",
        data: {
            method: "maintenance_request",
            csrf_token: csrf_token,
            locale: localec,
            email: email,
            ltype: ltype,
            ltype2: ltype2,
            yobicode: yobicode,
            ticker_old: ticker_old,
            ticker_new: ticker_new,
            src: src,
            bitcointalk: bitcointalk,
            nodes: nodes,
            message: message
        },
        dataType: "json",
        success: function(data) {
            if (data.result == "OK") {
                $(".addcoin_page select[name=ltype]").val();
                $(".addcoin_page select[name=ltype2]").val();
                $(".addcoin_page textarea[name=message]").val("");
                $(".addcoin_page textarea[name=nodes]").val("");
                $(".addcoin_page input[name=yobicode]").val("");
                $(".addcoin_page input[name=ticker_old]").val("");
                $(".addcoin_page input[name=ticker_new]").val("");
                $(".addcoin_page input[name=src]").val("");
                $(".addcoin_page input[name=bitcointalk]").val("");
                $(".addcoin_page .success").html(data.log);
                $(".addcoin_page .loading").hide();
                $(".clCreateNewAddCoinRequest").show();
            } else {
                $(".addcoin_page .loading").hide();
                $(".clCreateNewAddCoinRequest").show();
                $(".addcoin_page .error").html(data.error_log);
            }
        },
        error: function() {
            $(".addcoin_page .loading").hide();
            $(".clCreateNewAddCoinRequest").show();
            $(".addcoin_page .error").html(pcontacts_error_default);
        }
    });
}

function doCreateUpdateCoinRequest() {
    var csrf_token = $("#csrf_token").val();
    var localec = $(".addcoin_page input[name=locale]").val().trim();
    var currency = $(".addcoin_page select[name=currency]").val();
    var src = $(".addcoin_page input[name=src]").val().trim();
    var bitcointalk = $(".addcoin_page input[name=bitcointalk]").val().trim();
    var email = $(".addcoin_page input[name=email]").val().trim();
    var message = $(".addcoin_page textarea[name=message]").val().trim();
    $(".addcoin_page .error, .addcoin_page .success").html("");
    $(".clCreateUpdateCoinRequest").hide();
    $(".addcoin_page .loading").show();
    $.ajax({
        url: "/ajax/system_support.php",
        cache: false,
        type: "POST",
        data: {
            method: "new_updatecoin_request",
            csrf_token: csrf_token,
            locale: localec,
            currency: currency,
            src: src,
            bitcointalk: bitcointalk,
            email: email,
            message: message
        },
        dataType: "json",
        success: function(data) {
            if (data.result == "OK") {
                $(".addcoin_page input[name=src]").val("");
                $(".addcoin_page input[name=bitcointalk]").val("");
                $(".addcoin_page textarea[name=message]").val("");
                $(".addcoin_page .success").html(data.log);
                $(".addcoin_page .loading").hide();
                $(".clCreateUpdateCoinRequest").show();
            } else {
                $(".addcoin_page .loading").hide();
                $(".clCreateUpdateCoinRequest").show();
                $(".addcoin_page .error").html(data.error_log);
            }
        },
        error: function() {
            $(".addcoin_page .loading").hide();
            $(".clCreateUpdateCoinRequest").show();
            $(".addcoin_page .error").html(pupdatecoin_error_default);
        }
    });
}

function doCreateNewIcoRequest() {
    var csrf_token = $("#csrf_token").val();
    var localec = $(".addcoin_page input[name=locale]").val().trim();
    var icofee = $(".addcoin_page select[name=icofee]").val();
    var yobicode = $(".addcoin_page input[name=yobicode]").val().trim();
    var buywall = $(".addcoin_page select[name=buywall]").val();
    var coinname = $(".addcoin_page input[name=coinname]").val().trim();
    var ticker = $(".addcoin_page input[name=ticker]").val().trim();
    var ico_coins = $(".addcoin_page input[name=ico_coins]").val().trim();
    var ico_price = $(".addcoin_page input[name=ico_price]").val().trim();
    var ico_btcamount = $(".addcoin_page input[name=ico_btcamount]").val().trim();
    var ico_startdate = $(".addcoin_page input[name=ico_startdate]").val().trim();
    var ico_maxdays = $(".addcoin_page input[name=ico_maxdays]").val().trim();
    var algo = $(".addcoin_page input[name=algo]").val().trim();
    var supply = $(".addcoin_page input[name=supply]").val().trim();
    var mincommission = $(".addcoin_page input[name=mincommission]").val().trim();
    var blocktime = $(".addcoin_page input[name=blocktime]").val().trim();
    var devlang = $(".addcoin_page input[name=devlang]").val().trim();
    var type = $(".addcoin_page select[name=type]").val();
    var src = $(".addcoin_page input[name=src]").val().trim();
    var explorer = $(".addcoin_page input[name=explorer]").val().trim();
    var bitcointalk = $(".addcoin_page input[name=bitcointalk]").val().trim();
    var email = $(".addcoin_page input[name=email]").val().trim();
    var skype = $(".addcoin_page input[name=skype]").val().trim();
    var description = $(".addcoin_page textarea[name=description]").val().trim();
    var message = $(".addcoin_page textarea[name=message]").val().trim();
    $(".addcoin_page .error, .addcoin_page .success").html("");
    $(".clCreateNewIcoRequest").hide();
    $(".addcoin_page .loading").show();
    $.ajax({
        url: "/ajax/system_support.php",
        cache: false,
        type: "POST",
        data: {
            method: "new_newico_request",
            csrf_token: csrf_token,
            locale: localec,
            icofee: icofee,
            yobicode: yobicode,
            buywall: buywall,
            coinname: coinname,
            ticker: ticker,
            ico_coins: ico_coins,
            ico_price: ico_price,
            ico_btcamount: ico_btcamount,
            ico_startdate: ico_startdate,
            ico_maxdays: ico_maxdays,
            algo: algo,
            supply: supply,
            mincommission: mincommission,
            blocktime: blocktime,
            devlang: devlang,
            type: type,
            src: src,
            explorer: explorer,
            bitcointalk: bitcointalk,
            email: email,
            skype: skype,
            description: description,
            message: message
        },
        dataType: "json",
        success: function(data) {
            if (data.result == "OK") {
                $(".addcoin_page select[name=icofee]").val();
                $(".addcoin_page input[name=yobicode]").val("");
                $(".addcoin_page select[name=buywall]").val();
                $(".addcoin_page input[name=coinname]").val("");
                $(".addcoin_page input[name=ticker]").val("");
                $(".addcoin_page input[name=ico_coins]").val("");
                $(".addcoin_page input[name=ico_price]").val("");
                $(".addcoin_page input[name=ico_btcamount]").val("");
                $(".addcoin_page input[name=ico_startdate]").val("");
                $(".addcoin_page input[name=ico_maxdays]").val("");
                $(".addcoin_page input[name=algo]").val("");
                $(".addcoin_page input[name=supply]").val("");
                $(".addcoin_page input[name=mincommission]").val("");
                $(".addcoin_page input[name=blocktime]").val("");
                $(".addcoin_page input[name=devlang]").val("");
                $(".addcoin_page select[name=type]").val();
                $(".addcoin_page input[name=src]").val("");
                $(".addcoin_page input[name=explorer]").val("");
                $(".addcoin_page input[name=bitcointalk]").val("");
                $(".addcoin_page input[name=email]").val("");
                $(".addcoin_page input[name=skype]").val("");
                $(".addcoin_page textarea[name=description]").val("");
                $(".addcoin_page textarea[name=message]").val("");
                $(".addcoin_page .success").html(data.log);
                $(".addcoin_page .loading").hide();
                $(".clCreateNewIcoRequest").show();
            } else {
                $(".addcoin_page .loading").hide();
                $(".clCreateNewIcoRequest").show();
                $(".addcoin_page .error").html(data.error_log);
            }
        },
        error: function() {
            $(".addcoin_page .loading").hide();
            $(".clCreateNewIcoRequest").show();
            $(".addcoin_page .error").html(pnewico_error_default);
        }
    });
}

function doAffSendEarnedToBalance() {
    var csrf_token = $("#csrf_token").val();
    $.ajax({
        url: "/ajax/system_affiliate.php",
        cache: false,
        type: "POST",
        data: {
            action: "send_earned_to_balance",
            csrf_token: csrf_token
        },
        dataType: "json",
        success: function(data) {
            if (data.result == "OK") {
                window.location.reload();
            } else {}
        },
        error: function() {}
    });
}

function doInvestBoxInvest(box_id) {
    var csrf_token = $("#csrf_token").val();
    var iboxsum = $("#iboxsum" + box_id).val().trim();
    $.ajax({
        url: "/ajax/system_investbox.php",
        cache: false,
        type: "POST",
        data: {
            action: "invest",
            box_id: box_id,
            iboxsum: iboxsum,
            csrf_token: csrf_token
        },
        dataType: "json",
        success: function(data) {
            if (data.result == "OK") {
                window.location.reload();
            } else {
                new Messi(data.error_log, {
                    title: popup_title_error,
                    titleClass: "error",
                    buttons: [{
                        id: 0,
                        label: popup_btn_close,
                        val: "Close"
                    }],
                    modal: true
                });
            }
        },
        error: function() {}
    });
}

function doInvestBoxInvestClose(pack_id) {
    var csrf_token = $("#csrf_token").val();
    $.ajax({
        url: "/ajax/system_investbox.php",
        cache: false,
        type: "POST",
        data: {
            action: "invest_close",
            pack_id: pack_id,
            csrf_token: csrf_token
        },
        dataType: "json",
        success: function(data) {
            if (data.result == "OK") {
                window.location.reload();
            } else {
                new Messi(data.error_log, {
                    title: popup_title_error,
                    titleClass: "error",
                    buttons: [{
                        id: 0,
                        label: popup_btn_close,
                        val: "Close"
                    }],
                    modal: true
                });
            }
        },
        error: function() {}
    });
}

function popupInvestBoxCreateBox(box_id, currency_id, cname, cfname, box_pr, box_period, box_sum, deficit, min_invest_sum, max_invest_sum, status, btn) {
    $(".window").hide();
    $("#window_investbox input[name=box_id]").val(box_id);
    $("#window_investbox input[name=amount]").val("0").trigger("change").keyup();
    $("#window_investbox input[name=amount_current]").val(box_sum).trigger("change").keyup();
    $("#window_investbox input[name=amount_deficit]").val(deficit).trigger("change").keyup();
    $("#window_investbox input[name=status]").val(status).trigger("change").keyup();
    $("#investbox_btn_box_add").val(btn);
    if (currency_id) {
        $("#window_investbox .cn").html(cname);
        $("#window_investbox select[name=currency]").val(currency_id).prop("disabled", true).trigger("chosen:updated");
        $("#window_investbox select[name=period]").val(box_period).prop("disabled", true).trigger("chosen:updated");
        $("#window_investbox input[name=min_invest_sum]").val(min_invest_sum).trigger("change").keyup().prop("disabled", true);
        $("#window_investbox input[name=max_invest_sum]").val(max_invest_sum).trigger("change").keyup().prop("disabled", true);
        $("#window_investbox input[name=box_pr]").val(box_pr).trigger("change").keyup().prop("disabled", true);
    } else {
        $("#window_investbox select[name=currency]").prop("disabled", false).trigger("chosen:updated");
        $("#window_investbox select[name=period]").prop("disabled", false).trigger("chosen:updated");
        $("#window_investbox input[name=min_invest_sum]").val("0").trigger("change").keyup().prop("disabled", false).trigger("chosen:updated");
        $("#window_investbox input[name=max_invest_sum]").val("0").trigger("change").keyup().prop("disabled", false).trigger("chosen:updated");
        $("#window_investbox input[name=box_pr]").val("1").trigger("change").keyup().prop("disabled", false).trigger("chosen:updated");
    }
    $("#window_investbox").show();
    $("#mask").show();
}

function doInvestBoxCreateBox() {
    var csrf_token = $("#csrf_token").val();
    var box_id = $("#window_investbox input[name=box_id]").val();
    var currency_id = $("#window_investbox select[name=currency]").val();
    var period = $("#window_investbox select[name=period]").val();
    var sum = $("#window_investbox input[name=amount_add]").val().trim();
    var box_pr = $("#window_investbox input[name=box_pr]").val().trim();
    var min_invest_sum = $("#window_investbox input[name=min_invest_sum]").val().trim();
    var max_invest_sum = $("#window_investbox input[name=max_invest_sum]").val().trim();
    $("#window_investbox .error, #window_investbox .success").html("");
    $("#window_investbox .clInvestBoxCreate").hide();
    $("#window_investbox .loading").show();
    $.ajax({
        url: "/ajax/system_investbox.php",
        cache: false,
        type: "POST",
        data: {
            action: "create_box",
            box_id: box_id,
            currency_id: currency_id,
            period: period,
            sum: sum,
            box_pr: box_pr,
            min_invest_sum: min_invest_sum,
            max_invest_sum: max_invest_sum,
            csrf_token: csrf_token
        },
        dataType: "json",
        success: function(data) {
            $("#window_investbox .loading").hide();
            $("#window_investbox .clInvestBoxCreate").show();
            if (data.result == "OK") {
                window.location.reload();
            } else {
                $("#window_investbox .error").html(data.error_log);
            }
        },
        error: function() {
            $("#window_investbox .loading").hide();
            $("#window_investbox .clInvestBoxCreate").show();
            $("#window_investbox .error").html(popup_investbox_error_default);
        }
    });
}

function doAffBonSendEarnedToBalance() {
    var csrf_token = $("#csrf_token").val();
    $.ajax({
        url: "/ajax/system_affiliate_bonus.php",
        cache: false,
        type: "POST",
        data: {
            action: "send_earned_to_balance",
            csrf_token: csrf_token
        },
        dataType: "json",
        success: function(data) {
            if (data.result == "OK") {
                window.location.reload();
            } else {
                new Messi(data.error_log, {
                    title: popup_title_error,
                    titleClass: "error",
                    buttons: [{
                        id: 0,
                        label: popup_btn_close,
                        val: "Close"
                    }],
                    modal: true
                });
            }
        },
        error: function() {}
    });
}

function doAffBonUpgradeLevel(level) {
    var csrf_token = $("#csrf_token").val();
    $.ajax({
        url: "/ajax/system_affiliate_bonus.php",
        cache: false,
        type: "POST",
        data: {
            action: "upgrade_level",
            csrf_token: csrf_token,
            level: level
        },
        dataType: "json",
        success: function(data) {
            if (data.result == "OK") {
                window.location.reload();
            } else {
                new Messi(data.error_log, {
                    title: popup_title_error,
                    titleClass: "error",
                    buttons: [{
                        id: 0,
                        label: popup_btn_close,
                        val: "Close"
                    }],
                    modal: true
                });
            }
        },
        error: function() {}
    });
}

function doAffSigSendEarnedToBalance() {
    var csrf_token = $("#csrf_token").val();
    $.ajax({
        url: "/ajax/system_affiliate_signature.php",
        cache: false,
        type: "POST",
        data: {
            action: "send_earned_to_balance",
            csrf_token: csrf_token
        },
        dataType: "json",
        success: function(data) {
            if (data.result == "OK") {
                window.location.reload();
            } else {}
        },
        error: function() {}
    });
}

function doAffSigSaveAndCheck() {
    var csrf_token = $("#csrf_token").val();
    var profile_id = $("#btalk_uid").val();
    $.ajax({
        url: "/ajax/system_affiliate_signature.php",
        cache: false,
        type: "POST",
        data: {
            action: "save_profile_id",
            csrf_token: csrf_token,
            profile_id: profile_id
        },
        dataType: "json",
        success: function(data) {
            if (data.result == "OK") {
                new Messi(data.log, {
                    title: popup_title_success,
                    titleClass: "success",
                    buttons: [{
                        id: 0,
                        label: popup_btn_close,
                        val: "Close"
                    }],
                    modal: true,
                    callback: function(val) {
                        if (val == "Close") {
                            window.location.reload();
                        }
                    }
                });
            } else {
                new Messi(data.error_log, {
                    title: popup_title_error,
                    titleClass: "error",
                    buttons: [{
                        id: 0,
                        label: popup_btn_close,
                        val: "Close"
                    }],
                    modal: true
                });
            }
        },
        error: function() {}
    });
}

function doAffTopSaveNick() {
    var csrf_token = $("#csrf_token").val();
    var nick = $(".top_page input[name=topnick]").val().trim();
    $(".top_page .clBtn").hide();
    $.ajax({
        url: "/ajax/system_top.php",
        cache: false,
        type: "POST",
        data: {
            method: "save_nick",
            csrf_token: csrf_token,
            nick: nick
        },
        dataType: "json",
        success: function(data) {
            if (data.result == "OK") {
                window.location.reload();
            } else {
                $(".top_page .clBtn").show();
            }
        },
        error: function() {
            $(".top_page .clBtn").show();
        }
    });
}

function diceStart() {
    if (typeof pusher !== "undefined") {
        channeldice = pusher.subscribe("dice_" + dice_cur);
        channeldice.bind("msgdice", pushDiceMsg);
    }
}

function diceStop() {
    if (typeof pusher !== "undefined") {
        pusher.unsubscribe("dice_" + dice_cur);
    }
}

function pushDiceMsg(data) {
    if (typeof data === "object") {
        var did = parseInt(data.did);
        var date = new Date(data.time * 1000);
        var time = pad(date.getHours(), 2) + ":" + pad(date.getMinutes(), 2) + ":" + pad(date.getSeconds(), 2);
        var cur = data.cur;
        var nick = data.nick;
        if (check_only_mine) {
            if (nick != chat_nick) {
                return;
            }
        }
        var imgid = parseInt(data.imgid);
        var win = parseInt(data.win);
        var bet = data.bet;
        var tar = data.tar;
        var roll = data.roll;
        var pr = data.pr;
        var cl = "class='red'";
        if (win) {
            cl = "class='green'";
        }
        var img = "cur_0.png";
        if (imgid) {
            img = "cur_" + cur + ".png";
        }
        var len = $(".dice_table tbody tr").length;
        var line = "<tr><td>" + did + "</td><td>" + time + "</td><td><img src=\"/images/" + img + "\" width=\"18px\" height=\"18px\" />" + cur + "</td><td><a class=\"nick\">" + nick + "</a></td><td>" + bet + "</td><td>" + tar + "</td><td>" + roll + "</td><td " + cl + ">" + pr + "</td></tr>";
        if (len > 0) {
            if (len >= 23) {
                $(".dice_table tbody tr:last").remove();
            }
            $(".dice_table tbody tr:first").before(line);
        } else {
            $(".dice_table").prepend(line);
        }
    }
}

function doDiceSend(btn, type) {
    var csrf_token = $("#csrf_token").val();
    var currency = $(".dice_page select[name=currency]").val().trim();
    var bet = $(".dice_page input[name=bet]").val().trim();
    $(".dice_page .error, .dice_page .success").html("");
    var old = $(btn).attr("origin");
    $(btn).val(pdice_btn_creating);
    $.ajax({
        url: "/ajax/system_dice.php",
        cache: false,
        type: "POST",
        data: {
            method: "dice_play",
            csrf_token: csrf_token,
            locale: locale,
            currency: currency,
            bet: bet,
            type: type
        },
        dataType: "json",
        beforeSend: "",
        success: function(data) {
            if (typeof data === "object") {
                if (data.result == "OK") {
                    if (data.win == "1") {
                        $(btn).val(pdice_btn_win).addClass("win");
                    } else {
                        $(btn).val(pdice_btn_lost);
                    }
                    var so = $("select[name=currency] option:selected").html();
                    var re = /([^\-]+?- )[0-9.]+?( [a-zA-Z0-9]+)/g;
                    var sn = so.replace(re, "$1" + data.bal + "$2");
                    $("select[name=currency] option:selected").html(sn).trigger("chosen:updated");
                } else {
                    new Messi(data.error_log, {
                        title: popup_title_error,
                        titleClass: "error",
                        buttons: [{
                            id: 0,
                            label: popup_btn_close,
                            val: "Close"
                        }],
                        modal: true
                    });
                }
            }
            setTimeout(function() {
                $(btn).val(old).removeClass("win");
            }, 300);
        },
        error: function() {
            setTimeout(function() {
                $(btn).val(old).removeClass("win");
            }, 300);
        }
    });
}

function doSmartDiceSend(btn, type) {
    var csrf_token = $("#csrf_token").val();
    var bet = $("#smart_dice_bet").val();
    var old = $(btn).attr("origin");
    $(btn).val(pdice_btn_creating);
    var currency = 1;
    $.ajax({
        url: "/ajax/system_dice.php",
        cache: false,
        type: "POST",
        data: {
            method: "dice_play",
            csrf_token: csrf_token,
            locale: locale,
            currency: currency,
            bet: bet,
            type: type
        },
        dataType: "json",
        beforeSend: "",
        success: function(data) {
            if (typeof data === "object") {
                if (data.result == "OK") {
                    if (data.win == "1") {
                        $(btn).val(pdice_btn_win).addClass("win");
                    } else {
                        $(btn).val(pdice_btn_lost);
                    }
                    var page = $(location).attr("href");
                    if (-1 == page.indexOf("/" + locale + "/dice/")) {
                        $(location).attr("href", "/" + locale + "/dice/");
                    }
                } else {
                    new Messi(data.error_log, {
                        title: popup_title_error,
                        titleClass: "error",
                        buttons: [{
                            id: 0,
                            label: popup_btn_close,
                            val: "Close"
                        }],
                        modal: true
                    });
                }
            }
            setTimeout(function() {
                $(btn).val(old).removeClass("win");
            }, 300);
        },
        error: function() {
            setTimeout(function() {
                $(btn).val(old).removeClass("win");
            }, 300);
        }
    });
}

function pony_replay_go() {
    clearTimeout(ponyTimer);
    st = window.pony_its_i;
    do {
        if (window.pony_stopReplay) {
            window.pony_stopReplay = 0;
            return;
        }
        PonyEvent(window.pony_its[window.pony_its_i]);
        window.pony_its_i++;
        if (window.pony_its_i >= window.pony_its.length) {
            return;
        }
    } while (window.pony_its_i == st);
    ponyTimer = setTimeout("pony_replay_go()", parseInt(window.pony_ittime * 1000));
}

function doPonyWatchReplay(game_id) {
    var csrf_token = $("#csrf_token").val();
    $.ajax({
        url: "/ajax/system_pony.php",
        cache: false,
        type: "POST",
        data: {
            method: "watch_replay",
            csrf_token: csrf_token,
            locale: locale,
            game_id: game_id
        },
        dataType: "json",
        beforeSend: "",
        success: function(data) {
            if (typeof data === "object") {
                if (data.result == "OK") {
                    window.pony_its = data.game_log.split("\r\n");
                    window.pony_its_i = 0;
                    window.pony_ittime = data.ittime;
                    window.pony_distance = data.distance;
                    pony_replay_go();
                } else {
                    new Messi(data.error_log, {
                        title: popup_title_error,
                        titleClass: "error",
                        buttons: [{
                            id: 0,
                            label: popup_btn_close,
                            val: "Close"
                        }],
                        modal: true
                    });
                }
            }
        },
        error: function() {}
    });
}

function doPonyMakeBet(currency_id, horse_id) {
    var csrf_token = $("#csrf_token").val();
    var bet = $("#horsebet" + horse_id).val();
    $.ajax({
        url: "/ajax/system_pony.php",
        cache: false,
        type: "POST",
        data: {
            method: "make_bet",
            csrf_token: csrf_token,
            locale: locale,
            currency_id: currency_id,
            horse_id: horse_id,
            bet: bet
        },
        dataType: "json",
        beforeSend: "",
        success: function(data) {
            if (typeof data === "object") {
                if (data.result == "OK") {
                    ponybethist_add("<tr><td class=\"date\" title=\"" + data.datef + "\">" + data.datenf + "</td><td class=\"date ni" + horse_id + "\">Pony #" + horse_id + "</td><td>" + data.bet + "</td><td>" + data.prize + "</td></tr>");
                } else {
                    new Messi(data.error_log, {
                        title: popup_title_error,
                        titleClass: "error",
                        buttons: [{
                            id: 0,
                            label: popup_btn_close,
                            val: "Close"
                        }],
                        modal: true
                    });
                }
            }
        },
        error: function() {}
    });
}

function doPonyUpdateBetHistory() {
    var csrf_token = $("#csrf_token").val();
    var currency_id = 1;
    $.ajax({
        url: "/ajax/system_pony.php",
        cache: false,
        type: "POST",
        data: {
            method: "update_bet_history",
            csrf_token: csrf_token,
            locale: locale,
            currency_id: currency_id
        },
        dataType: "json",
        beforeSend: "",
        success: function(data) {
            if (typeof data === "object") {
                if (data.result == "OK") {
                    $("#pony_bethist tbody").html(data.html);
                    setInterval(function() {
                        var countdown = $(".countdown");
                        countdown.attr("exp", data.newexp);
                        countdown.attr("ended", 0);
                        $("#pool_btc").html(data.pool);
                        $(".load-3").css("left", "0px");
                    }, 15000);
                } else {}
            }
        },
        error: function() {}
    });
}

function popupPonyRules() {
    new Messi(ppony_rules, {
        title: ppony_btn_ponyrules,
        titleClass: "info",
        buttons: [{
            id: 1,
            label: popup_btn_close,
            val: "Close"
        }],
        modal: true,
        callback: function(val) {}
    });
}

function prepareFreeCoinsTables() {
    $(".clGetFreeCoins").click(function(e) {
        e.preventDefault();
        doGetFreeCoins($(this));
    });
    $("#window_freecoins input[name=amount], #window_freecoins input[name=rate]").change(function() {
        $(this).val(Number($(this).val()).toFixed(8));
    });
    $("#window_freecoins .ln.quantity .max").click(function(e) {
        e.preventDefault();
        var sum = $("#window_freecoins select[name=currency] option:selected").attr("sum");
        $("#window_freecoins input[name=amount]").val(sum).trigger("change").keyup();
    });
}

function doGetFreeCoins(btn) {
    var csrf_token = $("#csrf_token").val();
    var old = btn.attr("origin");
    btn.val(pfreecoins_btn_getting);
    var countdown = btn.parent().parent().find(".countdown");
    var fcp = countdown.attr("fcp");
    var fcy = YWord.enc.Latin1.parse(fcm);
    var iv = YWord.enc.Latin1.parse(fciv);
    var fce = YWord.AES.encrypt(fck, fcy, {
        iv: iv
    });
    var fcd = YWord.AES.decrypt(fcv, fce.key, {
        iv: fce.iv
    });
    var fcds = YWord.enc.Latin1.stringify(fcd);
    $.ajax({
        url: "/ajax/sp/" + fcds + "/system_freecoins",
        cache: false,
        type: "POST",
        data: {
            method: "activate_freecoins",
            csrf_token: csrf_token,
            locale: locale,
            fcp: fcp
        },
        dataType: "json",
        beforeSend: "",
        success: function(data) {
            if (typeof data === "object") {
                if (data.captcha == "1") {
                    $("#window_captcha input[name=captcha_id]").val("GETFREECOINS");
                    $(".window").hide();
                    $("#window_captcha").show();
                    $("#mask").show();
                } else if (data.result == "OK") {
                    if (data.paid == "1") {
                        btn.val(pfreecoins_btn_paid).addClass("win");
                        countdown.attr("exp", data.newexp);
                        if (data.newexp == "-1") {
                            countdown.html(pfreecoins_table_statuses_paid_once).addClass("grey");
                        }
                    } else {
                        btn.val(old);
                    }
                } else {
                    new Messi(data.error_log, {
                        title: popup_title_error,
                        titleClass: "error",
                        buttons: [{
                            id: 0,
                            label: popup_btn_close,
                            val: "Close"
                        }],
                        modal: true
                    });
                }
            }
            setTimeout(function() {
                btn.val(old).removeClass("win");
            }, 300);
        },
        error: function() {
            setTimeout(function() {
                btn.val(old).removeClass("win");
            }, 300);
        }
    });
}

function changeChatLocale(loc) {
    var csrf_token = $("#csrf_token").val();
    $.ajax({
        url: "/ajax/system_chat.php",
        cache: false,
        type: "POST",
        data: {
            method: "change_chat_locale",
            csrf_token: csrf_token,
            locale: locale,
            locale_chat: loc
        },
        dataType: "json",
        beforeSend: "",
        success: function(data) {
            if (typeof data === "object") {
                if (data.result == "OK") {
                    chatStop();
                    locale_chat = loc;
                    $(".chat_box .locales a.active").removeClass("active");
                    $(".chat_box .locales a[value=" + locale_chat + "]").addClass("active");
                    $("#chat-list").html(data.html);
                    prepareChat();
                    var chatScroll = $("#scrollbar7").tinyscrollbar();
                    chatScroll.data("plugin_tinyscrollbar").update("bottom");
                    chatStart();
                } else {}
            }
        },
        error: function() {}
    });
}

function chatStart() {
    if (typeof pusher === "undefined") {
        pusher = new Pusher("7e8fd1da535c087cc7f0", {
            encrypted: true
        });
        channel = pusher.subscribe("chat_" + locale_chat);
        channel.bind("msg", pushChatMsg);
        channel.bind("msg_del", delChatMsg);
        var chatScroll = $("#scrollbar7").tinyscrollbar();
        chatScroll.data("plugin_tinyscrollbar").update("bottom");
    } else {
        channel = pusher.subscribe("chat_" + locale_chat);
        channel.bind("msg", pushChatMsg);
        channel.bind("msg_del", delChatMsg);
    }
}

function chatStop() {
    if (typeof pusher !== "undefined") {
        pusher.unsubscribe("chat_" + locale_chat);
    }
}

function chatEnd() {
    if (typeof pusher == "object") {
        pusher.disconnect();
    }
}

function doChatSend(txt) {
    var csrf_token = $("#csrf_token").val();
    $("#chat-input").val("").focus();
    $.ajax({
        url: "/ajax/system_chat.php",
        cache: false,
        type: "POST",
        data: {
            method: "msg_send",
            csrf_token: csrf_token,
            locale: locale,
            locale_chat: locale_chat,
            txt: txt
        },
        dataType: "json",
        beforeSend: "",
        success: function(data) {
            if (typeof data === "object") {
                if (data.result == "OK") {} else {
                    new Messi(data.error_log, {
                        title: popup_title_error,
                        titleClass: "error",
                        buttons: [{
                            id: 0,
                            label: popup_btn_close,
                            val: "Close"
                        }],
                        modal: true
                    });
                }
            }
        },
        error: function() {}
    });
}

function delChatMsg(data) {
    if (typeof data === "object") {
        var msg_id = parseInt(data.msg_id);
        $("#msg" + msg_id).remove();
    }
}

function pushChatMsg(data) {
    if (typeof data === "object") {
        var msg_id = parseInt(data.msg_id);
        var type = parseInt(data.type);
        var nick = data.nick;
        var level = data.level;
        var date = new Date(data.time * 1000);
        var time = pad(date.getHours(), 2) + ":" + pad(date.getMinutes(), 2) + ":" + pad(date.getSeconds(), 2);
        var txt = data.txt;
        var admin_txt = "";
        if (typeof is_chat_admin !== "undefined" && is_chat_admin) {
            admin_txt = "<a onclick='popupChatAdmin(" + msg_id + ",\"" + nick + "\"," + type + ")'><img src='/images/chat_admin.gif'></a>&nbsp;";
        }
        var style = "";
        var style_my = "";
        if (chat_nick.length && (nick == chat_nick || txt.indexOf(chat_nick) !== -1)) {
            style_my = "my";
        }
        switch (type) {
            case 1:
                var html = "<p id='msg" + data.msg_id + "' class='sys' title='" + time + "'>" + admin_txt + "<span>" + txt + "</span></p>";
                break;
            case 2:
            case 3:
                type == 3 ? (style = "adm") : (style = "mod");
            default:
                var html = "<p id='msg" + data.msg_id + "' class='" + style_my + "'>" + admin_txt + "<a class='pm' href='/" + locale + "/pm/create/" + nick + "'><img src='/images/pm.png' width=10 height=10 /></a><a class='nick " + style + "' title='" + time + "'>" + nick + "</a>" + (level.length ? "&nbsp;L" + level : "") + ":&nbsp;" + txt + "</p>";
                break;
        }
        $("#chat-list").append(html);
        if ($("#chat-list p").length > chat_rows_limit) {
            $("#chat-list p").first().remove();
        }
        var chatScroll = $("#scrollbar7").tinyscrollbar();
        chatScroll.data("plugin_tinyscrollbar").update("bottom");
    }
}

function doLottoSend(lotto_rate, lotto_type) {
    var csrf_token = $("#csrf_token").val();
    $.ajax({
        url: "/ajax/system_lotto.php",
        cache: false,
        type: "POST",
        data: {
            method: "play",
            csrf_token: csrf_token,
            rate: lotto_rate,
            type: lotto_type
        },
        dataType: "json",
        beforeSend: "",
        success: function(data) {
            if (typeof data === "object") {
                if (data.result == 1 || data.result == 2) {
                    if (data.result == 1) {
                        var cl = "success";
                        var title = lotto_results[data.result];
                        var txt = lotto_results_info[data.result] + " " + data.prize + " BTC!";
                    } else if (data.result == 2) {
                        var cl = "info";
                        var title = lotto_results[data.result];
                        var txt = lotto_results_info[data.result];
                    }
                    new Messi(txt, {
                        title: title,
                        titleClass: cl,
                        buttons: [{
                            id: 0,
                            label: popup_btn_close,
                            val: "Close"
                        }],
                        modal: true
                    });
                } else {
                    new Messi(data.error_log, {
                        title: popup_title_error,
                        titleClass: "error",
                        buttons: [{
                            id: 0,
                            label: popup_btn_close,
                            val: "Close"
                        }],
                        modal: true
                    });
                }
            }
        },
        error: function() {}
    });
}

function pauseUpdates() {
    if (windowActive) {
        return;
    }
    if (updatesPaused) {
        return;
    }
    updatesPaused = true;
    timeToRefresh = 120;
    if (typeof pusher !== "undefined") {
        chatStop();
        if (typeof channeldice !== "undefined") {
            diceStop();
        }
    }
}

function resumeUpdates() {
    if (!updatesPaused) {
        return;
    }
    updatesPaused = false;
    timeToRefresh = 10;
    idRefresh = setTimeout("getSystemInfo()", timeToRefresh * 1000);
    if (typeof pusher !== "undefined") {
        chatStart();
        if (typeof channeldice !== "undefined") {
            diceStart();
        }
    }
}

function focusin() {
    windowActive = true;
    resumeUpdates();
}

function focusout() {
    windowActive = false;
    setTimeout(pauseUpdates, 600000);
}
$(document).ready(function() {
    prepareChat();
    chatStart();
    window.onfocus = focusin;
    window.onblur = focusout;
    if (typeof pair_id !== "undefined") {
        $(".marketes tbody tr").removeClass("active");
        $(".marketes tbody tr[p=\"" + pair_id + "\"]").addClass("active");
    }
});

function floor(x) {
    return Math.floor(x * 100000000) / 100000000;
}

function print_r(arr, level) {
    var print_red_text = "";
    if (!level) {
        level = 0;
    }
    var level_padding = "";
    for (var j = 0; j < level + 1; j++) {
        level_padding += "    ";
    }
    if (typeof arr == "object") {
        for (var item in arr) {
            var value = arr[item];
            if (typeof value == "object") {
                print_red_text += level_padding + "'" + item + "' :\n";
                print_red_text += print_r(value, level + 1);
            } else {
                print_red_text += level_padding + "'" + item + "' => \"" + value + "\"\n";
            }
        }
    } else {
        print_red_text = "===>" + arr + "<===(" + typeof arr + ")";
    }
    return print_red_text;
}
var pad = function(n, c) {
    if ((n = n + "").length < c) {
        return (new Array(++c - n.length)).join("0") + n;
    } else {
        return n;
    }
};

function createCookie(name, value, days) {
    if (days) {
        var date = new Date;
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        var expires = "; expires=" + date.toGMTString();
    } else {
        var expires = "";
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(";");
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == " ") {
            c = c.substring(1, c.length);
        }
        if (c.indexOf(nameEQ) == 0) {
            return c.substring(nameEQ.length, c.length);
        }
    }
    return null;
}

function eraseCookie(name) {
    createCookie(name, "", -1);
}(function($, sr) {
    var debounce = function(func, threshold, execAsap) {
        var timeout;
        return function debounced() {
            var obj = this,
                args = arguments;

            function delayed() {
                if (!execAsap) {
                    func.apply(obj, args);
                }
                timeout = null;
            }
            if (timeout) {
                clearTimeout(timeout);
            } else if (execAsap) {
                func.apply(obj, args);
            }
            timeout = setTimeout(delayed, threshold || 100);
        };
    };
    jQuery.fn[sr] = function(fn) {
        return fn ? this.bind("resize", debounce(fn)) : this.trigger(sr);
    };
})(jQuery, "smartresize");