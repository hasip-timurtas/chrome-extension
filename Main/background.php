<?php
header('Access-Control-Allow-Origin: *');
?>

  <div id='divim' style='padding:10px; width:629px; height:420px;'>
    <div id="loginArea">
      <input type="text" id="name" placeholder="User Name"> <br />
      <input type="password" id="pass"> <br>
      <button type="button" id="btnLogin">Login</button>
    </div>
    <h2 id="loginName"></h2>
    <h1 id="sayac" style="display:none; font-size:200px; font-weight:bold;"></h1>
    <br/>
    <table id="sonuclar" class="display nowrap dataTable dtr-inline" style="font-size:11px; font-family:arial; width: 100%; display:none;">
    </table>
  </div>
