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
    msg.setRangeText(emoji, msg.selectionStart, msg.selectionEnd, "end");
    autoresize();
    event.preventDefault();
    if (event) {
        if (!event.shiftKey) {
            closepicker();
            msg.focus();
        }
    }
    closemodal();
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
        sidebarButton.onclick = () => emjpage(`custom-${chat._id}`);

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
                chatIconElem.style.border = "2px solid #" + '1f5831';
            } else if (chat.icon_color) {
                chatIconElem.style.border = "2px solid #" + chat.icon_color;
            } else {
                chatIconElem.style.border = "2px solid #" + '000';
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
                    chatIconElem.style.border = pfpElem.style.border.replace("3px", "2px");
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
        section.id = `custom-${chat._id}`;
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

function uploadEmojiModal(chatid) {
    document.documentElement.style.overflow = "hidden";
    
    const mdlbck = document.querySelector('.modal-back');
    if (mdlbck) {
        mdlbck.style.display = 'flex';
        
        const mdl = mdlbck.querySelector('.modal');
        mdl.id = 'mdl-uptd';
        if (mdl) {
            const mdlt = mdl.querySelector('.modal-top');
            if (mdlt) {
                mdlt.innerHTML = `
                <h3>${lang().action.uploademoji}</h3>
                <div>
                <input id="emoji-nick-input" class="mdl-inp" placeholder="${lang().action.name}" minlength="1" maxlength="32">
                <input type="file" id="emoji-file" class="mdl-file" accept="image/png,image/jpeg,image/webp,image/gif" onchange="preUploadEmoji()">
                </div>
                `;
            }
            const mdbt = mdl.querySelector('.modal-bottom');
            if (mdbt) {
                mdbt.innerHTML = `
                <button id="create-emoji" class="modal-back-btn" onclick="uploadEmoji('${chatid}')">${lang().action.create}</button>
                `;
            }
        }
    }
}

function editEmojiName(chatid, emojiid, name) {
    document.documentElement.style.overflow = "hidden";
    
    const mdlbck = document.querySelector('.modal-back');
    if (mdlbck) {
        mdlbck.style.display = 'flex';
        
        const mdl = mdlbck.querySelector('.modal');
        mdl.id = 'mdl-uptd';
        if (mdl) {
            const mdlt = mdl.querySelector('.modal-top');
            if (mdlt) {
                mdlt.innerHTML = `
                <h3>${lang().action.editemoji}</h3>
                <div>
                <input id="emoji-nick-input" class="mdl-inp" placeholder="${escapeHTML(name)}" minlength="1" maxlength="32">
                </div>
                `;
            }
            const mdbt = mdl.querySelector('.modal-bottom');
            if (mdbt) {
                mdbt.innerHTML = `
                <button id="create-emoji" class="modal-back-btn" onclick="pushEmojiName('${chatid}', '${emojiid}')">${lang().action.confirm}</button>
                `;
            }
        }
    }
}

async function pushEmojiName(chatid, emojiId) {
    const name = document.getElementById('emoji-nick-input').value; // emoji name probably
    const createBtn = document.getElementById("create-emoji");
    createBtn.innerText = "Updating...";
    const apiResp = await fetch(`https://api.meower.org/chats/${chatid}/emojis/${emojiId}`, {
        method: "PATCH",
        headers: {
            'Content-Type': 'application/json',
            token: localStorage.getItem("token"),
        },
        body: JSON.stringify({ name }),
    });

    closemodal("Emoji updated!"); // add localization to these
}

async function removeEmoji(chatid, emojiId) {
    const apiResp = await fetch(`https://api.meower.org/chats/${chatid}/emojis/${emojiId}`, {
        method: "Delete",
        headers: {
            'Content-Type': 'application/json',
            token: localStorage.getItem("token"),
        },
        body: JSON.stringify({ name }),
    });

    closemodal("Emoji deleted!");
}

function preUploadEmoji() {
    const file = document.getElementById('emoji-file').files[0];
    if (file.size > 1 << 20) {
        closemodal("File too large! Emojis can be a maximum of 1 MiB.");
    } else if (!["image/png", "image/jpeg", "image/webp", "image/gif"].includes(file.type)) {
        closemodal("Unsupported file type! An emoji must be a PNG, JPEG, WebP, or GIF.");
    }

    const nick = document.getElementById('emoji-nick-input');
    nick.value = file.name.split('.').slice(0, -1).join('.');
}

async function uploadEmoji(chatid) {
    const name = document.getElementById('emoji-nick-input').value; // emoji name probably
    const file = document.getElementById('emoji-file').files[0]; // emoji file probably need to redo these
    const createBtn = document.getElementById("create-emoji");

    createBtn.disabled = true;

    createBtn.innerText = "Uploading...";
    const formData = new FormData();
    formData.append("file", file);
    const uploadsResp = await fetch("https://uploads.meower.org/emojis", {
        method: "POST",
        headers: { Authorization: localStorage.getItem("token") },
        body: formData,
    });
    const emojiId = (await uploadsResp.json()).id;

    createBtn.innerText = "Creating...";
    const apiResp = await fetch(`https://api.meower.org/chats/${chatid}/emojis/${emojiId}`, {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json',
            token: localStorage.getItem("token"),
        },
        body: JSON.stringify({ name }),
    });

    closemodal("Emoji created!");
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

function emjpagem(page) {
    const cc = document.querySelectorAll(".emojisec-mobile");
    cc.forEach(function(dd) {
        dd.style.removeProperty("display")
    });
    document.getElementById(page).style.display = "grid";
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
                <div class="emojicont-mobile"></div>
                `;
            }
            const mdbt = mdl.querySelector('.modal-bottom');
            if (mdbt) {
                mdbt.innerHTML = `
                <div class="emojisidebar-mobile"></div>
                `;
            }
            let ag = 1;
            for (const chat of Object.values(chatCache)) {
                const customEmojis = chat.emojis;
                if (!customEmojis.length) continue;

                const sidebarButton = document.createElement("button");
                sidebarButton.classList.add("emojibuttonside-mobile");
                sidebarButton.onclick = () => emjpagem(`custom-${chat._id}`);

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
                        chatIconElem.style.border = "2px solid #" + '1f5831';
                    } else if (chat.icon_color) {
                        chatIconElem.style.border = "2px solid #" + chat.icon_color;
                    } else {
                        chatIconElem.style.border = "2px solid #" + '000';
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
                            chatIconElem.style.border = pfpElem.style.border.replace("3px", "2px");
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

                mdbt.querySelector(".emojisidebar-mobile").appendChild(sidebarButton);

                const section = document.createElement("div");
                section.classList.add("emojisec-mobile");
                section.id = `custom-${chat._id}`;
                if (ag) {
                    section.style.display = "grid"
                }
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
                mdlt.querySelector(".emojicont-mobile").appendChild(section);
                ag = 0;
            }
        }
    }
}

function pickerhtm() {
    let emojisidebar = ``
    let emojicont = `<div class="emojisearch"><input type="text" class="emjinpt" id="emojin" placeholder="Find the perfect emoji..." autofill="none"></div>`
    for (const [id, value] of Object.entries(defaultEmoji)) {
        let emojisec = `<div class="emojiheader"><h3>${value.name}</h3></div>`
        for (const [title, emoji] of Object.entries(value.emoji)) {
            emojisec += `<button class="emojibutton" title="${title}" onclick="addemoji('${emoji}')">${emoji}</button>`
        }
        emojisidebar += `<button class="emojibuttonside" onclick="emjpage('${id}')">${value.icon}</button>`
        emojicont += `<div class="emojisec" id="${id}" style="display: flex;">${emojisec}</div>`
    }
    return `<div class="emojisidebar">${emojisidebar}</div><div class="emojicont">${emojicont}</div>`;
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
