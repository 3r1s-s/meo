var html = document.querySelector("html")
html.classList = []
html.style = "--background-color: hotpink; --color: #000000; --accent-color: #FFFFFF; --hov-accent-color: #FF0000; --hov-color: var(--hov-accent-color);"
var stylesnew = document.createElement("style")
stylesnew.innerText = ".button, .cstpgbt, input { border: solid 10px var(--accent-color); border-radius: 100% !important; }"
document.head.appendChild(stylesnew)