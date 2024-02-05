const catTexts = [
  '😺', '😸', '😻', '😼', '🐱', '🐈', 'Meow', 'Purr', 'Kitty', 'Catnip'
];

function replaceTextWithCats(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    let originalText = node.textContent.trim();
    if (originalText.length > 0) {
      const storedCatText = localStorage.getItem('catText');
      const catText = storedCatText || catTexts[Math.floor(Math.random() * catTexts.length)];
      node.textContent = catText;
      localStorage.setItem('catText', catText);
    }
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    for (const childNode of node.childNodes) {
      replaceTextWithCats(childNode);
    }
  }
}

replaceTextWithCats(document.body);
