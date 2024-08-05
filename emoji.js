// EMOJIS

let opened = 0
let shiftKeyPressed = false;

function togglePicker() {
    if (opened === 0) {
        loadpicker();
        opened = 1;
    } else {
        closepicker();
        opened = 0;
    }
}

function closepicker() {
    let picker = document.getElementById("emojipicker");
    picker.style.display = "none";
    const mdlback = document.querySelector(".emoji-back");
    mdlback.style.display = "none";
    picker = document.querySelector(".emojipicker");
    if (picker) {
        picker.innerHTML = ``;
        opened = 0;
    }
}

function addemoji(emoji) {
    const ogmsg = document.getElementById('msg').value
    document.getElementById('msg').value = `${ogmsg}${emoji} `;
    autoresize();
    event.preventDefault();
    if (event) {
        if (!event.shiftKey) {
            closepicker();
            document.getElementById('msg').focus();
        }
    }
}

function addemojim(emoji) {
    const ogmsg = document.getElementById('msg').value
    document.getElementById('msg').value = `${ogmsg}${emoji} `;
    autoresize();
    event.preventDefault();
    if (event) {
        if (!event.shiftKey) {
            closemodal();
            document.getElementById('msg').focus();
        }
    }
}

function loadpicker() {
    pickerhtm();
    let picker = document.getElementById("emojipicker");
    picker.style.display = "flex";
    const mdlback = document.querySelector(".emoji-back");
    mdlback.style.display = "block";
    if (document.querySelector(".emojipicker")) {
        picker = document.querySelector(".emojipicker");
        picker.innerHTML = pickerhtm()
    } else {
        picker.innerHTML = `<div class="emojipicker">` + pickerhtm() + `</div>`
    }
    if (settingsstuff().reducemotion) {
        document.querySelector(".emojipicker").classList.add("reduced-ani");
    } else {
        document.querySelector(".emojipicker").classList.remove("reduced-ani");
    }

    // Custom emojis from chats
    for (const chat of Object.values(chatCache)) {
        const customEmojis = chat.emojis;
        if (!customEmojis.length) continue;

        const sidebarButton = document.createElement("button");
        sidebarButton.classList.add("emojibuttonside");
        sidebarButton.onclick = () => emjpage(chat._id);

        const chatIconElem = document.createElement("div");
        chatIconElem.classList.add("avatar-small");
        chatIconElem.classList.add("pfp-inner");
        chatIconElem.setAttribute("alt", "Avatar");
        if (chat.type === 0) {
            if (chat.icon) {
                chatIconElem.style.backgroundImage = `url(https://uploads.meower.org/icons/${chat.icon})`;
            } else {
                chatIconElem.style.backgroundImage = `url(images/GC.svg)`;
            }
            if (!chat.icon) {
                chatIconElem.style.border = "1.5px solid #" + '1f5831';
            } else if (chat.icon_color) {
                chatIconElem.style.border = "1.5px solid #" + chat.icon_color;
            } else {
                chatIconElem.style.border = "1.5px solid #" + '000';
            }
        } else {
            // this is so hacky :p
            // - Tnix
            loadPfp(chat.members.find(v => v !== localStorage.getItem("username")))
            .then(pfpElem => {
                if (pfpElem) {
                    let bgImageUrl = pfpElem.style.backgroundImage;
                    if (bgImageUrl) {
                        bgImageUrl = bgImageUrl.slice(5, -2);
                    }
                    chatIconElem.style.border = pfpElem.style.border.replace("3px", "1.5px");
                    chatIconElem.style.backgroundColor = pfpElem.style.border.replace("3px solid", "");
                    chatIconElem.style.backgroundImage = `url("${bgImageUrl}")`;
                    chatIconElem.classList.add("pfp-inner");
                    if (pfpElem.classList.contains("svg-avatar")) {
                        chatIconElem.classList.add("svg-avatar");
                        chatIconElem.style.backgroundColor = '#fff';
                    }
                }
            });
        }
        chatIconElem.style.width = "100%";
        chatIconElem.style.height = "auto";
        sidebarButton.appendChild(chatIconElem);

        document.querySelector(".emojisidebar").appendChild(sidebarButton);

        const section = document.createElement("div");
        section.classList.add("emojisec");
        section.id = chat._id;
        const headerContainer = document.createElement("div");
        headerContainer.classList.add("emojiheader");
        const header = document.createElement("h3");
        header.innerText = chat.nickname || `@${chat.members.find(v => v !== localStorage.getItem("username"))}`;
        headerContainer.appendChild(header);
        section.appendChild(headerContainer);
        for (const emoji of customEmojis) {
            const addButton = document.createElement("button");
            addButton.classList.add("emojibutton");
            addButton.title = emoji.name;
            addButton.onclick = () => addemoji(`<:${emoji._id}>`);
            const img = document.createElement("img");
            img.src = `https://uploads.meower.org/emojis/${emoji._id}`;
            img.alt = emoji.name;
            img.height = 32;
            addButton.appendChild(img);
            section.appendChild(addButton);
        }
        document.querySelector(".emojicont").appendChild(section);
    }

    document.getElementById("emojin").focus();
}

document.addEventListener('input', function(event) {
    if (opened === 1) {
        const searchQuery = document.getElementById('emojin').value.toLowerCase();
        const emojiButtons = document.querySelectorAll('.emojibutton');

        if (searchQuery) {
            const aa = document.querySelectorAll(".emojisec");
            aa.forEach(function(bb) {
                bb.style.display = "flex";

            });
            const ee = document.querySelectorAll(".emojiheader");
            ee.forEach(function(ff) {
                ff.style.display = "none";
            });
        } else {
            const aa = document.querySelectorAll(".emojisec");
            aa.forEach(function(bb) {
                bb.style.removeProperty("display");
            });
            const ee = document.querySelectorAll(".emojiheader");
            ee.forEach(function(ff) {
                ff.style.removeProperty("display");
            });
            document.getElementById("people").style.display = "flex";
        }
    
        emojiButtons.forEach(function(button) {
            const emojiTitle = button.getAttribute('title').toLowerCase();
            const emojiEmoji = button.innerText.toLowerCase();
    
            if (emojiTitle.includes(searchQuery) || emojiEmoji.includes(searchQuery)) {
                button.style.display = 'inline-block';
            } else {
                button.style.display = 'none';
            }
        });
    }
});

function emjpage(page) {
    const cc = document.querySelectorAll(".emojisec");
    cc.forEach(function(dd) {
        dd.style.removeProperty("display")
    });
    document.getElementById(page).style.display = "flex";
}

function fstemj() {
    addemoji(document.querySelector('.emojibutton:not([style*="display: none;"])').getAttribute('onclick').match(/'(.*?)'/)[1]);
}

function emojimodal() {
    document.documentElement.style.overflow = "hidden";
    
    const mdlbck = document.querySelector('.modal-back');
    if (mdlbck) {
        mdlbck.style.display = 'flex';
        
        const mdl = mdlbck.querySelector('.modal');
        mdl.id = '';
        if (mdl) {
            const mdlt = mdl.querySelector('.modal-top');
            if (mdlt) {
                mdlt.innerHTML = `
                <div class="emojimodal">
                    <button class="emojibuttonm" title="think" onclick="addemojim('<:think:1226311619064234086>')"><img src="https://cdn.discordapp.com/emojis/1226311619064234086.webp?size=96&amp;quality=lossless" alt="think" height="32px"></button>
                    <button class="emojibuttonm" title="amog os" onclick="addemojim('<:amogos:1226314396377288726>')"><img src="https://cdn.discordapp.com/emojis/1226314396377288726.webp?size=96&amp;quality=lossless" alt="amogos" height="32px"></button>
                    <button class="emojibuttonm" title="toasty" onclick="addemojim('<:toasty:1227089807897792605>')"><img src="https://cdn.discordapp.com/emojis/1227089807897792605.webp?size=96&quality=lossless" alt="toasty" height="32px"></button>
                    <button class="emojibuttonm" title="luna" onclick="addemojim('<:luna:1221632755851591740>')"><img src="https://cdn.discordapp.com/emojis/1221632755851591740.webp?size=96&amp;quality=lossless" alt="luna" height="32px"></button>
                    <button class="emojibuttonm" title="noodle" onclick="addemojim('<:noodle:1227131494183473233>')"><img src="https://cdn.discordapp.com/emojis/1227131494183473233.webp?size=96&quality=lossless" alt="noodle" height="32px"></button>
                    <button class="emojibuttonm" title="me" onclick="addemojim('<:me:1221628997025267752>')"><img src="https://cdn.discordapp.com/emojis/1221628997025267752.webp?size=96&amp;quality=lossless" alt="me" height="32px"></button>
                    <button class="emojibuttonm" title="oswal" onclick="addemojim('<:oswal:1226912603931148338>')"><img src="https://cdn.discordapp.com/emojis/1226912603931148338.webp?size=96&quality=lossless" alt="oswal" height="32px"></button>
                    <button class="emojibuttonm" title="melm" onclick="addemojim('<:melm:1248842290806657035>')"><img src="https://cdn.discordapp.com/emojis/1248842290806657035.webp?size=96&quality=lossless" alt="melm" height="32px"></button>
                    <button class="emojibuttonm" title="cta" onclick="addemojim('<:cta:1226913189590073494>')"><img src="https://cdn.discordapp.com/emojis/1226913189590073494.webp?size=96&quality=lossless" alt="cta" height="32px"></button>
                    <button class="emojibuttonm" title="freya" onclick="addemojim('<:freya:1244778372953935922>')"><img src="https://cdn.discordapp.com/emojis/1244778372953935922.webp?size=96&quality=lossless" alt="freya" height="32px"></button>
                    <button class="emojibuttonm" title="atticus" onclick="addemojim('<:atticu:1221630557369405440>')"><img src="https://cdn.discordapp.com/emojis/1221630557369405440.webp?size=96&amp;quality=lossless" alt="atticu" height="32px"></button>
                    <button class="emojibuttonm" title="uggh" onclick="addemojim('<:uggh:1227845267496243242>')"><img src="https://cdn.discordapp.com/emojis/1227845267496243242.webp?size=96&quality=lossless" alt="uggh" height="32px"></button>
                    <button class="emojibuttonm" title=":3" onclick="addemojim('<:33:1226320165302571087>')"><img src="https://cdn.discordapp.com/emojis/1226320165302571087.webp?size=44&quality=lossless" alt=":3" height="32px"></button>
                    <button class="emojibuttonm" title="Cydia" onclick="addemojim('<:Cydia:1226320451278602290>')"><img src="https://cdn.discordapp.com/emojis/1226320451278602290.webp?size=44&quality=lossless" alt="Cydia" height="32px"></button>
                    <button class="emojibuttonm" title="yuhhuh" onclick="addemojim('<:yuhhuh:1227268820213698611>')"><img src="https://cdn.discordapp.com/emojis/1227268820213698611.webp?size=96&quality=lossless" alt="yuhhuh" height="32px"></button>
                    <button class="emojibuttonm" title="nuhhuh" onclick="addemojim('<:nuhhuh:1233290735999258664>')"><img src="https://cdn.discordapp.com/emojis/1233290735999258664.webp?size=96&quality=lossless" alt="nuhhuh" height="32px"></button>
                    <button class="emojibuttonm" title="DebugMan" onclick="addemojim('<:DebugMan2:1226320526037880916>')"><img src="https://cdn.discordapp.com/emojis/1226320526037880916.webp?size=44&quality=lossless" alt="DebugMan" height="32px"></button>
                    <button class="emojibuttonm" title="blobheart" onclick="addemojim('<:blobheart:1226319886867763240>')"><img src="https://cdn.discordapp.com/emojis/1226319886867763240.webp?size=44&quality=lossless" alt="blobheart" height="32px"></button>
                    <button class="emojibuttonm" title="demonetized" onclick="addemojim('<:demonetized:1226320307673894953>')"><img src="https://cdn.discordapp.com/emojis/1226320307673894953.webp?size=44&quality=lossless" alt="demonetized" height="32px"></button>
                    <button class="emojibuttonm" title="GarfTrue" onclick="addemojim('<:GarfTrue:1228207760047472670>')"><img src="https://cdn.discordapp.com/emojis/1228207760047472670.webp?size=44&quality=lossless" alt="GarfTrue" height="32px"></button>
                    <button class="emojibuttonm" title="thubsup" onclick="addemojim('<:thubsup:1229994631840927774>')"><img src="https://cdn.discordapp.com/emojis/1229994631840927774.webp?size=96&quality=lossless" alt="thubsup" height="32px"></button>
                    <button class="emojibuttonm" title="miau" onclick="addemojim('<:miau:1237207275870097519>')"><img src="https://cdn.discordapp.com/emojis/1237207275870097519.webp?size=96&quality=lossless" alt="miau" height="32px"></button>
                    <button class="emojibuttonm" title="marker" onclick="addemojim('<:marker:1238203265229914132>')"><img src="https://cdn.discordapp.com/emojis/1238203265229914132.webp?size=128&quality=lossless" alt="marker" height="32px"></button>
                    <button class="emojibuttonm" title="ow" onclick="addemojim('<:ow:1251723597630931065>')"><img src="https://cdn.discordapp.com/emojis/1251723597630931065.webp?size=128&quality=lossless" alt="ow" height="32px"></button>
                    <button class="emojibuttonm" title="scary" onclick="addemojim('<:scary:1259355757602672651>')"><img src="https://cdn.discordapp.com/emojis/1259355757602672651.webp?size=96&quality=lossless" alt="scary" height="32px"></button>
                    <button class="emojibuttonm" title="wink" onclick="addemojim('<:wink:1260356148968689704>')"><img src="https://cdn.discordapp.com/emojis/1260356148968689704.webp?size=96&quality=lossless" alt="wink" height="32px"></button>
                    <button class="emojibuttonm" title="roxy" onclick="addemojim('<:roxy:1260366574989348955>')"><img src="https://cdn.discordapp.com/emojis/1260366574989348955.webp?size=96&quality=lossless" alt="roxy" height="32px"></button>
                    <button class="emojibuttonm" title="doinkus" onclick="addemojim('<:doinkus:1267307216000782457>')"><img src="https://cdn.discordapp.com/emojis/1267307216000782457.webp?size=96&quality=lossless" alt="doinkus" height="32px"></button>
                    
                    <button class="emojibuttonm" title="yippe" onclick="addemojim('<a:yippe:1226318495147495505>')"><img src="https://cdn.discordapp.com/emojis/1226318495147495505.gif?size=48&quality=lossless&name=yippe" alt="yippe" height="32px"></button>
                    <button class="emojibuttonm" title="hooray" onclick="addemojim('<a:hooray:1230023947777609808>')"><img src="https://cdn.discordapp.com/emojis/1230023947777609808.gif?size=48&quality=lossless&name=hooray" alt="hooray" height="32px"></button>
                    <button class="emojibuttonm" title="boogie" onclick="addemojim('<a:boogie:1226311710818959401>')"><img src="https://cdn.discordapp.com/emojis/1226311710818959401.gif?size=96&amp;quality=lossless" alt="boogie" height="32px"></button>
                    <button class="emojibuttonm" title="ameowdundundun" onclick="addemojim('<a:ameowdundundun:1226319768236331140>')"><img src="https://cdn.discordapp.com/emojis/1226319768236331140.gif?size=48&quality=lossless&name=ameowdundundun" alt="ameowdundundun" height="32px"></button>
                    <button class="emojibuttonm" title="Misc_Hundred" onclick="addemojim('<a:Misc_Hundred:1226319950570983434>')"><img src="https://cdn.discordapp.com/emojis/1226319950570983434.gif?size=48&quality=lossless&name=Misc_Hundred" alt="Misc_Hundred" height="32px"></button>
                    <button class="emojibuttonm" title="kick" onclick="addemojim('<a:kick:1231078387704139967>')"><img src="https://cdn.discordapp.com/emojis/1231078387704139967.gif?size=48&quality=lossless&name=kick" alt="kick" height="32px"></button>
                    <button class="emojibuttonm" title="shake" onclick="addemojim('<a:shake:1227279789472354435>')"><img src="https://cdn.discordapp.com/emojis/1227279789472354435.gif?size=48&quality=lossless&name=shake" alt="shake" height="32px"></button>
                    <button class="emojibuttonm" title="sphere" onclick="addemojim('<a:sphere:1227279796715917362>')"><img src="https://cdn.discordapp.com/emojis/1227279796715917362.gif?size=48&quality=lossless&name=sphere" alt="sphere" height="32px"></button>
                    <button class="emojibuttonm" title="spin" onclick="addemojim('<a:spin:1227279798015889498>')"><img src="https://cdn.discordapp.com/emojis/1227279798015889498.gif?size=48&quality=lossless&name=spin" alt="spin" height="32px"></button>
                    <button class="emojibuttonm" title="squish" onclick="addemojim('<a:squish:1227279787072946189>')"><img src="https://cdn.discordapp.com/emojis/1227279787072946189.gif?size=48&quality=lossless&name=squish" alt="squish" height="32px"></button>
                </div>
                `;
            }
            const mdbt = mdl.querySelector('.modal-bottom');
            if (mdbt) {
                mdbt.innerHTML = `
                `;
            }
        }
    }
}


