// ==UserScript==
// @name Json Input
// @namespace http://tampermonkey.net/
// @version 1.0
// @description Unexpected end of json input
// @author Bloctans
// @match https://meo-32r.pages.dev/*
// @run-at document-start
// ==/UserScript==

function Yeah() {
for (let i = 0; i < document.getElementsByTagName("p").length; i++) {
document.getElementsByTagName("p")[i].innerHTML = "Unexpected end of JSON input"
}
for (let i = 0; i < document.getElementsByTagName("span").length; i++) {
document.getElementsByTagName("span")[i].innerHTML = "Unexpected end of JSON input"
}
for (let i = 0; i < document.getElementsByTagName("h1").length; i++) {
document.getElementsByTagName("h1")[i].innerHTML = "Unexpected end of JSON input"
}
for (let i = 0; i < document.getElementsByTagName("h2").length; i++) {
document.getElementsByTagName("h2")[i].innerHTML = "Unexpected end of JSON input"
}
for (let i = 0; i < document.getElementsByTagName("h3").length; i++) {
document.getElementsByTagName("h3")[i].innerHTML = "Unexpected end of JSON input"
}
for (let i = 0; i < document.getElementsByTagName("h4").length; i++) {
document.getElementsByTagName("h4")[i].innerHTML = "Unexpected end of JSON input"
}
for (let i = 0; i < document.getElementsByTagName("h5").length; i++) {
document.getElementsByTagName("h5")[i].innerHTML = "Unexpected end of JSON input"
}
for (let i = 0; i < document.getElementsByTagName("a").length; i++) {
document.getElementsByTagName("a")[i].innerHTML = "Unexpected end of JSON input"
}
for (let i = 0; i < document.getElementsByTagName("button").length; i++) {
document.getElementsByTagName("button")[i].innerHTML = "Unexpected end of JSON input"
}
for (let i = 0; i < document.getElementsByTagName("yt-formatted-string").length; i++) {
document.getElementsByTagName("yt-formatted-string")[i].innerHTML = "Unexpected end of JSON input"
}
for (let i = 0; i < document.getElementsByTagName("li").length; i++) {
document.getElementsByTagName("li")[i].innerHTML = "Unexpected end of JSON input"
}
for (let i = 0; i < document.getElementsByTagName("summary").length; i++) {
document.getElementsByTagName("summary")[i].innerHTML = "Unexpected end of JSON input"
}
for (let i = 0; i < document.getElementsByTagName("td").length; i++) {
document.getElementsByTagName("td")[i].innerHTML = "Unexpected end of JSON input"
}
for (let i = 0; i < document.getElementsByTagName("th").length; i++) {
document.getElementsByTagName("th")[i].innerHTML = "Unexpected end of JSON input"
}
for (let i = 0; i < document.getElementsByTagName("b").length; i++) {
document.getElementsByTagName("b")[i].innerHTML = "Unexpected end of JSON input"
}
}

Yeah()

setInterval(Yeah, 1000)