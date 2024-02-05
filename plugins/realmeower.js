const catTexts = [
  '😺', '😸', '😻', '😼', '🐱', '🐈', 'Meow', 'Purr', 'Kitty', 'Catnip'
];


function replaceTextWithCats(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    let originalText = node.textContent.trim();
    if (originalText.length > 0) {
      // Randomly select a cat-related text
      const randomCatText = catTexts[Math.floor(Math.random() * catTexts.length)];
      // Replace the original text with cat text
      node.textContent = randomCatText;
    }
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    for (const childNode of node.childNodes) {
      replaceTextWithCats(childNode);
    }
  }
}

replaceTextWithCats(document.body);