function pickerhtm() {
    return `
    <div class="emojisidebar">
        <button class="emojibuttonside" onclick="emjpage('people')">😀</button>
        <button class="emojibuttonside" onclick="emjpage('animals')">😺</button>
        <button class="emojibuttonside" onclick="emjpage('food')">🍎</button>
        <button class="emojibuttonside" onclick="emjpage('travel')">🏠</button>
        <button class="emojibuttonside" onclick="emjpage('activities')">⚽</button>
        <button class="emojibuttonside" onclick="emjpage('objects')">📃</button>
        <button class="emojibuttonside" onclick="emjpage('symbols')">❤️</button>
        <button class="emojibuttonside" onclick="emjpage('flags')">🏳️‍🌈</button>
        <button class="emojibuttonside" onclick="emjpage('special')">✨</button>
    </div>
    <div class="emojicont">
        <div class="emojisearch">
        <input type="text" class="emjinpt" id="emojin" placeholder="Find the perfect emoji..." autofill="none">
        </div>
        <div class="emojisec" id="people" style="display:flex;">
            <div class="emojiheader">
                <h3>People</h3>
            </div>
            <button class="emojibutton" title="grinning face" onclick="addemoji('😀')">😀</button>
            <button class="emojibutton" title="grinning face with big eyes" onclick="addemoji('😃')">😃</button>
            <button class="emojibutton" title="grinning face with smiling eyes" onclick="addemoji('😄')">😄</button>
            <button class="emojibutton" title="beaming face with smiling eyes" onclick="addemoji('😁')">😁</button>
            <button class="emojibutton" title="grinning squinting face" onclick="addemoji('😆')">😆</button>
            <button class="emojibutton" title="grinning face with sweat" onclick="addemoji('😅')">😅</button>
            <button class="emojibutton" title="rolling on the floor laughing" onclick="addemoji('🤣')">🤣</button>
            <button class="emojibutton" title="face with tears of joy" onclick="addemoji('😂')">😂</button>
            <button class="emojibutton" title="slightly smiling face" onclick="addemoji('🙂')">🙂</button>
            <button class="emojibutton" title="winking face" onclick="addemoji('😉')">😉</button>
            <button class="emojibutton" title="smiling face with smiling eyes" onclick="addemoji('😊')">😊</button>
            <button class="emojibutton" title="smiling face with halo, innocent" onclick="addemoji('😇')">😇</button>
            <button class="emojibutton" title="smiling face with hearts" onclick="addemoji('🥰')">🥰</button>
            <button class="emojibutton" title="smiling face with heart-eyes" onclick="addemoji('😍')">😍</button>
            <button class="emojibutton" title="star-struck" onclick="addemoji('🤩')">🤩</button>
            <button class="emojibutton" title="face blowing a kiss" onclick="addemoji('😘')">😘</button>
            <button class="emojibutton" title="kissing face" onclick="addemoji('😗')">😗</button>
            <button class="emojibutton" title="smiling face" onclick="addemoji('☺️')">☺️</button>
            <button class="emojibutton" title="kissing face with closed eyes" onclick="addemoji('😚')">😚</button>
            <button class="emojibutton" title="kissing face with smiling eyes" onclick="addemoji('😙')">😙</button>
            <button class="emojibutton" title="smiling face with tear" onclick="addemoji('🥲')">🥲</button>
            <button class="emojibutton" title="smirking face" onclick="addemoji('😏')">😏</button>
            <button class="emojibutton" title="face savoring food" onclick="addemoji('😋')">😋</button>
            <button class="emojibutton" title="face with tongue" onclick="addemoji('😛')">😛</button>
            <button class="emojibutton" title="winking face with tongue" onclick="addemoji('😜')">😜</button>
            <button class="emojibutton" title="zany face" onclick="addemoji('🤪')">🤪</button>
            <button class="emojibutton" title="squinting face with tongue" onclick="addemoji('😝')">😝</button>
            <button class="emojibutton" title="smiling face with open hands" onclick="addemoji('🤗')">🤗</button>
            <button class="emojibutton" title="face with hand over mouth" onclick="addemoji('🤭')">🤭</button>
            <button class="emojibutton" title="face with open eyes and hand over mouth" onclick="addemoji('🫢')">🫢</button>
            <button class="emojibutton" title="face with peeking eye" onclick="addemoji('🫣')">🫣</button>
            <button class="emojibutton" title="shushing face" onclick="addemoji('🤫')">🤫</button>
            <button class="emojibutton" title="thinking face" onclick="addemoji('🤔')">🤔</button>
            <button class="emojibutton" title="saluting face" onclick="addemoji('🫡')">🫡</button>
            <button class="emojibutton" title="drooling face" onclick="addemoji('🤤')">🤤</button>
            <button class="emojibutton" title="cowboy hat face" onclick="addemoji('🤠')">🤠</button>
            <button class="emojibutton" title="partying face" onclick="addemoji('🥳')">🥳</button>
            <button class="emojibutton" title="disguised face" onclick="addemoji('🥸')">🥸</button>
            <button class="emojibutton" title="smiling face with sunglasses" onclick="addemoji('😎')">😎</button>
            <button class="emojibutton" title="nerd face" onclick="addemoji('🤓')">🤓</button>
            <button class="emojibutton" title="face with monocle" onclick="addemoji('🧐')">🧐</button>
            <button class="emojibutton" title="upside-down face" onclick="addemoji('🙃')">🙃</button>
            <button class="emojibutton" title="melting face" onclick="addemoji('🫠')">🫠</button>
            <button class="emojibutton" title="zipper-mouth face" onclick="addemoji('🤐')">🤐</button>
            <button class="emojibutton" title="face with raised eyebrow" onclick="addemoji('🤨')">🤨</button>
            <button class="emojibutton" title="neutral face" onclick="addemoji('😐')">😐</button>
            <button class="emojibutton" title="expressionless face" onclick="addemoji('😑')">😑</button>
            <button class="emojibutton" title="face without mouth" onclick="addemoji('😶')">😶</button>
            <button class="emojibutton" title="dotted line face" onclick="addemoji('🫥')">🫥</button>
            <button class="emojibutton" title="face in clouds" onclick="addemoji('😶‍🌫️')">😶‍🌫️</button>
            <button class="emojibutton" title="unamused face" onclick="addemoji('😒')">😒</button>
            <button class="emojibutton" title="face with rolling eyes" onclick="addemoji('🙄')">🙄</button>
            <button class="emojibutton" title="grimacing face" onclick="addemoji('😬')">😬</button>
            <button class="emojibutton" title="face exhaling" onclick="addemoji('😮‍💨')">😮‍💨</button>
            <button class="emojibutton" title="lying face" onclick="addemoji('🤥')">🤥</button>
            <button class="emojibutton" title="shaking face" onclick="addemoji('🫨')">🫨</button>
            <button class="emojibutton" title="relieved face" onclick="addemoji('😌')">😌</button>
            <button class="emojibutton" title="pensive face" onclick="addemoji('😔')">😔</button>
            <button class="emojibutton" title="sleepy face" onclick="addemoji('😪')">😪</button>
            <button class="emojibutton" title="sleeping face" onclick="addemoji('😴')">😴</button>
            <button class="emojibutton" title="face with medical mask" onclick="addemoji('😷')">😷</button>
            <button class="emojibutton" title="face with thermometer" onclick="addemoji('🤒')">🤒</button>
            <button class="emojibutton" title="face with head-bandage" onclick="addemoji('🤕')">🤕</button>
            <button class="emojibutton" title="nauseated face" onclick="addemoji('🤢')">🤢</button>
            <button class="emojibutton" title="face vomiting" onclick="addemoji('🤮')">🤮</button>
            <button class="emojibutton" title="sneezing face" onclick="addemoji('🤧')">🤧</button>
            <button class="emojibutton" title="hot face" onclick="addemoji('🥵')">🥵</button>
            <button class="emojibutton" title="cold face" onclick="addemoji('🥶')">🥶</button>
            <button class="emojibutton" title="woozy face" onclick="addemoji('🥴')">🥴</button>
            <button class="emojibutton" title="face with crossed-out eyes" onclick="addemoji('😵')">😵</button>
            <button class="emojibutton" title="face with spiral eyes" onclick="addemoji('😵‍💫')">😵‍💫</button>
            <button class="emojibutton" title="exploding head" onclick="addemoji('🤯')">🤯</button>
            <button class="emojibutton" title="yawning face" onclick="addemoji('🥱')">🥱</button>
            <button class="emojibutton" title="confused face" onclick="addemoji('😕')">😕</button>
            <button class="emojibutton" title="face with diagonal mouth" onclick="addemoji('🫤')">🫤</button>
            <button class="emojibutton" title="worried face" onclick="addemoji('😟')">😟</button>
            <button class="emojibutton" title="slightly frowning face" onclick="addemoji('🙁')">🙁</button>
            <button class="emojibutton" title="frowning face" onclick="addemoji('☹️')">☹️</button>
            <button class="emojibutton" title="face with open mouth" onclick="addemoji('😮')">😮</button>
            <button class="emojibutton" title="hushed face" onclick="addemoji('😯')">😯</button>
            <button class="emojibutton" title="astonished face" onclick="addemoji('😲')">😲</button>
            <button class="emojibutton" title="flushed face" onclick="addemoji('😳')">😳</button>
            <button class="emojibutton" title="pleading face" onclick="addemoji('🥺')">🥺</button>
            <button class="emojibutton" title="face holding back tears" onclick="addemoji('🥹')">🥹</button>
            <button class="emojibutton" title="frowning face with open mouth" onclick="addemoji('😦')">😦</button>
            <button class="emojibutton" title="anguished face" onclick="addemoji('😧')">😧</button>
            <button class="emojibutton" title="fearful face" onclick="addemoji('😨')">😨</button>
            <button class="emojibutton" title="anxious face with sweat" onclick="addemoji('😰')">😰</button>
            <button class="emojibutton" title="sad but relieved face" onclick="addemoji('😥')">😥</button>
            <button class="emojibutton" title="crying face" onclick="addemoji('😢')">😢</button>
            <button class="emojibutton" title="sobbing face" onclick="addemoji('😭')">😭</button>
            <button class="emojibutton" title="face screaming in fear" onclick="addemoji('😱')">😱</button>
            <button class="emojibutton" title="confounded face" onclick="addemoji('😖')">😖</button>
            <button class="emojibutton" title="persevering face" onclick="addemoji('😣')">😣</button>
            <button class="emojibutton" title="disappointed face" onclick="addemoji('😞')">😞</button>
            <button class="emojibutton" title="downcast face with sweat" onclick="addemoji('😓')">😓</button>
            <button class="emojibutton" title="weary face" onclick="addemoji('😩')">😩</button>
            <button class="emojibutton" title="tired face" onclick="addemoji('😫')">😫</button>
            <button class="emojibutton" title="face with steam from nose" onclick="addemoji('😤')">😤</button>
            <button class="emojibutton" title="enraged face" onclick="addemoji('😡')">😡</button>
            <button class="emojibutton" title="angry face" onclick="addemoji('😠')">😠</button>
            <button class="emojibutton" title="face with symbols on mouth" onclick="addemoji('🤬')">🤬</button>
            <button class="emojibutton" title="angry face with horns" onclick="addemoji('👿')">👿</button>
            <button class="emojibutton" title="devil smiling" onclick="addemoji('😈')">😈</button>
            <button class="emojibutton" title="angry devil" onclick="addemoji('👿')">👿</button>
            <button class="emojibutton" title="skull" onclick="addemoji('💀')">💀</button>
            <button class="emojibutton" title="skull and crossbones" onclick="addemoji('☠️')">☠️</button>
            <button class="emojibutton" title="pile of poo" onclick="addemoji('💩')">💩</button>
            <button class="emojibutton" title="clown face" onclick="addemoji('🤡')">🤡</button>
            <button class="emojibutton" title="ogre" onclick="addemoji('👹')">👹</button>
            <button class="emojibutton" title="goblin" onclick="addemoji('👺')">👺</button>
            <button class="emojibutton" title="ghost" onclick="addemoji('👻')">👻</button>
            <button class="emojibutton" title="alien" onclick="addemoji('👽')">👽</button>
            <button class="emojibutton" title="space invader" onclick="addemoji('👾')">👾</button>
            <button class="emojibutton" title="robot" onclick="addemoji('🤖')">🤖</button>
            <button class="emojibutton" title="grinning cat" onclick="addemoji('😺')">😺</button>
            <button class="emojibutton" title="grinning cat with smiling eyes" onclick="addemoji('😸')">😸</button>
            <button class="emojibutton" title="cat with tears of joy" onclick="addemoji('😹')">😹</button>
            <button class="emojibutton" title="smiling cat with heart-eyes" onclick="addemoji('😻')">😻</button>
            <button class="emojibutton" title="cat with wry smile" onclick="addemoji('😼')">😼</button>
            <button class="emojibutton" title="kissing cat" onclick="addemoji('😽')">😽</button>
            <button class="emojibutton" title="weary cat" onclick="addemoji('🙀')">🙀</button>
            <button class="emojibutton" title="crying cat" onclick="addemoji('😿')">😿</button>
            <button class="emojibutton" title="pouting cat" onclick="addemoji('😾')">😾</button>
            <button class="emojibutton" title="see-no-evil monkey" onclick="addemoji('🙈')">🙈</button>
            <button class="emojibutton" title="hear-no-evil monkey" onclick="addemoji('🙉')">🙉</button>
            <button class="emojibutton" title="speak-no-evil monkey" onclick="addemoji('🙊')">🙊</button>
            <button class="emojibutton" title="boy" onclick="addemoji('👦')">👦</button>
            <button class="emojibutton" title="girl" onclick="addemoji('👧')">👧</button>
            <button class="emojibutton" title="man" onclick="addemoji('👨')">👨</button>
            <button class="emojibutton" title="woman" onclick="addemoji('👩')">👩</button>
            <button class="emojibutton" title="old man" onclick="addemoji('👴')">👴</button>
            <button class="emojibutton" title="old woman" onclick="addemoji('👵')">👵</button>
            <button class="emojibutton" title="baby" onclick="addemoji('👶')">👶</button>
            <button class="emojibutton" title="baby angel" onclick="addemoji('👼')">👼</button>
            <button class="emojibutton" title="man health worker" onclick="addemoji('👨‍⚕️')">👨‍⚕️</button>
            <button class="emojibutton" title="woman health worker" onclick="addemoji('👩‍⚕️')">👩‍⚕️</button>
            <button class="emojibutton" title="man student" onclick="addemoji('👨‍🎓')">👨‍🎓</button>
            <button class="emojibutton" title="woman student" onclick="addemoji('👩‍🎓')">👩‍🎓</button>
            <button class="emojibutton" title="man teacher" onclick="addemoji('👨‍🏫')">👨‍🏫</button>
            <button class="emojibutton" title="woman teacher" onclick="addemoji('👩‍🏫')">👩‍🏫</button>
            <button class="emojibutton" title="man judge" onclick="addemoji('👨‍⚖️')">👨‍⚖️</button>
            <button class="emojibutton" title="woman judge" onclick="addemoji('👩‍⚖️')">👩‍⚖️</button>
            <button class="emojibutton" title="man farmer" onclick="addemoji('👨‍🌾')">👨‍🌾</button>
            <button class="emojibutton" title="woman farmer" onclick="addemoji('👩‍🌾')">👩‍🌾</button>
            <button class="emojibutton" title="man cook" onclick="addemoji('👨‍🍳')">👨‍🍳</button>
            <button class="emojibutton" title="woman cook" onclick="addemoji('👩‍🍳')">👩‍🍳</button>
            <button class="emojibutton" title="man mechanic" onclick="addemoji('👨‍🔧')">👨‍🔧</button>
            <button class="emojibutton" title="woman mechanic" onclick="addemoji('👩‍🔧')">👩‍🔧</button>
            <button class="emojibutton" title="man factory worker" onclick="addemoji('👨‍🏭')">👨‍🏭</button>
            <button class="emojibutton" title="woman factory worker" onclick="addemoji('👩‍🏭')">👩‍🏭</button>
            <button class="emojibutton" title="man office worker" onclick="addemoji('👨‍💼')">👨‍💼</button>
            <button class="emojibutton" title="woman office worker" onclick="addemoji('👩‍💼')">👩‍💼</button>
            <button class="emojibutton" title="man scientist" onclick="addemoji('👨‍🔬')">👨‍🔬</button>
            <button class="emojibutton" title="woman scientist" onclick="addemoji('👩‍🔬')">👩‍🔬</button>
            <button class="emojibutton" title="man technologist" onclick="addemoji('👨‍💻')">👨‍💻</button>
            <button class="emojibutton" title="woman technologist" onclick="addemoji('👩‍💻')">👩‍💻</button>
            <button class="emojibutton" title="man singer" onclick="addemoji('👨‍🎤')">👨‍🎤</button>
            <button class="emojibutton" title="woman singer" onclick="addemoji('👩‍🎤')">👩‍🎤</button>
            <button class="emojibutton" title="man artist" onclick="addemoji('👨‍🎨')">👨‍🎨</button>
            <button class="emojibutton" title="woman artist" onclick="addemoji('👩‍🎨')">👩‍🎨</button>
            <button class="emojibutton" title="man pilot" onclick="addemoji('👨‍✈️')">👨‍✈️</button>
            <button class="emojibutton" title="woman pilot" onclick="addemoji('👩‍✈️')">👩‍✈️</button>
            <button class="emojibutton" title="man astronaut" onclick="addemoji('👨‍🚀')">👨‍🚀</button>
            <button class="emojibutton" title="woman astronaut" onclick="addemoji('👩‍🚀')">👩‍🚀</button>
            <button class="emojibutton" title="man firefighter" onclick="addemoji('👨‍🚒')">👨‍🚒</button>
            <button class="emojibutton" title="woman firefighter" onclick="addemoji('👩‍🚒')">👩‍🚒</button>
            <button class="emojibutton" title="police officer" onclick="addemoji('👮')">👮</button>
            <button class="emojibutton" title="man police officer" onclick="addemoji('👮‍♂️')">👮‍♂️</button>
            <button class="emojibutton" title="woman police officer" onclick="addemoji('👮‍♀️')">👮‍♀️</button>
            <button class="emojibutton" title="detective" onclick="addemoji('🕵️')">🕵️</button>
            <button class="emojibutton" title="man detective" onclick="addemoji('🕵️‍♂️')">🕵️‍♂️</button>
            <button class="emojibutton" title="woman detective" onclick="addemoji('🕵️‍♀️')">🕵️‍♀️</button>
            <button class="emojibutton" title="guard" onclick="addemoji('💂')">💂</button>
            <button class="emojibutton" title="man guard" onclick="addemoji('💂‍♂️')">💂‍♂️</button>
            <button class="emojibutton" title="woman guard" onclick="addemoji('💂‍♀️')">💂‍♀️</button>
            <button class="emojibutton" title="construction worker" onclick="addemoji('👷')">👷</button>
            <button class="emojibutton" title="man construction worker" onclick="addemoji('👷‍♂️')">👷‍♂️</button>
            <button class="emojibutton" title="woman construction worker" onclick="addemoji('👷‍♀️')">👷‍♀️</button>
            <button class="emojibutton" title="person wearing turban" onclick="addemoji('👳')">👳</button>
            <button class="emojibutton" title="man wearing turban" onclick="addemoji('👳‍♂️')">👳‍♂️</button>
            <button class="emojibutton" title="woman wearing turban" onclick="addemoji('👳‍♀️')">👳‍♀️</button>
            <button class="emojibutton" title="blond-haired person" onclick="addemoji('👱')">👱</button>
            <button class="emojibutton" title="blond-haired man" onclick="addemoji('👱‍♂️')">👱‍♂️</button>
            <button class="emojibutton" title="blond-haired woman" onclick="addemoji('👱‍♀️')">👱‍♀️</button>
            <button class="emojibutton" title="Santa Claus" onclick="addemoji('🎅')">🎅</button>
            <button class="emojibutton" title="Mrs. Claus" onclick="addemoji('🤶')">🤶</button>
            <button class="emojibutton" title="princess" onclick="addemoji('👸')">👸</button>
            <button class="emojibutton" title="prince" onclick="addemoji('🤴')">🤴</button>
            <button class="emojibutton" title="bride with veil" onclick="addemoji('👰')">👰</button>
            <button class="emojibutton" title="man in tuxedo" onclick="addemoji('🤵')">🤵</button>
            <button class="emojibutton" title="pregnant woman" onclick="addemoji('🤰')">🤰</button>
            <button class="emojibutton" title="man with Chinese cap" onclick="addemoji('👲')">👲</button>
            <button class="emojibutton" title="person frowning" onclick="addemoji('🙍')">🙍</button>
            <button class="emojibutton" title="man frowning" onclick="addemoji('🙍‍♂️')">🙍‍♂️</button>
            <button class="emojibutton" title="woman frowning" onclick="addemoji('🙍‍♀️')">🙍‍♀️</button>
            <button class="emojibutton" title="person pouting" onclick="addemoji('🙎')">🙎</button>
            <button class="emojibutton" title="man pouting" onclick="addemoji('🙎‍♂️')">🙎‍♂️</button>
            <button class="emojibutton" title="woman pouting" onclick="addemoji('🙎‍♀️')">🙎‍♀️</button>
            <button class="emojibutton" title="person gesturing NO" onclick="addemoji('🙅')">🙅</button>
            <button class="emojibutton" title="man gesturing NO" onclick="addemoji('🙅‍♂️')">🙅‍♂️</button>
            <button class="emojibutton" title="woman gesturing NO" onclick="addemoji('🙅‍♀️')">🙅‍♀️</button>
            <button class="emojibutton" title="person gesturing OK" onclick="addemoji('🙆')">🙆</button>
            <button class="emojibutton" title="man gesturing OK" onclick="addemoji('🙆‍♂️')">🙆‍♂️</button>
            <button class="emojibutton" title="woman gesturing OK" onclick="addemoji('🙆‍♀️')">🙆‍♀️</button>
            <button class="emojibutton" title="person tipping hand" onclick="addemoji('💁')">💁</button>
            <button class="emojibutton" title="man tipping hand" onclick="addemoji('💁‍♂️')">💁‍♂️</button>
            <button class="emojibutton" title="woman tipping hand" onclick="addemoji('💁‍♀️')">💁‍♀️</button>
            <button class="emojibutton" title="person raising hand" onclick="addemoji('🙋')">🙋</button>
            <button class="emojibutton" title="man raising hand" onclick="addemoji('🙋‍♂️')">🙋‍♂️</button>
            <button class="emojibutton" title="woman raising hand" onclick="addemoji('🙋‍♀️')">🙋‍♀️</button>
            <button class="emojibutton" title="person bowing" onclick="addemoji('🙇')">🙇</button>
            <button class="emojibutton" title="man bowing" onclick="addemoji('🙇‍♂️')">🙇‍♂️</button>
            <button class="emojibutton" title="woman bowing" onclick="addemoji('🙇‍♀️')">🙇‍♀️</button>
            <button class="emojibutton" title="person facepalming" onclick="addemoji('🤦')">🤦</button>
            <button class="emojibutton" title="man facepalming" onclick="addemoji('🤦‍♂️')">🤦‍♂️</button>
            <button class="emojibutton" title="woman facepalming" onclick="addemoji('🤦‍♀️')">🤦‍♀️</button>
            <button class="emojibutton" title="person shrugging" onclick="addemoji('🤷')">🤷</button>
            <button class="emojibutton" title="man shrugging" onclick="addemoji('🤷‍♂️')">🤷‍♂️</button>
            <button class="emojibutton" title="woman shrugging" onclick="addemoji('🤷‍♀️')">🤷‍♀️</button>
            <button class="emojibutton" title="person getting massage" onclick="addemoji('💆')">💆</button>
            <button class="emojibutton" title="man getting massage" onclick="addemoji('💆‍♂️')">💆‍♂️</button>
            <button class="emojibutton" title="woman getting massage" onclick="addemoji('💆‍♀️')">💆‍♀️</button>
            <button class="emojibutton" title="person getting haircut" onclick="addemoji('💇')">💇</button>
            <button class="emojibutton" title="man getting haircut" onclick="addemoji('💇‍♂️')">💇‍♂️</button>
            <button class="emojibutton" title="woman getting haircut" onclick="addemoji('💇‍♀️')">💇‍♀️</button>
            <button class="emojibutton" title="deaf person" onclick="addemoji('🧏')">🧏</button>
            <button class="emojibutton" title="person walking" onclick="addemoji('🚶')">🚶</button>
            <button class="emojibutton" title="man walking" onclick="addemoji('🚶‍♂️')">🚶‍♂️</button>
            <button class="emojibutton" title="woman walking" onclick="addemoji('🚶‍♀️')">🚶‍♀️</button>
            <button class="emojibutton" title="person running" onclick="addemoji('🏃')">🏃</button>
            <button class="emojibutton" title="man running" onclick="addemoji('🏃‍♂️')">🏃‍♂️</button>
            <button class="emojibutton" title="woman running" onclick="addemoji('🏃‍♀️')">🏃‍♀️</button>
            <button class="emojibutton" title="woman dancing" onclick="addemoji('💃')">💃</button>
            <button class="emojibutton" title="man dancing" onclick="addemoji('🕺')">🕺</button>
            <button class="emojibutton" title="people with bunny ears partying" onclick="addemoji('👯')">👯</button>
            <button class="emojibutton" title="men with bunny ears partying" onclick="addemoji('👯‍♂️')">👯‍♂️</button>
            <button class="emojibutton" title="women with bunny ears partying" onclick="addemoji('👯‍♀️')">👯‍♀️</button>
            <button class="emojibutton" title="man in business suit levitating" onclick="addemoji('🕴️')">🕴️</button>
            <button class="emojibutton" title="speaking head" onclick="addemoji('🗣️')">🗣️</button>
            <button class="emojibutton" title="bust in silhouette" onclick="addemoji('👤')">👤</button>
            <button class="emojibutton" title="busts in silhouette" onclick="addemoji('👥')">👥</button>
            <button class="emojibutton" title="person fencing" onclick="addemoji('🤺')">🤺</button>
            <button class="emojibutton" title="horse racing" onclick="addemoji('🏇')">🏇</button>
            <button class="emojibutton" title="skier" onclick="addemoji('⛷️')">⛷️</button>
            <button class="emojibutton" title="snowboarder" onclick="addemoji('🏂')">🏂</button>
            <button class="emojibutton" title="person golfing" onclick="addemoji('🏌️')">🏌️</button>
            <button class="emojibutton" title="man golfing" onclick="addemoji('🏌️‍♂️')">🏌️‍♂️</button>
            <button class="emojibutton" title="woman golfing" onclick="addemoji('🏌️‍♀️')">🏌️‍♀️</button>
            <button class="emojibutton" title="person surfing" onclick="addemoji('🏄')">🏄</button>
            <button class="emojibutton" title="man surfing" onclick="addemoji('🏄‍♂️')">🏄‍♂️</button>
            <button class="emojibutton" title="woman surfing" onclick="addemoji('🏄‍♀️')">🏄‍♀️</button>
            <button class="emojibutton" title="person rowing boat" onclick="addemoji('🚣')">🚣</button>
            <button class="emojibutton" title="man rowing boat" onclick="addemoji('🚣‍♂️')">🚣‍♂️</button>
            <button class="emojibutton" title="woman rowing boat" onclick="addemoji('🚣‍♀️')">🚣‍♀️</button>
            <button class="emojibutton" title="person swimming" onclick="addemoji('🏊')">🏊</button>
            <button class="emojibutton" title="man swimming" onclick="addemoji('🏊‍♂️')">🏊‍♂️</button>
            <button class="emojibutton" title="woman swimming" onclick="addemoji('🏊‍♀️')">🏊‍♀️</button>
            <button class="emojibutton" title="person bouncing ball" onclick="addemoji('⛹️')">⛹️</button>
            <button class="emojibutton" title="man bouncing ball" onclick="addemoji('⛹️‍♂️')">⛹️‍♂️</button>
            <button class="emojibutton" title="woman bouncing ball" onclick="addemoji('⛹️‍♀️')">⛹️‍♀️</button>
            <button class="emojibutton" title="person lifting weights" onclick="addemoji('🏋️')">🏋️</button>
            <button class="emojibutton" title="man lifting weights" onclick="addemoji('🏋️‍♂️')">🏋️‍♂️</button>
            <button class="emojibutton" title="woman lifting weights" onclick="addemoji('🏋️‍♀️')">🏋️‍♀️</button>
            <button class="emojibutton" title="person biking" onclick="addemoji('🚴')">🚴</button>
            <button class="emojibutton" title="man biking" onclick="addemoji('🚴‍♂️')">🚴‍♂️</button>
            <button class="emojibutton" title="woman biking" onclick="addemoji('🚴‍♀️')">🚴‍♀️</button>
            <button class="emojibutton" title="person mountain biking" onclick="addemoji('🚵')">🚵</button>
            <button class="emojibutton" title="man mountain biking" onclick="addemoji('🚵‍♂️')">🚵‍♂️</button>
            <button class="emojibutton" title="woman mountain biking" onclick="addemoji('🚵‍♀️')">🚵‍♀️</button>
            <button class="emojibutton" title="racing car" onclick="addemoji('🏎️')">🏎️</button>
            <button class="emojibutton" title="motorcycle" onclick="addemoji('🏍️')">🏍️</button>
            <button class="emojibutton" title="person cartwheeling" onclick="addemoji('🤸')">🤸</button>
            <button class="emojibutton" title="man cartwheeling" onclick="addemoji('🤸‍♂️')">🤸‍♂️</button>
            <button class="emojibutton" title="woman cartwheeling" onclick="addemoji('🤸‍♀️')">🤸‍♀️</button>
            <button class="emojibutton" title="people wrestling" onclick="addemoji('🤼')">🤼</button>
            <button class="emojibutton" title="men wrestling" onclick="addemoji('🤼‍♂️')">🤼‍♂️</button>
            <button class="emojibutton" title="women wrestling" onclick="addemoji('🤼‍♀️')">🤼‍♀️</button>
            <button class="emojibutton" title="person playing water polo" onclick="addemoji('🤽')">🤽</button>
            <button class="emojibutton" title="man playing water polo" onclick="addemoji('🤽‍♂️')">🤽‍♂️</button>
            <button class="emojibutton" title="woman playing water polo" onclick="addemoji('🤽‍♀️')">🤽‍♀️</button>
            <button class="emojibutton" title="person playing handball" onclick="addemoji('🤾')">🤾</button>
            <button class="emojibutton" title="man playing handball" onclick="addemoji('🤾‍♂️')">🤾‍♂️</button>
            <button class="emojibutton" title="woman playing handball" onclick="addemoji('🤾‍♀️')">🤾‍♀️</button>
            <button class="emojibutton" title="person juggling" onclick="addemoji('🤹')">🤹</button>
            <button class="emojibutton" title="man juggling" onclick="addemoji('🤹‍♂️')">🤹‍♂️</button>
            <button class="emojibutton" title="woman juggling" onclick="addemoji('🤹‍♀️')">🤹‍♀️</button>
            <button class="emojibutton" title="man and woman holding hands" onclick="addemoji('👫')">👫</button>
            <button class="emojibutton" title="two men holding hands" onclick="addemoji('👬')">👬</button>
            <button class="emojibutton" title="two women holding hands" onclick="addemoji('👭')">👭</button>
            <button class="emojibutton" title="kiss" onclick="addemoji('💏')">💏</button>
            <button class="emojibutton" title="couple with heart" onclick="addemoji('💑')">💑</button>
            <button class="emojibutton" title="family" onclick="addemoji('👪')">👪</button>
            <button class="emojibutton" title="flexed biceps" onclick="addemoji('💪')">💪</button>
            <button class="emojibutton" title="selfie" onclick="addemoji('🤳')">🤳</button>
            <button class="emojibutton" title="backhand index pointing at screen" onclick="addemoji('🫵')">🫵</button>
            <button class="emojibutton" title="backhand index pointing left" onclick="addemoji('👈')">👈</button>
            <button class="emojibutton" title="backhand index pointing right" onclick="addemoji('👉')">👉</button>
            <button class="emojibutton" title="index pointing up" onclick="addemoji('☝️')">☝️</button>
            <button class="emojibutton" title="backhand index pointing up" onclick="addemoji('👆')">👆</button>
            <button class="emojibutton" title="middle finger" onclick="addemoji('🖕')">🖕</button>
            <button class="emojibutton" title="backhand index pointing down" onclick="addemoji('👇')">👇</button>
            <button class="emojibutton" title="victory hand" onclick="addemoji('✌️')">✌️</button>
            <button class="emojibutton" title="crossed fingers" onclick="addemoji('🤞')">🤞</button>
            <button class="emojibutton" title="vulcan salute" onclick="addemoji('🖖')">🖖</button>
            <button class="emojibutton" title="sign of the horns" onclick="addemoji('🤘')">🤘</button>
            <button class="emojibutton" title="call me hand" onclick="addemoji('🤙')">🤙</button>
            <button class="emojibutton" title="raised hand with fingers splayed" onclick="addemoji('🖐️')">🖐️</button>
            <button class="emojibutton" title="raised hand" onclick="addemoji('✋')">✋</button>
            <button class="emojibutton" title="OK hand" onclick="addemoji('👌')">👌</button>
            <button class="emojibutton" title="thumbs up" onclick="addemoji('👍')">👍</button>
            <button class="emojibutton" title="thumbs down" onclick="addemoji('👎')">👎</button>
            <button class="emojibutton" title="raised fist" onclick="addemoji('✊')">✊</button>
            <button class="emojibutton" title="oncoming fist" onclick="addemoji('👊')">👊</button>
            <button class="emojibutton" title="left-facing fist" onclick="addemoji('🤛')">🤛</button>
            <button class="emojibutton" title="right-facing fist" onclick="addemoji('🤜')">🤜</button>
            <button class="emojibutton" title="raised back of hand" onclick="addemoji('🤚')">🤚</button>
            <button class="emojibutton" title="waving hand" onclick="addemoji('👋')">👋</button>
            <button class="emojibutton" title="clapping hands" onclick="addemoji('👏')">👏</button>
            <button class="emojibutton" title="writing hand" onclick="addemoji('✍️')">✍️</button>
            <button class="emojibutton" title="open hands" onclick="addemoji('👐')">👐</button>
            <button class="emojibutton" title="raising hands" onclick="addemoji('🙌')">🙌</button>
            <button class="emojibutton" title="folded hands, pray" onclick="addemoji('🙏')">🙏</button>
            <button class="emojibutton" title="handshake" onclick="addemoji('🤝')">🤝</button>
            <button class="emojibutton" title="nail polish" onclick="addemoji('💅')">💅</button>
            <button class="emojibutton" title="ear" onclick="addemoji('👂')">👂</button>
            <button class="emojibutton" title="nose" onclick="addemoji('👃')">👃</button>
            <button class="emojibutton" title="footprints" onclick="addemoji('👣')">👣</button>
            <button class="emojibutton" title="eyes" onclick="addemoji('👀')">👀</button>
            <button class="emojibutton" title="eye" onclick="addemoji('👁️')">👁️</button>
            <button class="emojibutton" title="eye in speech bubble" onclick="addemoji('👁️‍🗨️')">👁️‍🗨️</button>
            <button class="emojibutton" title="tongue" onclick="addemoji('👅')">👅</button>
            <button class="emojibutton" title="mouth" onclick="addemoji('👄')">👄</button>
            <button class="emojibutton" title="kiss mark" onclick="addemoji('💋')">💋</button>
            <button class="emojibutton" title="glasses" onclick="addemoji('👓')">👓</button>
            <button class="emojibutton" title="sunglasses" onclick="addemoji('🕶️')">🕶️</button>
            <button class="emojibutton" title="necktie" onclick="addemoji('👔')">👔</button>
            <button class="emojibutton" title="t-shirt" onclick="addemoji('👕')">👕</button>
            <button class="emojibutton" title="jeans" onclick="addemoji('👖')">👖</button>
            <button class="emojibutton" title="dress" onclick="addemoji('👗')">👗</button>
            <button class="emojibutton" title="kimono" onclick="addemoji('👘')">👘</button>
            <button class="emojibutton" title="bikini" onclick="addemoji('👙')">👙</button>
            <button class="emojibutton" title="woman's clothes" onclick="addemoji('👚')">👚</button>
            <button class="emojibutton" title="purse" onclick="addemoji('👛')">👛</button>
            <button class="emojibutton" title="handbag" onclick="addemoji('👜')">👜</button>
            <button class="emojibutton" title="clutch bag" onclick="addemoji('👝')">👝</button>
            <button class="emojibutton" title="shopping bags" onclick="addemoji('🛍️')">🛍️</button>
            <button class="emojibutton" title="school backpack" onclick="addemoji('🎒')">🎒</button>
            <button class="emojibutton" title="man's shoe" onclick="addemoji('👞')">👞</button>
            <button class="emojibutton" title="running shoe" onclick="addemoji('👟')">👟</button>
            <button class="emojibutton" title="high-heeled shoe" onclick="addemoji('👠')">👠</button>
            <button class="emojibutton" title="woman's sandal" onclick="addemoji('👡')">👡</button>
            <button class="emojibutton" title="woman's boot" onclick="addemoji('👢')">👢</button>
            <button class="emojibutton" title="crown" onclick="addemoji('👑')">👑</button>
            <button class="emojibutton" title="woman's hat" onclick="addemoji('👒')">👒</button>
            <button class="emojibutton" title="top hat" onclick="addemoji('🎩')">🎩</button>
            <button class="emojibutton" title="graduation cap" onclick="addemoji('🎓')">🎓</button>
            <button class="emojibutton" title="rescue worker's helmet" onclick="addemoji('⛑️')">⛑️</button>
            <button class="emojibutton" title="prayer beads" onclick="addemoji('📿')">📿</button>
            <button class="emojibutton" title="lipstick" onclick="addemoji('💄')">💄</button>
            <button class="emojibutton" title="ring" onclick="addemoji('💍')">💍</button>
            <button class="emojibutton" title="gem stone" onclick="addemoji('💎')">💎</button>
        </div>
        <div class="emojisec" id="animals">
            <div class="emojiheader">
                <h3>Animals & Nature</h3>
            </div>
            <button class="emojibutton" title="monkey face" onclick="addemoji('🐵')">🐵</button>
            <button class="emojibutton" title="monkey" onclick="addemoji('🐒')">🐒</button>
            <button class="emojibutton" title="gorilla" onclick="addemoji('🦍')">🦍</button>
            <button class="emojibutton" title="dog face" onclick="addemoji('🐶')">🐶</button>
            <button class="emojibutton" title="dog" onclick="addemoji('🐕')">🐕</button>
            <button class="emojibutton" title="poodle" onclick="addemoji('🐩')">🐩</button>
            <button class="emojibutton" title="wolf face" onclick="addemoji('🐺')">🐺</button>
            <button class="emojibutton" title="fox face" onclick="addemoji('🦊')">🦊</button>
            <button class="emojibutton" title="cat face" onclick="addemoji('🐱')">🐱</button>
            <button class="emojibutton" title="cat" onclick="addemoji('🐈')">🐈</button>
            <button class="emojibutton" title="lion face" onclick="addemoji('🦁')">🦁</button>
            <button class="emojibutton" title="tiger face" onclick="addemoji('🐯')">🐯</button>
            <button class="emojibutton" title="tiger" onclick="addemoji('🐅')">🐅</button>
            <button class="emojibutton" title="leopard" onclick="addemoji('🐆')">🐆</button>
            <button class="emojibutton" title="horse face" onclick="addemoji('🐴')">🐴</button>
            <button class="emojibutton" title="horse" onclick="addemoji('🐎')">🐎</button>
            <button class="emojibutton" title="deer" onclick="addemoji('🦌')">🦌</button>
            <button class="emojibutton" title="unicorn face" onclick="addemoji('🦄')">🦄</button>
            <button class="emojibutton" title="cow face" onclick="addemoji('🐮')">🐮</button>
            <button class="emojibutton" title="ox" onclick="addemoji('🐂')">🐂</button>
            <button class="emojibutton" title="water buffalo" onclick="addemoji('🐃')">🐃</button>
            <button class="emojibutton" title="cow" onclick="addemoji('🐄')">🐄</button>
            <button class="emojibutton" title="pig face" onclick="addemoji('🐷')">🐷</button>
            <button class="emojibutton" title="pig" onclick="addemoji('🐖')">🐖</button>
            <button class="emojibutton" title="boar" onclick="addemoji('🐗')">🐗</button>
            <button class="emojibutton" title="pig nose" onclick="addemoji('🐽')">🐽</button>
            <button class="emojibutton" title="ram" onclick="addemoji('🐏')">🐏</button>
            <button class="emojibutton" title="sheep" onclick="addemoji('🐑')">🐑</button>
            <button class="emojibutton" title="goat" onclick="addemoji('🐐')">🐐</button>
            <button class="emojibutton" title="camel" onclick="addemoji('🐪')">🐪</button>
            <button class="emojibutton" title="two-hump camel" onclick="addemoji('🐫')">🐫</button>
            <button class="emojibutton" title="elephant" onclick="addemoji('🐘')">🐘</button>
            <button class="emojibutton" title="rhinoceros" onclick="addemoji('🦏')">🦏</button>
            <button class="emojibutton" title="mouse face" onclick="addemoji('🐭')">🐭</button>
            <button class="emojibutton" title="mouse" onclick="addemoji('🐁')">🐁</button>
            <button class="emojibutton" title="rat" onclick="addemoji('🐀')">🐀</button>
            <button class="emojibutton" title="hamster face" onclick="addemoji('🐹')">🐹</button>
            <button class="emojibutton" title="rabbit face" onclick="addemoji('🐰')">🐰</button>
            <button class="emojibutton" title="rabbit" onclick="addemoji('🐇')">🐇</button>
            <button class="emojibutton" title="chipmunk" onclick="addemoji('🐿️')">🐿️</button>
            <button class="emojibutton" title="bat" onclick="addemoji('🦇')">🦇</button>
            <button class="emojibutton" title="bear face" onclick="addemoji('🐻')">🐻</button>
            <button class="emojibutton" title="koala" onclick="addemoji('🐨')">🐨</button>
            <button class="emojibutton" title="panda face" onclick="addemoji('🐼')">🐼</button>
            <button class="emojibutton" title="paw prints" onclick="addemoji('🐾')">🐾</button>
            <button class="emojibutton" title="turkey" onclick="addemoji('🦃')">🦃</button>
            <button class="emojibutton" title="chicken" onclick="addemoji('🐔')">🐔</button>
            <button class="emojibutton" title="rooster" onclick="addemoji('🐓')">🐓</button>
            <button class="emojibutton" title="hatching chick" onclick="addemoji('🐣')">🐣</button>
            <button class="emojibutton" title="baby chick" onclick="addemoji('🐤')">🐤</button>
            <button class="emojibutton" title="front-facing baby chick" onclick="addemoji('🐥')">🐥</button>
            <button class="emojibutton" title="bird" onclick="addemoji('🐦')">🐦</button>
            <button class="emojibutton" title="penguin" onclick="addemoji('🐧')">🐧</button>
            <button class="emojibutton" title="dove" onclick="addemoji('🕊️')">🕊️</button>
            <button class="emojibutton" title="eagle" onclick="addemoji('🦅')">🦅</button>
            <button class="emojibutton" title="duck" onclick="addemoji('🦆')">🦆</button>
            <button class="emojibutton" title="owl" onclick="addemoji('🦉')">🦉</button>
            <button class="emojibutton" title="frog face" onclick="addemoji('🐸')">🐸</button>
            <button class="emojibutton" title="crocodile" onclick="addemoji('🐊')">🐊</button>
            <button class="emojibutton" title="turtle" onclick="addemoji('🐢')">🐢</button>
            <button class="emojibutton" title="lizard" onclick="addemoji('🦎')">🦎</button>
            <button class="emojibutton" title="snake" onclick="addemoji('🐍')">🐍</button>
            <button class="emojibutton" title="dragon face" onclick="addemoji('🐲')">🐲</button>
            <button class="emojibutton" title="dragon" onclick="addemoji('🐉')">🐉</button>
            <button class="emojibutton" title="spouting whale" onclick="addemoji('🐳')">🐳</button>
            <button class="emojibutton" title="whale" onclick="addemoji('🐋')">🐋</button>
            <button class="emojibutton" title="dolphin" onclick="addemoji('🐬')">🐬</button>
            <button class="emojibutton" title="fish" onclick="addemoji('🐟')">🐟</button>
            <button class="emojibutton" title="tropical fish" onclick="addemoji('🐠')">🐠</button>
            <button class="emojibutton" title="blowfish" onclick="addemoji('🐡')">🐡</button>
            <button class="emojibutton" title="shark" onclick="addemoji('🦈')">🦈</button>
            <button class="emojibutton" title="octopus" onclick="addemoji('🐙')">🐙</button>
            <button class="emojibutton" title="spiral shell" onclick="addemoji('🐚')">🐚</button>
            <button class="emojibutton" title="crab" onclick="addemoji('🦀')">🦀</button>
            <button class="emojibutton" title="shrimp" onclick="addemoji('🦐')">🦐</button>
            <button class="emojibutton" title="squid" onclick="addemoji('🦑')">🦑</button>
            <button class="emojibutton" title="butterfly" onclick="addemoji('🦋')">🦋</button>
            <button class="emojibutton" title="snail" onclick="addemoji('🐌')">🐌</button>
            <button class="emojibutton" title="bug" onclick="addemoji('🐛')">🐛</button>
            <button class="emojibutton" title="ant" onclick="addemoji('🐜')">🐜</button>
            <button class="emojibutton" title="honeybee" onclick="addemoji('🐝')">🐝</button>
            <button class="emojibutton" title="lady beetle" onclick="addemoji('🐞')">🐞</button>
            <button class="emojibutton" title="spider" onclick="addemoji('🕷️')">🕷️</button>
            <button class="emojibutton" title="spider web" onclick="addemoji('🕸️')">🕸️</button>
            <button class="emojibutton" title="scorpion" onclick="addemoji('🦂')">🦂</button>
            <button class="emojibutton" title="bouquet" onclick="addemoji('💐')">💐</button>
            <button class="emojibutton" title="cherry blossom" onclick="addemoji('🌸')">🌸</button>
            <button class="emojibutton" title="white flower" onclick="addemoji('💮')">💮</button>
            <button class="emojibutton" title="rosette" onclick="addemoji('🏵️')">🏵️</button>
            <button class="emojibutton" title="rose" onclick="addemoji('🌹')">🌹</button>
            <button class="emojibutton" title="wilted flower" onclick="addemoji('🥀')">🥀</button>
            <button class="emojibutton" title="hibiscus" onclick="addemoji('🌺')">🌺</button>
            <button class="emojibutton" title="sunflower" onclick="addemoji('🌻')">🌻</button>
            <button class="emojibutton" title="blossom" onclick="addemoji('🌼')">🌼</button>
            <button class="emojibutton" title="tulip" onclick="addemoji('🌷')">🌷</button>
            <button class="emojibutton" title="seedling" onclick="addemoji('🌱')">🌱</button>
            <button class="emojibutton" title="evergreen tree" onclick="addemoji('🌲')">🌲</button>
            <button class="emojibutton" title="deciduous tree" onclick="addemoji('🌳')">🌳</button>
            <button class="emojibutton" title="palm tree" onclick="addemoji('🌴')">🌴</button>
            <button class="emojibutton" title="cactus" onclick="addemoji('🌵')">🌵</button>
            <button class="emojibutton" title="sheaf of rice" onclick="addemoji('🌾')">🌾</button>
            <button class="emojibutton" title="herb" onclick="addemoji('🌿')">🌿</button>
            <button class="emojibutton" title="shamrock" onclick="addemoji('☘️')">☘️</button>
            <button class="emojibutton" title="four leaf clover" onclick="addemoji('🍀')">🍀</button>
            <button class="emojibutton" title="maple leaf" onclick="addemoji('🍁')">🍁</button>
            <button class="emojibutton" title="fallen leaf" onclick="addemoji('🍂')">🍂</button>
            <button class="emojibutton" title="leaf fluttering in wind" onclick="addemoji('🍃')">🍃</button>
            <button class="emojibutton" title="new moon" onclick="addemoji('🌑')">🌑</button>
            <button class="emojibutton" title="waxing crescent moon" onclick="addemoji('🌒')">🌒</button>
            <button class="emojibutton" title="first quarter moon" onclick="addemoji('🌓')">🌓</button>
            <button class="emojibutton" title="waxing gibbous moon" onclick="addemoji('🌔')">🌔</button>
            <button class="emojibutton" title="full moon" onclick="addemoji('🌕')">🌕</button>
            <button class="emojibutton" title="waning gibbous moon" onclick="addemoji('🌖')">🌖</button>
            <button class="emojibutton" title="last quarter moon" onclick="addemoji('🌗')">🌗</button>
            <button class="emojibutton" title="waning crescent moon" onclick="addemoji('🌘')">🌘</button>
            <button class="emojibutton" title="crescent moon" onclick="addemoji('🌙')">🌙</button>
            <button class="emojibutton" title="new moon face" onclick="addemoji('🌚')">🌚</button>
            <button class="emojibutton" title="first quarter moon with face" onclick="addemoji('🌛')">🌛</button>
            <button class="emojibutton" title="last quarter moon with face" onclick="addemoji('🌜')">🌜</button>
            <button class="emojibutton" title="full moon with face" onclick="addemoji('🌝')">🌝</button>
            <button class="emojibutton" title="thermometer" onclick="addemoji('🌡️')">🌡️</button>
            <button class="emojibutton" title="sun" onclick="addemoji('☀️')">☀️</button>
            <button class="emojibutton" title="sun with face" onclick="addemoji('🌞')">🌞</button>
            <button class="emojibutton" title="white medium star" onclick="addemoji('⭐')">⭐</button>
            <button class="emojibutton" title="planet" onclick="addemoji('🪐')">🪐</button>
            <button class="emojibutton" title="glowing star" onclick="addemoji('🌟')">🌟</button>
            <button class="emojibutton" title="shooting star" onclick="addemoji('🌠')">🌠</button>
            <button class="emojibutton" title="cloud" onclick="addemoji('☁️')">☁️</button>
            <button class="emojibutton" title="sun behind cloud" onclick="addemoji('⛅')">⛅</button>
            <button class="emojibutton" title="cloud with lightning and rain" onclick="addemoji('⛈️')">⛈️</button>
            <button class="emojibutton" title="sun behind small cloud" onclick="addemoji('🌤️')">🌤️</button>
            <button class="emojibutton" title="sun behind large cloud" onclick="addemoji('🌥️')">🌥️</button>
            <button class="emojibutton" title="sun behind rain cloud" onclick="addemoji('🌦️')">🌦️</button>
            <button class="emojibutton" title="cloud with rain" onclick="addemoji('🌧️')">🌧️</button>
            <button class="emojibutton" title="cloud with snow" onclick="addemoji('🌨️')">🌨️</button>
            <button class="emojibutton" title="cloud with lightning" onclick="addemoji('🌩️')">🌩️</button>
            <button class="emojibutton" title="tornado" onclick="addemoji('🌪️')">🌪️</button>
            <button class="emojibutton" title="fog" onclick="addemoji('🌫️')">🌫️</button>
            <button class="emojibutton" title="wind face" onclick="addemoji('🌬️')">🌬️</button>
            <button class="emojibutton" title="cyclone" onclick="addemoji('🌀')">🌀</button>
            <button class="emojibutton" title="rainbow" onclick="addemoji('🌈')">🌈</button>
            <button class="emojibutton" title="closed umbrella" onclick="addemoji('🌂')">🌂</button>
            <button class="emojibutton" title="umbrella" onclick="addemoji('☂️')">☂️</button>
            <button class="emojibutton" title="umbrella with rain drops" onclick="addemoji('☔')">☔</button>
            <button class="emojibutton" title="umbrella on ground" onclick="addemoji('⛱️')">⛱️</button>
            <button class="emojibutton" title="high voltage" onclick="addemoji('⚡')">⚡</button>
            <button class="emojibutton" title="snowflake" onclick="addemoji('❄️')">❄️</button>
            <button class="emojibutton" title="snowman" onclick="addemoji('☃️')">☃️</button>
            <button class="emojibutton" title="snowman without snow" onclick="addemoji('⛄')">⛄</button>
            <button class="emojibutton" title="comet" onclick="addemoji('☄️')">☄️</button>
            <button class="emojibutton" title="fire" onclick="addemoji('🔥')">🔥</button>
            <button class="emojibutton" title="droplet" onclick="addemoji('💧')">💧</button>
            <button class="emojibutton" title="water wave" onclick="addemoji('🌊')">🌊</button>
            <button class="emojibutton" title="sweat droplets" onclick="addemoji('💦')">💦</button>
            <button class="emojibutton" title="dashing away" onclick="addemoji('💨')">💨</button>
            <button class="emojibutton" title="dizzy" onclick="addemoji('💫')">💫</button>           
        </div>
        <div class="emojisec" id="food">
            <div class="emojiheader">
                <h3>Food & Drink</h3>
            </div>
            <button class="emojibutton" title="grapes" onclick="addemoji('🍇')">🍇</button>
            <button class="emojibutton" title="melon" onclick="addemoji('🍈')">🍈</button>
            <button class="emojibutton" title="watermelon" onclick="addemoji('🍉')">🍉</button>
            <button class="emojibutton" title="tangerine, orange" onclick="addemoji('🍊')">🍊</button>
            <button class="emojibutton" title="lemon" onclick="addemoji('🍋')">🍋</button>
            <button class="emojibutton" title="banana" onclick="addemoji('🍌')">🍌</button>
            <button class="emojibutton" title="pineapple" onclick="addemoji('🍍')">🍍</button>
            <button class="emojibutton" title="red apple" onclick="addemoji('🍎')">🍎</button>
            <button class="emojibutton" title="green apple" onclick="addemoji('🍏')">🍏</button>
            <button class="emojibutton" title="pear" onclick="addemoji('🍐')">🍐</button>
            <button class="emojibutton" title="peach" onclick="addemoji('🍑')">🍑</button>
            <button class="emojibutton" title="cherries" onclick="addemoji('🍒')">🍒</button>
            <button class="emojibutton" title="strawberry" onclick="addemoji('🍓')">🍓</button>
            <button class="emojibutton" title="kiwi fruit" onclick="addemoji('🥝')">🥝</button>
            <button class="emojibutton" title="tomato" onclick="addemoji('🍅')">🍅</button>
            <button class="emojibutton" title="avocado" onclick="addemoji('🥑')">🥑</button>
            <button class="emojibutton" title="eggplant" onclick="addemoji('🍆')">🍆</button>
            <button class="emojibutton" title="potato" onclick="addemoji('🥔')">🥔</button>
            <button class="emojibutton" title="carrot" onclick="addemoji('🥕')">🥕</button>
            <button class="emojibutton" title="ear of corn" onclick="addemoji('🌽')">🌽</button>
            <button class="emojibutton" title="hot pepper" onclick="addemoji('🌶️')">🌶️</button>
            <button class="emojibutton" title="cucumber" onclick="addemoji('🥒')">🥒</button>
            <button class="emojibutton" title="mushroom" onclick="addemoji('🍄')">🍄</button>
            <button class="emojibutton" title="peanuts" onclick="addemoji('🥜')">🥜</button>
            <button class="emojibutton" title="chestnut" onclick="addemoji('🌰')">🌰</button>
            <button class="emojibutton" title="bread" onclick="addemoji('🍞')">🍞</button>
            <button class="emojibutton" title="croissant" onclick="addemoji('🥐')">🥐</button>
            <button class="emojibutton" title="baguette bread" onclick="addemoji('🥖')">🥖</button>
            <button class="emojibutton" title="pancakes" onclick="addemoji('🥞')">🥞</button>
            <button class="emojibutton" title="cheese wedge" onclick="addemoji('🧀')">🧀</button>
            <button class="emojibutton" title="meat on bone" onclick="addemoji('🍖')">🍖</button>
            <button class="emojibutton" title="poultry leg" onclick="addemoji('🍗')">🍗</button>
            <button class="emojibutton" title="bacon" onclick="addemoji('🥓')">🥓</button>
            <button class="emojibutton" title="hamburger" onclick="addemoji('🍔')">🍔</button>
            <button class="emojibutton" title="french fries" onclick="addemoji('🍟')">🍟</button>
            <button class="emojibutton" title="pizza" onclick="addemoji('🍕')">🍕</button>
            <button class="emojibutton" title="hot dog" onclick="addemoji('🌭')">🌭</button>
            <button class="emojibutton" title="taco" onclick="addemoji('🌮')">🌮</button>
            <button class="emojibutton" title="burrito" onclick="addemoji('🌯')">🌯</button>
            <button class="emojibutton" title="stuffed flatbread" onclick="addemoji('🥙')">🥙</button>
            <button class="emojibutton" title="egg" onclick="addemoji('🥚')">🥚</button>
            <button class="emojibutton" title="cooking" onclick="addemoji('🍳')">🍳</button>
            <button class="emojibutton" title="shallow pan of food" onclick="addemoji('🥘')">🥘</button>
            <button class="emojibutton" title="pot of food" onclick="addemoji('🍲')">🍲</button>
            <button class="emojibutton" title="green salad" onclick="addemoji('🥗')">🥗</button>
            <button class="emojibutton" title="popcorn" onclick="addemoji('🍿')">🍿</button>
            <button class="emojibutton" title="bento box" onclick="addemoji('🍱')">🍱</button>
            <button class="emojibutton" title="rice cracker" onclick="addemoji('🍘')">🍘</button>
            <button class="emojibutton" title="rice ball" onclick="addemoji('🍙')">🍙</button>
            <button class="emojibutton" title="cooked rice" onclick="addemoji('🍚')">🍚</button>
            <button class="emojibutton" title="curry rice" onclick="addemoji('🍛')">🍛</button>
            <button class="emojibutton" title="steaming bowl" onclick="addemoji('🍜')">🍜</button>
            <button class="emojibutton" title="spaghetti" onclick="addemoji('🍝')">🍝</button>
            <button class="emojibutton" title="roasted sweet potato" onclick="addemoji('🍠')">🍠</button>
            <button class="emojibutton" title="oden" onclick="addemoji('🍢')">🍢</button>
            <button class="emojibutton" title="sushi" onclick="addemoji('🍣')">🍣</button>
            <button class="emojibutton" title="fried shrimp" onclick="addemoji('🍤')">🍤</button>
            <button class="emojibutton" title="fish cake with swirl" onclick="addemoji('🍥')">🍥</button>
            <button class="emojibutton" title="dango" onclick="addemoji('🍡')">🍡</button>
            <button class="emojibutton" title="soft ice cream" onclick="addemoji('🍦')">🍦</button>
            <button class="emojibutton" title="shaved ice" onclick="addemoji('🍧')">🍧</button>
            <button class="emojibutton" title="ice cream" onclick="addemoji('🍨')">🍨</button>
            <button class="emojibutton" title="doughnut" onclick="addemoji('🍩')">🍩</button>
            <button class="emojibutton" title="cookie" onclick="addemoji('🍪')">🍪</button>
            <button class="emojibutton" title="birthday cake" onclick="addemoji('🎂')">🎂</button>
            <button class="emojibutton" title="shortcake" onclick="addemoji('🍰')">🍰</button>
            <button class="emojibutton" title="chocolate bar" onclick="addemoji('🍫')">🍫</button>
            <button class="emojibutton" title="candy" onclick="addemoji('🍬')">🍬</button>
            <button class="emojibutton" title="lollipop" onclick="addemoji('🍭')">🍭</button>
            <button class="emojibutton" title="custard" onclick="addemoji('🍮')">🍮</button>
            <button class="emojibutton" title="honey pot" onclick="addemoji('🍯')">🍯</button>
            <button class="emojibutton" title="baby bottle" onclick="addemoji('🍼')">🍼</button>
            <button class="emojibutton" title="glass of milk" onclick="addemoji('🥛')">🥛</button>
            <button class="emojibutton" title="hot beverage" onclick="addemoji('☕')">☕</button>
            <button class="emojibutton" title="teacup without handle" onclick="addemoji('🍵')">🍵</button>
            <button class="emojibutton" title="sake" onclick="addemoji('🍶')">🍶</button>
            <button class="emojibutton" title="bottle with popping cork" onclick="addemoji('🍾')">🍾</button>
            <button class="emojibutton" title="wine glass" onclick="addemoji('🍷')">🍷</button>
            <button class="emojibutton" title="cocktail glass" onclick="addemoji('🍸')">🍸</button>
            <button class="emojibutton" title="tropical drink" onclick="addemoji('🍹')">🍹</button>
            <button class="emojibutton" title="beer mug" onclick="addemoji('🍺')">🍺</button>
            <button class="emojibutton" title="clinking beer mugs" onclick="addemoji('🍻')">🍻</button>
            <button class="emojibutton" title="clinking glasses" onclick="addemoji('🥂')">🥂</button>
            <button class="emojibutton" title="tumbler glass" onclick="addemoji('🥃')">🥃</button>
            <button class="emojibutton" title="fork and knife with plate" onclick="addemoji('🍽️')">🍽️</button>
            <button class="emojibutton" title="fork and knife" onclick="addemoji('🍴')">🍴</button>
            <button class="emojibutton" title="spoon" onclick="addemoji('🥄')">🥄</button>
            <button class="emojibutton" title="kitchen knife" onclick="addemoji('🔪')">🔪</button>
            <button class="emojibutton" title="amphora" onclick="addemoji('🏺')">🏺</button>
        </div>
        <div class="emojisec" id="travel">
            <div class="emojiheader">
                <h3>Travel</h3>
            </div>
            <button class="emojibutton" title="globe showing Europe-Africa" onclick="addemoji('🌍')">🌍</button>
            <button class="emojibutton" title="globe showing Americas" onclick="addemoji('🌎')">🌎</button>
            <button class="emojibutton" title="globe showing Asia-Australia" onclick="addemoji('🌏')">🌏</button>
            <button class="emojibutton" title="globe with meridians" onclick="addemoji('🌐')">🌐</button>
            <button class="emojibutton" title="world map" onclick="addemoji('🗺️')">🗺️</button>
            <button class="emojibutton" title="map of Japan" onclick="addemoji('🗾')">🗾</button>
            <button class="emojibutton" title="snow-capped mountain" onclick="addemoji('🏔️')">🏔️</button>
            <button class="emojibutton" title="mountain" onclick="addemoji('⛰️')">⛰️</button>
            <button class="emojibutton" title="volcano" onclick="addemoji('🌋')">🌋</button>
            <button class="emojibutton" title="mount fuji" onclick="addemoji('🗻')">🗻</button>
            <button class="emojibutton" title="camping" onclick="addemoji('🏕️')">🏕️</button>
            <button class="emojibutton" title="beach with umbrella" onclick="addemoji('🏖️')">🏖️</button>
            <button class="emojibutton" title="desert" onclick="addemoji('🏜️')">🏜️</button>
            <button class="emojibutton" title="desert island" onclick="addemoji('🏝️')">🏝️</button>
            <button class="emojibutton" title="national park" onclick="addemoji('🏞️')">🏞️</button>
            <button class="emojibutton" title="stadium" onclick="addemoji('🏟️')">🏟️</button>
            <button class="emojibutton" title="classical building" onclick="addemoji('🏛️')">🏛️</button>
            <button class="emojibutton" title="building construction" onclick="addemoji('🏗️')">🏗️</button>
            <button class="emojibutton" title="house" onclick="addemoji('🏘️')">🏘️</button>
            <button class="emojibutton" title="cityscape" onclick="addemoji('🏙️')">🏙️</button>
            <button class="emojibutton" title="derelict house" onclick="addemoji('🏚️')">🏚️</button>
            <button class="emojibutton" title="house" onclick="addemoji('🏠')">🏠</button>
            <button class="emojibutton" title="house with garden" onclick="addemoji('🏡')">🏡</button>
            <button class="emojibutton" title="office building" onclick="addemoji('🏢')">🏢</button>
            <button class="emojibutton" title="Japanese post office" onclick="addemoji('🏣')">🏣</button>
            <button class="emojibutton" title="post office" onclick="addemoji('🏤')">🏤</button>
            <button class="emojibutton" title="hospital" onclick="addemoji('🏥')">🏥</button>
            <button class="emojibutton" title="bank" onclick="addemoji('🏦')">🏦</button>
            <button class="emojibutton" title="hotel" onclick="addemoji('🏨')">🏨</button>
            <button class="emojibutton" title="love hotel" onclick="addemoji('🏩')">🏩</button>
            <button class="emojibutton" title="convenience store" onclick="addemoji('🏪')">🏪</button>
            <button class="emojibutton" title="school" onclick="addemoji('🏫')">🏫</button>
            <button class="emojibutton" title="department store" onclick="addemoji('🏬')">🏬</button>
            <button class="emojibutton" title="factory" onclick="addemoji('🏭')">🏭</button>
            <button class="emojibutton" title="Japanese castle" onclick="addemoji('🏯')">🏯</button>
            <button class="emojibutton" title="castle" onclick="addemoji('🏰')">🏰</button>
            <button class="emojibutton" title="wedding" onclick="addemoji('💒')">💒</button>
            <button class="emojibutton" title="Tokyo tower" onclick="addemoji('🗼')">🗼</button>
            <button class="emojibutton" title="Statue of Liberty" onclick="addemoji('🗽')">🗽</button>
            <button class="emojibutton" title="church" onclick="addemoji('⛪')">⛪</button>
            <button class="emojibutton" title="mosque" onclick="addemoji('🕌')">🕌</button>
            <button class="emojibutton" title="synagogue" onclick="addemoji('🕍')">🕍</button>
            <button class="emojibutton" title="shinto shrine" onclick="addemoji('⛩️')">⛩️</button>
            <button class="emojibutton" title="kaaba" onclick="addemoji('🕋')">🕋</button>
            <button class="emojibutton" title="fountain" onclick="addemoji('⛲')">⛲</button>
            <button class="emojibutton" title="tent" onclick="addemoji('⛺')">⛺</button>
            <button class="emojibutton" title="foggy" onclick="addemoji('🌁')">🌁</button>
            <button class="emojibutton" title="night with stars" onclick="addemoji('🌃')">🌃</button>
            <button class="emojibutton" title="sunrise over mountains" onclick="addemoji('🌄')">🌄</button>
            <button class="emojibutton" title="sunrise" onclick="addemoji('🌅')">🌅</button>
            <button class="emojibutton" title="cityscape at dusk" onclick="addemoji('🌆')">🌆</button>
            <button class="emojibutton" title="sunset" onclick="addemoji('🌇')">🌇</button>
            <button class="emojibutton" title="bridge at night" onclick="addemoji('🌉')">🌉</button>
            <button class="emojibutton" title="hot springs" onclick="addemoji('♨️')">♨️</button>
            <button class="emojibutton" title="milky way" onclick="addemoji('🌌')">🌌</button>
            <button class="emojibutton" title="carousel horse" onclick="addemoji('🎠')">🎠</button>
            <button class="emojibutton" title="ferris wheel" onclick="addemoji('🎡')">🎡</button>
            <button class="emojibutton" title="roller coaster" onclick="addemoji('🎢')">🎢</button>
            <button class="emojibutton" title="barber pole" onclick="addemoji('💈')">💈</button>
            <button class="emojibutton" title="circus tent" onclick="addemoji('🎪')">🎪</button>
            <button class="emojibutton" title="performing arts" onclick="addemoji('🎭')">🎭</button>
            <button class="emojibutton" title="framed picture" onclick="addemoji('🖼️')">🖼️</button>
            <button class="emojibutton" title="artist palette" onclick="addemoji('🎨')">🎨</button>
            <button class="emojibutton" title="slot machine" onclick="addemoji('🎰')">🎰</button>
            <button class="emojibutton" title="locomotive" onclick="addemoji('🚂')">🚂</button>
            <button class="emojibutton" title="railway car" onclick="addemoji('🚃')">🚃</button>
            <button class="emojibutton" title="high-speed train" onclick="addemoji('🚄')">🚄</button>
            <button class="emojibutton" title="high-speed train with bullet nose" onclick="addemoji('🚅')">🚅</button>
            <button class="emojibutton" title="train" onclick="addemoji('🚆')">🚆</button>
            <button class="emojibutton" title="metro" onclick="addemoji('🚇')">🚇</button>
            <button class="emojibutton" title="light rail" onclick="addemoji('🚈')">🚈</button>
            <button class="emojibutton" title="station" onclick="addemoji('🚉')">🚉</button>
            <button class="emojibutton" title="tram" onclick="addemoji('🚊')">🚊</button>
            <button class="emojibutton" title="monorail" onclick="addemoji('🚝')">🚝</button>
            <button class="emojibutton" title="mountain railway" onclick="addemoji('🚞')">🚞</button>
            <button class="emojibutton" title="tram car" onclick="addemoji('🚋')">🚋</button>
            <button class="emojibutton" title="bus" onclick="addemoji('🚌')">🚌</button>
            <button class="emojibutton" title="oncoming bus" onclick="addemoji('🚍')">🚍</button>
            <button class="emojibutton" title="trolleybus" onclick="addemoji('🚎')">🚎</button>
            <button class="emojibutton" title="minibus" onclick="addemoji('🚐')">🚐</button>
            <button class="emojibutton" title="ambulance" onclick="addemoji('🚑')">🚑</button>
            <button class="emojibutton" title="fire engine" onclick="addemoji('🚒')">🚒</button>
            <button class="emojibutton" title="police car" onclick="addemoji('🚓')">🚓</button>
            <button class="emojibutton" title="oncoming police car" onclick="addemoji('🚔')">🚔</button>
            <button class="emojibutton" title="taxi" onclick="addemoji('🚕')">🚕</button>
            <button class="emojibutton" title="oncoming taxi" onclick="addemoji('🚖')">🚖</button>
            <button class="emojibutton" title="automobile" onclick="addemoji('🚗')">🚗</button>
            <button class="emojibutton" title="oncoming automobile" onclick="addemoji('🚘')">🚘</button>
            <button class="emojibutton" title="sport utility vehicle" onclick="addemoji('🚙')">🚙</button>
            <button class="emojibutton" title="delivery truck" onclick="addemoji('🚚')">🚚</button>
            <button class="emojibutton" title="articulated lorry" onclick="addemoji('🚛')">🚛</button>
            <button class="emojibutton" title="tractor" onclick="addemoji('🚜')">🚜</button>
            <button class="emojibutton" title="bicycle" onclick="addemoji('🚲')">🚲</button>
            <button class="emojibutton" title="kick scooter" onclick="addemoji('🛴')">🛴</button>
            <button class="emojibutton" title="motor scooter" onclick="addemoji('🛵')">🛵</button>
            <button class="emojibutton" title="bus stop" onclick="addemoji('🚏')">🚏</button>
            <button class="emojibutton" title="motorway" onclick="addemoji('🛣️')">🛣️</button>
            <button class="emojibutton" title="railway track" onclick="addemoji('🛤️')">🛤️</button>
            <button class="emojibutton" title="fuel pump" onclick="addemoji('⛽')">⛽</button>
            <button class="emojibutton" title="police car light" onclick="addemoji('🚨')">🚨</button>
            <button class="emojibutton" title="horizontal traffic light" onclick="addemoji('🚥')">🚥</button>
            <button class="emojibutton" title="vertical traffic light" onclick="addemoji('🚦')">🚦</button>
            <button class="emojibutton" title="construction" onclick="addemoji('🚧')">🚧</button>
            <button class="emojibutton" title="stop sign" onclick="addemoji('🛑')">🛑</button>
            <button class="emojibutton" title="anchor" onclick="addemoji('⚓')">⚓</button>
            <button class="emojibutton" title="sailboat" onclick="addemoji('⛵')">⛵</button>
            <button class="emojibutton" title="canoe" onclick="addemoji('🛶')">🛶</button>
            <button class="emojibutton" title="speedboat" onclick="addemoji('🚤')">🚤</button>
            <button class="emojibutton" title="passenger ship" onclick="addemoji('🛳️')">🛳️</button>
            <button class="emojibutton" title="ferry" onclick="addemoji('⛴️')">⛴️</button>
            <button class="emojibutton" title="motor boat" onclick="addemoji('🛥️')">🛥️</button>
            <button class="emojibutton" title="ship" onclick="addemoji('🚢')">🚢</button>
            <button class="emojibutton" title="airplane" onclick="addemoji('✈️')">✈️</button>
            <button class="emojibutton" title="small airplane" onclick="addemoji('🛩️')">🛩️</button>
            <button class="emojibutton" title="airplane departure" onclick="addemoji('🛫')">🛫</button>
            <button class="emojibutton" title="airplane arrival" onclick="addemoji('🛬')">🛬</button>
            <button class="emojibutton" title="seat" onclick="addemoji('💺')">💺</button>
            <button class="emojibutton" title="helicopter" onclick="addemoji('🚁')">🚁</button>
            <button class="emojibutton" title="suspension railway" onclick="addemoji('🚟')">🚟</button>
            <button class="emojibutton" title="mountain cableway" onclick="addemoji('🚠')">🚠</button>
            <button class="emojibutton" title="aerial tramway" onclick="addemoji('🚡')">🚡</button>
            <button class="emojibutton" title="rocket" onclick="addemoji('🚀')">🚀</button>
            <button class="emojibutton" title="satellite" onclick="addemoji('🛰️')">🛰️</button>
            <button class="emojibutton" title="bellhop bell" onclick="addemoji('🛎️')">🛎️</button>
            <button class="emojibutton" title="door" onclick="addemoji('🚪')">🚪</button>
            <button class="emojibutton" title="person in bed" onclick="addemoji('🛌')">🛌</button>
            <button class="emojibutton" title="bed" onclick="addemoji('🛏️')">🛏️</button>
            <button class="emojibutton" title="couch and lamp" onclick="addemoji('🛋️')">🛋️</button>
            <button class="emojibutton" title="toilet" onclick="addemoji('🚽')">🚽</button>
            <button class="emojibutton" title="shower" onclick="addemoji('🚿')">🚿</button>
            <button class="emojibutton" title="person taking bath" onclick="addemoji('🛀')">🛀</button>
            <button class="emojibutton" title="bathtub" onclick="addemoji('🛁')">🛁</button>
            <button class="emojibutton" title="hourglass" onclick="addemoji('⌛')">⌛</button>
            <button class="emojibutton" title="hourglass with flowing sand" onclick="addemoji('⏳')">⏳</button>
            <button class="emojibutton" title="watch" onclick="addemoji('⌚')">⌚</button>
            <button class="emojibutton" title="alarm clock" onclick="addemoji('⏰')">⏰</button>
            <button class="emojibutton" title="stopwatch" onclick="addemoji('⏱️')">⏱️</button>
            <button class="emojibutton" title="timer clock" onclick="addemoji('⏲️')">⏲️</button>
            <button class="emojibutton" title="mantelpiece clock" onclick="addemoji('🕰️')">🕰️</button>            
        </div>
        <div class="emojisec" id="activities">
            <div class="emojiheader">
                <h3>Activities</h3>
            </div>
            <button class="emojibutton" title="jack-o-lantern" onclick="addemoji('🎃')">🎃</button>
            <button class="emojibutton" title="Christmas tree" onclick="addemoji('🎄')">🎄</button>
            <button class="emojibutton" title="fireworks" onclick="addemoji('🎆')">🎆</button>
            <button class="emojibutton" title="sparkler" onclick="addemoji('🎇')">🎇</button>
            <button class="emojibutton" title="sparkles" onclick="addemoji('✨')">✨</button>
            <button class="emojibutton" title="balloon" onclick="addemoji('🎈')">🎈</button>
            <button class="emojibutton" title="party popper" onclick="addemoji('🎉')">🎉</button>
            <button class="emojibutton" title="confetti ball" onclick="addemoji('🎊')">🎊</button>
            <button class="emojibutton" title="tanabata tree" onclick="addemoji('🎋')">🎋</button>
            <button class="emojibutton" title="pine decoration" onclick="addemoji('🎍')">🎍</button>
            <button class="emojibutton" title="Japanese dolls" onclick="addemoji('🎎')">🎎</button>
            <button class="emojibutton" title="carp streamer" onclick="addemoji('🎏')">🎏</button>
            <button class="emojibutton" title="wind chime" onclick="addemoji('🎐')">🎐</button>
            <button class="emojibutton" title="moon viewing ceremony" onclick="addemoji('🎑')">🎑</button>
            <button class="emojibutton" title="ribbon" onclick="addemoji('🎀')">🎀</button>
            <button class="emojibutton" title="wrapped gift" onclick="addemoji('🎁')">🎁</button>
            <button class="emojibutton" title="reminder ribbon" onclick="addemoji('🎗️')">🎗️</button>
            <button class="emojibutton" title="admission tickets" onclick="addemoji('🎟️')">🎟️</button>
            <button class="emojibutton" title="ticket" onclick="addemoji('🎫')">🎫</button>
            <button class="emojibutton" title="military medal" onclick="addemoji('🎖️')">🎖️</button>
            <button class="emojibutton" title="trophy" onclick="addemoji('🏆')">🏆</button>
            <button class="emojibutton" title="sports medal" onclick="addemoji('🏅')">🏅</button>
            <button class="emojibutton" title="1st place medal" onclick="addemoji('🥇')">🥇</button>
            <button class="emojibutton" title="2nd place medal" onclick="addemoji('🥈')">🥈</button>
            <button class="emojibutton" title="3rd place medal" onclick="addemoji('🥉')">🥉</button>
            <button class="emojibutton" title="soccer ball" onclick="addemoji('⚽')">⚽</button>
            <button class="emojibutton" title="baseball" onclick="addemoji('⚾')">⚾</button>
            <button class="emojibutton" title="basketball" onclick="addemoji('🏀')">🏀</button>
            <button class="emojibutton" title="volleyball" onclick="addemoji('🏐')">🏐</button>
            <button class="emojibutton" title="american football" onclick="addemoji('🏈')">🏈</button>
            <button class="emojibutton" title="rugby football" onclick="addemoji('🏉')">🏉</button>
            <button class="emojibutton" title="tennis" onclick="addemoji('🎾')">🎾</button>
            <button class="emojibutton" title="pool 8 ball" onclick="addemoji('🎱')">🎱</button>
            <button class="emojibutton" title="bowling" onclick="addemoji('🎳')">🎳</button>
            <button class="emojibutton" title="cricket" onclick="addemoji('🏏')">🏏</button>
            <button class="emojibutton" title="field hockey" onclick="addemoji('🏑')">🏑</button>
            <button class="emojibutton" title="ice hockey" onclick="addemoji('🏒')">🏒</button>
            <button class="emojibutton" title="ping pong" onclick="addemoji('🏓')">🏓</button>
            <button class="emojibutton" title="badminton" onclick="addemoji('🏸')">🏸</button>
            <button class="emojibutton" title="boxing glove" onclick="addemoji('🥊')">🥊</button>
            <button class="emojibutton" title="martial arts uniform" onclick="addemoji('🥋')">🥋</button>
            <button class="emojibutton" title="goal net" onclick="addemoji('🥅')">🥅</button>
            <button class="emojibutton" title="direct hit" onclick="addemoji('🎯')">🎯</button>
            <button class="emojibutton" title="flag in hole" onclick="addemoji('⛳')">⛳</button>
            <button class="emojibutton" title="ice skate" onclick="addemoji('⛸️')">⛸️</button>
            <button class="emojibutton" title="fishing pole" onclick="addemoji('🎣')">🎣</button>
            <button class="emojibutton" title="running shirt" onclick="addemoji('🎽')">🎽</button>
            <button class="emojibutton" title="skis" onclick="addemoji('🎿')">🎿</button>
            <button class="emojibutton" title="video game" onclick="addemoji('🎮')">🎮</button>
            <button class="emojibutton" title="joystick" onclick="addemoji('🕹️')">🕹️</button>
            <button class="emojibutton" title="game die" onclick="addemoji('🎲')">🎲</button>
            <button class="emojibutton" title="spade suit" onclick="addemoji('♠️')">♠️</button>
            <button class="emojibutton" title="heart suit" onclick="addemoji('♥️')">♥️</button>
            <button class="emojibutton" title="diamond suit" onclick="addemoji('♦️')">♦️</button>
            <button class="emojibutton" title="club suit" onclick="addemoji('♣️')">♣️</button>
            <button class="emojibutton" title="joker" onclick="addemoji('🃏')">🃏</button>
            <button class="emojibutton" title="mahjong red dragon" onclick="addemoji('🀄')">🀄</button>
            <button class="emojibutton" title="flower playing cards" onclick="addemoji('🎴')">🎴</button>            
        </div>
        <div class="emojisec" id="objects">
            <div class="emojiheader">
                <h3>Objects</h3>
            </div>
            <button class="emojibutton" title="loudspeaker" onclick="addemoji('📢')">📢</button>
            <button class="emojibutton" title="megaphone" onclick="addemoji('📣')">📣</button>
            <button class="emojibutton" title="postal horn" onclick="addemoji('📯')">📯</button>
            <button class="emojibutton" title="bell" onclick="addemoji('🔔')">🔔</button>
            <button class="emojibutton" title="bell with slash" onclick="addemoji('🔕')">🔕</button>
            <button class="emojibutton" title="musical score" onclick="addemoji('🎼')">🎼</button>
            <button class="emojibutton" title="musical note" onclick="addemoji('🎵')">🎵</button>
            <button class="emojibutton" title="musical notes" onclick="addemoji('🎶')">🎶</button>
            <button class="emojibutton" title="studio microphone" onclick="addemoji('🎙️')">🎙️</button>
            <button class="emojibutton" title="level slider" onclick="addemoji('🎚️')">🎚️</button>
            <button class="emojibutton" title="control knobs" onclick="addemoji('🎛️')">🎛️</button>
            <button class="emojibutton" title="microphone" onclick="addemoji('🎤')">🎤</button>
            <button class="emojibutton" title="headphone" onclick="addemoji('🎧')">🎧</button>
            <button class="emojibutton" title="radio" onclick="addemoji('📻')">📻</button>
            <button class="emojibutton" title="saxophone" onclick="addemoji('🎷')">🎷</button>
            <button class="emojibutton" title="guitar" onclick="addemoji('🎸')">🎸</button>
            <button class="emojibutton" title="musical keyboard" onclick="addemoji('🎹')">🎹</button>
            <button class="emojibutton" title="trumpet" onclick="addemoji('🎺')">🎺</button>
            <button class="emojibutton" title="violin" onclick="addemoji('🎻')">🎻</button>
            <button class="emojibutton" title="drum" onclick="addemoji('🥁')">🥁</button>
            <button class="emojibutton" title="mobile phone" onclick="addemoji('📱')">📱</button>
            <button class="emojibutton" title="mobile phone with arrow" onclick="addemoji('📲')">📲</button>
            <button class="emojibutton" title="telephone" onclick="addemoji('☎️')">☎️</button>
            <button class="emojibutton" title="telephone receiver" onclick="addemoji('📞')">📞</button>
            <button class="emojibutton" title="pager" onclick="addemoji('📟')">📟</button>
            <button class="emojibutton" title="fax machine" onclick="addemoji('📠')">📠</button>
            <button class="emojibutton" title="battery" onclick="addemoji('🔋')">🔋</button>
            <button class="emojibutton" title="electric plug" onclick="addemoji('🔌')">🔌</button>
            <button class="emojibutton" title="laptop computer" onclick="addemoji('💻')">💻</button>
            <button class="emojibutton" title="desktop computer" onclick="addemoji('🖥️')">🖥️</button>
            <button class="emojibutton" title="printer" onclick="addemoji('🖨️')">🖨️</button>
            <button class="emojibutton" title="keyboard" onclick="addemoji('⌨️')">⌨️</button>
            <button class="emojibutton" title="computer mouse" onclick="addemoji('🖱️')">🖱️</button>
            <button class="emojibutton" title="trackball" onclick="addemoji('🖲️')">🖲️</button>
            <button class="emojibutton" title="computer disk" onclick="addemoji('💽')">💽</button>
            <button class="emojibutton" title="floppy disk" onclick="addemoji('💾')">💾</button>
            <button class="emojibutton" title="optical disk" onclick="addemoji('💿')">💿</button>
            <button class="emojibutton" title="dvd" onclick="addemoji('📀')">📀</button>
            <button class="emojibutton" title="movie camera" onclick="addemoji('🎥')">🎥</button>
            <button class="emojibutton" title="film frames" onclick="addemoji('🎞️')">🎞️</button>
            <button class="emojibutton" title="film projector" onclick="addemoji('📽️')">📽️</button>
            <button class="emojibutton" title="clapper board" onclick="addemoji('🎬')">🎬</button>
            <button class="emojibutton" title="television" onclick="addemoji('📺')">📺</button>
            <button class="emojibutton" title="camera" onclick="addemoji('📷')">📷</button>
            <button class="emojibutton" title="camera with flash" onclick="addemoji('📸')">📸</button>
            <button class="emojibutton" title="video camera" onclick="addemoji('📹')">📹</button>
            <button class="emojibutton" title="videocassette" onclick="addemoji('📼')">📼</button>
            <button class="emojibutton" title="left-pointing magnifying glass" onclick="addemoji('🔍')">🔍</button>
            <button class="emojibutton" title="right-pointing magnifying glass" onclick="addemoji('🔎')">🔎</button>
            <button class="emojibutton" title="microscope" onclick="addemoji('🔬')">🔬</button>
            <button class="emojibutton" title="telescope" onclick="addemoji('🔭')">🔭</button>
            <button class="emojibutton" title="satellite antenna" onclick="addemoji('📡')">📡</button>
            <button class="emojibutton" title="candle" onclick="addemoji('🕯️')">🕯️</button>
            <button class="emojibutton" title="light bulb" onclick="addemoji('💡')">💡</button>
            <button class="emojibutton" title="flashlight" onclick="addemoji('🔦')">🔦</button>
            <button class="emojibutton" title="red paper lantern" onclick="addemoji('🏮')">🏮</button>
            <button class="emojibutton" title="notebook with decorative cover" onclick="addemoji('📔')">📔</button>
            <button class="emojibutton" title="closed book" onclick="addemoji('📕')">📕</button>
            <button class="emojibutton" title="open book" onclick="addemoji('📖')">📖</button>
            <button class="emojibutton" title="green book" onclick="addemoji('📗')">📗</button>
            <button class="emojibutton" title="blue book" onclick="addemoji('📘')">📘</button>
            <button class="emojibutton" title="orange book" onclick="addemoji('📙')">📙</button>
            <button class="emojibutton" title="books" onclick="addemoji('📚')">📚</button>
            <button class="emojibutton" title="notebook" onclick="addemoji('📓')">📓</button>
            <button class="emojibutton" title="ledger" onclick="addemoji('📒')">📒</button>
            <button class="emojibutton" title="page with curl" onclick="addemoji('📃')">📃</button>
            <button class="emojibutton" title="scroll" onclick="addemoji('📜')">📜</button>
            <button class="emojibutton" title="page facing up" onclick="addemoji('📄')">📄</button>
            <button class="emojibutton" title="newspaper" onclick="addemoji('📰')">📰</button>
            <button class="emojibutton" title="rolled-up newspaper" onclick="addemoji('🗞️')">🗞️</button>
            <button class="emojibutton" title="bookmark tabs" onclick="addemoji('📑')">📑</button>
            <button class="emojibutton" title="bookmark" onclick="addemoji('🔖')">🔖</button>
            <button class="emojibutton" title="label" onclick="addemoji('🏷️')">🏷️</button>
            <button class="emojibutton" title="money bag" onclick="addemoji('💰')">💰</button>
            <button class="emojibutton" title="yen banknote" onclick="addemoji('💴')">💴</button>
            <button class="emojibutton" title="dollar banknote" onclick="addemoji('💵')">💵</button>
            <button class="emojibutton" title="euro banknote" onclick="addemoji('💶')">💶</button>
            <button class="emojibutton" title="pound banknote" onclick="addemoji('💷')">💷</button>
            <button class="emojibutton" title="money with wings" onclick="addemoji('💸')">💸</button>
            <button class="emojibutton" title="credit card" onclick="addemoji('💳')">💳</button>
            <button class="emojibutton" title="chart increasing with yen" onclick="addemoji('💹')">💹</button>
            <button class="emojibutton" title="currency exchange" onclick="addemoji('💱')">💱</button>
            <button class="emojibutton" title="heavy dollar sign" onclick="addemoji('💲')">💲</button>
            <button class="emojibutton" title="envelope" onclick="addemoji('✉️')">✉️</button>
            <button class="emojibutton" title="e-mail" onclick="addemoji('📧')">📧</button>
            <button class="emojibutton" title="love letter" onclick="addemoji('💌')">💌</button>
            <button class="emojibutton" title="incoming envelope" onclick="addemoji('📨')">📨</button>
            <button class="emojibutton" title="envelope with arrow" onclick="addemoji('📩')">📩</button>
            <button class="emojibutton" title="outbox tray" onclick="addemoji('📤')">📤</button>
            <button class="emojibutton" title="inbox tray" onclick="addemoji('📥')">📥</button>
            <button class="emojibutton" title="package" onclick="addemoji('📦')">📦</button>
            <button class="emojibutton" title="closed mailbox with raised flag" onclick="addemoji('📫')">📫</button>
            <button class="emojibutton" title="closed mailbox with lowered flag" onclick="addemoji('📪')">📪</button>
            <button class="emojibutton" title="open mailbox with raised flag" onclick="addemoji('📬')">📬</button>
            <button class="emojibutton" title="open mailbox with lowered flag" onclick="addemoji('📭')">📭</button>
            <button class="emojibutton" title="postbox" onclick="addemoji('📮')">📮</button>
            <button class="emojibutton" title="ballot box with ballot" onclick="addemoji('🗳️')">🗳️</button>
            <button class="emojibutton" title="pencil" onclick="addemoji('✏️')">✏️</button>
            <button class="emojibutton" title="black nib" onclick="addemoji('✒️')">✒️</button>
            <button class="emojibutton" title="fountain pen" onclick="addemoji('🖋️')">🖋️</button>
            <button class="emojibutton" title="pen" onclick="addemoji('🖊️')">🖊️</button>
            <button class="emojibutton" title="paintbrush" onclick="addemoji('🖌️')">🖌️</button>
            <button class="emojibutton" title="crayon" onclick="addemoji('🖍️')">🖍️</button>
            <button class="emojibutton" title="memo" onclick="addemoji('📝')">📝</button>
            <button class="emojibutton" title="briefcase" onclick="addemoji('💼')">💼</button>
            <button class="emojibutton" title="file folder" onclick="addemoji('📁')">📁</button>
            <button class="emojibutton" title="open file folder" onclick="addemoji('📂')">📂</button>
            <button class="emojibutton" title="card index dividers" onclick="addemoji('🗂️')">🗂️</button>
            <button class="emojibutton" title="calendar" onclick="addemoji('📅')">📅</button>
            <button class="emojibutton" title="tear-off calendar" onclick="addemoji('📆')">📆</button>
            <button class="emojibutton" title="spiral notepad" onclick="addemoji('🗒️')">🗒️</button>
            <button class="emojibutton" title="spiral calendar" onclick="addemoji('🗓️')">🗓️</button>
            <button class="emojibutton" title="card index" onclick="addemoji('📇')">📇</button>
            <button class="emojibutton" title="chart increasing" onclick="addemoji('📈')">📈</button>
            <button class="emojibutton" title="chart decreasing" onclick="addemoji('📉')">📉</button>
            <button class="emojibutton" title="bar chart" onclick="addemoji('📊')">📊</button>
            <button class="emojibutton" title="clipboard" onclick="addemoji('📋')">📋</button>
            <button class="emojibutton" title="pushpin" onclick="addemoji('📌')">📌</button>
            <button class="emojibutton" title="round pushpin" onclick="addemoji('📍')">📍</button>
            <button class="emojibutton" title="paperclip" onclick="addemoji('📎')">📎</button>
            <button class="emojibutton" title="linked paperclips" onclick="addemoji('🖇️')">🖇️</button>
            <button class="emojibutton" title="straight ruler" onclick="addemoji('📏')">📏</button>
            <button class="emojibutton" title="triangular ruler" onclick="addemoji('📐')">📐</button>
            <button class="emojibutton" title="scissors" onclick="addemoji('✂️')">✂️</button>
            <button class="emojibutton" title="card file box" onclick="addemoji('🗃️')">🗃️</button>
            <button class="emojibutton" title="file cabinet" onclick="addemoji('🗄️')">🗄️</button>
            <button class="emojibutton" title="wastebasket" onclick="addemoji('🗑️')">🗑️</button>
            <button class="emojibutton" title="locked" onclick="addemoji('🔒')">🔒</button>
            <button class="emojibutton" title="unlocked" onclick="addemoji('🔓')">🔓</button>
            <button class="emojibutton" title="locked with pen" onclick="addemoji('🔏')">🔏</button>
            <button class="emojibutton" title="locked with key" onclick="addemoji('🔐')">🔐</button>
            <button class="emojibutton" title="key" onclick="addemoji('🔑')">🔑</button>
            <button class="emojibutton" title="old key" onclick="addemoji('🗝️')">🗝️</button>
            <button class="emojibutton" title="hammer" onclick="addemoji('🔨')">🔨</button>
            <button class="emojibutton" title="pick" onclick="addemoji('⛏️')">⛏️</button>
            <button class="emojibutton" title="hammer and pick" onclick="addemoji('⚒️')">⚒️</button>
            <button class="emojibutton" title="hammer and wrench" onclick="addemoji('🛠️')">🛠️</button>
            <button class="emojibutton" title="dagger" onclick="addemoji('🗡️')">🗡️</button>
            <button class="emojibutton" title="crossed swords" onclick="addemoji('⚔️')">⚔️</button>
            <button class="emojibutton" title="pistol" onclick="addemoji('🔫')">🔫</button>
            <button class="emojibutton" title="bow and arrow" onclick="addemoji('🏹')">🏹</button>
            <button class="emojibutton" title="shield" onclick="addemoji('🛡️')">🛡️</button>
            <button class="emojibutton" title="wrench" onclick="addemoji('🔧')">🔧</button>
            <button class="emojibutton" title="nut and bolt" onclick="addemoji('🔩')">🔩</button>
            <button class="emojibutton" title="gear" onclick="addemoji('⚙️')">⚙️</button>
            <button class="emojibutton" title="clamp" onclick="addemoji('🗜️')">🗜️</button>
            <button class="emojibutton" title="alembic" onclick="addemoji('⚗️')">⚗️</button>
            <button class="emojibutton" title="balance scale" onclick="addemoji('⚖️')">⚖️</button>
            <button class="emojibutton" title="link" onclick="addemoji('🔗')">🔗</button>
            <button class="emojibutton" title="chains" onclick="addemoji('⛓️')">⛓️</button>
            <button class="emojibutton" title="syringe" onclick="addemoji('💉')">💉</button>
            <button class="emojibutton" title="pill" onclick="addemoji('💊')">💊</button>
            <button class="emojibutton" title="cigarette" onclick="addemoji('🚬')">🚬</button>
            <button class="emojibutton" title="coffin" onclick="addemoji('⚰️')">⚰️</button>
            <button class="emojibutton" title="funeral urn" onclick="addemoji('⚱️')">⚱️</button>
            <button class="emojibutton" title="moai" onclick="addemoji('🗿')">🗿</button>
            <button class="emojibutton" title="oil drum" onclick="addemoji('🛢️')">🛢️</button>
            <button class="emojibutton" title="crystal ball" onclick="addemoji('🔮')">🔮</button>
            <button class="emojibutton" title="shopping cart" onclick="addemoji('🛒')">🛒</button>
            <button class="emojibutton" title="zzz" onclick="addemoji('💤')">💤</button>
            <button class="emojibutton" title="anger symbol" onclick="addemoji('💢')">💢</button>
            <button class="emojibutton" title="bomb" onclick="addemoji('💣')">💣</button>
            <button class="emojibutton" title="collision" onclick="addemoji('💥')">💥</button>
            <button class="emojibutton" title="grave, tomb" onclick="addemoji('🪦')">🪦</button>
            <button class="emojibutton" title="hole" onclick="addemoji('🕳️')">🕳️</button>
        </div>
        <div class="emojisec" id="symbols">
            <div class="emojiheader">
                <h3>Symbols</h3>
            </div>
            <button class="emojibutton" title="red heart" onclick="addemoji('❤️')">❤️</button>
            <button class="emojibutton" title="orange heart" onclick="addemoji('🧡')">🧡</button>
            <button class="emojibutton" title="yellow heart" onclick="addemoji('💛')">💛</button>
            <button class="emojibutton" title="green heart" onclick="addemoji('💚')">💚</button>
            <button class="emojibutton" title="light blue heart" onclick="addemoji('🩵')">🩵</button>
            <button class="emojibutton" title="blue heart" onclick="addemoji('💙')">💙</button>
            <button class="emojibutton" title="purple heart" onclick="addemoji('💜')">💜</button>
            <button class="emojibutton" title="pink heart" onclick="addemoji('🩷')">🩷</button>
            <button class="emojibutton" title="brown heart" onclick="addemoji('🤎')">🤎</button>
            <button class="emojibutton" title="black heart" onclick="addemoji('🖤')">🖤</button>
            <button class="emojibutton" title="two hearts" onclick="addemoji('💕')">💕</button>
            <button class="emojibutton" title="revolving hearts" onclick="addemoji('💞')">💞</button>
            <button class="emojibutton" title="heart with arrow" onclick="addemoji('💘')">💘</button>
            <button class="emojibutton" title="beating heart" onclick="addemoji('💓')">💓</button>
            <button class="emojibutton" title="broken heart" onclick="addemoji('💔')">💔</button>
            <button class="emojibutton" title="sparkling heart" onclick="addemoji('💖')">💖</button>
            <button class="emojibutton" title="growing heart" onclick="addemoji('💗')">💗</button>
            <button class="emojibutton" title="heart with ribbon" onclick="addemoji('💝')">💝</button>
            <button class="emojibutton" title="heart decoration" onclick="addemoji('💟')">💟</button>
            <button class="emojibutton" title="heavy heart exclamation" onclick="addemoji('❣️')">❣️</button>
            <button class="emojibutton" title="ATM sign" onclick="addemoji('🏧')">🏧</button>
            <button class="emojibutton" title="litter in bin sign" onclick="addemoji('🚮')">🚮</button>
            <button class="emojibutton" title="potable water" onclick="addemoji('🚰')">🚰</button>
            <button class="emojibutton" title="wheelchair symbol" onclick="addemoji('♿')">♿</button>
            <button class="emojibutton" title="men's room" onclick="addemoji('🚹')">🚹</button>
            <button class="emojibutton" title="women's room" onclick="addemoji('🚺')">🚺</button>
            <button class="emojibutton" title="restroom" onclick="addemoji('🚻')">🚻</button>
            <button class="emojibutton" title="baby symbol" onclick="addemoji('🚼')">🚼</button>
            <button class="emojibutton" title="water closet" onclick="addemoji('🚾')">🚾</button>
            <button class="emojibutton" title="passport control" onclick="addemoji('🛂')">🛂</button>
            <button class="emojibutton" title="customs" onclick="addemoji('🛃')">🛃</button>
            <button class="emojibutton" title="baggage claim" onclick="addemoji('🛄')">🛄</button>
            <button class="emojibutton" title="left luggage" onclick="addemoji('🛅')">🛅</button>
            <button class="emojibutton" title="warning" onclick="addemoji('⚠️')">⚠️</button>
            <button class="emojibutton" title="children crossing" onclick="addemoji('🚸')">🚸</button>
            <button class="emojibutton" title="no entry" onclick="addemoji('⛔')">⛔</button>
            <button class="emojibutton" title="prohibited" onclick="addemoji('🚫')">🚫</button>
            <button class="emojibutton" title="no bicycles" onclick="addemoji('🚳')">🚳</button>
            <button class="emojibutton" title="no smoking" onclick="addemoji('🚭')">🚭</button>
            <button class="emojibutton" title="no littering" onclick="addemoji('🚯')">🚯</button>
            <button class="emojibutton" title="non-potable water" onclick="addemoji('🚱')">🚱</button>
            <button class="emojibutton" title="no pedestrians" onclick="addemoji('🚷')">🚷</button>
            <button class="emojibutton" title="no mobile phones" onclick="addemoji('📵')">📵</button>
            <button class="emojibutton" title="no one under eighteen" onclick="addemoji('🔞')">🔞</button>
            <button class="emojibutton" title="radioactive" onclick="addemoji('☢️')">☢️</button>
            <button class="emojibutton" title="biohazard" onclick="addemoji('☣️')">☣️</button>
            <button class="emojibutton" title="up arrow" onclick="addemoji('⬆️')">⬆️</button>
            <button class="emojibutton" title="up-right arrow" onclick="addemoji('↗️')">↗️</button>
            <button class="emojibutton" title="right arrow" onclick="addemoji('➡️')">➡️</button>
            <button class="emojibutton" title="down-right arrow" onclick="addemoji('↘️')">↘️</button>
            <button class="emojibutton" title="down arrow" onclick="addemoji('⬇️')">⬇️</button>
            <button class="emojibutton" title="down-left arrow" onclick="addemoji('↙️')">↙️</button>
            <button class="emojibutton" title="left arrow" onclick="addemoji('⬅️')">⬅️</button>
            <button class="emojibutton" title="up-left arrow" onclick="addemoji('↖️')">↖️</button>
            <button class="emojibutton" title="up-down arrow" onclick="addemoji('↕️')">↕️</button>
            <button class="emojibutton" title="left-right arrow" onclick="addemoji('↔️')">↔️</button>
            <button class="emojibutton" title="right arrow curving left" onclick="addemoji('↩️')">↩️</button>
            <button class="emojibutton" title="left arrow curving right" onclick="addemoji('↪️')">↪️</button>
            <button class="emojibutton" title="right arrow curving up" onclick="addemoji('⤴️')">⤴️</button>
            <button class="emojibutton" title="right arrow curving down" onclick="addemoji('⤵️')">⤵️</button>
            <button class="emojibutton" title="clockwise vertical arrows" onclick="addemoji('🔃')">🔃</button>
            <button class="emojibutton" title="anticlockwise arrows button" onclick="addemoji('🔄')">🔄</button>
            <button class="emojibutton" title="BACK arrow" onclick="addemoji('🔙')">🔙</button>
            <button class="emojibutton" title="END arrow" onclick="addemoji('🔚')">🔚</button>
            <button class="emojibutton" title="ON! arrow" onclick="addemoji('🔛')">🔛</button>
            <button class="emojibutton" title="SOON arrow" onclick="addemoji('🔜')">🔜</button>
            <button class="emojibutton" title="TOP arrow" onclick="addemoji('🔝')">🔝</button>
            <button class="emojibutton" title="place of worship" onclick="addemoji('🛐')">🛐</button>
            <button class="emojibutton" title="atom symbol" onclick="addemoji('⚛️')">⚛️</button>
            <button class="emojibutton" title="om" onclick="addemoji('🕉️')">🕉️</button>
            <button class="emojibutton" title="star of David" onclick="addemoji('✡️')">✡️</button>
            <button class="emojibutton" title="wheel of dharma" onclick="addemoji('☸️')">☸️</button>
            <button class="emojibutton" title="yin yang" onclick="addemoji('☯️')">☯️</button>
            <button class="emojibutton" title="latin cross" onclick="addemoji('✝️')">✝️</button>
            <button class="emojibutton" title="orthodox cross" onclick="addemoji('☦️')">☦️</button>
            <button class="emojibutton" title="star and crescent" onclick="addemoji('☪️')">☪️</button>
            <button class="emojibutton" title="peace symbol" onclick="addemoji('☮️')">☮️</button>
            <button class="emojibutton" title="menorah" onclick="addemoji('🕎')">🕎</button>
            <button class="emojibutton" title="dotted six-pointed star" onclick="addemoji('🔯')">🔯</button>
            <button class="emojibutton" title="Aries" onclick="addemoji('♈')">♈</button>
            <button class="emojibutton" title="Taurus" onclick="addemoji('♉')">♉</button>
            <button class="emojibutton" title="Gemini" onclick="addemoji('♊')">♊</button>
            <button class="emojibutton" title="Cancer" onclick="addemoji('♋')">♋</button>
            <button class="emojibutton" title="Leo" onclick="addemoji('♌')">♌</button>
            <button class="emojibutton" title="Virgo" onclick="addemoji('♍')">♍</button>
            <button class="emojibutton" title="Libra" onclick="addemoji('♎')">♎</button>
            <button class="emojibutton" title="Scorpius" onclick="addemoji('♏')">♏</button>
            <button class="emojibutton" title="Sagittarius" onclick="addemoji('♐')">♐</button>
            <button class="emojibutton" title="Capricorn" onclick="addemoji('♑')">♑</button>
            <button class="emojibutton" title="Aquarius" onclick="addemoji('♒')">♒</button>
            <button class="emojibutton" title="Pisces" onclick="addemoji('♓')">♓</button>
            <button class="emojibutton" title="Ophiuchus" onclick="addemoji('⛎')">⛎</button>
            <button class="emojibutton" title="muted speaker" onclick="addemoji('🔇')">🔇</button>
            <button class="emojibutton" title="speaker low volume" onclick="addemoji('🔈')">🔈</button>
            <button class="emojibutton" title="speaker medium volume" onclick="addemoji('🔉')">🔉</button>
            <button class="emojibutton" title="speaker high volume" onclick="addemoji('🔊')">🔊</button>
            <button class="emojibutton" title="shuffle tracks button" onclick="addemoji('🔀')">🔀</button>
            <button class="emojibutton" title="repeat button" onclick="addemoji('🔁')">🔁</button>
            <button class="emojibutton" title="repeat single button" onclick="addemoji('🔂')">🔂</button>
            <button class="emojibutton" title="play button" onclick="addemoji('▶️')">▶️</button>
            <button class="emojibutton" title="fast-forward button" onclick="addemoji('⏩')">⏩</button>
            <button class="emojibutton" title="next track button" onclick="addemoji('⏭️')">⏭️</button>
            <button class="emojibutton" title="play or pause button" onclick="addemoji('⏯️')">⏯️</button>
            <button class="emojibutton" title="reverse button" onclick="addemoji('◀️')">◀️</button>
            <button class="emojibutton" title="fast reverse button" onclick="addemoji('⏪')">⏪</button>
            <button class="emojibutton" title="last track button" onclick="addemoji('⏮️')">⏮️</button>
            <button class="emojibutton" title="up button" onclick="addemoji('🔼')">🔼</button>
            <button class="emojibutton" title="fast up button" onclick="addemoji('⏫')">⏫</button>
            <button class="emojibutton" title="down button" onclick="addemoji('🔽')">🔽</button>
            <button class="emojibutton" title="fast down button" onclick="addemoji('⏬')">⏬</button>
            <button class="emojibutton" title="pause button" onclick="addemoji('⏸️')">⏸️</button>
            <button class="emojibutton" title="stop button" onclick="addemoji('⏹️')">⏹️</button>
            <button class="emojibutton" title="record button" onclick="addemoji('⏺️')">⏺️</button>
            <button class="emojibutton" title="eject button" onclick="addemoji('⏏️')">⏏️</button>
            <button class="emojibutton" title="cinema" onclick="addemoji('🎦')">🎦</button>
            <button class="emojibutton" title="dim button" onclick="addemoji('🔅')">🔅</button>
            <button class="emojibutton" title="bright button" onclick="addemoji('🔆')">🔆</button>
            <button class="emojibutton" title="antenna bars" onclick="addemoji('📶')">📶</button>
            <button class="emojibutton" title="vibration mode" onclick="addemoji('📳')">📳</button>
            <button class="emojibutton" title="mobile phone off" onclick="addemoji('📴')">📴</button>
            <button class="emojibutton" title="recycling symbol" onclick="addemoji('♻️')">♻️</button>
            <button class="emojibutton" title="name badge" onclick="addemoji('📛')">📛</button>
            <button class="emojibutton" title="fleur-de-lis" onclick="addemoji('⚜️')">⚜️</button>
            <button class="emojibutton" title="Japanese symbol for beginner" onclick="addemoji('🔰')">🔰</button>
            <button class="emojibutton" title="trident emblem" onclick="addemoji('🔱')">🔱</button>
            <button class="emojibutton" title="heavy large circle" onclick="addemoji('⭕')">⭕</button>
            <button class="emojibutton" title="white heavy check mark" onclick="addemoji('✅')">✅</button>
            <button class="emojibutton" title="ballot box with check" onclick="addemoji('☑️')">☑️</button>
            <button class="emojibutton" title="heavy check mark" onclick="addemoji('✔️')">✔️</button>
            <button class="emojibutton" title="heavy multiplication x" onclick="addemoji('✖️')">✖️</button>
            <button class="emojibutton" title="cross mark" onclick="addemoji('❌')">❌</button>
            <button class="emojibutton" title="cross mark button" onclick="addemoji('❎')">❎</button>
            <button class="emojibutton" title="heavy plus sign" onclick="addemoji('➕')">➕</button>
            <button class="emojibutton" title="female sign" onclick="addemoji('♀️')">♀️</button>
            <button class="emojibutton" title="male sign" onclick="addemoji('♂️')">♂️</button>
            <button class="emojibutton" title="medical symbol" onclick="addemoji('⚕️')">⚕️</button>
            <button class="emojibutton" title="heavy minus sign" onclick="addemoji('➖')">➖</button>
            <button class="emojibutton" title="heavy division sign" onclick="addemoji('➗')">➗</button>
            <button class="emojibutton" title="curly loop" onclick="addemoji('➰')">➰</button>
            <button class="emojibutton" title="double curly loop" onclick="addemoji('➿')">➿</button>
            <button class="emojibutton" title="part alternation mark" onclick="addemoji('〽️')">〽️</button>
            <button class="emojibutton" title="eight-spoked asterisk" onclick="addemoji('✳️')">✳️</button>
            <button class="emojibutton" title="eight-pointed star" onclick="addemoji('✴️')">✴️</button>
            <button class="emojibutton" title="sparkle" onclick="addemoji('❇️')">❇️</button>
            <button class="emojibutton" title="double exclamation mark" onclick="addemoji('‼️')">‼️</button>
            <button class="emojibutton" title="exclamation question mark" onclick="addemoji('⁉️')">⁉️</button>
            <button class="emojibutton" title="question mark" onclick="addemoji('❓')">❓</button>
            <button class="emojibutton" title="white question mark" onclick="addemoji('❔')">❔</button>
            <button class="emojibutton" title="white exclamation mark" onclick="addemoji('❕')">❕</button>
            <button class="emojibutton" title="exclamation mark" onclick="addemoji('❗')">❗</button>
            <button class="emojibutton" title="wavy dash" onclick="addemoji('〰️')">〰️</button>
            <button class="emojibutton" title="copyright" onclick="addemoji('©️')">©️</button>
            <button class="emojibutton" title="registered" onclick="addemoji('®️')">®️</button>
            <button class="emojibutton" title="trade mark" onclick="addemoji('™️')">™️</button>
            <button class="emojibutton" title="keycap 0" onclick="addemoji('0️⃣')">0️⃣</button>
            <button class="emojibutton" title="keycap 1" onclick="addemoji('1️⃣')">1️⃣</button>
            <button class="emojibutton" title="keycap 2" onclick="addemoji('2️⃣')">2️⃣</button>
            <button class="emojibutton" title="keycap 3" onclick="addemoji('3️⃣')">3️⃣</button>
            <button class="emojibutton" title="keycap 4" onclick="addemoji('4️⃣')">4️⃣</button>
            <button class="emojibutton" title="keycap 5" onclick="addemoji('5️⃣')">5️⃣</button>
            <button class="emojibutton" title="keycap 6" onclick="addemoji('6️⃣')">6️⃣</button>
            <button class="emojibutton" title="keycap 7" onclick="addemoji('7️⃣')">7️⃣</button>
            <button class="emojibutton" title="keycap 8" onclick="addemoji('8️⃣')">8️⃣</button>
            <button class="emojibutton" title="keycap 9" onclick="addemoji('9️⃣')">9️⃣</button>            
            <button class="emojibutton" title="keycap 10" onclick="addemoji('🔟')">🔟</button>
            <button class="emojibutton" title="100 points" onclick="addemoji('💯')">💯</button>
            <button class="emojibutton" title="input latin uppercase" onclick="addemoji('🔠')">🔠</button>
            <button class="emojibutton" title="input latin lowercase" onclick="addemoji('🔡')">🔡</button>
            <button class="emojibutton" title="input numbers" onclick="addemoji('🔢')">🔢</button>
            <button class="emojibutton" title="input symbols" onclick="addemoji('🔣')">🔣</button>
            <button class="emojibutton" title="input latin letters" onclick="addemoji('🔤')">🔤</button>
            <button class="emojibutton" title="A button (blood type)" onclick="addemoji('🅰️')">🅰️</button>
            <button class="emojibutton" title="AB button (blood type)" onclick="addemoji('🆎')">🆎</button>
            <button class="emojibutton" title="B button (blood type)" onclick="addemoji('🅱️')">🅱️</button>
            <button class="emojibutton" title="CL button" onclick="addemoji('🆑')">🆑</button>
            <button class="emojibutton" title="COOL button" onclick="addemoji('🆒')">🆒</button>
            <button class="emojibutton" title="FREE button" onclick="addemoji('🆓')">🆓</button>
            <button class="emojibutton" title="information" onclick="addemoji('ℹ️')">ℹ️</button>
            <button class="emojibutton" title="ID button" onclick="addemoji('🆔')">🆔</button>
            <button class="emojibutton" title="circled M" onclick="addemoji('Ⓜ️')">Ⓜ️</button>
            <button class="emojibutton" title="NEW button" onclick="addemoji('🆕')">🆕</button>
            <button class="emojibutton" title="NG button" onclick="addemoji('🆖')">🆖</button>
            <button class="emojibutton" title="O button (blood type)" onclick="addemoji('🅾️')">🅾️</button>
            <button class="emojibutton" title="OK button" onclick="addemoji('🆗')">🆗</button>
            <button class="emojibutton" title="P button" onclick="addemoji('🅿️')">🅿️</button>
            <button class="emojibutton" title="SOS button" onclick="addemoji('🆘')">🆘</button>
            <button class="emojibutton" title="UP! button" onclick="addemoji('🆙')">🆙</button>
            <button class="emojibutton" title="VS button" onclick="addemoji('🆚')">🆚</button>
            <button class="emojibutton" title="Japanese “here” button" onclick="addemoji('🈁')">🈁</button>
            <button class="emojibutton" title="Japanese “service charge” button" onclick="addemoji('🈂️')">🈂️</button>
            <button class="emojibutton" title="Japanese “monthly amount” button" onclick="addemoji('🈷️')">🈷️</button>
            <button class="emojibutton" title="Japanese “not free of charge” button" onclick="addemoji('🈶')">🈶</button>
            <button class="emojibutton" title="Japanese “reserved” button" onclick="addemoji('🈯')">🈯</button>
            <button class="emojibutton" title="Japanese “bargain” button" onclick="addemoji('🉐')">🉐</button>
            <button class="emojibutton" title="Japanese “discount” button" onclick="addemoji('🈹')">🈹</button>
            <button class="emojibutton" title="Japanese “free of charge” button" onclick="addemoji('🈚')">🈚</button>
            <button class="emojibutton" title="Japanese “prohibited” button" onclick="addemoji('🈲')">🈲</button>
            <button class="emojibutton" title="Japanese “acceptable” button" onclick="addemoji('🉑')">🉑</button>
            <button class="emojibutton" title="Japanese “application” button" onclick="addemoji('🈸')">🈸</button>
            <button class="emojibutton" title="Japanese “passing grade” button" onclick="addemoji('🈴')">🈴</button>
            <button class="emojibutton" title="Japanese “vacancy” button" onclick="addemoji('🈳')">🈳</button>
            <button class="emojibutton" title="Japanese “congratulations” button" onclick="addemoji('㊗️')">㊗️</button>
            <button class="emojibutton" title="Japanese “secret” button" onclick="addemoji('㊙️')">㊙️</button>
            <button class="emojibutton" title="Japanese “open for business” button" onclick="addemoji('🈺')">🈺</button>
            <button class="emojibutton" title="Japanese “no vacancy” button" onclick="addemoji('🈵')">🈵</button>
            <button class="emojibutton" title="black small square" onclick="addemoji('▪️')">▪️</button>
            <button class="emojibutton" title="white small square" onclick="addemoji('▫️')">▫️</button>
            <button class="emojibutton" title="white medium square" onclick="addemoji('◻️')">◻️</button>
            <button class="emojibutton" title="black medium square" onclick="addemoji('◼️')">◼️</button>
            <button class="emojibutton" title="white medium-small square" onclick="addemoji('◽')">◽</button>
            <button class="emojibutton" title="black medium-small square" onclick="addemoji('◾')">◾</button>
            <button class="emojibutton" title="black large square" onclick="addemoji('⬛')">⬛</button>
            <button class="emojibutton" title="white large square" onclick="addemoji('⬜')">⬜</button>
            <button class="emojibutton" title="large orange diamond" onclick="addemoji('🔶')">🔶</button>
            <button class="emojibutton" title="large blue diamond" onclick="addemoji('🔷')">🔷</button>
            <button class="emojibutton" title="small orange diamond" onclick="addemoji('🔸')">🔸</button>
            <button class="emojibutton" title="small blue diamond" onclick="addemoji('🔹')">🔹</button>
            <button class="emojibutton" title="red triangle pointed up" onclick="addemoji('🔺')">🔺</button>
            <button class="emojibutton" title="red triangle pointed down" onclick="addemoji('🔻')">🔻</button>
            <button class="emojibutton" title="diamond with a dot" onclick="addemoji('💠')">💠</button>
            <button class="emojibutton" title="radio button" onclick="addemoji('🔘')">🔘</button>
            <button class="emojibutton" title="black square button" onclick="addemoji('🔲')">🔲</button>
            <button class="emojibutton" title="white square button" onclick="addemoji('🔳')">🔳</button>
            <button class="emojibutton" title="white circle" onclick="addemoji('⚪')">⚪</button>
            <button class="emojibutton" title="black circle" onclick="addemoji('⚫')">⚫</button>
            <button class="emojibutton" title="red circle" onclick="addemoji('🔴')">🔴</button>
            <button class="emojibutton" title="orange circle" onclick="addemoji('🟠')">🟠</button>
            <button class="emojibutton" title="yellow circle" onclick="addemoji('🟡')">🟡</button>
            <button class="emojibutton" title="green circle" onclick="addemoji('🟢')">🟢</button>
            <button class="emojibutton" title="blue circle" onclick="addemoji('🔵')">🔵</button>
            <button class="emojibutton" title="purple circle" onclick="addemoji('🟣')">🟣</button>
            <button class="emojibutton" title="brown circle" onclick="addemoji('🟤')">🟤</button>
            <button class="emojibutton" title="speech balloon" onclick="addemoji('💬')">💬</button>
            <button class="emojibutton" title="left speech bubble" onclick="addemoji('🗨️')">🗨️</button>
            <button class="emojibutton" title="right anger bubble" onclick="addemoji('🗯️')">🗯️</button>
            <button class="emojibutton" title="thought balloon" onclick="addemoji('💭')">💭</button>
            <button class="emojibutton" title="twelve o'clock" onclick="addemoji('🕛')">🕛</button>
            <button class="emojibutton" title="twelve-thirty" onclick="addemoji('🕧')">🕧</button>
            <button class="emojibutton" title="one o'clock" onclick="addemoji('🕐')">🕐</button>
            <button class="emojibutton" title="one-thirty" onclick="addemoji('🕜')">🕜</button>
            <button class="emojibutton" title="two o'clock" onclick="addemoji('🕑')">🕑</button>
            <button class="emojibutton" title="two-thirty" onclick="addemoji('🕝')">🕝</button>
            <button class="emojibutton" title="three o'clock" onclick="addemoji('🕒')">🕒</button>
            <button class="emojibutton" title="three-thirty" onclick="addemoji('🕞')">🕞</button>
            <button class="emojibutton" title="four o'clock" onclick="addemoji('🕓')">🕓</button>
            <button class="emojibutton" title="four-thirty" onclick="addemoji('🕟')">🕟</button>
            <button class="emojibutton" title="five o'clock" onclick="addemoji('🕔')">🕔</button>
            <button class="emojibutton" title="five-thirty" onclick="addemoji('🕠')">🕠</button>
            <button class="emojibutton" title="six o'clock" onclick="addemoji('🕕')">🕕</button>
            <button class="emojibutton" title="six-thirty" onclick="addemoji('🕡')">🕡</button>
            <button class="emojibutton" title="seven o'clock" onclick="addemoji('🕖')">🕖</button>
            <button class="emojibutton" title="seven-thirty" onclick="addemoji('🕢')">🕢</button>
            <button class="emojibutton" title="eight o'clock" onclick="addemoji('🕗')">🕗</button>
            <button class="emojibutton" title="eight-thirty" onclick="addemoji('🕣')">🕣</button>
            <button class="emojibutton" title="nine o'clock" onclick="addemoji('🕘')">🕘</button>
            <button class="emojibutton" title="nine-thirty" onclick="addemoji('🕤')">🕤</button>
            <button class="emojibutton" title="ten o'clock" onclick="addemoji('🕙')">🕙</button>
            <button class="emojibutton" title="ten-thirty" onclick="addemoji('🕥')">🕥</button>
            <button class="emojibutton" title="eleven o'clock" onclick="addemoji('🕚')">🕚</button>
            <button class="emojibutton" title="eleven-thirty" onclick="addemoji('🕦')">🕦</button>
        </div>
        <div class="emojisec" id="flags">
            <div class="emojiheader">
                <h3>Flags</h3>
            </div>
            <button class="emojibutton" title="chequered flag" onclick="addemoji('🏁')">🏁</button>
            <button class="emojibutton" title="triangular flag" onclick="addemoji('🚩')">🚩</button>
            <button class="emojibutton" title="crossed flags" onclick="addemoji('🎌')">🎌</button>
            <button class="emojibutton" title="black flag" onclick="addemoji('🏴')">🏴</button>
            <button class="emojibutton" title="white flag" onclick="addemoji('🏳️')">🏳️</button>
            <button class="emojibutton" title="rainbow flag" onclick="addemoji('🏳️‍🌈')">🏳️‍🌈</button>
            <button class="emojibutton" title="trans flag" onclick="addemoji('🏳️‍⚧️')">🏳️‍⚧️</button>
            <button class="emojibutton" title="Ascension Island" onclick="addemoji('🇦🇨')">🇦🇨</button>
            <button class="emojibutton" title="Andorra" onclick="addemoji('🇦🇩')">🇦🇩</button>
            <button class="emojibutton" title="United Arab Emirates" onclick="addemoji('🇦🇪')">🇦🇪</button>
            <button class="emojibutton" title="Afghanistan" onclick="addemoji('🇦🇫')">🇦🇫</button>
            <button class="emojibutton" title="Antigua &amp; Barbuda" onclick="addemoji('🇦🇬')">🇦🇬</button>
            <button class="emojibutton" title="Anguilla" onclick="addemoji('🇦🇮')">🇦🇮</button>
            <button class="emojibutton" title="Albania" onclick="addemoji('🇦🇱')">🇦🇱</button>
            <button class="emojibutton" title="Armenia" onclick="addemoji('🇦🇲')">🇦🇲</button>
            <button class="emojibutton" title="Angola" onclick="addemoji('🇦🇴')">🇦🇴</button>
            <button class="emojibutton" title="Antarctica" onclick="addemoji('🇦🇶')">🇦🇶</button>
            <button class="emojibutton" title="Argentina" onclick="addemoji('🇦🇷')">🇦🇷</button>
            <button class="emojibutton" title="American Samoa" onclick="addemoji('🇦🇸')">🇦🇸</button>
            <button class="emojibutton" title="Austria" onclick="addemoji('🇦🇹')">🇦🇹</button>
            <button class="emojibutton" title="Australia" onclick="addemoji('🇦🇺')">🇦🇺</button>
            <button class="emojibutton" title="Aruba" onclick="addemoji('🇦🇼')">🇦🇼</button>
            <button class="emojibutton" title="Åland Islands" onclick="addemoji('🇦🇽')">🇦🇽</button>
            <button class="emojibutton" title="Azerbaijan" onclick="addemoji('🇦🇿')">🇦🇿</button>
            <button class="emojibutton" title="Bosnia &amp; Herzegovina" onclick="addemoji('🇧🇦')">🇧🇦</button>
            <button class="emojibutton" title="Barbados" onclick="addemoji('🇧🇧')">🇧🇧</button>
            <button class="emojibutton" title="Bangladesh" onclick="addemoji('🇧🇩')">🇧🇩</button>
            <button class="emojibutton" title="Belgium" onclick="addemoji('🇧🇪')">🇧🇪</button>
            <button class="emojibutton" title="Burkina Faso" onclick="addemoji('🇧🇫')">🇧🇫</button>
            <button class="emojibutton" title="Bulgaria" onclick="addemoji('🇧🇬')">🇧🇬</button>
            <button class="emojibutton" title="Bahrain" onclick="addemoji('🇧🇭')">🇧🇭</button>
            <button class="emojibutton" title="Burundi" onclick="addemoji('🇧🇮')">🇧🇮</button>
            <button class="emojibutton" title="Benin" onclick="addemoji('🇧🇯')">🇧🇯</button>
            <button class="emojibutton" title="St. Barthélemy" onclick="addemoji('🇧🇱')">🇧🇱</button>
            <button class="emojibutton" title="Bermuda" onclick="addemoji('🇧🇲')">🇧🇲</button>
            <button class="emojibutton" title="Brunei" onclick="addemoji('🇧🇳')">🇧🇳</button>
            <button class="emojibutton" title="Bolivia" onclick="addemoji('🇧🇴')">🇧🇴</button>
            <button class="emojibutton" title="Caribbean Netherlands" onclick="addemoji('🇧🇶')">🇧🇶</button>
            <button class="emojibutton" title="Brazil" onclick="addemoji('🇧🇷')">🇧🇷</button>
            <button class="emojibutton" title="Bahamas" onclick="addemoji('🇧🇸')">🇧🇸</button>
            <button class="emojibutton" title="Bhutan" onclick="addemoji('🇧🇹')">🇧🇹</button>
            <button class="emojibutton" title="Bouvet Island" onclick="addemoji('🇧🇻')">🇧🇻</button>
            <button class="emojibutton" title="Botswana" onclick="addemoji('🇧🇼')">🇧🇼</button>
            <button class="emojibutton" title="Belarus" onclick="addemoji('🇧🇾')">🇧🇾</button>
            <button class="emojibutton" title="Belize" onclick="addemoji('🇧🇿')">🇧🇿</button>
            <button class="emojibutton" title="Canada" onclick="addemoji('🇨🇦')">🇨🇦</button>
            <button class="emojibutton" title="Cocos (Keeling) Islands" onclick="addemoji('🇨🇨')">🇨🇨</button>
            <button class="emojibutton" title="Congo - Kinshasa" onclick="addemoji('🇨🇩')">🇨🇩</button>
            <button class="emojibutton" title="Central African Republic" onclick="addemoji('🇨🇫')">🇨🇫</button>
            <button class="emojibutton" title="Congo - Brazzaville" onclick="addemoji('🇨🇬')">🇨🇬</button>
            <button class="emojibutton" title="Switzerland" onclick="addemoji('🇨🇭')">🇨🇭</button>
            <button class="emojibutton" title="Côte d'Ivoire" onclick="addemoji('🇨🇮')">🇨🇮</button>
            <button class="emojibutton" title="Cook Islands" onclick="addemoji('🇨🇰')">🇨🇰</button>
            <button class="emojibutton" title="Chile" onclick="addemoji('🇨🇱')">🇨🇱</button>
            <button class="emojibutton" title="Cameroon" onclick="addemoji('🇨🇲')">🇨🇲</button>
            <button class="emojibutton" title="China" onclick="addemoji('🇨🇳')">🇨🇳</button>
            <button class="emojibutton" title="Colombia" onclick="addemoji('🇨🇴')">🇨🇴</button>
            <button class="emojibutton" title="Clipperton Island" onclick="addemoji('🇨🇵')">🇨🇵</button>
            <button class="emojibutton" title="Costa Rica" onclick="addemoji('🇨🇷')">🇨🇷</button>
            <button class="emojibutton" title="Cuba" onclick="addemoji('🇨🇺')">🇨🇺</button>
            <button class="emojibutton" title="Cape Verde" onclick="addemoji('🇨🇻')">🇨🇻</button>
            <button class="emojibutton" title="Curaçao" onclick="addemoji('🇨🇼')">🇨🇼</button>
            <button class="emojibutton" title="Christmas Island" onclick="addemoji('🇨🇽')">🇨🇽</button>
            <button class="emojibutton" title="Cyprus" onclick="addemoji('🇨🇾')">🇨🇾</button>
            <button class="emojibutton" title="Czech Republic" onclick="addemoji('🇨🇿')">🇨🇿</button>
            <button class="emojibutton" title="Germany" onclick="addemoji('🇩🇪')">🇩🇪</button>
            <button class="emojibutton" title="Diego Garcia" onclick="addemoji('🇩🇬')">🇩🇬</button>
            <button class="emojibutton" title="Djibouti" onclick="addemoji('🇩🇯')">🇩🇯</button>
            <button class="emojibutton" title="Denmark" onclick="addemoji('🇩🇰')">🇩🇰</button>
            <button class="emojibutton" title="Dominica" onclick="addemoji('🇩🇲')">🇩🇲</button>
            <button class="emojibutton" title="Dominican Republic" onclick="addemoji('🇩🇴')">🇩🇴</button>
            <button class="emojibutton" title="Algeria" onclick="addemoji('🇩🇿')">🇩🇿</button>
            <button class="emojibutton" title="Ceuta &amp; Melilla" onclick="addemoji('🇪🇦')">🇪🇦</button>
            <button class="emojibutton" title="Ecuador" onclick="addemoji('🇪🇨')">🇪🇨</button>
            <button class="emojibutton" title="Estonia" onclick="addemoji('🇪🇪')">🇪🇪</button>
            <button class="emojibutton" title="Egypt" onclick="addemoji('🇪🇬')">🇪🇬</button>
            <button class="emojibutton" title="Western Sahara" onclick="addemoji('🇪🇭')">🇪🇭</button>
            <button class="emojibutton" title="Eritrea" onclick="addemoji('🇪🇷')">🇪🇷</button>
            <button class="emojibutton" title="Spain" onclick="addemoji('🇪🇸')">🇪🇸</button>
            <button class="emojibutton" title="Ethiopia" onclick="addemoji('🇪🇹')">🇪🇹</button>
            <button class="emojibutton" title="European Union" onclick="addemoji('🇪🇺')">🇪🇺</button>
            <button class="emojibutton" title="Finland" onclick="addemoji('🇫🇮')">🇫🇮</button>
            <button class="emojibutton" title="Fiji" onclick="addemoji('🇫🇯')">🇫🇯</button>
            <button class="emojibutton" title="Falkland Islands" onclick="addemoji('🇫🇰')">🇫🇰</button>
            <button class="emojibutton" title="Micronesia" onclick="addemoji('🇫🇲')">🇫🇲</button>
            <button class="emojibutton" title="Faroe Islands" onclick="addemoji('🇫🇴')">🇫🇴</button>
            <button class="emojibutton" title="France" onclick="addemoji('🇫🇷')">🇫🇷</button>
            <button class="emojibutton" title="Gabon" onclick="addemoji('🇬🇦')">🇬🇦</button>
            <button class="emojibutton" title="United Kingdom" onclick="addemoji('🇬🇧')">🇬🇧</button>
            <button class="emojibutton" title="Grenada" onclick="addemoji('🇬🇩')">🇬🇩</button>
            <button class="emojibutton" title="Georgia" onclick="addemoji('🇬🇪')">🇬🇪</button>
            <button class="emojibutton" title="French Guiana" onclick="addemoji('🇬🇫')">🇬🇫</button>
            <button class="emojibutton" title="Guernsey" onclick="addemoji('🇬🇬')">🇬🇬</button>
            <button class="emojibutton" title="Ghana" onclick="addemoji('🇬🇭')">🇬🇭</button>
            <button class="emojibutton" title="Gibraltar" onclick="addemoji('🇬🇮')">🇬🇮</button>
            <button class="emojibutton" title="Greenland" onclick="addemoji('🇬🇱')">🇬🇱</button>
            <button class="emojibutton" title="Gambia" onclick="addemoji('🇬🇲')">🇬🇲</button>
            <button class="emojibutton" title="Guinea" onclick="addemoji('🇬🇳')">🇬🇳</button>
            <button class="emojibutton" title="Guadeloupe" onclick="addemoji('🇬🇵')">🇬🇵</button>
            <button class="emojibutton" title="Equatorial Guinea" onclick="addemoji('🇬🇶')">🇬🇶</button>
            <button class="emojibutton" title="Greece" onclick="addemoji('🇬🇷')">🇬🇷</button>
            <button class="emojibutton" title="South Georgia &amp; South Sandwich Islands" onclick="addemoji('🇬🇸')">🇬🇸</button>
            <button class="emojibutton" title="Guatemala" onclick="addemoji('🇬🇹')">🇬🇹</button>
            <button class="emojibutton" title="Guam" onclick="addemoji('🇬🇺')">🇬🇺</button>
            <button class="emojibutton" title="Guinea-Bissau" onclick="addemoji('🇬🇼')">🇬🇼</button>
            <button class="emojibutton" title="Guyana" onclick="addemoji('🇬🇾')">🇬🇾</button>
            <button class="emojibutton" title="Hong Kong SAR China" onclick="addemoji('🇭🇰')">🇭🇰</button>
            <button class="emojibutton" title="Heard &amp; McDonald Islands" onclick="addemoji('🇭🇲')">🇭🇲</button>
            <button class="emojibutton" title="Honduras" onclick="addemoji('🇭🇳')">🇭🇳</button>
            <button class="emojibutton" title="Croatia" onclick="addemoji('🇭🇷')">🇭🇷</button>
            <button class="emojibutton" title="Haiti" onclick="addemoji('🇭🇹')">🇭🇹</button>
            <button class="emojibutton" title="Hungary" onclick="addemoji('🇭🇺')">🇭🇺</button>
            <button class="emojibutton" title="Canary Islands" onclick="addemoji('🇮🇨')">🇮🇨</button>
            <button class="emojibutton" title="Indonesia" onclick="addemoji('🇮🇩')">🇮🇩</button>
            <button class="emojibutton" title="Ireland" onclick="addemoji('🇮🇪')">🇮🇪</button>
            <button class="emojibutton" title="Israel" onclick="addemoji('🇮🇱')">🇮🇱</button>
            <button class="emojibutton" title="Isle of Man" onclick="addemoji('🇮🇲')">🇮🇲</button>
            <button class="emojibutton" title="India" onclick="addemoji('🇮🇳')">🇮🇳</button>
            <button class="emojibutton" title="British Indian Ocean Territory" onclick="addemoji('🇮🇴')">🇮🇴</button>
            <button class="emojibutton" title="Iraq" onclick="addemoji('🇮🇶')">🇮🇶</button>
            <button class="emojibutton" title="Iran" onclick="addemoji('🇮🇷')">🇮🇷</button>
            <button class="emojibutton" title="Iceland" onclick="addemoji('🇮🇸')">🇮🇸</button>
            <button class="emojibutton" title="Italy" onclick="addemoji('🇮🇹')">🇮🇹</button>
            <button class="emojibutton" title="Jersey" onclick="addemoji('🇯🇪')">🇯🇪</button>
            <button class="emojibutton" title="Jamaica" onclick="addemoji('🇯🇲')">🇯🇲</button>
            <button class="emojibutton" title="Jordan" onclick="addemoji('🇯🇴')">🇯🇴</button>
            <button class="emojibutton" title="Japan" onclick="addemoji('🇯🇵')">🇯🇵</button>
            <button class="emojibutton" title="Kenya" onclick="addemoji('🇰🇪')">🇰🇪</button>
            <button class="emojibutton" title="Kyrgyzstan" onclick="addemoji('🇰🇬')">🇰🇬</button>
            <button class="emojibutton" title="Cambodia" onclick="addemoji('🇰🇭')">🇰🇭</button>
            <button class="emojibutton" title="Kiribati" onclick="addemoji('🇰🇮')">🇰🇮</button>
            <button class="emojibutton" title="Comoros" onclick="addemoji('🇰🇲')">🇰🇲</button>
            <button class="emojibutton" title="St. Kitts &amp; Nevis" onclick="addemoji('🇰🇳')">🇰🇳</button>
            <button class="emojibutton" title="North Korea" onclick="addemoji('🇰🇵')">🇰🇵</button>
            <button class="emojibutton" title="South Korea" onclick="addemoji('🇰🇷')">🇰🇷</button>
            <button class="emojibutton" title="Kuwait" onclick="addemoji('🇰🇼')">🇰🇼</button>
            <button class="emojibutton" title="Cayman Islands" onclick="addemoji('🇰🇾')">🇰🇾</button>
            <button class="emojibutton" title="Kazakhstan" onclick="addemoji('🇰🇿')">🇰🇿</button>
            <button class="emojibutton" title="Laos" onclick="addemoji('🇱🇦')">🇱🇦</button>
            <button class="emojibutton" title="Lebanon" onclick="addemoji('🇱🇧')">🇱🇧</button>
            <button class="emojibutton" title="St. Lucia" onclick="addemoji('🇱🇨')">🇱🇨</button>
            <button class="emojibutton" title="Liechtenstein" onclick="addemoji('🇱🇮')">🇱🇮</button>
            <button class="emojibutton" title="Sri Lanka" onclick="addemoji('🇱🇰')">🇱🇰</button>
            <button class="emojibutton" title="Liberia" onclick="addemoji('🇱🇷')">🇱🇷</button>
            <button class="emojibutton" title="Lesotho" onclick="addemoji('🇱🇸')">🇱🇸</button>
            <button class="emojibutton" title="Lithuania" onclick="addemoji('🇱🇹')">🇱🇹</button>
            <button class="emojibutton" title="Luxembourg" onclick="addemoji('🇱🇺')">🇱🇺</button>
            <button class="emojibutton" title="Latvia" onclick="addemoji('🇱🇻')">🇱🇻</button>
            <button class="emojibutton" title="Libya" onclick="addemoji('🇱🇾')">🇱🇾</button>
            <button class="emojibutton" title="Morocco" onclick="addemoji('🇲🇦')">🇲🇦</button>
            <button class="emojibutton" title="Monaco" onclick="addemoji('🇲🇨')">🇲🇨</button>
            <button class="emojibutton" title="Moldova" onclick="addemoji('🇲🇩')">🇲🇩</button>
            <button class="emojibutton" title="Montenegro" onclick="addemoji('🇲🇪')">🇲🇪</button>
            <button class="emojibutton" title="St. Martin" onclick="addemoji('🇲🇫')">🇲🇫</button>
            <button class="emojibutton" title="Madagascar" onclick="addemoji('🇲🇬')">🇲🇬</button>
            <button class="emojibutton" title="Marshall Islands" onclick="addemoji('🇲🇭')">🇲🇭</button>
            <button class="emojibutton" title="Macedonia" onclick="addemoji('🇲🇰')">🇲🇰</button>
            <button class="emojibutton" title="Mali" onclick="addemoji('🇲🇱')">🇲🇱</button>
            <button class="emojibutton" title="Myanmar (Burma)" onclick="addemoji('🇲🇲')">🇲🇲</button>
            <button class="emojibutton" title="Mongolia" onclick="addemoji('🇲🇳')">🇲🇳</button>
            <button class="emojibutton" title="Macau SAR China" onclick="addemoji('🇲🇴')">🇲🇴</button>
            <button class="emojibutton" title="Northern Mariana Islands" onclick="addemoji('🇲🇵')">🇲🇵</button>
            <button class="emojibutton" title="Martinique" onclick="addemoji('🇲🇶')">🇲🇶</button>
            <button class="emojibutton" title="Mauritania" onclick="addemoji('🇲🇷')">🇲🇷</button>
            <button class="emojibutton" title="Montserrat" onclick="addemoji('🇲🇸')">🇲🇸</button>
            <button class="emojibutton" title="Malta" onclick="addemoji('🇲🇹')">🇲🇹</button>
            <button class="emojibutton" title="Mauritius" onclick="addemoji('🇲🇺')">🇲🇺</button>
            <button class="emojibutton" title="Maldives" onclick="addemoji('🇲🇻')">🇲🇻</button>
            <button class="emojibutton" title="Malawi" onclick="addemoji('🇲🇼')">🇲🇼</button>
            <button class="emojibutton" title="Mexico" onclick="addemoji('🇲🇽')">🇲🇽</button>
            <button class="emojibutton" title="Malaysia" onclick="addemoji('🇲🇾')">🇲🇾</button>
            <button class="emojibutton" title="Mozambique" onclick="addemoji('🇲🇿')">🇲🇿</button>
            <button class="emojibutton" title="Namibia" onclick="addemoji('🇳🇦')">🇳🇦</button>
            <button class="emojibutton" title="New Caledonia" onclick="addemoji('🇳🇨')">🇳🇨</button>
            <button class="emojibutton" title="Niger" onclick="addemoji('🇳🇪')">🇳🇪</button>
            <button class="emojibutton" title="Norfolk Island" onclick="addemoji('🇳🇫')">🇳🇫</button>
            <button class="emojibutton" title="Nigeria" onclick="addemoji('🇳🇬')">🇳🇬</button>
            <button class="emojibutton" title="Nicaragua" onclick="addemoji('🇳🇮')">🇳🇮</button>
            <button class="emojibutton" title="Netherlands" onclick="addemoji('🇳🇱')">🇳🇱</button>
            <button class="emojibutton" title="Norway" onclick="addemoji('🇳🇴')">🇳🇴</button>
            <button class="emojibutton" title="Nepal" onclick="addemoji('🇳🇵')">🇳🇵</button>
            <button class="emojibutton" title="Nauru" onclick="addemoji('🇳🇷')">🇳🇷</button>
            <button class="emojibutton" title="Niue" onclick="addemoji('🇳🇺')">🇳🇺</button>
            <button class="emojibutton" title="New Zealand" onclick="addemoji('🇳🇿')">🇳🇿</button>
            <button class="emojibutton" title="Oman" onclick="addemoji('🇴🇲')">🇴🇲</button>
            <button class="emojibutton" title="Panama" onclick="addemoji('🇵🇦')">🇵🇦</button>
            <button class="emojibutton" title="Peru" onclick="addemoji('🇵🇪')">🇵🇪</button>
            <button class="emojibutton" title="French Polynesia" onclick="addemoji('🇵🇫')">🇵🇫</button>
            <button class="emojibutton" title="Papua New Guinea" onclick="addemoji('🇵🇬')">🇵🇬</button>
            <button class="emojibutton" title="Philippines" onclick="addemoji('🇵🇭')">🇵🇭</button>
            <button class="emojibutton" title="Pakistan" onclick="addemoji('🇵🇰')">🇵🇰</button>
            <button class="emojibutton" title="Poland" onclick="addemoji('🇵🇱')">🇵🇱</button>
            <button class="emojibutton" title="St. Pierre &amp; Miquelon" onclick="addemoji('🇵🇲')">🇵🇲</button>
            <button class="emojibutton" title="Pitcairn Islands" onclick="addemoji('🇵🇳')">🇵🇳</button>
            <button class="emojibutton" title="Puerto Rico" onclick="addemoji('🇵🇷')">🇵🇷</button>
            <button class="emojibutton" title="Palestinian Territories" onclick="addemoji('🇵🇸')">🇵🇸</button>
            <button class="emojibutton" title="Portugal" onclick="addemoji('🇵🇹')">🇵🇹</button>
            <button class="emojibutton" title="Palau" onclick="addemoji('🇵🇼')">🇵🇼</button>
            <button class="emojibutton" title="Paraguay" onclick="addemoji('🇵🇾')">🇵🇾</button>
            <button class="emojibutton" title="Qatar" onclick="addemoji('🇶🇦')">🇶🇦</button>
            <button class="emojibutton" title="Réunion" onclick="addemoji('🇷🇪')">🇷🇪</button>
            <button class="emojibutton" title="Romania" onclick="addemoji('🇷🇴')">🇷🇴</button>
            <button class="emojibutton" title="Serbia" onclick="addemoji('🇷🇸')">🇷🇸</button>
            <button class="emojibutton" title="Russia" onclick="addemoji('🇷🇺')">🇷🇺</button>
            <button class="emojibutton" title="Rwanda" onclick="addemoji('🇷🇼')">🇷🇼</button>
            <button class="emojibutton" title="Saudi Arabia" onclick="addemoji('🇸🇦')">🇸🇦</button>
            <button class="emojibutton" title="Solomon Islands" onclick="addemoji('🇸🇧')">🇸🇧</button>
            <button class="emojibutton" title="Seychelles" onclick="addemoji('🇸🇨')">🇸🇨</button>
            <button class="emojibutton" title="Sudan" onclick="addemoji('🇸🇩')">🇸🇩</button>
            <button class="emojibutton" title="Sweden" onclick="addemoji('🇸🇪')">🇸🇪</button>
            <button class="emojibutton" title="Singapore" onclick="addemoji('🇸🇬')">🇸🇬</button>
            <button class="emojibutton" title="St. Helena" onclick="addemoji('🇸🇭')">🇸🇭</button>
            <button class="emojibutton" title="Slovenia" onclick="addemoji('🇸🇮')">🇸🇮</button>
            <button class="emojibutton" title="Svalbard &amp; Jan Mayen" onclick="addemoji('🇸🇯')">🇸🇯</button>
            <button class="emojibutton" title="Slovakia" onclick="addemoji('🇸🇰')">🇸🇰</button>
            <button class="emojibutton" title="Sierra Leone" onclick="addemoji('🇸🇱')">🇸🇱</button>
            <button class="emojibutton" title="San Marino" onclick="addemoji('🇸🇲')">🇸🇲</button>
            <button class="emojibutton" title="Senegal" onclick="addemoji('🇸🇳')">🇸🇳</button>
            <button class="emojibutton" title="Somalia" onclick="addemoji('🇸🇴')">🇸🇴</button>
            <button class="emojibutton" title="Suriname" onclick="addemoji('🇸🇷')">🇸🇷</button>
            <button class="emojibutton" title="South Sudan" onclick="addemoji('🇸🇸')">🇸🇸</button>
            <button class="emojibutton" title="São Tomé &amp; Príncipe" onclick="addemoji('🇸🇹')">🇸🇹</button>
            <button class="emojibutton" title="El Salvador" onclick="addemoji('🇸🇻')">🇸🇻</button>
            <button class="emojibutton" title="Sint Maarten" onclick="addemoji('🇸🇽')">🇸🇽</button>
            <button class="emojibutton" title="Syria" onclick="addemoji('🇸🇾')">🇸🇾</button>
            <button class="emojibutton" title="Swaziland" onclick="addemoji('🇸🇿')">🇸🇿</button>
            <button class="emojibutton" title="Tristan da Cunha" onclick="addemoji('🇹🇦')">🇹🇦</button>
            <button class="emojibutton" title="Turks &amp; Caicos Islands" onclick="addemoji('🇹🇨')">🇹🇨</button>
            <button class="emojibutton" title="Chad" onclick="addemoji('🇹🇩')">🇹🇩</button>
            <button class="emojibutton" title="French Southern Territories" onclick="addemoji('🇹🇫')">🇹🇫</button>
            <button class="emojibutton" title="Togo" onclick="addemoji('🇹🇬')">🇹🇬</button>
            <button class="emojibutton" title="Thailand" onclick="addemoji('🇹🇭')">🇹🇭</button>
            <button class="emojibutton" title="Tajikistan" onclick="addemoji('🇹🇯')">🇹🇯</button>
            <button class="emojibutton" title="Tokelau" onclick="addemoji('🇹🇰')">🇹🇰</button>
            <button class="emojibutton" title="Timor-Leste" onclick="addemoji('🇹🇱')">🇹🇱</button>
            <button class="emojibutton" title="Turkmenistan" onclick="addemoji('🇹🇲')">🇹🇲</button>
            <button class="emojibutton" title="Tunisia" onclick="addemoji('🇹🇳')">🇹🇳</button>
            <button class="emojibutton" title="Tonga" onclick="addemoji('🇹🇴')">🇹🇴</button>
            <button class="emojibutton" title="Turkey" onclick="addemoji('🇹🇷')">🇹🇷</button>
            <button class="emojibutton" title="Trinidad &amp; Tobago" onclick="addemoji('🇹🇹')">🇹🇹</button>
            <button class="emojibutton" title="Tuvalu" onclick="addemoji('🇹🇻')">🇹🇻</button>
            <button class="emojibutton" title="Taiwan" onclick="addemoji('🇹🇼')">🇹🇼</button>
            <button class="emojibutton" title="Tanzania" onclick="addemoji('🇹🇿')">🇹🇿</button>
            <button class="emojibutton" title="Ukraine" onclick="addemoji('🇺🇦')">🇺🇦</button>
            <button class="emojibutton" title="Uganda" onclick="addemoji('🇺🇬')">🇺🇬</button>
            <button class="emojibutton" title="United Nations" onclick="addemoji('🇺🇳')">🇺🇳</button>
            <button class="emojibutton" title="United States" onclick="addemoji('🇺🇸')">🇺🇸</button>
            <button class="emojibutton" title="Uruguay" onclick="addemoji('🇺🇾')">🇺🇾</button>
            <button class="emojibutton" title="Uzbekistan" onclick="addemoji('🇺🇿')">🇺🇿</button>
            <button class="emojibutton" title="Vatican City" onclick="addemoji('🇻🇦')">🇻🇦</button>
            <button class="emojibutton" title="St. Vincent &amp; Grenadines" onclick="addemoji('🇻🇨')">🇻🇨</button>
            <button class="emojibutton" title="Venezuela" onclick="addemoji('🇻🇪')">🇻🇪</button>
            <button class="emojibutton" title="British Virgin Islands" onclick="addemoji('🇻🇬')">🇻🇬</button>
            <button class="emojibutton" title="U.S. Virgin Islands" onclick="addemoji('🇻🇮')">🇻🇮</button>
            <button class="emojibutton" title="Vietnam" onclick="addemoji('🇻🇳')">🇻🇳</button>
            <button class="emojibutton" title="Vanuatu" onclick="addemoji('🇻🇺')">🇻🇺</button>
            <button class="emojibutton" title="Wallis &amp; Futuna" onclick="addemoji('🇼🇫')">🇼🇫</button>
            <button class="emojibutton" title="Samoa" onclick="addemoji('🇼🇸')">🇼🇸</button>
            <button class="emojibutton" title="Kosovo" onclick="addemoji('🇽🇰')">🇽🇰</button>
            <button class="emojibutton" title="Yemen" onclick="addemoji('🇾🇪')">🇾🇪</button>
            <button class="emojibutton" title="Mayotte" onclick="addemoji('🇾🇹')">🇾🇹</button>
            <button class="emojibutton" title="South Africa" onclick="addemoji('🇿🇦')">🇿🇦</button>
            <button class="emojibutton" title="Zambia" onclick="addemoji('🇿🇲')">🇿🇲</button>
            <button class="emojibutton" title="Zimbabwe" onclick="addemoji('🇿🇼')">🇿🇼</button>            
        </div>
        <div class="emojisec" id="special">
            <div class="emojiheader">
                <h3>Special</h3>
            </div>
            <button class="emojibutton" title="think" onclick="addemoji('<:think:1226311619064234086>')"><img src="https://cdn.discordapp.com/emojis/1226311619064234086.webp?size=96&amp;quality=lossless" alt="think" height="32px"></button>
            <button class="emojibutton" title="amog os" onclick="addemoji('<:amogos:1226314396377288726>')"><img src="https://cdn.discordapp.com/emojis/1226314396377288726.webp?size=96&amp;quality=lossless" alt="amogos" height="32px"></button>
            <button class="emojibutton" title="toasty" onclick="addemoji('<:toasty:1227089807897792605>')"><img src="https://cdn.discordapp.com/emojis/1227089807897792605.webp?size=96&quality=lossless" alt="toasty" height="32px"></button>
            <button class="emojibutton" title="luna" onclick="addemoji('<:luna:1221632755851591740>')"><img src="https://cdn.discordapp.com/emojis/1221632755851591740.webp?size=96&amp;quality=lossless" alt="luna" height="32px"></button>
            <button class="emojibutton" title="noodle" onclick="addemoji('<:noodle:1227131494183473233>')"><img src="https://cdn.discordapp.com/emojis/1227131494183473233.webp?size=96&quality=lossless" alt="noodle" height="32px"></button>
            <button class="emojibutton" title="me" onclick="addemoji('<:me:1221628997025267752>')"><img src="https://cdn.discordapp.com/emojis/1221628997025267752.webp?size=96&amp;quality=lossless" alt="me" height="32px"></button>
            <button class="emojibutton" title="oswal" onclick="addemoji('<:oswal:1226912603931148338>')"><img src="https://cdn.discordapp.com/emojis/1226912603931148338.webp?size=96&quality=lossless" alt="oswal" height="32px"></button>
            <button class="emojibutton" title="melm" onclick="addemoji('<:melm:1248842290806657035>')"><img src="https://cdn.discordapp.com/emojis/1248842290806657035.webp?size=96&quality=lossless" alt="melm" height="32px"></button>
            <button class="emojibutton" title="cta" onclick="addemoji('<:cta:1226913189590073494>')"><img src="https://cdn.discordapp.com/emojis/1226913189590073494.webp?size=96&quality=lossless" alt="cta" height="32px"></button>
            <button class="emojibutton" title="freya" onclick="addemoji('<:freya:1244778372953935922>')"><img src="https://cdn.discordapp.com/emojis/1244778372953935922.webp?size=96&quality=lossless" alt="freya" height="32px"></button>
            <button class="emojibutton" title="atticus" onclick="addemoji('<:atticu:1221630557369405440>')"><img src="https://cdn.discordapp.com/emojis/1221630557369405440.webp?size=96&amp;quality=lossless" alt="atticu" height="32px"></button>
            <button class="emojibutton" title="uggh" onclick="addemoji('<:uggh:1227845267496243242>')"><img src="https://cdn.discordapp.com/emojis/1227845267496243242.webp?size=96&quality=lossless" alt="uggh" height="32px"></button>
            <button class="emojibutton" title=":3" onclick="addemoji('<:33:1226320165302571087>')"><img src="https://cdn.discordapp.com/emojis/1226320165302571087.webp?size=44&quality=lossless" alt=":3" height="32px"></button>
            <button class="emojibutton" title="Cydia" onclick="addemoji('<:Cydia:1226320451278602290>')"><img src="https://cdn.discordapp.com/emojis/1226320451278602290.webp?size=44&quality=lossless" alt="Cydia" height="32px"></button>
            <button class="emojibutton" title="yuhhuh" onclick="addemoji('<:yuhhuh:1227268820213698611>')"><img src="https://cdn.discordapp.com/emojis/1227268820213698611.webp?size=96&quality=lossless" alt="yuhhuh" height="32px"></button>
            <button class="emojibutton" title="nuhhuh" onclick="addemoji('<:nuhhuh:1233290735999258664>')"><img src="https://cdn.discordapp.com/emojis/1233290735999258664.webp?size=96&quality=lossless" alt="nuhhuh" height="32px"></button>
            <button class="emojibutton" title="DebugMan" onclick="addemoji('<:DebugMan2:1226320526037880916>')"><img src="https://cdn.discordapp.com/emojis/1226320526037880916.webp?size=44&quality=lossless" alt="DebugMan" height="32px"></button>
            <button class="emojibutton" title="blobheart" onclick="addemoji('<:blobheart:1226319886867763240>')"><img src="https://cdn.discordapp.com/emojis/1226319886867763240.webp?size=44&quality=lossless" alt="blobheart" height="32px"></button>
            <button class="emojibutton" title="demonetized" onclick="addemoji('<:demonetized:1226320307673894953>')"><img src="https://cdn.discordapp.com/emojis/1226320307673894953.webp?size=44&quality=lossless" alt="demonetized" height="32px"></button>
            <button class="emojibutton" title="GarfTrue" onclick="addemoji('<:GarfTrue:1228207760047472670>')"><img src="https://cdn.discordapp.com/emojis/1228207760047472670.webp?size=44&quality=lossless" alt="GarfTrue" height="32px"></button>
            <button class="emojibutton" title="thubsup" onclick="addemoji('<:thubsup:1229994631840927774>')"><img src="https://cdn.discordapp.com/emojis/1229994631840927774.webp?size=96&quality=lossless" alt="thubsup" height="32px"></button>
            <button class="emojibutton" title="miau" onclick="addemoji('<:miau:1237207275870097519>')"><img src="https://cdn.discordapp.com/emojis/1237207275870097519.webp?size=96&quality=lossless" alt="miau" height="32px"></button>
            <button class="emojibutton" title="marker" onclick="addemoji('<:marker:1238203265229914132>')"><img src="https://cdn.discordapp.com/emojis/1238203265229914132.webp?size=128&quality=lossless" alt="marker" height="32px"></button>
            <button class="emojibutton" title="ow" onclick="addemoji('<:ow:1251723597630931065>')"><img src="https://cdn.discordapp.com/emojis/1251723597630931065.webp?size=128&quality=lossless" alt="ow" height="32px"></button>
            <button class="emojibutton" title="scary" onclick="addemoji('<:scary:1259355757602672651>')"><img src="https://cdn.discordapp.com/emojis/1259355757602672651.webp?size=96&quality=lossless" alt="scary" height="32px"></button>
            <button class="emojibutton" title="wink" onclick="addemoji('<:wink:1260356148968689704>')"><img src="https://cdn.discordapp.com/emojis/1260356148968689704.webp?size=96&quality=lossless" alt="wink" height="32px"></button>
            <button class="emojibutton" title="roxy" onclick="addemoji('<:roxy:1260366574989348955>')"><img src="https://cdn.discordapp.com/emojis/1260366574989348955.webp?size=96&quality=lossless" alt="roxy" height="32px"></button>
            <button class="emojibutton" title="doinkus" onclick="addemoji('<:doinkus:1267307216000782457>')"><img src="https://cdn.discordapp.com/emojis/1267307216000782457.webp?size=96&quality=lossless" alt="doinkus" height="32px"></button>

            <button class="emojibutton" title="yippe" onclick="addemoji('<a:yippe:1226318495147495505>')"><img src="https://cdn.discordapp.com/emojis/1226318495147495505.gif?size=48&quality=lossless&name=yippe" alt="yippe" height="32px"></button>
            <button class="emojibutton" title="hooray" onclick="addemoji('<a:hooray:1230023947777609808>')"><img src="https://cdn.discordapp.com/emojis/1230023947777609808.gif?size=48&quality=lossless&name=hooray" alt="hooray" height="32px"></button>
            <button class="emojibutton" title="boogie" onclick="addemoji('<a:boogie:1226311710818959401>')"><img src="https://cdn.discordapp.com/emojis/1226311710818959401.gif?size=96&amp;quality=lossless" alt="boogie" height="32px"></button>
            <button class="emojibutton" title="ameowdundundun" onclick="addemoji('<a:ameowdundundun:1226319768236331140>')"><img src="https://cdn.discordapp.com/emojis/1226319768236331140.gif?size=48&quality=lossless&name=ameowdundundun" alt="ameowdundundun" height="32px"></button>
            <button class="emojibutton" title="Misc_Hundred" onclick="addemoji('<a:Misc_Hundred:1226319950570983434>')"><img src="https://cdn.discordapp.com/emojis/1226319950570983434.gif?size=48&quality=lossless&name=Misc_Hundred" alt="Misc_Hundred" height="32px"></button>
            <button class="emojibutton" title="kick" onclick="addemoji('<a:kick:1231078387704139967>')"><img src="https://cdn.discordapp.com/emojis/1231078387704139967.gif?size=48&quality=lossless&name=kick" alt="kick" height="32px"></button>
            <button class="emojibutton" title="shake" onclick="addemoji('<a:shake:1227279789472354435>')"><img src="https://cdn.discordapp.com/emojis/1227279789472354435.gif?size=48&quality=lossless&name=shake" alt="shake" height="32px"></button>
            <button class="emojibutton" title="sphere" onclick="addemoji('<a:sphere:1227279796715917362>')"><img src="https://cdn.discordapp.com/emojis/1227279796715917362.gif?size=48&quality=lossless&name=sphere" alt="sphere" height="32px"></button>
            <button class="emojibutton" title="spin" onclick="addemoji('<a:spin:1227279798015889498>')"><img src="https://cdn.discordapp.com/emojis/1227279798015889498.gif?size=48&quality=lossless&name=spin" alt="spin" height="32px"></button>
            <button class="emojibutton" title="squish" onclick="addemoji('<a:squish:1227279787072946189>')"><img src="https://cdn.discordapp.com/emojis/1227279787072946189.gif?size=48&quality=lossless&name=squish" alt="squish" height="32px"></button>
        </div>
    </div>    
    </div>    
`;
}

