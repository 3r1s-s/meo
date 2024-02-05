// (() => {
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
      .replace("B", "👌︎") +
    "?????? (This post was made with https://meo-32r.pages.dev/)";
})();
