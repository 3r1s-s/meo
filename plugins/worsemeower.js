// mybearworld
(() => {
  const originalDoPostWizard = window.dopostwizard;
  window.dopostwizard = () => {
    const msg = document.querySelector("#msg");
    msg.value = beautify(msg.value);

    originalDoPostWizard();
  };

  const beautify = (string) =>
    string
      .substring(0, 50)
      .toUpperCase()
      .replace("M", "N")
      .replace("I", "l")
      .replace(" ", "  ")
      .replace(":", ";")
      .replace("?", "/")
      .replace(",", ".")
      .replace("+", "=")
      .replace("|", "I")
      .replace("!", "?")
      .replace("@", "#")
      .replace("$", "%")
      .replace("^", "&")
      .replace("*", "(")
      .replace(")", "(")
      .replace("L", "I")
      .replace("A", "∀")
      .replace("B", "👌") +
    "?????? (This post was made with https://meo-32r.pages.dev/)";
}
// bloctans
var html = document.querySelector("html")
html.classList = []
html.style = "--background-color: hotpink; --color: #000000; --accent-color: #FFFFFF; --hov-accent-color: #FF0000; --hov-color: var(--hov-accent-color);"
var stylesnew = document.createElement("style")
stylesnew.innerText = ".button, .cstpgbt, input { border: solid 10px var(--accent-color); border-radius: 100% !important; }"
document.head.appendChild(stylesnew)
)();