function groupcat() {
    page = "groupcat";
    pre = "groupcat";
    setTop();
    const pageContainer = document.getElementById("main");
    pageContainer.innerHTML = 
    `
    <h1>GROUP CAT ATTICU EDITION</h1>
    <button onclick="loadchat('home')" class="button blockeduser">AAAH THERE'S TOO MANY</button>
    <div class="groupcat">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 56.6652vw; top: 50.9331vh; animation-delay: -6.49979s; animation-duration: 14.2032s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 4.91153vw; top: 18.259vh; animation-delay: -1.32871s; animation-duration: 14.3195s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 45.3357vw; top: 82.9157vh; animation-delay: -14.7363s; animation-duration: 9.20648s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 37.3383vw; top: 54.4181vh; animation-delay: -9.94348s; animation-duration: 9.57753s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 6.24411vw; top: 85.7608vh; animation-delay: -0.0223908s; animation-duration: 12.0177s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 34.0399vw; top: 79.8261vh; animation-delay: -1.32301s; animation-duration: 13.1273s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 26.8995vw; top: 73.5607vh; animation-delay: -12.1757s; animation-duration: 5.32167s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 51.1875vw; top: 56.7208vh; animation-delay: -7.31183s; animation-duration: 7.25114s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 53.572vw; top: 31.6198vh; animation-delay: -1.01284s; animation-duration: 5.21966s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 63.1717vw; top: 91.7683vh; animation-delay: -1.56812s; animation-duration: 12.4793s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 11.9454vw; top: 54.0909vh; animation-delay: -6.29677s; animation-duration: 11.8255s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 49.7496vw; top: 15.0617vh; animation-delay: -11.8117s; animation-duration: 5.40376s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 83.5586vw; top: 61.4099vh; animation-delay: -4.4065s; animation-duration: 7.5939s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 23.8914vw; top: 61.4587vh; animation-delay: -10.8687s; animation-duration: 14.3228s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 37.8738vw; top: 65.2018vh; animation-delay: -1.27076s; animation-duration: 12.2514s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 52.2085vw; top: 83.5806vh; animation-delay: -3.48581s; animation-duration: 6.57297s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 88.6852vw; top: 51.7688vh; animation-delay: -6.78996s; animation-duration: 14.706s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 65.9482vw; top: 9.87737vh; animation-delay: -3.17515s; animation-duration: 14.1143s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 46.9134vw; top: 9.94203vh; animation-delay: -12.6057s; animation-duration: 7.01384s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 39.7497vw; top: 0.0404414vh; animation-delay: -12.5965s; animation-duration: 11.8729s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 25.0185vw; top: 62.9602vh; animation-delay: -4.19068s; animation-duration: 9.94018s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 57.7607vw; top: 16.1917vh; animation-delay: -4.12669s; animation-duration: 9.79883s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 48.8025vw; top: 9.9478vh; animation-delay: -12.0666s; animation-duration: 13.9631s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 21.6929vw; top: 21.9728vh; animation-delay: -5.14285s; animation-duration: 11.0254s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 28.3006vw; top: 47.836vh; animation-delay: -5.29666s; animation-duration: 13.9682s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 72.1136vw; top: 46.2463vh; animation-delay: -9.84707s; animation-duration: 6.73884s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 11.8019vw; top: 6.63292vh; animation-delay: -11.2257s; animation-duration: 6.75448s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 23.4734vw; top: 96.4724vh; animation-delay: -2.52114s; animation-duration: 8.69464s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 18.654vw; top: 83.4979vh; animation-delay: -11.5153s; animation-duration: 11.9493s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 28.4398vw; top: 98.0237vh; animation-delay: -2.65736s; animation-duration: 11.7907s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 57.7652vw; top: 18.7254vh; animation-delay: -0.45969s; animation-duration: 5.45926s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 62.421vw; top: 53.744vh; animation-delay: -3.92757s; animation-duration: 14.349s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 99.7103vw; top: 11.9954vh; animation-delay: -0.877125s; animation-duration: 10.7634s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 69.4917vw; top: 78.9774vh; animation-delay: -9.39647s; animation-duration: 12.1078s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 73.2123vw; top: 22.4999vh; animation-delay: -11.2006s; animation-duration: 14.344s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 41.3587vw; top: 11.9998vh; animation-delay: -4.35194s; animation-duration: 12.3149s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 60.4695vw; top: 46.7822vh; animation-delay: -14.2508s; animation-duration: 5.46501s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 9.90047vw; top: 69.2093vh; animation-delay: -0.691658s; animation-duration: 10.3712s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 59.6222vw; top: 0.879368vh; animation-delay: -14.6587s; animation-duration: 8.98682s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 43.3682vw; top: 86.3268vh; animation-delay: -1.75571s; animation-duration: 5.93978s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 43.2048vw; top: 16.511vh; animation-delay: -14.8049s; animation-duration: 10.6385s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 18.1629vw; top: 97.9516vh; animation-delay: -0.837998s; animation-duration: 5.08959s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 38.8625vw; top: 38.7213vh; animation-delay: -12.2966s; animation-duration: 9.45021s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 28.9548vw; top: 29.924vh; animation-delay: -6.80495s; animation-duration: 11.4562s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 55.3735vw; top: 91.1392vh; animation-delay: -0.826462s; animation-duration: 5.19364s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 79.486vw; top: 81.2393vh; animation-delay: -3.12231s; animation-duration: 8.79663s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 80.6084vw; top: 39.36vh; animation-delay: -13.8327s; animation-duration: 11.7898s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 40.7018vw; top: 19.6449vh; animation-delay: -10.508s; animation-duration: 10.1169s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 97.0306vw; top: 4.90393vh; animation-delay: -14.5341s; animation-duration: 8.00388s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 70.7537vw; top: 41.1993vh; animation-delay: -10.1744s; animation-duration: 14.0328s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 60.3633vw; top: 22.9261vh; animation-delay: -5.24413s; animation-duration: 10.8716s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 59.236vw; top: 23.9414vh; animation-delay: -6.16334s; animation-duration: 10.4404s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 29.393vw; top: 34.6555vh; animation-delay: -12.6958s; animation-duration: 8.66129s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 87.1784vw; top: 88.0215vh; animation-delay: -10.4089s; animation-duration: 10.9882s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 26.0858vw; top: 26.1819vh; animation-delay: -10.0662s; animation-duration: 13.1198s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 75.6456vw; top: 55.5677vh; animation-delay: -4.93865s; animation-duration: 11.8557s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 86.8212vw; top: 79.2443vh; animation-delay: -5.10446s; animation-duration: 6.76114s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 55.743vw; top: 27.582vh; animation-delay: -10.1167s; animation-duration: 13.3484s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 59.0122vw; top: 2.77725vh; animation-delay: -7.41559s; animation-duration: 12.9276s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 58.2762vw; top: 66.1408vh; animation-delay: -7.06835s; animation-duration: 13.6349s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 24.3372vw; top: 74.987vh; animation-delay: -10.8446s; animation-duration: 8.04605s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 15.4593vw; top: 96.8344vh; animation-delay: -2.05856s; animation-duration: 10.9207s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 35.6114vw; top: 32.9079vh; animation-delay: -7.35237s; animation-duration: 9.51646s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 48.592vw; top: 50.2003vh; animation-delay: -5.27766s; animation-duration: 6.0217s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 59.3881vw; top: 18.1104vh; animation-delay: -10.4263s; animation-duration: 9.25792s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 57.2766vw; top: 36.2141vh; animation-delay: -13.8436s; animation-duration: 11.5643s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 62.4844vw; top: 48.5927vh; animation-delay: -8.72176s; animation-duration: 12.9203s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 54.7835vw; top: 49.8909vh; animation-delay: -14.3464s; animation-duration: 9.97518s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 37.0141vw; top: 62.9967vh; animation-delay: -10.598s; animation-duration: 12.656s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 28.3549vw; top: 61.0806vh; animation-delay: -4.41274s; animation-duration: 5.42642s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 45.1161vw; top: 75.0632vh; animation-delay: -8.60798s; animation-duration: 12.7761s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 26.24vw; top: 51.9477vh; animation-delay: -3.79373s; animation-duration: 14.8319s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 73.623vw; top: 2.58591vh; animation-delay: -13.2526s; animation-duration: 12.1627s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 33.1946vw; top: 9.05399vh; animation-delay: -11.6574s; animation-duration: 9.87972s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 1.58802vw; top: 56.1942vh; animation-delay: -2.7505s; animation-duration: 11.8342s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 10.6931vw; top: 28.0722vh; animation-delay: -9.26487s; animation-duration: 10.7166s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 43.6183vw; top: 30.0863vh; animation-delay: -13.1958s; animation-duration: 11.1865s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 12.1vw; top: 67.8954vh; animation-delay: -13.927s; animation-duration: 5.14334s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 73.1589vw; top: 2.71029vh; animation-delay: -9.07103s; animation-duration: 6.19745s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 13.0037vw; top: 99.544vh; animation-delay: -3.05857s; animation-duration: 14.2727s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 18.2206vw; top: 8.39347vh; animation-delay: -11.3614s; animation-duration: 11.8138s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 9.15629vw; top: 16.0227vh; animation-delay: -6.22675s; animation-duration: 13.4034s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 68.6424vw; top: 75.0417vh; animation-delay: -4.98173s; animation-duration: 14.1731s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 0.575163vw; top: 57.1744vh; animation-delay: -10.9046s; animation-duration: 6.18349s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 39.4578vw; top: 96.429vh; animation-delay: -7.51116s; animation-duration: 5.36905s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 33.7323vw; top: 85.5577vh; animation-delay: -6.42537s; animation-duration: 14.9106s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 79.1985vw; top: 76.0052vh; animation-delay: -4.03953s; animation-duration: 10.4579s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 22.8221vw; top: 6.45191vh; animation-delay: -6.87477s; animation-duration: 5.57475s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 20.4706vw; top: 85.0177vh; animation-delay: -13.1881s; animation-duration: 5.14277s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 89.6953vw; top: 87.9562vh; animation-delay: -0.925815s; animation-duration: 6.23621s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 45.6752vw; top: 56.4953vh; animation-delay: -14.0929s; animation-duration: 6.29266s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 10.0902vw; top: 19.7134vh; animation-delay: -6.01674s; animation-duration: 9.39678s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 50.0972vw; top: 92.4296vh; animation-delay: -0.877207s; animation-duration: 11.586s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 50.2487vw; top: 67.6996vh; animation-delay: -7.40206s; animation-duration: 6.85467s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 62.1741vw; top: 31.3422vh; animation-delay: -11.8495s; animation-duration: 9.20556s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 42.2675vw; top: 30.4503vh; animation-delay: -6.90177s; animation-duration: 5.72739s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 78.3379vw; top: 77.2612vh; animation-delay: -2.34853s; animation-duration: 11.1745s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 85.7201vw; top: 69.1797vh; animation-delay: -1.74139s; animation-duration: 8.55524s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 44.8887vw; top: 77.1469vh; animation-delay: -10.7357s; animation-duration: 10.0497s;">
        <img class="groupcat-cat" alt="MEOW" title="MEOW" src="images/atticu.png" height="100" style="left: 6.17108vw; top: 67.4407vh; animation-delay: -2.26017s; animation-duration: 7.65046s;">
        <div id='msgs'></div>
    </div>
    `; 
}