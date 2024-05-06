javascript:(function() {
  var a = document.createElement("div");
    a.innerHTML = `
<center style="position: absolute;bottom:0;left:0;right:0;">
    <iframe id="BetterAd" src="https://adservice.bettermeower.app/generate" style="border: medium; width: 728px; height: 90px; overflow: hidden;" scrolling="no"></iframe>
    <iframe id="BetterAd" src="https://adservice.bettermeower.app/generate" style="border: medium; width: 728px; height: 90px; overflow: hidden;" scrolling="no"></iframe>
    <iframe id="BetterAd" src="https://adservice.bettermeower.app/generate" style="border: medium; width: 728px; height: 90px; overflow: hidden;" scrolling="no"></iframe>
    <iframe id="BetterAd" src="https://adservice.bettermeower.app/generate" style="border: medium; width: 728px; height: 90px; overflow: hidden;" scrolling="no"></iframe>
</center>
    `
  document.body.appendChild(a);
})();

