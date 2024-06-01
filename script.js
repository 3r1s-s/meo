// yes its a mess
// no i wont do anything about it
// - Eris

let end = false;
let page = "load";
const sidediv = document.querySelectorAll(".side");
    sidediv.forEach(function(sidediv) {
        sidediv.classList.add("hidden");
    });
let lul = 0;
let eul;
let sul = "";
let pre = settingsstuff().homepage ? 'home' : 'start';

let bridges = ['Discord', 'SplashBridge', 'gc', 'Revower'];

let ipBlocked = false;
let openprofile = false;

const communityDiscordLink = "https://discord.com/invite/THgK9CgyYJ";
const forumLink = "https://forums.meower.org";
const server = "wss://server.meower.org/";

const pfpCache = {};
const postCache = { livechat: [] };  // {chatId: [post, post, ...]} (up to 25 posts for inactive chats)
const chatCache = {}; // {chatId: chat}
const blockedUsers = {}; // {user, user}

let favoritedChats = [];  // [chatId, ...]

let pendingAttachments = [];

let blockedWords;

if (localStorage.getItem("blockedWords")) {
    blockedWords = JSON.parse(localStorage.getItem("blockedWords"));
} else {
    blockedWords = {};
}

let lastTyped = 0;

setAccessibilitySettings()
loadSavedPlugins();
loadCustomCss();
loadCustomTheme();

function replsh(rpl) {
    const trimmedString = rpl.length > 25 ?
        rpl.substring(0, 22) + "..." :
        rpl;
    return trimmedString;
}
// make it so when reconnect happens it goes back to the prev screen and not the start page
function main() {
    meowerConnection = new WebSocket(server);
    let loggedin = false;

    meowerConnection.addEventListener('error', function(event) {
        //launch screen
    });
    
    meowerConnection.onclose = (event) => {
        logout(true);
    };
    page = "login";
    loadtheme();
    
    if ('windowControlsOverlay' in navigator) {
        console.log("PWA!!!!");
    }
      
    meowerConnection.onmessage = (event) => {
        console.log("INC: " + event.data);

        const sentdata = JSON.parse(event.data);
        let data
        if (sentdata.val == "I:112 | Trusted Access enabled") {
            data = {
                cmd: "direct",
                val: {
                    cmd: "type",
                    val: "js"
                }
            };

            meowerConnection.send(JSON.stringify(data));
            console.log("OUT: " + JSON.stringify(data));

            data = {
                cmd: "direct",
                val: "meower"
            };

            meowerConnection.send(JSON.stringify(data));
            console.log("OUT: " + JSON.stringify(data));
            if (localStorage.getItem("token") != undefined && localStorage.getItem("username") != undefined) {
                login(localStorage.getItem("username"), localStorage.getItem("token"));
            } else {
                loadLogin();
            };
        } else if (sentdata.listener == "auth") {
            if (sentdata.val.mode && sentdata.val.mode == "auth") {
                sentdata.val.payload.relationships.forEach((relationship) => {
                    if (relationship.state === 2) {
                        blockedUsers[relationship.username] = true;
                    }
                });
                localStorage.setItem("username", sentdata.val.payload.username);
                localStorage.setItem("token", sentdata.val.payload.token);
                localStorage.setItem("permissions", sentdata.val.payload.account.permissions);
                favoritedChats = sentdata.val.payload.account.favorited_chats;
                loggedin = true;
                sidebars();
                
                // work on this
                if (pre !== "") {
                    if (pre === "home") {
                        loadhome();
                    } else if (pre === "explore") {
                        loadexplore();
                    } else if (pre === "start") {
                        loadstart();
                    } else if (pre === "settings") {
                        loadstgs();
                    } else {
                        loadchat(pre);
                    }                
                } else  {
                    loadstart();
                }
                if (openprofile) {
                    openUsrModal(localStorage.getItem("username"));
                }
                console.log("Logged in!");
            } else if (sentdata.cmd == "statuscode" && sentdata.val != "I:100 | OK") {
                toggleLogin(false);
                if ("token" in localStorage)
                    logout(false);
                switch (sentdata.val) {
                    case "I:015 | Account exists":
                        openUpdate(lang().info.accexists);
                        break;
                    case "E:103 | ID not found":
                        openUpdate(lang().info.invaliduser);
                        break;
                    case "I:011 | Invalid Password":
                        openUpdate(lang().info.invalidpass);
                        break;
                    case "E:018 | Account Banned":
                        openUpdate(lang().info.accbanned);
                        break;
                    case "E:025 | Deleted":
                        openUpdate(lang().info.accdeleted);
                        break;
                    case "E:110 | ID conflict":
                        openUpdate(lang().info.conflict);
                        break;
                    default:
                        openUpdate(`${lang().info.unknown} ${sentdata.val}`);
                        break;
                }
            }
        } else if (loggedin && sentdata.val.post_origin) {
            let postOrigin = sentdata.val.post_origin;
            if (postCache[postOrigin]) {
                postCache[postOrigin].push(sentdata.val);
                if (page === postOrigin) {
                    loadpost(sentdata.val);
                } else if (postCache[postOrigin].length >= 24) {
                    postCache[postOrigin].shift();
                }
            }
        } else if (end) {
            return 0;
        } else if (sentdata.val.mode == "update_config") {
            if (sentdata.val.payload.favorited_chats) {
                favoritedChats = sentdata.val.payload.favorited_chats;
                renderChats();
            }
        } else if (sentdata.val.mode == "update_profile") {
            let username = sentdata.val.payload._id;
            if (pfpCache[username]) {
                delete pfpCache[username];
                loadPfp(username, 0)
                    .then(pfpElement => {
                        if (pfpElement) {
                            pfpCache[username] = pfpElement.cloneNode(true);
                            for (const elem of document.getElementsByClassName("avatar")) {
                                if (elem.getAttribute("data-username") !== username) continue;
                                elem.replaceWith(pfpElement.cloneNode(true));
                            }
                        }
                    });
            }
        } else if (sentdata.val.mode == "update_post") {
            let postOrigin = sentdata.val.payload.post_origin;
            if (postCache[postOrigin]) {
                index = postCache[postOrigin].findIndex(post => post._id === sentdata.val.payload._id);
                if (index !== -1) {
                    postCache[postOrigin][index] = Object.assign(
                        postCache[postOrigin][index],
                        sentdata.val.payload
                    );
                }
            }
            if (document.getElementById(sentdata.val.payload.post_id)) {
                loadpost(sentdata.val.payload);
            }
        } else if (sentdata.val.mode == "create_chat") {
            chatCache[sentdata.val.payload._id] = sentdata.val.payload;
            renderChats();
        } else if (sentdata.val.mode == "update_chat") {
            const chatId = sentdata.val.payload._id;
            if (chatId in chatCache) {
                chatCache[chatId] = Object.assign(
                    chatCache[chatId],
                    sentdata.val.payload
                );
                renderChats();
            }
        } else if (sentdata.cmd == "ulist") {
            const iul = sentdata.val;
            sul = iul.trim().split(";");
            eul = sul;
            lul = sul.length - 1;
            
            if (sul.length > 1) {
                sul = sul.slice(0, -2).join(", ") + (sul.length > 2 ? ", " : "") + sul.slice(-2).join(".");
            } else {
                sul = sul[0];
            }
        
            if (page == "home") {
                document.getElementById("info").innerText = lul + " users online (" + sul + ")";
            }
        } else if (sentdata.val.mode == "delete") {
            console.log("Received delete command for ID:", sentdata.val.id);

            if (chatCache[sentdata.val.id]) {
                delete chatCache[sentdata.val.id];
            }
            if (postCache[sentdata.val.id]) {
                delete postCache[sentdata.val.id];
            }
            for (const key in postCache) {
                const index = postCache[key].findIndex(post => post._id === sentdata.val.id);
                if (index !== -1) {
                    postCache[key].splice(index, 1);
                    break;
                }
            }

            const divToDelete = document.getElementById(sentdata.val.id);
            if (divToDelete) {
                divToDelete.parentNode.removeChild(divToDelete);
                if (page === sentdata.val.id) {
                    openUpdate(lang().info.chatremoved);
                    if (!settingsstuff().homepage) {
                        loadstart();
                    } else {
                        loadhome();
                    }
                }
                console.log(sentdata.val.id, "deleted successfully.");
            } else {
                console.warn(sentdata.val.id, "not found.");
            }
        } else if (sentdata.listener == "chpw") {
            if (sentdata.val === 'I:100 | OK') {
                closemodal(lang().info.passupdate)
            }
        }
    };
    document.addEventListener("keydown", function(event) {
        if (page !== "settings" && page !== "explore" && page !== "login" && page !== "start") {
            const textarea = document.getElementById("msg");
            const emj = document.getElementById("emojin");
            if (event.key === "Enter" && !event.shiftKey) {
                if (settingsstuff().entersend) {
                    if (textarea === document.activeElement) {

                    } else if (emj === document.activeElement) {
                        if (opened === 1) {
                            fstemj();
                        }
                    }
                } else {
                    if (textarea === document.activeElement) {
                        event.preventDefault();
                        sendpost();
                        textarea.style.height = 'auto';
                    } else {
                        if (emj === document.activeElement) {
                            if (opened === 1) {
                                fstemj();
                            }
                        }
                    }
                }
            } else if (event.key === "Escape") {
                closemodal();
                closeImage();
                if (opened===1) {
                    closepicker();
                }
                const editIndicator = document.getElementById("edit-indicator");
                if (editIndicator.hasAttribute("data-postid")) {
                    cancelEdit();
                }
                textarea.blur();
            } else if (event.keyCode >= 48 && event.keyCode <= 90 && textarea === document.activeElement && !settingsstuff().invtyping && lastTyped+3000 < Date.now()) {
                lastTyped = Date.now();
                fetch(`https://api.meower.org/${page === "home" ? "" : "chats/"}${page}/typing`, {
                    method: "POST",
                    headers: { token: localStorage.getItem("token") }
                });
            }
        }
    });
    addEventListener("DOMContentLoaded", () => {
        document.onpaste = (event) => {
            if (!document.getElementById("msg")) return;
    
            const files = Array.from(event.clipboardData.files);
            if (files.some(file => file.size > (25 << 20))) {
                errorModal("File too large", "Please upload files smaller than 25MiB.");
                return;
            }
    
            for (const file of files) {
                const formData = new FormData();
                formData.append('file', file);
                pendingAttachments.push({
                    id: Math.random(),
                    file,
                    req: fetch('https://uploads.meower.org/attachments', {
                        method: 'POST',
                        headers: { Authorization: localStorage.getItem("token") },
                        body: formData
                    })
                    .then(response => {
                        return response.json();
                    })
                    .catch(error => errorModal("Error uploading attachment", error))
                });
            }
            setAttachmentContainer();
        };
    });
    addEventListener("keydown", (event) => {
        if (!event.ctrlKey && event.keyCode >= 48 && event.keyCode <= 90) {
            if (!document.activeElement || (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA')) {
                document.getElementById("msg").focus();
            }
        } else if ((event.ctrlKey || event.metaKey) && event.key === 's') {
            if (page !== "settings" && page !== "explore" && page !== "login" && page !== "start") {
                event.preventDefault();
                togglePicker();
            }
        } else if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
            if (postCache[page]) {
                event.preventDefault();

                const post = [...postCache[page]].reverse().find(post => post.u === localStorage.getItem("username"));
                if (post) {
                    editPost(page, post._id);
                }
            }
        } else if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
            if (!document.activeElement || (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA')) {
                if (page !== "settings" && page !== "explore" && page !== "login" && page !== "start") {
                    document.getElementById("msg").focus();
                }
            }
        } else if ((event.ctrlKey || event.metaKey) && event.key === 'u') {
            if (page !== "settings" && page !== "explore" && page !== "login" && page !== "start") {
                event.preventDefault();
                const editIndicator = document.getElementById("edit-indicator");
                if (!editIndicator.hasAttribute("data-postid")) {
                    addAttachment();
                }
            }
        } else if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
            event.preventDefault();
            goAnywhere();
        } else if ((event.ctrlKey || event.metaKey) && event.key === '/') {
            event.preventDefault();
            document.getElementById("msg").focus();
        }
    });
}

function loadLogin() {
    const pageContainer = document.getElementById("main");
    pageContainer.innerHTML = 
    `<div class='login'>
        <div class='login-inner'>
            <h2 class="login-header">${lang().meo_welcome}</h2>
            <input type='text' id='userinput' placeholder='${lang().meo_username}' class='login-text text' aria-label="username input" autocomplete="username">
            <input type='password' id='passinput' placeholder='${lang().meo_password}' class='login-text text' aria-label="password input" autocomplete="current-password">
            <input type='button' id='login' value='${lang().action.login}' class='login-button button' onclick='toggleLogin(true);login(document.getElementById("userinput").value, document.getElementById("passinput").value)' aria-label="Register">
            <input type='button' id='signup' value='${lang().action.signup}' class='login-button button' onclick='agreementModal()' aria-label="log in">
            <small>${lang().login_sub.desc}</small>
        </div>
        <div class="login-top">
            <select id="login-language-sel" onchange="loginLang(this.value)">
            <option value="en" ${language === "en" ? "selected" : ""}>${en.language}</option>
            <option value="enuk" ${language === "enuk" ? "selected" : ""}>${enuk.language}</option>
            <option value="es" ${language === "es" ? "selected" : ""}>${es.language}</option>
            <option value="de" ${language === "de" ? "selected" : ""}>${de.language}</option>
        </select>
        </div>
        <div class="login-back">
            <svg viewBox="0 0 640 241" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M640 125.573V240.972H0V0.0817643C55.9126 -1.18277 109.819 12.2262 158.654 39.893C178.197 51.0356 196.768 64.3924 215.342 77.752C231.898 89.6595 248.457 101.569 265.708 111.915C317.851 143.196 376.397 159.929 437.266 158.287C469.927 157.428 505.114 149.607 540.103 141.831C568.471 135.526 596.708 129.251 623.362 126.737C628.896 126.215 634.448 125.82 640 125.573Z" fill="currentColor"/>
            </svg>
        </div>
        <div class='login-bottom'>
            <a href="https://github.com/3r1s-s" target="_blank" class="info-button">
                <svg viewBox="0 0 24 24" height="24" width="24" aria-hidden="true" focusable="false" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" d="M12.026 2c-5.509 0-9.974 4.465-9.974 9.974 0 4.406 2.857 8.145 6.821 9.465.499.09.679-.217.679-.481 0-.237-.008-.865-.011-1.696-2.775.602-3.361-1.338-3.361-1.338-.452-1.152-1.107-1.459-1.107-1.459-.905-.619.069-.605.069-.605 1.002.07 1.527 1.028 1.527 1.028.89 1.524 2.336 1.084 2.902.829.091-.645.351-1.085.635-1.334-2.214-.251-4.542-1.107-4.542-4.93 0-1.087.389-1.979 1.024-2.675-.101-.253-.446-1.268.099-2.64 0 0 .837-.269 2.742 1.021a9.582 9.582 0 0 1 2.496-.336 9.554 9.554 0 0 1 2.496.336c1.906-1.291 2.742-1.021 2.742-1.021.545 1.372.203 2.387.099 2.64.64.696 1.024 1.587 1.024 2.675 0 3.833-2.33 4.675-4.552 4.922.355.308.675.916.675 1.846 0 1.334-.012 2.41-.012 2.737 0 .267.178.577.687.479C19.146 20.115 22 16.379 22 11.974 22 6.465 17.535 2 12.026 2z" clip-rule="evenodd"></path>
                </svg>
            </a>
            <a href="https://discord.gg/gjdKksMjMs" target="_blank" class="info-button">
                <svg width="24" height="24" viewBox="0 0 24 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.3303 1.52336C18.7535 0.80145 17.0889 0.289302 15.3789 0C15.1449 0.418288 14.9332 0.848651 14.7447 1.28929C12.9233 1.01482 11.071 1.01482 9.24963 1.28929C9.06097 0.848696 8.84926 0.418339 8.61537 0C6.90435 0.291745 5.23861 0.805109 3.6602 1.52714C0.526645 6.16328 -0.322812 10.6843 0.101917 15.1411C1.937 16.4969 3.99099 17.5281 6.17459 18.1897C6.66627 17.5284 7.10135 16.8269 7.47521 16.0925C6.76512 15.8273 6.07977 15.5001 5.42707 15.1147C5.59885 14.9901 5.76685 14.8617 5.92919 14.7371C7.82839 15.6303 9.90126 16.0934 12 16.0934C14.0987 16.0934 16.1716 15.6303 18.0708 14.7371C18.235 14.8712 18.403 14.9995 18.5729 15.1147C17.9189 15.5007 17.2323 15.8285 16.521 16.0944C16.8944 16.8284 17.3295 17.5294 17.8216 18.1897C20.0071 17.5307 22.0626 16.5001 23.898 15.143C24.3964 9.97452 23.0467 5.49504 20.3303 1.52336ZM8.0132 12.4002C6.82962 12.4002 5.8518 11.3261 5.8518 10.0047C5.8518 8.68334 6.79564 7.59981 8.00942 7.59981C9.2232 7.59981 10.1935 8.68334 10.1727 10.0047C10.1519 11.3261 9.21943 12.4002 8.0132 12.4002ZM15.9868 12.4002C14.8013 12.4002 13.8273 11.3261 13.8273 10.0047C13.8273 8.68334 14.7711 7.59981 15.9868 7.59981C17.2024 7.59981 18.1652 8.68334 18.1444 10.0047C18.1236 11.3261 17.193 12.4002 15.9868 12.4002Z" fill="currentColor"/>
                </svg>
            </a>
            <a href="https://eris.pages.dev" target="blank" class="info-button">
                <svg width="13" height="14" viewBox="0 0 13 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.1016 8.99219L12.2812 9.26172C11.9375 10.5352 11.3008 11.5234 10.3711 12.2266C9.44141 12.9297 8.25391 13.2812 6.80859 13.2812C4.98828 13.2812 3.54297 12.7227 2.47266 11.6055C1.41016 10.4805 0.878906 8.90625 0.878906 6.88281C0.878906 4.78906 1.41797 3.16406 2.49609 2.00781C3.57422 0.851562 4.97266 0.273438 6.69141 0.273438C8.35547 0.273438 9.71484 0.839844 10.7695 1.97266C11.8242 3.10547 12.3516 4.69922 12.3516 6.75391C12.3516 6.87891 12.3477 7.06641 12.3398 7.31641H3.05859C3.13672 8.68359 3.52344 9.73047 4.21875 10.457C4.91406 11.1836 5.78125 11.5469 6.82031 11.5469C7.59375 11.5469 8.25391 11.3438 8.80078 10.9375C9.34766 10.5312 9.78125 9.88281 10.1016 8.99219ZM3.17578 5.58203H10.125C10.0312 4.53516 9.76562 3.75 9.32812 3.22656C8.65625 2.41406 7.78516 2.00781 6.71484 2.00781C5.74609 2.00781 4.92969 2.33203 4.26562 2.98047C3.60938 3.62891 3.24609 4.49609 3.17578 5.58203Z" fill="currentColor"/>
                </svg>                 
            </a>
            <div class="info-bullet"></div>
            <a href="https://meower.org/legal" target="_blank" class="info-link">
            ${lang().login_sub.agreement}
            </a>
        </div>
        <div id='msgs'></div>
    </div>
    `; 
}

function loadpost(p) {
    let user;
    let content;
    let bridged = (p.u && bridges.includes(p.u));
    
    if (bridged) {
        const rcon = p.p;
        const match = rcon.match(/^([a-zA-Z0-9]{1,20})?: ([\s\S]+)?/m);
        
        if (match) {
            user = match[1];
            content = match[2] || "";
        } else {
            user = p.u;
            content = rcon;
        }
    } else {
        if (p.u === "Webhooks") {
            const rcon = p.p;
            const parts = rcon.split(': ');
            user = parts[0];
            content = parts.slice(1).join(': ');
        } else {
            content = p.p;
            user = p.u;
        }
    }
    
    const postContainer = document.createElement("div");
    postContainer.classList.add("post");
    postContainer.setAttribute("tabindex", "0");

    const ba = Object.keys(blockedWords);
    const bc = ba.some(word => {
        const regex = new RegExp('\\b' + word + '\\b', 'i');
        return regex.test(content);
    });

    if (bc) {
        if (settingsstuff().censorwords) {
            content = content.replace(new RegExp('\\b(' + ba.join('|') + ')\\b', 'gi'), match => '*'.repeat(match.length));
        } else {
            if (settingsstuff().blockedmessages) {
                postContainer.setAttribute("style", "display:none;");
            } else {
                postContainer.classList.add("blocked");
            }
        }
    }
    
    if (blockedUsers.hasOwnProperty(user)) {
        if (settingsstuff().blockedmessages) {
            postContainer.setAttribute("style", "display:none;");
        } else {
            postContainer.classList.add("blocked");
        }
    }

    const wrapperDiv = document.createElement("div");
    wrapperDiv.classList.add("wrapper");

    const pfpDiv = document.createElement("div");
    pfpDiv.classList.add("pfp");
    
    wrapperDiv.appendChild(createButtonContainer(p));
    
    const mobileButtonContainer = document.createElement("div");
    mobileButtonContainer.classList.add("mobileContainer");
    mobileButtonContainer.innerHTML = `
    <div class='toolbarContainer'>
        <div class='toolButton mobileButton' onclick='openModal("${p._id}");'>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="M4 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm10-2a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm8 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" clip-rule="evenodd" class=""></path></svg>
        </div>
    </div>
    `;
    
    wrapperDiv.appendChild(mobileButtonContainer);

    const pstdte = document.createElement("i");
    pstdte.classList.add("date");
    tsr = p.t.e;
    tsra = tsr * 1000;
    tsrb = Math.trunc(tsra);
    const ts = new Date();
    ts.setTime(tsrb);
    pstdte.innerText = new Date(tsrb).toLocaleString([], { month: '2-digit', day: '2-digit', year: '2-digit', hour: 'numeric', minute: 'numeric' });

    const pstinf = document.createElement("span");
    pstinf.classList.add("user-header")
    pstinf.innerHTML = `<span id='username' onclick='openUsrModal("${user}")'>${user}</span>`;

    if (bridged || p.u == "Webhooks") {
        const bridged = document.createElement("bridge");
        bridged.innerText = lang().meo_bridged.start;
        bridged.setAttribute("title", lang().meo_bridged.title);
        pstinf.appendChild(bridged);
    }
    
    pstinf.appendChild(pstdte);
    wrapperDiv.appendChild(pstinf);

    const roarer = /@([\w-]+)\s+"([^"]*)"\s+\(([^)]+)\)/g;
    const bettermeower = /@([\w-]+)\[([a-zA-Z0-9]+)\]/g;

    let match1 = roarer.exec(content);
    let match2 = bettermeower.exec(content);
    
    if (match1) {
        const replyid = match1[3];
        const pageContainer = document.getElementById("msgs");
    
        if (pageContainer.firstChild) {
            pageContainer.insertBefore(postContainer, pageContainer.firstChild);
        } else {
            pageContainer.appendChild(postContainer);
        }
        
        loadreply(p.post_origin, replyid).then(replycontainer => {
            pstinf.after(replycontainer);
        });
    
        content = content.replace(match1[0], '').trim();
    } else if (match2) {
        const replyid = match2[2];
        const pageContainer = document.getElementById("msgs");
    
        if (pageContainer.firstChild) {
            pageContainer.insertBefore(postContainer, pageContainer.firstChild);
        } else {
            pageContainer.appendChild(postContainer);
        }
        
        loadreply(p.post_origin, replyid).then(replycontainer => {
            pstinf.after(replycontainer);
        });
    
        content = content.replace(match2[0], '').trim();
    }
    let postContentText = document.createElement("p");
    postContentText.className = "post-content";
    // tysm tni <3
    if (typeof md !== 'undefined') {
        md.disable(['image']);
        postContentText.innerHTML = erimd(md.render(content));
        postContentText.innerHTML = buttonbadges(postContentText);
    } else {
        // fallback for when md doenst work
        // figure this issue OUT
        postContentText.innerHTML = oldMarkdown(content);
        console.error("Parsed with old markdown, fix later :)")
    }
    const emojiRgx = /^(?:(?!\d)(?:\p{Emoji}|[\u200d\ufe0f\u{E0061}-\u{E007A}\u{E007F}]))+$/u;
    const discordRgx = /^<(a)?:\w+:\d+>$/gi;
    if (emojiRgx.test(content) || discordRgx.test(content)) {
        postContentText.classList.add('big');
    }
    
    if (content) {
        wrapperDiv.appendChild(postContentText);
    }

    const links = content.match(/(?:https?|ftp):\/\/[^\s(){}[\]]+/g);
    const embd = embed(links);
    if (embd || p.attachments) {
        const embedsDiv = document.createElement('div');
        embedsDiv.classList.add('embeds');
        if (embd) {
            embd.forEach(embeddedElement => {
                embedsDiv.appendChild(embeddedElement);
            });
        }

        p.attachments.forEach(attachment => {
            const g = attach(attachment);
            embedsDiv.appendChild(g);
        });
    
        wrapperDiv.appendChild(embedsDiv);
    }
    

    postContainer.appendChild(wrapperDiv);

    loadPfp(user, 0)
        .then(pfpElement => {
            if (pfpElement) {
                pfpDiv.appendChild(pfpElement);
                pfpCache[user] = pfpElement.cloneNode(true);
                postContainer.insertBefore(pfpDiv, wrapperDiv);
            }
        });

    const pageContainer = document.getElementById("msgs");
    const existingPost = document.getElementById(p._id);
    postContainer.id = p._id;
    if (existingPost) {
        existingPost.replaceWith(postContainer);
    } else if (pageContainer.firstChild) {
        pageContainer.insertBefore(postContainer, pageContainer.firstChild);
    } else {
        pageContainer.appendChild(postContainer);
    }
}

function loadPfp(username, button) {
    return new Promise((resolve, reject) => {
        if (pfpCache[username]) {
            resolve(pfpCache[username].cloneNode(true));
        } else {
            let pfpElement;

            fetch(`https://api.meower.org/users/${username}`)
                .then(userResp => userResp.json())
                .then(userData => {
                    if (userData.avatar) {
                        const pfpurl = `https://uploads.meower.org/icons/${userData.avatar}`;

                        
                        pfpElement = document.createElement("img");
                        pfpElement.setAttribute("src", pfpurl);
                        pfpElement.setAttribute("alt", username);
                        pfpElement.setAttribute("data-username", username);
                        pfpElement.classList.add("avatar");
                        if (!button) {
                            pfpElement.setAttribute("onclick", `openUsrModal('${username}')`);
                        }
                        
                        if (userData.avatar_color) {
//                            if (userData.avatar_color === "!color") {
//                                pfpElement.style.border = `3px solid #f00`;
//                                pfpElement.style.backgroundColor = `#f00`;
//                            } else {
//                            }
                            pfpElement.style.border = `3px solid #${userData.avatar_color}`;
                            pfpElement.style.backgroundColor = `#${userData.avatar_color}`;
                        }
                        
                        pfpElement.addEventListener('error', () => {
                            pfpElement.setAttribute("src", `${pfpurl}.png`);
                            pfpCache[username].setAttribute("src", `${pfpurl}.png`);
                        });

                    } else if (userData.pfp_data) {
                        let pfpurl;
                        if (userData.pfp_data > 0 && userData.pfp_data <= 37) {
                            pfpurl = `images/avatars/icon_${userData.pfp_data - 1}.svg`;
                        } else {
                            pfpurl = `images/avatars/icon_err.svg`;
                        }
                        
                        pfpElement = document.createElement("img");
                        pfpElement.setAttribute("src", pfpurl);
                        pfpElement.setAttribute("alt", username);
                        pfpElement.setAttribute("data-username", username);
                        pfpElement.classList.add("avatar");
                        if (!button) {
                            pfpElement.setAttribute("onclick", `openUsrModal('${username}')`);
                        }
                        pfpElement.classList.add("svg-avatar");

                        if (userData.avatar_color) {
                            pfpElement.style.border = `3px solid #${userData.avatar_color}`;
                        }
                        
                    } else {
                        const pfpurl = `images/avatars/icon_-4.svg`;
                        
                        pfpElement = document.createElement("img");
                        pfpElement.setAttribute("src", pfpurl);
                        pfpElement.setAttribute("alt", username);
                        pfpElement.setAttribute("data-username", username);
                        if (!button) {
                            pfpElement.setAttribute("onclick", `openUsrModal('${username}')`);
                        }
                        pfpElement.classList.add("avatar");
                        pfpElement.classList.add("svg-avatar");
                        
                        pfpElement.style.border = `3px solid #fff`;
                        pfpElement.style.backgroundColor = `#fff`;
                    }

                    if (pfpElement) {
                        pfpCache[username] = pfpElement.cloneNode(true);
                    }

                    resolve(pfpElement);
                })
                .catch(error => {
                    console.error("Failed to fetch:", error);
                    resolve(null);
                });
        }
    });
}

async function loadreply(postOrigin, replyid) {
    const roarRegex = /^@[\w-]+ (.+?) \(([^)]+)\)/;
    const betterMeowerRegex = /@([\w-]+)\[([a-zA-Z0-9]+)\]/g;

    try {
        let replydata = postCache[postOrigin].find(post => post._id === replyid);
        if (!replydata) {
            const replyresp = await fetch(`https://api.meower.org/posts?id=${replyid}`, {
                headers: { token: localStorage.getItem("token") }
            });
            if (replyresp.status === 404) {
                replydata = { p: "[original message was deleted]" };
            } else {
                replydata = await replyresp.json();
            }
        }

        let bridged = (bridges.includes(replydata.u));

        const replycontainer = document.createElement("div");
        replycontainer.classList.add("reply");
        replycontainer.id = `reply-${replyid}`;  // Add an ID to the reply container

        let content;
        let user;

        if (replydata.p) {
            content = replydata.p;

            let match = replydata.p.replace(roarRegex, "").trim();
            match = match.replace(betterMeowerRegex, "").trim();

            if (match) {
                content = match;
            }
        } else if (replydata.attachments) {
            content = "[Attachment]";
        } else {
            content = '';
        }

        user = replydata.u || '';

        if (bridged) {
            const rcon = content;
            const match = rcon.match(/^([a-zA-Z0-9]{1,20})?: ([\s\S]+)?/m);

            if (match) {
                user = match[1];
                content = match[2] || "";
            } else {
                user = replydata.u;
                content = rcon;
            }
        }

        replycontainer.innerHTML = `<p style='font-weight:bold;margin: 10px 0 10px 0;'>${escapeHTML(user)}</p><p style='margin: 10px 0 10px 0;'>${escapeHTML(content)}</p>`;
        
        const full = document.createElement("div");
        full.href = `${replyid}`;
        full.classList.add("reply-outer");
        
        full.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetElement = document.getElementById(`${replyid}`);
            const outer = document.getElementById("main");
            targetElement.style.backgroundColor = 'var(--hov-accent-color)';
            const navbarOffset = document.querySelector('.message-container').offsetHeight;
            let scroll
            if (settingsstuff().reducemotion) {
                scroll = "auto";
            } else {
                scroll = "smooth";
            }

            if (window.innerWidth < 720) {
                const containerRect = outer.getBoundingClientRect();
                const elementRect = targetElement.getBoundingClientRect();
                const elementPosition = elementRect.top - containerRect.top + outer.scrollTop - navbarOffset;
        
                outer.scrollTo({
                    top: elementPosition,
                    behavior: scroll
                });
            } else {
                const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY - navbarOffset;
                window.scrollTo({
                    top: elementPosition,
                    behavior: scroll
                });
            }
            setTimeout(() => {
                targetElement.style.backgroundColor = '';
            }, 1000);
        });
        
        

        full.appendChild(replycontainer);
        return full;
    } catch (error) {
        console.error("Error fetching reply:", error);
        const errorElement = document.createElement("p");
        errorElement.textContent = "Error fetching reply";
        return errorElement;
    }
}

function reply(event) {
    let postcont = "";
    const postContainer = event.target.closest('.post');
    if (postContainer) {
        const username = postContainer.querySelector('#username').innerText;
        if (postContainer.querySelector('p')) {
            postcont = postContainer.querySelector('p').innerText
            .replace(/\n/g, ' ')
            .replace(/@\w+/g, '')
            .split(' ')
            .slice(0, 6)
            .join(' ');
        } else {
            postcont = "";
        }
        const ogmsg = document.getElementById('msg').value
        
        const postId = postContainer.id;
        document.getElementById('msg').value = `@${username} "${postcont}..." (${postId})\n${ogmsg}`;
        document.getElementById('msg').focus();
        autoresize();
    }
}

function pingusr(event) {
    const postContainer = event.target.closest('.post');
    if (postContainer) {
        const username = postContainer.querySelector('#username').innerText;

        document.getElementById('msg').value = `@${username} `;
        document.getElementById('msg').focus();
        autoresize();
    }
}

function loadtheme() {
    const theme = localStorage.getItem("theme");
    
    if (theme) {
        document.documentElement.classList.add(theme + "-theme");
    }
    
    const rootStyles = window.getComputedStyle(document.documentElement);
    const rootBackgroundColor = rootStyles.getPropertyValue('--background');
    
    const metaThemeColor = document.querySelector("meta[name=theme-color]");
    if (metaThemeColor) {
        metaThemeColor.setAttribute("content", rootBackgroundColor);
    }
}

function sharepost() {
    const postId = event.target.closest('.post').id;
    window.open(`https://leo.atticat.tech/share?id=${postId}`, '_blank');
}

function toggleLogin(yn) {
    if (document.getElementById("signup")) {
        document.getElementById("signup").disabled = yn;
        document.getElementById("login").disabled = yn;
        document.getElementById("passinput").disabled = yn;
        document.getElementById("userinput").disabled = yn;
    }
}

function login(user, pass) {
        const data = {
        cmd: "direct",
        val: {
            cmd: "authpswd",
            val: {
                username: user,
                pswd: pass
            }
        },
        listener: "auth"
    };
    meowerConnection.send(JSON.stringify(data));
    console.log(user);
    console.log("User is logging in, details will not be logged for security reasons.");
}

function signup(user, pass) {
    const data = {
        cmd: "direct",
        val: {
            cmd: "gen_account",
            val: {
                username: user,
                pswd: pass
            }
        },
        listener: "auth"
    };
    meowerConnection.send(JSON.stringify(data));
    console.log("User is signing up, details will not be logged for security reasons.");
    openprofile = true;
    closemodal();
}

async function sendpost() {
    const msgbox = document.getElementById('msg');
    if (msgbox.disabled) return;
    const message = msgbox.value;
    msgbox.value = "";

    const attachmentCont = document.getElementById("images-container");
    const editIndicator = document.getElementById("edit-indicator");

    if (!message.trim() && (editIndicator.hasAttribute("data-postid") || pendingAttachments.length < 1)) {
        console.log("The message is blank.");
        return;
    }
    
    if (editIndicator.hasAttribute("data-postid")) {
        fetch(`https://api.meower.org/posts?id=${editIndicator.getAttribute("data-postid")}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                token: localStorage.getItem("token")
            },
            body: JSON.stringify({content: message})
        });
        editIndicator.removeAttribute("data-postid");
        editIndicator.innerText = "";
        document.getElementById("attach").hidden = false;
    } else {
        // Wait for attachments to upload and get attachment IDs
        msgbox.placeholder = `Uploading ${pendingAttachments.length} ${pendingAttachments.length > 1 ? 'files' : 'file'}...`;
        msgbox.disabled = true;
        const attachments = await Promise.all(pendingAttachments.map(attachment => attachment.req));
        pendingAttachments.length = 0;
        msgbox.placeholder = lang().meo_messagebox;
        msgbox.disabled = false;
        attachmentCont.innerHTML = '';
        

        fetch(`https://api.meower.org/${page === "home" ? "home" : `posts/${page}`}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                token: localStorage.getItem("token")
            },
            body: JSON.stringify({
                content: message,
                attachments: attachments.map(attachment => attachment.id),
            })
        });
    }

    autoresize();
    closepicker();
}

function loadhome() {
    page = "home";
    pre = "home";
    setTop();
    let pageContainer
    pageContainer = document.getElementById("main");
    pageContainer.innerHTML = `
        <div class='info'><h1 class='header-top'>${lang().page_home}</h1><p id='info'></p>
        </div>` + loadinputs();
        document.getElementById("info").innerText = lul + " users online (" + sul + ")";
    
    sidebars();

    if (postCache["home"]) {
        postCache["home"].forEach(post => {
            if (page !== "home") {
                return;
            }
            loadpost(post);
        });
        document.getElementById("skeleton-msgs").style.display = "none";
    } else {
        const xhttpPosts = new XMLHttpRequest();
        xhttpPosts.open("GET", "https://api.meower.org/home?autoget");
        xhttpPosts.onload = () => {
            const postsData = JSON.parse(xhttpPosts.response);
            const postsarray = postsData.autoget || [];

            postsarray.reverse();
            postCache["home"] = postsarray;
            postsarray.forEach(post => {
                if (page !== "home") {
                    return;
                }
                loadpost(post);
            });
            document.getElementById("skeleton-msgs").style.display = "none";
        };
        xhttpPosts.send();
    }
    
    const attachButton = document.getElementById('attach')
    attachButton.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        attachButton.classList.add('dragover');
    });

    attachButton.addEventListener('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        attachButton.classList.remove('dragover');
    });

    attachButton.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        attachButton.classList.remove('dragover');
        dropFiles(e.dataTransfer.files);
    });

    const jumpButton = document.querySelector('.jump');
    const navbarOffset = document.querySelector('.message-container').offsetHeight;

    window.addEventListener('scroll', function() {
        if (window.scrollY > navbarOffset) {
            jumpButton.classList.add('visible');
        } else {
            jumpButton.classList.remove('visible');
        }
    });
}

function sidebars() {
    let pageContainer
    pageContainer = document.getElementById("nav");
    pageContainer.innerHTML = `
    <div class='navigation'>
    <div class='nav-top'>
    <button class='trans' id='submit' value='Home' onclick='loadstart()' aria-label="Home">
        <svg width="32" height="32" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
            <g>
                <path fill="currentColor" d="M468.42 20.5746L332.997 65.8367C310.218 58.8105 284.517 55.049 255.499 55.6094C226.484 55.049 200.78 58.8105 178.004 65.8367L42.5803 20.5746C18.9102 16.3251 -1.81518 36.2937 2.5967 59.1025L38.7636 200.894C18.861 248.282 12.1849 296.099 12.1849 325.027C12.1849 399.343 44.6613 492 255.499 492C466.339 492 498.815 399.343 498.815 325.027C498.815 296.099 492.139 248.282 472.237 200.894L508.404 59.1025C512.814 36.2937 492.09 16.3251 468.42 20.5746Z"/>
            </g>
        </svg>
    </button>
    </div>
    </div>
    `;
    
    let navlist = `
    <input type='button' class='navigation-button button' id='explore' value='${lang().page_explore}' onclick='loadexplore();' aria-label="explore" tabindex="0">
    <input type='button' class='navigation-button button' id='inbox' value='${lang().page_inbox}' onclick='loadinbox()' aria-label="inbox" tabindex="0">
    <input type='button' class='navigation-button button' id='settings' value='${lang().page_settings}' onclick='loadstgs()' aria-label="settings" tabindex="0">
    <button type='button' class='user-area button' id='profile' onclick='openUsrModal("${localStorage.getItem("username")}")' aria-label="profile" tabindex="0">
        <img class="avatar-small" id="uav" src="" alt="Avatar">
        <span class="gcname">${localStorage.getItem("username")}</span></div>
    </button>
    `;

    loadPfp(localStorage.getItem("username"))
    .then(pfpElem => {
        if (pfpElem) {
            const userAvatar = document.getElementById("uav");
            userAvatar.src = pfpElem.src;
            userAvatar.style.border = pfpElem.style.border.replace("3px", "3px");
            if (pfpElem.classList.contains("svg-avatar")) {
                userAvatar.classList.add("svg-avatar");
            }
        }
    });

    if (localStorage.getItem("permissions") === "1") {
    navlist = `<input type='button' class='navigation-button button' id='moderation' value='${lang().action.mod}' onclick='openModModal()' aria-label="moderate">` + navlist;
    }

    let mdmdl = document.getElementsByClassName('navigation')[0];
    mdmdl.innerHTML += navlist;
//make it check if the list already exists, if so dont do this
    if (Object.keys(chatCache).length === 0) {
        const char = new XMLHttpRequest();
        char.open("GET", "https://api.meower.org/chats?autoget");
        char.setRequestHeader("token", localStorage.getItem('token'));
        char.onload = async () => {
            const response = JSON.parse(char.response);
            response.autoget.forEach(chat => {
                chatCache[chat._id] = chat;
            });
            renderChats();
        };
        char.send();
    }

    const sidediv = document.querySelectorAll(".side");
    sidediv.forEach(function(sidediv) {
        sidediv.classList.remove("hidden");
    });
}

function renderChats() {
    const groupsdiv = document.getElementById("groups");
    const gcdiv = document.createElement("div");
    gcdiv.className = "gcs";
    gcdiv.setAttribute("tabindex", "-1");


    groupsdiv.innerHTML = `
    <h1 class="groupheader">${lang().title_chats}</h1>
    <button class="search-input button" id="search" aria-label="search" onclick="goAnywhere();"><span class="srchtx">${lang().action.search}</span></button
    
    `;
    gcdiv.innerHTML += `
    <button class="navigation-button button gcbtn" onclick="loadhome()">
    <div class="chat-home-button">
        <svg width="36" height="26" viewBox="0 0 36 26" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.8336 21.6667C15.3859 21.6667 15.8336 21.219 15.8336 20.6667V16.1667C15.8336 15.6144 16.2814 15.1667 16.8336 15.1667H19.1669C19.7192 15.1667 20.1669 15.6144 20.1669 16.1667V20.6667C20.1669 21.219 20.6147 21.6667 21.1669 21.6667H24.5836C25.1359 21.6667 25.5836 21.219 25.5836 20.6667V13H28.8336L18.0003 3.25L7.16699 13H10.417V20.6667C10.417 21.219 10.8647 21.6667 11.417 21.6667H14.8336Z" fill="currentColor"/></svg>
    </div>
    <span class="gcname">${lang().page_home}</span>
    </button>
    <button class="navigation-button button gcbtn" onclick="loadlive()">
    <div class="chat-home-button">
        <svg width="36" height="26" viewBox="0 0 36 26" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.4 8C8.97012 8 7 9.94349 7 12.3405C7 14.7376 8.97012 16.6811 11.4 16.6811H24.6L27.7482 19.7867C28.2101 20.2424 29 19.9195 29 19.2752V12.7023C29 10.1053 26.8659 8 24.2333 8H11.4Z" fill="currentColor"/></svg>
    </div>    
    <span class="gcname">${lang().title_live}</span>
    </button>
    `;

    let favedChats = Object.values(chatCache).filter(chat => favoritedChats.includes(chat._id)).sort((a, b) => {
        return b.last_active - a.last_active;
    });
    let unfavedChats = Object.values(chatCache).filter(chat => !favoritedChats.includes(chat._id)).sort((a, b) => {
        return b.last_active - a.last_active;
    });
    let sortedChats = favedChats.concat(unfavedChats);

    sortedChats.forEach(chat => {
        const r = document.createElement("button");
        r.id = chat._id;
        r.className = `navigation-button button gcbtn`;
        r.onclick = function() {
            loadchat(chat._id);
        };

        const chatIconElem = document.createElement("img");
        chatIconElem.classList.add("avatar-small");
        chatIconElem.setAttribute("alt", "Avatar");
        if (chat.type === 0) {
            if (chat.icon) {
                chatIconElem.src = 'https://uploads.meower.org/icons/' + chat.icon;
            } else {
                chatIconElem.src = "images/GC.svg";
            }
            if (!chat.icon) {
                chatIconElem.style.border = "3px solid #" + '1f5831';
            } else if (chat.icon_color) {
                chatIconElem.style.border = "3px solid #" + chat.icon_color;
            } else {
                chatIconElem.style.border = "3px solid #" + '000';
            }
        } else {
            // this is so hacky :p
            // - Tnix
            loadPfp(chat.members.find(v => v !== localStorage.getItem("username")))
            .then(pfpElem => {
                if (pfpElem) {
                    chatIconElem.src = pfpElem.src;
                    chatIconElem.style.border = pfpElem.style.border.replace("3px", "3px");
                    chatIconElem.style.background = pfpElem.style.border.replace("3px solid", "");
                    if (pfpElem.classList.contains("svg-avatar")) {
                        chatIconElem.classList.add("svg-avatar");
                        chatIconElem.style.background = '#fff';
                    }
                }
            });
        }
        r.appendChild(chatIconElem);

        const chatNameElem = document.createElement("span");
        chatNameElem.classList.add("gcname");
        chatNameElem.innerText = chat.nickname || `@${chat.members.find(v => v !== localStorage.getItem("username"))}`;
        r.appendChild(chatNameElem);
        let escnickname
        if (chat.nickname) {
            escnickname = escapeHTML(chat.nickname);
        }
        
        const chatOps = document.createElement("div");
        chatOps.classList.add("chat-ops");
        chatOps.innerHTML = `
        <div class="chat-op" onclick="favChat(event, '${escapeHTML(chat._id)}')" title="${lang().action.favorite}" aria-label="${lang().action.favorite}">
            ${favoritedChats.includes(chat._id) ? `
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M3.05649 9.24618L0.635792 6.89056C0.363174 6.62527 0.264902 6.22838 0.382279 5.8667C0.499657 5.50502 0.812337 5.24125 1.1889 5.18626L5.27593 4.58943L7.10348 0.890366C7.27196 0.549372 7.61957 0.333496 8.00019 0.333496C8.38081 0.333496 8.72843 0.549372 8.8969 0.890366L9.72865 2.57387L3.05649 9.24618Z"/>
            <path fill="currentColor" d="M3.66083 14.7073L13.3894 4.97859L14.8115 5.18626C15.188 5.24125 15.5007 5.50502 15.6181 5.8667C15.7355 6.22838 15.6372 6.62527 15.3646 6.89056L12.408 9.76762L13.1058 13.8322C13.1701 14.207 13.0159 14.5859 12.7079 14.8094C12.3999 15.0329 11.9917 15.0624 11.6547 14.8853L8.00019 12.9652L4.34564 14.8853C4.06073 15.035 3.72478 15.0371 3.44161 14.899C3.51788 14.8409 3.59116 14.777 3.66083 14.7073Z"/>
            <path fill="currentColor" d="M2.95372 14.0002C2.93062 14.0233 2.90678 14.0452 2.88227 14.066C2.88227 14.066 2.88226 14.0659 2.88227 14.066C2.43262 14.446 1.75904 14.4238 1.3352 14C0.888265 13.5531 0.888265 12.8285 1.33521 12.3815L12.3815 1.3352C12.8284 0.888267 13.5531 0.888267 14 1.3352C14.4469 1.78213 14.4469 2.50675 14 2.95368L2.95372 14.0002Z"/>
            </svg>
            ` : `
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M8.8969 0.890366C8.72843 0.549372 8.38081 0.333496 8.00019 0.333496C7.61957 0.333496 7.27196 0.549372 7.10348 0.890366L5.27593 4.58943L1.1889 5.18626C0.812337 5.24125 0.499657 5.50502 0.382279 5.8667C0.264902 6.22838 0.363174 6.62527 0.635792 6.89056L3.59234 9.76762L2.89458 13.8322C2.83023 14.207 2.98448 14.5859 3.29246 14.8094C3.60044 15.0329 4.00873 15.0624 4.34564 14.8853L8.00019 12.9652L11.6547 14.8853C11.9917 15.0624 12.3999 15.0329 12.7079 14.8094C13.0159 14.5859 13.1701 14.207 13.1058 13.8322L12.408 9.76762L15.3646 6.89056C15.6372 6.62527 15.7355 6.22838 15.6181 5.8667C15.5007 5.50502 15.188 5.24125 14.8115 5.18626L10.7245 4.58943L8.8969 0.890366Z"/>
            </svg>
            `}
        </div>
        <div class="chat-op" onclick="closeChatModal(event, '${escapeHTML(chat._id)}', '${escnickname || chat.members.find(v => v !== localStorage.getItem("username"))}')" title="${lang().action.close}" aria-label="${lang().action.close}">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M2.3352 13.6648C2.78215 14.1117 3.50678 14.1117 3.95372 13.6648L8 9.61851L12.0463 13.6648C12.4932 14.1117 13.2179 14.1117 13.6648 13.6648C14.1117 13.2179 14.1117 12.4932 13.6648 12.0463L9.61851 8L13.6648 3.95372C14.1117 3.50678 14.1117 2.78214 13.6648 2.3352C13.2179 1.88826 12.4932 1.88827 12.0463 2.33521L8 6.38149L3.95372 2.33521C3.50678 1.88827 2.78214 1.88827 2.3352 2.33521C1.88826 2.78215 1.88827 3.50678 2.33521 3.95372L6.38149 8L2.33521 12.0463C1.88827 12.4932 1.88827 13.2179 2.3352 13.6648Z"/>
            </svg>            
        </div>
        `;

        r.appendChild(chatOps);

        gcdiv.appendChild(r);
    });

    groupsdiv.appendChild(gcdiv);
}

function loadstart() {
    page = "start";
    pre = "start";
    sidebars();
    pageContainer = document.getElementById("main");
    pageContainer.innerHTML = `
    <div class="info"><h1>${lang().page_start}</h1></div>
    <div class="explore">
        <h3>Online - ${lul}</h3>
        <div class="start-users-online">
            <button class="ubtn button skeleton" aria-label="Skeleton"><div class="ubtnsa"><div class="start-pfp-outer"><div class="skeleton-avatar-small"></div></div></div></button>
            <button class="ubtn button skeleton" aria-label="Skeleton"><div class="ubtnsa"><div class="start-pfp-outer"><div class="skeleton-avatar-small"></div></div></div></button>
            <button class="ubtn button skeleton" aria-label="Skeleton"><div class="ubtnsa"><div class="start-pfp-outer"><div class="skeleton-avatar-small"></div></div></div></button>
            <button class="ubtn button skeleton" aria-label="Skeleton"><div class="ubtnsa"><div class="start-pfp-outer"><div class="skeleton-avatar-small"></div></div></div></button>
            <button class="ubtn button skeleton" aria-label="Skeleton"><div class="ubtnsa"><div class="start-pfp-outer"><div class="skeleton-avatar-small"></div></div></div></button>
            <button class="ubtn button skeleton" aria-label="Skeleton"><div class="ubtnsa"><div class="start-pfp-outer"><div class="skeleton-avatar-small"></div></div></div></button>
            <button class="ubtn button skeleton" aria-label="Skeleton"><div class="ubtnsa"><div class="start-pfp-outer"><div class="skeleton-avatar-small"></div></div></div></button>
            <button class="ubtn button skeleton" aria-label="Skeleton"><div class="ubtnsa"><div class="start-pfp-outer"><div class="skeleton-avatar-small"></div></div></div></button>
            <button class="ubtn button skeleton" aria-label="Skeleton"><div class="ubtnsa"><div class="start-pfp-outer"><div class="skeleton-avatar-small"></div></div></div></button>
            <button class="ubtn button skeleton" aria-label="Skeleton"><div class="ubtnsa"><div class="start-pfp-outer"><div class="skeleton-avatar-small"></div></div></div></button>
            <button class="ubtn button skeleton" aria-label="Skeleton"><div class="ubtnsa"><div class="start-pfp-outer"><div class="skeleton-avatar-small"></div></div></div></button>
        </div>
        <div class="quick-btns">
        <div class="qc-bts-sc">
        <button class="qbtn button" aria-label="create chat" onclick="createChatModal()">${lang().action.creategc}</button>
        <button class="qbtn button" aria-label="home" onclick="loadhome();">${lang().action.gohome}</button>
        </div>
        <div class="qc-bts-sc">
        <button class="qbtn button" aria-label="explore" onclick="loadexplore();">${lang().page_explore}</button>
        <button class="qbtn button" aria-label="dm me" onclick="opendm('Eris')">${lang().action.dmme}</button>
        </div>
        <div class="qc-bts-sc">
        <button class="qbtn button" aria-label="share" onclick="shareModal()" style="display:none;">${lang().action.invite}</button>
        </div>
    </div>
    `;
    fetch('https://api.meower.org/ulist?autoget')
    .then(response => response.json())
    .then(data => {
        let pl = ''
        data.autoget.forEach(item => {
            const gr = item._id.trim();
            if (gr !== localStorage.getItem("username")) {
                const profilecont = document.createElement('div');
                profilecont.classList.add('start-pfp-outer');
                if (item.avatar_color !== "!color" && data.avatar_color) {
                    profilecont.classList.add('custom-bg');
                }
                if (item.avatar) {
                    profilecont.innerHTML = `
                        <img class="avatar-small" style="border: 3px solid #${item.avatar_color}; background-color:#${item.avatar_color};" src="https://uploads.meower.org/icons/${item.avatar}" alt="Avatar" title="${item._id}"></img>
                    `;
                } else if (item.pfp_data) {
                    profilecont.innerHTML = `
                        <img class="avatar-small svg-avatar" style="border: 3px solid #${item.avatar_color}"; src="images/avatars/icon_${item.pfp_data - 1}.svg" alt="Avatar" title="${item._id}"></img>
                    `;
                } else {
                    profilecont.innerHTML = `
                        <img class="avatar-small svg-avatar" style="border: 3px solid #000"; src="images/avatars/icon_-4.svg" alt="Avatar" title="${item._id}"></img>
                    `;
                }
                pl += `<button class="ubtn button" aria-label="${gr}"><div class="ubtnsa" onclick="openUsrModal('${gr}')">${profilecont.outerHTML}${gr}</div><div class="ubtnsb" onclick="opendm('${gr}')" id="username"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 22a10 10 0 1 0-8.45-4.64c.13.19.11.44-.04.61l-2.06 2.37A1 1 0 0 0 2.2 22H12Z" class=""></path></svg></div></button>`;
            }
        });
        document.querySelector(".start-users-online").innerHTML = pl;
    });

}

function opendm(username) {
    fetch(`https://api.meower.org/users/${username}/dm`, {
        method: 'GET',
        headers: {
            'token': localStorage.getItem("token")
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        chatCache[data._id] = data;
        parent.loadchat(data._id);
        parent.closemodal();
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
}

function loadchat(chatId) {
    page = chatId;
    pre = chatId;
    setTop();
    if (!chatCache[chatId]) {
        fetch(`https://api.meower.org/chats/${chatId}`, {
            headers: {token: localStorage.getItem("token")}
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error("Chat not found");
                } else {
                    throw new Error('Network response was not ok');
                }
            }
            return response.json();
        })
        .then(data => {
            chatCache[chatId] = data;
            loadchat(chatId);
        })
        .catch(e => {
            openUpdate(`Unable to open chat: ${e}`);
            if (!settingsstuff().homepage) {
                loadstart();
            } else {
                loadhome();
            }
        });
        return;
    }

    sidebars();

    const data = chatCache[chatId];

    const mainContainer = document.getElementById("main");
    if (data.nickname) {
        mainContainer.innerHTML = `<div class='info'><div class="gctitle"><h1 id='nickname' class='header-top'>${escapeHTML(data.nickname)}</h1><i class="subtitle">${chatId}</i></div>
        <p id='info'></p></div>` + loadinputs();
        const ulinf = document.getElementById('info');
        data.members.forEach((user, index) => {
            if (index === data.members.length - 1) {
                ulinf.innerHTML += `<div class='ulmember'><span id='ulmnl'>${user}</span></div>`;
            } else {
                ulinf.innerHTML += `<div class='ulmember'><span id='ulmnl'>${user}</span>, </div>`;
            }
        });
    } else {
        mainContainer.innerHTML = `<div class='info'><div class="gctitle"><h1 id='username' class='header-top' onclick="openUsrModal('${data.members.find(v => v !== localStorage.getItem("username"))}')">${data.members.find(v => v !== localStorage.getItem("username"))}</h1><i class="subtitle">${chatId}</i></div><p id='info'></p></div>` + loadinputs();
    }

    if (postCache[chatId]) {
        postCache[chatId].forEach(post => {
            if (page !== chatId) {
                return;
            }
            loadpost(post);
        });
        document.getElementById("skeleton-msgs").style.display = "none";
    } else {
        const xhttpPosts = new XMLHttpRequest();
        xhttpPosts.open("GET", `https://api.meower.org/posts/${chatId}?autoget`);
        xhttpPosts.setRequestHeader("token", localStorage.getItem('token'));
        xhttpPosts.onload = () => {
            const postsData = JSON.parse(xhttpPosts.response);
            const postsarray = postsData.autoget || [];

            postsarray.reverse();
            postCache[chatId] = postsarray;
            postsarray.forEach(post => {
                if (page !== chatId) {
                    return;
                }
                loadpost(post);
            });
            document.getElementById("skeleton-msgs").style.display = "none";
        };
        xhttpPosts.send();
    }

    const attachButton = document.getElementById('attach')
    attachButton.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        attachButton.classList.add('dragover');
    });

    attachButton.addEventListener('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        attachButton.classList.remove('dragover');
    });

    attachButton.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        attachButton.classList.remove('dragover');
        dropFiles(e.dataTransfer.files);
    });

    const jumpButton = document.querySelector('.jump');
    const navbarOffset = document.querySelector('.message-container').offsetHeight;

    window.addEventListener('scroll', function() {
        if (window.scrollY > navbarOffset) {
            jumpButton.classList.add('visible');
        } else {
            jumpButton.classList.remove('visible');
        }
    });
}

function loadlive() {
    page = 'livechat';
    pre = 'livechat';
    setTop();
    const mainContainer = document.getElementById("main");
    mainContainer.innerHTML = `
        <div class='info'>
            <h1>${lang().title_live}</h1>
            <p id='info'>${lang().live_sub.desc}</p>
        </div>
        ${loadinputs()}
    `;
    
    document.getElementById("skeleton-msgs").style.display = "none";
    sidebars();

    if (!postCache["livechat"]) postCache["livechat"] = [];
    postCache["livechat"].forEach(post => {
        if (page !== "livechat") {
            return;
        }
        loadpost(post);
    });

    const attachButton = document.getElementById('attach')
    attachButton.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        attachButton.classList.add('dragover');
    });

    attachButton.addEventListener('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        attachButton.classList.remove('dragover');
    });

    attachButton.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        attachButton.classList.remove('dragover');
        dropFiles(e.dataTransfer.files);
    });

    const jumpButton = document.querySelector('.jump');
    const navbarOffset = document.querySelector('.message-container').offsetHeight;

    window.addEventListener('scroll', function() {
        if (window.scrollY > navbarOffset) {
            jumpButton.classList.add('visible');
        } else {
            jumpButton.classList.remove('visible');
        }
    });
}

function loadinbox() {
    page = "inbox"
    pre = "inbox"
    setTop();

    const mainContainer = document.getElementById("main");
    mainContainer.innerHTML = `
        <div class='info'>
            <h1>${lang().page_inbox}</h1>
            <p id='info'>${lang().inbox_sub.desc}</p>
        </div>
        <div class='message-container'>
        </div>
        <div id='msgs' class='posts'></div>
            <div id="skeleton-msgs" class="posts" style="display:block;">
            <div class="skeleton-post"><div class="pfp"><div class="skeleton-avatar"></div></div><div class="wrapper"><span class="skeleton-header"><div class="skeleton-username"></div><div class="skeleton-date"></div></span><div class="skeleton-content-1"></div><div class="skeleton-content-2"></div></div></div>
            <div class="skeleton-post"><div class="pfp"><div class="skeleton-avatar"></div></div><div class="wrapper"><span class="skeleton-header"><div class="skeleton-username"></div><div class="skeleton-date"></div></span><div class="skeleton-content-1"></div><div class="skeleton-content-2"></div></div></div>
            <div class="skeleton-post"><div class="pfp"><div class="skeleton-avatar"></div></div><div class="wrapper"><span class="skeleton-header"><div class="skeleton-username"></div><div class="skeleton-date"></div></span><div class="skeleton-content-1"></div><div class="skeleton-content-2"></div></div></div>
            <div class="skeleton-post"><div class="pfp"><div class="skeleton-avatar"></div></div><div class="wrapper"><span class="skeleton-header"><div class="skeleton-username"></div><div class="skeleton-date"></div></span><div class="skeleton-content-1"></div><div class="skeleton-content-2"></div></div></div>
            <div class="skeleton-post"><div class="pfp"><div class="skeleton-avatar"></div></div><div class="wrapper"><span class="skeleton-header"><div class="skeleton-username"></div><div class="skeleton-date"></div></span><div class="skeleton-content-1"></div><div class="skeleton-content-2"></div></div></div>
            <div class="skeleton-post"><div class="pfp"><div class="skeleton-avatar"></div></div><div class="wrapper"><span class="skeleton-header"><div class="skeleton-username"></div><div class="skeleton-date"></div></span><div class="skeleton-content-1"></div><div class="skeleton-content-2"></div></div></div>
            <div class="skeleton-post"><div class="pfp"><div class="skeleton-avatar"></div></div><div class="wrapper"><span class="skeleton-header"><div class="skeleton-username"></div><div class="skeleton-date"></div></span><div class="skeleton-content-1"></div><div class="skeleton-content-2"></div></div></div>
            <div class="skeleton-post"><div class="pfp"><div class="skeleton-avatar"></div></div><div class="wrapper"><span class="skeleton-header"><div class="skeleton-username"></div><div class="skeleton-date"></div></span><div class="skeleton-content-1"></div><div class="skeleton-content-2"></div></div></div>
            <div class="skeleton-post"><div class="pfp"><div class="skeleton-avatar"></div></div><div class="wrapper"><span class="skeleton-header"><div class="skeleton-username"></div><div class="skeleton-date"></div></span><div class="skeleton-content-1"></div><div class="skeleton-content-2"></div></div></div>
            <div class="skeleton-post"><div class="pfp"><div class="skeleton-avatar"></div></div><div class="wrapper"><span class="skeleton-header"><div class="skeleton-username"></div><div class="skeleton-date"></div></span><div class="skeleton-content-1"></div><div class="skeleton-content-2"></div></div></div>
            <div class="skeleton-post"><div class="pfp"><div class="skeleton-avatar"></div></div><div class="wrapper"><span class="skeleton-header"><div class="skeleton-username"></div><div class="skeleton-date"></div></span><div class="skeleton-content-1"></div><div class="skeleton-content-2"></div></div></div>
            <div class="skeleton-post"><div class="pfp"><div class="skeleton-avatar"></div></div><div class="wrapper"><span class="skeleton-header"><div class="skeleton-username"></div><div class="skeleton-date"></div></span><div class="skeleton-content-1"></div><div class="skeleton-content-2"></div></div></div>
        </div>
    `;

    sidebars();

    const sidedivs = document.querySelectorAll(".side");
    sidedivs.forEach(sidediv => sidediv.classList.remove("hidden"));

    const inboxUrl = 'https://api.meower.org/inbox?autoget=1';

    const xhttp = new XMLHttpRequest();
    xhttp.open("GET", inboxUrl);
    xhttp.setRequestHeader("token", localStorage.getItem('token'));
    xhttp.onload = () => {
        const postsData = JSON.parse(xhttp.response);
        const postsarray = postsData.autoget || [];

        postsarray.reverse();

        postsarray.forEach(postId => {
            loadpost(postId);
        });
        document.getElementById("skeleton-msgs").style.display = "none";
        document.getElementById("msg").style.display = "block";
    };
    xhttp.send();
}

function logout(iskl) {
    if (!iskl) {
        localStorage.clear();
        meowerConnection.close();
    }
    end = true;
    for (const key in pfpCache) delete pfpCache[key];
    for (const key in postCache) if (key !== "livechat") delete postCache[key];
    for (const key in chatCache) delete chatCache[key];
    for (const key in blockedUsers) delete blockedUsers[key];
    if (document.getElementById("main"))
        document.getElementById("main").innerHTML = "";
    if (document.getElementById("nav"))
        document.getElementById("nav").innerHTML = "";
    if (document.getElementById("groups"))
        document.getElementById("groups").innerHTML = "";
    document.querySelectorAll(".side").forEach(function(element) {
        element.classList.add("hidden");
    });    
    end = false;
    main();
}

function loadstgs() {
    page = "settings";
    pre = "settings";
    const navc = document.querySelector(".nav-top");
    navc.innerHTML = `
    <input type='button' class='navigation-button button' id='submit' value='${lang().settings_general}' onclick='loadGeneral()' aria-label="general">
    <input type='button' class='navigation-button button' id='submit' value='${lang().settings_appearance}' onclick='loadAppearance()' aria-label="appearance">
    <input type="button" class="navigation-button button" id="submit" value='${lang().settings_languages}' onclick="loadLanguages()" aria-label="languages">
    <input type="button" class="navigation-button button" id="submit" value='${lang().settings_plugins}' onclick="loadPlugins()" aria-label="plugins">
    <input type='button' class='navigation-button button' id='logout' value='${lang().action.logout}' onclick='logout(false)' aria-label="logout">
    `;
    loadGeneral();
}

function loadGeneral() {
    setTop();
    const pageContainer = document.getElementById("main");
    const settingsContent = `
        <div class="settings">
            <h1>${lang().settings_general}</h1>
            <h3>${lang().general_sub.chat}</h3>
            <div class="msgs"></div>
            <div class="stg-section">
                <label class="general-label">
                <div class="general-desc">
                ${lang().general_list.title.homepage}
                <p class="subsubheader">${lang().general_list.desc.homepage}</p>
                </div>
                <input type="checkbox" id="homepage" class="settingstoggle">
                </label>
            </div>
            <div class="stg-section">
                <label class="general-label">
                <div class="general-desc">
                ${lang().general_list.title.invtyping}
                <p class="subsubheader">${lang().general_list.desc.invtyping}</p>
                </div>
                <input type="checkbox" id="invtyping" class="settingstoggle">
                </label>
            </div>
            <div class="stg-section">
                <label class="general-label">
                <div class="general-desc">
                ${lang().general_list.title.imagewhitelist}
                <p class="subsubheader">${lang().general_list.desc.imagewhitelist}</p>
                </div>
                <input type="checkbox" id="imagewhitelist" class="settingstoggle">
                </label>
            </div>
                <div class="stg-section">
                <label class="general-label">
                <div class="general-desc">
                ${lang().general_list.title.hideimages}
                <p class="subsubheader">${lang().general_list.desc.hideimages}</p>
                </div>
                <input type="checkbox" id="hideimages" class="settingstoggle">
                </label>
            </div>
            <div class="stg-section">
                <label class="general-label">
                <div class="general-desc">
                ${lang().general_list.title.embeds}
                <p class="subsubheader">${lang().general_list.desc.embeds}</p>
                </div>
                <input type="checkbox" id="embeds" class="settingstoggle">
                </label>
            </div>
            <div class="stg-section">
                <label class="general-label">
                <div class="general-desc">
                ${lang().general_list.title.entersend}
                <p class="subsubheader">${lang().general_list.desc.entersend}</p>
                </div>
                <input type="checkbox" id="entersend" class="settingstoggle">
                </label>
            </div>
            <div class="stg-section">
                <label class="general-label">
                <div class="general-desc">
                ${lang().general_list.title.blockedmessages}
                <p class="subsubheader">${lang().general_list.desc.blockedmessages}</p>
                </div>
                <input type="checkbox" id="blockedmessages" class="settingstoggle">
                </label>
            </div>
            <div class="stg-section">
                <label class="general-label">
                <div class="general-desc">
                ${lang().general_list.title.censorwords}
                <p class="subsubheader">${lang().general_list.desc.censorwords}</p>
                </div>
                <input type="checkbox" id="censorwords" class="settingstoggle">
                </label>
            </div>
            <h3>${lang().general_sub.accessibility}</h3>
            <div class="stg-section">
                <label class="general-label">
                <div class="general-desc">
                ${lang().general_list.title.reducemotion}
                <p class="subsubheader">${lang().general_list.desc.reducemotion}</p>
                </div>
                <input type="checkbox" id="reducemotion" class="settingstoggle">
                </label>
            </div>
            <div class="stg-section">
                <label class="general-label">
                <div class="general-desc">
                ${lang().general_list.title.showpostbuttons}
                <p class="subsubheader">${lang().general_list.desc.showpostbuttons}</p>
                </div>
                <input type="checkbox" id="showpostbuttons" class="settingstoggle">
                </label>
            </div>
            <div class="stg-section">
                <label class="general-label">
                <div class="general-desc">
                ${lang().general_list.title.underlinelinks}
                <p class="subsubheader">${lang().general_list.desc.underlinelinks}</p>
                </div>
                <input type="checkbox" id="underlinelinks" class="settingstoggle">
                </label>
            </div>
            <h3>${lang().general_sub.misc}</h3>
            <div class="stg-section">
                <label class="general-label">
                <div class="general-desc">
                ${lang().general_list.title.consolewarnings}
                <p class="subsubheader">${lang().general_list.desc.consolewarnings}</p>
                </div>
                <input type="checkbox" id="consolewarnings" class="settingstoggle">
                </label>
            </div>
            <h3>${lang().general_sub.acc}</h3>
            <button onclick="deleteTokensModal()" class="button blockeduser">${lang().action.cleartokens}</button>
            <button onclick="changePasswordModal()" class="button blockeduser">${lang().action.changepw}</button>
            <button onclick="clearLocalstorageModal()" class="button blockeduser">${lang().action.clearls}</button>
            <button onclick="DeleteAccountModal()" class="button blockeduser red">${lang().action.deleteacc}</button>
            <h3>${lang().general_sub.blockedusers}</h3>
            <div class="blockedusers list">
            <button class="blockeduser button" onclick="blockUserSel()">${lang().action.blockuser}</button>
            </div>
            <h3>${lang().general_sub.blockedwords}</h3>
            <div class="blockedwords list">
            <button class="blockedword button" onclick="blockWordSel()">${lang().action.blockword}</button>
            </div>
            <h3>${lang().general_sub.about}</h3>
            <div class="stg-section">
            <span>meo v1.2.0</span>
            </div>
            <h3>${lang().general_sub.credits}</h3>
            <div class="stg-section">
                <div class="list">
                    <span class="credit">Tnix, for helping out here and there</span>
                    <span class="credit">ethernet, moral support, and translating</span>
                    <span class="credit">melt, for the original webhook code</span>
                    <span class="credit">theotherhades, for the IP popup</span>
                    <span class="credit">You, ${localStorage.getItem("username")}, for using the client</span>
                    <span class="credit">All the contributors and translators</span>
                </div>
            </div>
            </div>
            `;

            pageContainer.innerHTML = settingsContent;

            const settings = {
                homepage: document.getElementById("homepage"),
                consolewarnings: document.getElementById("consolewarnings"),
                blockedmessages: document.getElementById("blockedmessages"),
                invtyping: document.getElementById("invtyping"),
                imagewhitelist: document.getElementById("imagewhitelist"),
                censorwords: document.getElementById("censorwords"),
                embeds: document.getElementById("embeds"),
                reducemotion: document.getElementById("reducemotion"),
                showpostbuttons: document.getElementById("showpostbuttons"),
                underlinelinks: document.getElementById("underlinelinks"),
                entersend: document.getElementById("entersend"),
                hideimages: document.getElementById("hideimages")
            };
        
            Object.values(settings).forEach((checkbox) => {
                checkbox.addEventListener("change", () => {
                    localStorage.setItem('settings', JSON.stringify({
                        homepage: settings.homepage.checked,
                        consolewarnings: settings.consolewarnings.checked,
                        blockedmessages: settings.blockedmessages.checked,
                        invtyping: settings.invtyping.checked,
                        imagewhitelist: settings.imagewhitelist.checked,
                        censorwords: settings.censorwords.checked,
                        embeds: settings.embeds.checked,
                        reducemotion: settings.reducemotion.checked,
                        showpostbuttons: settings.showpostbuttons.checked,
                        underlinelinks: settings.underlinelinks.checked,
                        entersend: settings.entersend.checked,
                        hideimages: settings.hideimages.checked
                    }));
                    setAccessibilitySettings();
                });
            });
        
            const storedSettings = JSON.parse(localStorage.getItem('settings')) || {};
            Object.entries(storedSettings).forEach(([setting, value]) => {
                if (settings[setting]) {
                    settings[setting].checked = value;
                }
            });

        const cont = document.querySelector('.blockedusers');

        for (var user in blockedUsers) {
            if (blockedUsers.hasOwnProperty(user)) {
                const item = document.createElement('button');
                
                item.innerText = '@' + user;
                
                item.classList.add('blockeduser');
                item.classList.add('button');
                
                item.setAttribute("onclick", `blockUserModal('${user}')`);
                
                cont.appendChild(item);
            }
        }

        const bwcont = document.querySelector('.blockedwords');

        for (const word in blockedWords) {
            if (blockedWords.hasOwnProperty(word)) {
                const item = document.createElement('button');
                
                item.innerText = word;
                
                item.classList.add('blockedword');
                item.classList.add('button');
                
                item.setAttribute("onclick", `unblockWord('${word}')`);
                
                bwcont.appendChild(item);
            }
        }
}

async function loadPlugins() {
    setTop();
    let pageContainer = document.getElementById("main");
    let settingsContent = `
        <div class="settings">
            <h1>${lang().settings_plugins}</h1>
            <div class="msgs"></div>
            <h3>${lang().plugins_sub.manage}</h3>
            <button onclick="resetPlugins()" class="button blockeduser">${lang().action.resetplugins}</button>

            <h3>${lang().settings_plugins}</h3>
            <div class='plugins'>
            <div class="section plugin"><label>----<input type="checkbox" id="placeholder" class="settingstoggle" disabled><p class="pluginsub">--------------</p><p class="subsubheader">-----------</p></label></div>
            <div class="section plugin"><label>----<input type="checkbox" id="placeholder" class="settingstoggle" disabled><p class="pluginsub">--------------</p><p class="subsubheader">-----------</p></label></div>
            <div class="section plugin"><label>----<input type="checkbox" id="placeholder" class="settingstoggle" disabled><p class="pluginsub">--------------</p><p class="subsubheader">-----------</p></label></div>
            <div class="section plugin"><label>----<input type="checkbox" id="placeholder" class="settingstoggle" disabled><p class="pluginsub">--------------</p><p class="subsubheader">-----------</p></label></div>
            <div class="section plugin"><label>----<input type="checkbox" id="placeholder" class="settingstoggle" disabled><p class="pluginsub">--------------</p><p class="subsubheader">-----------</p></label></div>
            <div class="section plugin"><label>----<input type="checkbox" id="placeholder" class="settingstoggle" disabled><p class="pluginsub">--------------</p><p class="subsubheader">-----------</p></label></div>
            </div>
            <hr>
            <span>${lang().plugins_sub.desc} <a href='https://github.com/3r1s-s/meo-plugins' target="_blank" id='link'>${lang().plugins_sub.link}</a></span>
        </div>
    `;
    pageContainer.innerHTML = settingsContent;

    const pluginsData = await fetchPlugins();
    const enabledPlugins = JSON.parse(localStorage.getItem('enabledPlugins')) || {};
    let pluginsList = document.querySelector(".plugins");
    pluginsList.innerHTML = '';
    pluginsData.forEach(plugin => {
        const isEnabled = enabledPlugins[plugin.name] || false;
        addPlugin(plugin, isEnabled);
    });
}

function addPlugin(plugin, isEnabled) {
    let pluginsList = document.querySelector(".plugins");

    pluginsList.insertAdjacentHTML('beforeend', `
        <div class='section plugin' ${plugin.flags === '1' ? `title="Use this plugin with caution."` : ''}>
        <label>
            ${plugin.name}
            <input type="checkbox" id="${plugin.name}" class="plugintoggle" ${isEnabled ? 'checked' : ''}>
            <p class='pluginsub'>${plugin.description}</p>
            <p class='subsubheader'>Created by <a href='https://github.com/${plugin.creator}' target='_blank'>${plugin.creator}</a></p>
            </label>
            ${plugin.flags === '1' ? `
            <svg class="plugin-flag" width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fill="currentColor" d="M20 6.00201H14V3.00201C14 2.45001 13.553 2.00201 13 2.00201H4C3.447 2.00201 3 2.45001 3 3.00201V22.002H5V14.002H10.586L8.293 16.295C8.007 16.581 7.922 17.011 8.076 17.385C8.23 17.759 8.596 18.002 9 18.002H20C20.553 18.002 21 17.554 21 17.002V7.00201C21 6.45001 20.553 6.00201 20 6.00201Z">
                </path>
            </svg>
            ` : ''}
        </div>
    `);

    const checkbox = document.getElementById(plugin.name);
    checkbox.addEventListener('change', function() {
        const enabledPlugins = JSON.parse(localStorage.getItem('enabledPlugins')) || {};
        enabledPlugins[plugin.name] = checkbox.checked;
        localStorage.setItem('enabledPlugins', JSON.stringify(enabledPlugins));


        if (!checkbox.checked) {
            const existingScript = document.querySelector(`script[src="${plugin.script}"]`);
            if (existingScript) {
                existingScript.remove();
            }
        };
        modalPluginup();
    });
}

async function fetchPlugins() {
    try {
        const response = await fetch('https://raw.githubusercontent.com/3r1s-s/meo-plugins/main/index.json');
        const pluginsData = await response.json();
        return pluginsData;
    } catch (error) {
        console.error('Error fetching or parsing plugins data:', error);
        return [];
    }
}

async function loadSavedPlugins() {
    const pluginsData = await fetchPlugins();
    const enabledPlugins = JSON.parse(localStorage.getItem('enabledPlugins')) || {};

    pluginsData.forEach(plugin => {
        const isEnabled = enabledPlugins[plugin.name] || false;

        if (isEnabled) {
            loadPluginScript(plugin.script);
            console.warn("loaded " + plugin.script + "!")
        }
    });
}

function loadPluginScript(scriptUrl) {
    fetch(scriptUrl, {
        headers: {
            'Accept': 'application.javascript'
        }
    })
    .then(response => response.text())
    .then(data =>{
        eval(data);
    })
    .catch(error => console.error('Error:', error));
}

function resetPlugins() {
    localStorage.removeItem("enabledPlugins");
    modalPluginup();
}

function loadAppearance() {
    setTop();
    let pageContainer = document.getElementById("main");
    let settingsContent = `
    <div class="settings">
        <h1>${lang().settings_appearance}</h1>
        <div class="msgs example-msg">
        <div id="example" class="post" style="margin-top: -2.8em;"><div class="pfp"><img src="https://uploads.meower.org/icons/o1KPbrqDXKV6BeqmbwLvZurG" alt="Avatar" class="avatar" style="border: 3px solid #ad3e00;"></div><div class="wrapper"><div class="buttonContainer">
                    <div class="toolbarContainer">
                        <div class="toolButton">
                            <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18"><path d="M12.9297 3.25007C12.7343 3.05261 12.4154 3.05226 12.2196 3.24928L11.5746 3.89824C11.3811 4.09297 11.3808 4.40733 11.5739 4.60245L16.5685 9.64824C16.7614 9.84309 16.7614 10.1569 16.5685 10.3517L11.5739 15.3975C11.3808 15.5927 11.3811 15.907 11.5746 16.1017L12.2196 16.7507C12.4154 16.9477 12.7343 16.9474 12.9297 16.7499L19.2604 10.3517C19.4532 10.1568 19.4532 9.84314 19.2604 9.64832L12.9297 3.25007Z"></path><path d="M8.42616 4.60245C8.6193 4.40733 8.61898 4.09297 8.42545 3.89824L7.78047 3.24928C7.58466 3.05226 7.26578 3.05261 7.07041 3.25007L0.739669 9.64832C0.5469 9.84314 0.546901 10.1568 0.739669 10.3517L7.07041 16.7499C7.26578 16.9474 7.58465 16.9477 7.78047 16.7507L8.42545 16.1017C8.61898 15.907 8.6193 15.5927 8.42616 15.3975L3.43155 10.3517C3.23869 10.1569 3.23869 9.84309 3.43155 9.64824L8.42616 4.60245Z"></path></svg>
                        </div>
                        <div class="toolButton">
                            <svg class="icon" height="24" width="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.486 2 2 6.486 2 12C2 17.515 6.486 22 12 22C14.039 22 15.993 21.398 17.652 20.259L16.521 18.611C15.195 19.519 13.633 20 12 20C7.589 20 4 16.411 4 12C4 7.589 7.589 4 12 4C16.411 4 20 7.589 20 12V12.782C20 14.17 19.402 15 18.4 15L18.398 15.018C18.338 15.005 18.273 15 18.209 15H18C17.437 15 16.6 14.182 16.6 13.631V12C16.6 9.464 14.537 7.4 12 7.4C9.463 7.4 7.4 9.463 7.4 12C7.4 14.537 9.463 16.6 12 16.6C13.234 16.6 14.35 16.106 15.177 15.313C15.826 16.269 16.93 17 18 17L18.002 16.981C18.064 16.994 18.129 17 18.195 17H18.4C20.552 17 22 15.306 22 12.782V12C22 6.486 17.514 2 12 2ZM12 14.599C10.566 14.599 9.4 13.433 9.4 11.999C9.4 10.565 10.566 9.399 12 9.399C13.434 9.399 14.6 10.565 14.6 11.999C14.6 13.433 13.434 14.599 12 14.599Z"></path></svg>
                        </div>
                        <div class="toolButton">
                            <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M20 6.00201H14V3.00201C14 2.45001 13.553 2.00201 13 2.00201H4C3.447 2.00201 3 2.45001 3 3.00201V22.002H5V14.002H10.586L8.293 16.295C8.007 16.581 7.922 17.011 8.076 17.385C8.23 17.759 8.596 18.002 9 18.002H20C20.553 18.002 21 17.554 21 17.002V7.00201C21 6.45001 20.553 6.00201 20 6.00201Z"></path></svg>
                        </div>
                        <div class="toolButton">
                            <svg class="icon_d1ac81" width="24" height="24" viewBox="0 0 24 24"><path d="M10 8.26667V4L3 11.4667L10 18.9333V14.56C15 14.56 18.5 16.2667 21 20C20 14.6667 17 9.33333 10 8.26667Z" fill="currentColor"></path></svg>
                        </div>
                    </div>
                    </div><div class="mobileContainer">
                    <div class="toolbarContainer">
                        <div class="toolButton mobileButton">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="M4 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm10-2a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm8 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" clip-rule="evenodd" class=""></path></svg>
                        </div>
                    </div>
                    </div><h3><span id="username">melt</span><bridge title="${lang().meo_bridged.title}">${lang().meo_bridged.start}</bridge><i class="date">04/06/24, 11:49 pm</i></h3><p>pal was so eepy she couldn't even finish speaking!! 😹</p></div></div><div id="example" class="post"><div class="pfp"><img src="https://uploads.meower.org/icons/09M4f10bxn4AbvadnNCKZCiP" alt="Avatar" class="avatar" style="border: 3px solid #b190fe;"></div><div class="wrapper"><div class="buttonContainer">
                    <div class="toolbarContainer">
                        <div class="toolButton">
                            <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18"><path d="M12.9297 3.25007C12.7343 3.05261 12.4154 3.05226 12.2196 3.24928L11.5746 3.89824C11.3811 4.09297 11.3808 4.40733 11.5739 4.60245L16.5685 9.64824C16.7614 9.84309 16.7614 10.1569 16.5685 10.3517L11.5739 15.3975C11.3808 15.5927 11.3811 15.907 11.5746 16.1017L12.2196 16.7507C12.4154 16.9477 12.7343 16.9474 12.9297 16.7499L19.2604 10.3517C19.4532 10.1568 19.4532 9.84314 19.2604 9.64832L12.9297 3.25007Z"></path><path d="M8.42616 4.60245C8.6193 4.40733 8.61898 4.09297 8.42545 3.89824L7.78047 3.24928C7.58466 3.05226 7.26578 3.05261 7.07041 3.25007L0.739669 9.64832C0.5469 9.84314 0.546901 10.1568 0.739669 10.3517L7.07041 16.7499C7.26578 16.9474 7.58465 16.9477 7.78047 16.7507L8.42545 16.1017C8.61898 15.907 8.6193 15.5927 8.42616 15.3975L3.43155 10.3517C3.23869 10.1569 3.23869 9.84309 3.43155 9.64824L8.42616 4.60245Z"></path></svg>
                        </div>
                        <div class="toolButton">
                            <svg class="icon" height="24" width="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.486 2 2 6.486 2 12C2 17.515 6.486 22 12 22C14.039 22 15.993 21.398 17.652 20.259L16.521 18.611C15.195 19.519 13.633 20 12 20C7.589 20 4 16.411 4 12C4 7.589 7.589 4 12 4C16.411 4 20 7.589 20 12V12.782C20 14.17 19.402 15 18.4 15L18.398 15.018C18.338 15.005 18.273 15 18.209 15H18C17.437 15 16.6 14.182 16.6 13.631V12C16.6 9.464 14.537 7.4 12 7.4C9.463 7.4 7.4 9.463 7.4 12C7.4 14.537 9.463 16.6 12 16.6C13.234 16.6 14.35 16.106 15.177 15.313C15.826 16.269 16.93 17 18 17L18.002 16.981C18.064 16.994 18.129 17 18.195 17H18.4C20.552 17 22 15.306 22 12.782V12C22 6.486 17.514 2 12 2ZM12 14.599C10.566 14.599 9.4 13.433 9.4 11.999C9.4 10.565 10.566 9.399 12 9.399C13.434 9.399 14.6 10.565 14.6 11.999C14.6 13.433 13.434 14.599 12 14.599Z"></path></svg>
                        </div>
                        <div class="toolButton">
                            <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M20 6.00201H14V3.00201C14 2.45001 13.553 2.00201 13 2.00201H4C3.447 2.00201 3 2.45001 3 3.00201V22.002H5V14.002H10.586L8.293 16.295C8.007 16.581 7.922 17.011 8.076 17.385C8.23 17.759 8.596 18.002 9 18.002H20C20.553 18.002 21 17.554 21 17.002V7.00201C21 6.45001 20.553 6.00201 20 6.00201Z"></path></svg>
                        </div>
                        <div class="toolButton">
                            <svg class="icon_d1ac81" width="24" height="24" viewBox="0 0 24 24"><path d="M10 8.26667V4L3 11.4667L10 18.9333V14.56C15 14.56 18.5 16.2667 21 20C20 14.6667 17 9.33333 10 8.26667Z" fill="currentColor"></path></svg>
                        </div>
                    </div>
                    </div><div class="mobileContainer">
                    <div class="toolbarContainer">
                        <div class="toolButton mobileButton">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="M4 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm10-2a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm8 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" clip-rule="evenodd" class=""></path></svg>
                        </div>
                    </div>
                    </div><h3><span id="username">Eris</span><i class="date">04/06/24, 11:12 pm</i></h3><p>get ready for this</p></div></div><div id="example" class="post"><div class="pfp"><img src="https://uploads.meower.org/icons/09M4f10bxn4AbvadnNCKZCiP" alt="Avatar" class="avatar" style="border: 3px solid #b190fe;"></div><div class="wrapper"><div class="buttonContainer">
                    <div class="toolbarContainer">
                        <div class="toolButton">
                            <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18"><path d="M12.9297 3.25007C12.7343 3.05261 12.4154 3.05226 12.2196 3.24928L11.5746 3.89824C11.3811 4.09297 11.3808 4.40733 11.5739 4.60245L16.5685 9.64824C16.7614 9.84309 16.7614 10.1569 16.5685 10.3517L11.5739 15.3975C11.3808 15.5927 11.3811 15.907 11.5746 16.1017L12.2196 16.7507C12.4154 16.9477 12.7343 16.9474 12.9297 16.7499L19.2604 10.3517C19.4532 10.1568 19.4532 9.84314 19.2604 9.64832L12.9297 3.25007Z"></path><path d="M8.42616 4.60245C8.6193 4.40733 8.61898 4.09297 8.42545 3.89824L7.78047 3.24928C7.58466 3.05226 7.26578 3.05261 7.07041 3.25007L0.739669 9.64832C0.5469 9.84314 0.546901 10.1568 0.739669 10.3517L7.07041 16.7499C7.26578 16.9474 7.58465 16.9477 7.78047 16.7507L8.42545 16.1017C8.61898 15.907 8.6193 15.5927 8.42616 15.3975L3.43155 10.3517C3.23869 10.1569 3.23869 9.84309 3.43155 9.64824L8.42616 4.60245Z"></path></svg>
                        </div>
                        <div class="toolButton">
                            <svg class="icon" height="24" width="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.486 2 2 6.486 2 12C2 17.515 6.486 22 12 22C14.039 22 15.993 21.398 17.652 20.259L16.521 18.611C15.195 19.519 13.633 20 12 20C7.589 20 4 16.411 4 12C4 7.589 7.589 4 12 4C16.411 4 20 7.589 20 12V12.782C20 14.17 19.402 15 18.4 15L18.398 15.018C18.338 15.005 18.273 15 18.209 15H18C17.437 15 16.6 14.182 16.6 13.631V12C16.6 9.464 14.537 7.4 12 7.4C9.463 7.4 7.4 9.463 7.4 12C7.4 14.537 9.463 16.6 12 16.6C13.234 16.6 14.35 16.106 15.177 15.313C15.826 16.269 16.93 17 18 17L18.002 16.981C18.064 16.994 18.129 17 18.195 17H18.4C20.552 17 22 15.306 22 12.782V12C22 6.486 17.514 2 12 2ZM12 14.599C10.566 14.599 9.4 13.433 9.4 11.999C9.4 10.565 10.566 9.399 12 9.399C13.434 9.399 14.6 10.565 14.6 11.999C14.6 13.433 13.434 14.599 12 14.599Z"></path></svg>
                        </div>
                        <div class="toolButton">
                            <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M20 6.00201H14V3.00201C14 2.45001 13.553 2.00201 13 2.00201H4C3.447 2.00201 3 2.45001 3 3.00201V22.002H5V14.002H10.586L8.293 16.295C8.007 16.581 7.922 17.011 8.076 17.385C8.23 17.759 8.596 18.002 9 18.002H20C20.553 18.002 21 17.554 21 17.002V7.00201C21 6.45001 20.553 6.00201 20 6.00201Z"></path></svg>
                        </div>
                        <div class="toolButton">
                            <svg class="icon_d1ac81" width="24" height="24" viewBox="0 0 24 24"><path d="M10 8.26667V4L3 11.4667L10 18.9333V14.56C15 14.56 18.5 16.2667 21 20C20 14.6667 17 9.33333 10 8.26667Z" fill="currentColor"></path></svg>
                        </div>
                    </div>
                    </div><div class="mobileContainer">
                    <div class="toolbarContainer">
                        <div class="toolButton mobileButton">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="M4 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm10-2a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm8 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" clip-rule="evenodd" class=""></path></svg>
                        </div>
                    </div>
                    </div><h3><span id="username">Eris</span><i class="date">04/06/24, 11:12 pm</i></h3><p>so ur scared of helpful advice</p></div></div><div id="example" class="post"><div class="pfp"><img src="https://uploads.meower.org/icons/09M4f10bxn4AbvadnNCKZCiP" alt="Avatar" class="avatar" style="border: 3px solid #b190fe;"></div><div class="wrapper"><div class="buttonContainer">
                    <div class="toolbarContainer">
                        <div class="toolButton">
                            <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18"><path d="M12.9297 3.25007C12.7343 3.05261 12.4154 3.05226 12.2196 3.24928L11.5746 3.89824C11.3811 4.09297 11.3808 4.40733 11.5739 4.60245L16.5685 9.64824C16.7614 9.84309 16.7614 10.1569 16.5685 10.3517L11.5739 15.3975C11.3808 15.5927 11.3811 15.907 11.5746 16.1017L12.2196 16.7507C12.4154 16.9477 12.7343 16.9474 12.9297 16.7499L19.2604 10.3517C19.4532 10.1568 19.4532 9.84314 19.2604 9.64832L12.9297 3.25007Z"></path><path d="M8.42616 4.60245C8.6193 4.40733 8.61898 4.09297 8.42545 3.89824L7.78047 3.24928C7.58466 3.05226 7.26578 3.05261 7.07041 3.25007L0.739669 9.64832C0.5469 9.84314 0.546901 10.1568 0.739669 10.3517L7.07041 16.7499C7.26578 16.9474 7.58465 16.9477 7.78047 16.7507L8.42545 16.1017C8.61898 15.907 8.6193 15.5927 8.42616 15.3975L3.43155 10.3517C3.23869 10.1569 3.23869 9.84309 3.43155 9.64824L8.42616 4.60245Z"></path></svg>
                        </div>
                        <div class="toolButton">
                            <svg class="icon" height="24" width="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.486 2 2 6.486 2 12C2 17.515 6.486 22 12 22C14.039 22 15.993 21.398 17.652 20.259L16.521 18.611C15.195 19.519 13.633 20 12 20C7.589 20 4 16.411 4 12C4 7.589 7.589 4 12 4C16.411 4 20 7.589 20 12V12.782C20 14.17 19.402 15 18.4 15L18.398 15.018C18.338 15.005 18.273 15 18.209 15H18C17.437 15 16.6 14.182 16.6 13.631V12C16.6 9.464 14.537 7.4 12 7.4C9.463 7.4 7.4 9.463 7.4 12C7.4 14.537 9.463 16.6 12 16.6C13.234 16.6 14.35 16.106 15.177 15.313C15.826 16.269 16.93 17 18 17L18.002 16.981C18.064 16.994 18.129 17 18.195 17H18.4C20.552 17 22 15.306 22 12.782V12C22 6.486 17.514 2 12 2ZM12 14.599C10.566 14.599 9.4 13.433 9.4 11.999C9.4 10.565 10.566 9.399 12 9.399C13.434 9.399 14.6 10.565 14.6 11.999C14.6 13.433 13.434 14.599 12 14.599Z"></path></svg>
                        </div>
                        <div class="toolButton">
                            <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M20 6.00201H14V3.00201C14 2.45001 13.553 2.00201 13 2.00201H4C3.447 2.00201 3 2.45001 3 3.00201V22.002H5V14.002H10.586L8.293 16.295C8.007 16.581 7.922 17.011 8.076 17.385C8.23 17.759 8.596 18.002 9 18.002H20C20.553 18.002 21 17.554 21 17.002V7.00201C21 6.45001 20.553 6.00201 20 6.00201Z"></path></svg>
                        </div>
                        <div class="toolButton">
                            <svg class="icon_d1ac81" width="24" height="24" viewBox="0 0 24 24"><path d="M10 8.26667V4L3 11.4667L10 18.9333V14.56C15 14.56 18.5 16.2667 21 20C20 14.6667 17 9.33333 10 8.26667Z" fill="currentColor"></path></svg>
                        </div>
                    </div>
                    </div><div class="mobileContainer">
                    <div class="toolbarContainer">
                        <div class="toolButton mobileButton">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="M4 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm10-2a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm8 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" clip-rule="evenodd" class=""></path></svg>
                        </div>
                    </div>
                    </div><h3><span id="username">Eris</span><i class="date">04/04/24, 10:49 pm</i></h3><p><a href="https://uploads.meower.org/attachments/oMZqXLbqOjb9fbkRN3VDYmI0/togif.gif" target="_blank" class="attachment"><svg class="icon_ecf39b icon__13ad2" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"><path fill="currentColor" d="M10.57 4.01a6.97 6.97 0 0 1 9.86 0l.54.55a6.99 6.99 0 0 1 0 9.88l-7.26 7.27a1 1 0 0 1-1.42-1.42l7.27-7.26a4.99 4.99 0 0 0 0-7.06L19 5.43a4.97 4.97 0 0 0-7.02 0l-8.02 8.02a3.24 3.24 0 1 0 4.58 4.58l6.24-6.24a1.12 1.12 0 0 0-1.58-1.58l-3.5 3.5a1 1 0 0 1-1.42-1.42l3.5-3.5a3.12 3.12 0 1 1 4.42 4.42l-6.24 6.24a5.24 5.24 0 0 1-7.42-7.42l8.02-8.02Z" class=""></path></svg><span> attachments</span></a></p><img src="https://uploads.meower.org/attachments/oMZqXLbqOjb9fbkRN3VDYmI0/togif.gif" onclick="openImage('https://uploads.meower.org/attachments/oMZqXLbqOjb9fbkRN3VDYmI0/togif.gif')" alt="togif.gif" class="embed"></div></div>
            </div>
        <div class="theme-buttons">
            <h3>${lang().appearance_sub.theme}</h3>
            <div class="theme-buttons-inner">
                <button onclick='changeTheme(\"light\", this)' class='theme-button light-theme'>Light</button>
                <button onclick='changeTheme(\"dark\", this)' class='theme-button dark-theme'>Dark</button>
                <button onclick='changeTheme(\"oled\", this)' class='theme-button oled-theme'>Black</button>
            </div>
            <h3>Pride Themes</h3>
                <div class="theme-buttons-inner">
                    <button onclick='changeTheme(\"pride\", this)' class='theme-button pride-theme'>Pride</button>
                    <button onclick='changeTheme(\"trans\", this)' class='theme-button trans-theme'>Trans</button>
                </div>
            <h3>${lang().appearance_sub.spthemes}</h3>
                <div class="theme-buttons-inner">
                    <button onclick='changeTheme(\"cosmic\", this)' class='theme-button cosmic-theme'>Cosmic Latte</button>
                    <button onclick='changeTheme(\"lime\", this)' class='theme-button lime-theme'>Lime</button>
                    <button onclick='changeTheme(\"bsky\", this)' class='theme-button bsky-theme'>Midnight</button>
                    <button onclick='changeTheme(\"grain\", this)' class='theme-button grain-theme'>Grain</button>
                    <button onclick='changeTheme(\"sage\", this)' class='theme-button sage-theme'>Sage</button>
                    <button onclick='changeTheme(\"grip\", this)' class='theme-button grip-theme'>9rip</button>
                    <button onclick='changeTheme(\"roarer\", this)' class='theme-button roarer-theme'>Roarer</button>
                    <button onclick='changeTheme(\"flamingo\", this)' class='theme-button flamingo-theme'>Flamingo</button>
                    <button onclick='changeTheme(\"darflen\", this)' class='theme-button darflen-theme'>Darflen</button>
                </div>
            <h3>${lang().appearance_sub.acthemes}</h3>
                <div class="theme-buttons-inner">
                    <button onclick='changeTheme(\"contrast\", this)' class='theme-button contrast-theme'>High Contrast</button>
                </div>
            <h3>${lang().appearance_sub.ogthemes}</h3>
                <div class="theme-buttons-inner">
                    <button onclick='changeTheme(\"oldlight\", this)' class='theme-button oldlight-theme'>Old Light</button>
                    <button onclick='changeTheme(\"old\", this)' class='theme-button old-theme'>Old Dark</button>
                </div>
            <h3>${lang().appearance_sub.glthemes}</h3>
                <div class="theme-buttons-inner">
                    <button onclick='changeTheme(\"glight\", this)' class='theme-button glight-theme'>Light</button>
                    <button onclick='changeTheme(\"gdark\", this)' class='theme-button gdark-theme'>Dark</button>
                    <button onclick='imagemodal()' class='theme-button upload-button'>Add Image</button>
                </div>
            <h3>${lang().appearance_sub.cstheme}</h3>
                <div class="theme-buttons-inner">
                    <button onclick='changeTheme(\"custom\", this)' class='theme-button custom-theme'>Custom</button>
                </div>
            </div>
            <br>
            <div class="customcss">
                <div class="custom-theme-in section">
                    <div class="cstmeinp">
                    <label for="primary" class="custom-label">Primary Color:</label>
                    <input type="color" class="cstcolinpc" id="primary" name="primary" value="#15a4c1">
                    </div>    
                    <div class="cstmeinp">
                    <label for="secondary" class="custom-label">Secondary Color:</label>
                    <input type="color" class="cstcolinpc" id="secondary" name="secondary" value="#0f788e">
                    </div>
                    <div class="cstmeinp">
                    <label for="background" class="custom-label">Background Color:</label>
                    <input type="color" class="cstcolinpc" id="background" name="background" value="#1c1f26">
                    </div>
                    <div class="cstmeinp">
                    <label for="color" class="custom-label">Text Color:</label>
                    <input type="color" class="cstcolinpc" id="color" name="color" value="#fefefe">
                    </div>
                    <div class="cstmeinp">
                    <label for="accent-color" class="custom-label">Accent Color:</label>
                    <input type="color" class="cstcolinpc" id="accent-color" name="accent-color" value="#2f3540">
                    </div>
                    <div class="cstmeinp">
                    <label for="hov-accent-color" class="custom-label">Accent Hover Color:</label>
                    <input type="color" class="cstcolinpc" id="hov-accent-color" name="hov-accent-color" value="#414959">
                    </div>
                    <div class="cstmeinp">
                    <label for="hov-color" class="custom-label">Secondary Hover Color:</label>
                    <input type="color" class="cstcolinpc" id="hov-color" name="hov-color" value="#353b49">
                    </div>
                    <div class="cstmeinp">
                    <label for="link-color" class="custom-label">Link Color:</label>
                    <input type="color" class="cstcolinpc" id="link-color" name="link-color" value="#00abd2">
                    </div>
                    <div class="cstmeinp">
                    <label for="attachment-background-color" class="custom-label">Attachment Background Color:</label>
                    <input type="color" class="cstcolinpc" id="attachment-background-color" name="attachment-background-color" value="#094c5b">
                    </div>
                    <div class="cstmeinp">
                    <label for="attachment-color" class="custom-label">Attachment Text Color:</label>
                    <input type="color" class="cstcolinpc" id="attachment-color" name="attachment-color" value="#15a4c1">
                    </div>
                    <div class="cstmeinp">
                    <label for="attachment-background-color-hover" class="custom-label">Attachment Hover Background Color:</label>
                    <input type="color" class="cstcolinpc" id="attachment-background-color-hover" name="attachment-background-color-hover" value="#15a4c1">
                    </div>
                    <div class="cstmeinp">
                    <label for="attachment-color-hover" class="custom-label">Attachment Hover Text Color:</label>
                    <input type="color" class="cstcolinpc" id="attachment-color-hover" name="attachment-color-hover" value="#fefefe">
                    </div>
                    <div class="cstmeinp">
                    <label for="button-color" class="custom-label">Post Button Color:</label>
                    <input type="color" class="cstcolinpc" id="button-color" name="button-color" value="#a5abb3">
                    </div>
                    <div class="cstmeinp">
                    <label for="hov-button-color" class="custom-label">Post Button Hover Color:</label>
                    <input type="color" class="cstcolinpc" id="hov-button-color" name="hov-button-color" value="#fefefe">
                    </div>
                    <div class="cstmeinp">
                    <label for="modal-color" class="custom-label">Modal Background Color:</label>
                    <input type="color" class="cstcolinpc" id="modal-color" name="modal-color" value="#2f3540">
                    </div>
                    <div class="cstmeinp">
                    <label for="modal-button-color" class="custom-label">Modal Button Color:</label>
                    <input type="color" class="cstcolinpc" id="modal-button-color" name="modal-button-color" value="#414959">
                    </div>
                    <div class="cstmeinp">
                    <label for="hov-modal-button-color" class="custom-label">Modal Button Hover Color:</label>
                    <input type="color" class="cstcolinpc" id="hov-modal-button-color" name="hov-modal-button-color" value="#4d576a">
                    </div>
                </div>
                <button onclick="applyCustomTheme()" class="cstpgbt button">${lang().action.apply}</button>
                <button onclick="saveCustomTheme()" class="cstpgbt button">${lang().action.savetheme}</button>
                <button onclick="loadCustomThemeFile()" class="cstpgbt button">${lang().action.loadtheme}</button>

            </div>
        <h3>${lang().appearance_sub.cscss}</h3>
        <div class='list'>
            <textarea class="editor" id='customcss' placeholder="// you put stuff here"></textarea>
        </div>
    </div>
    `

    pageContainer.innerHTML = settingsContent;

    const themeCSS = localStorage.getItem('themeCSS');

    if (themeCSS) {
        const regex = /--(.*?):(.*?);/g;
        let match;
        while ((match = regex.exec(themeCSS)) !== null) {
            const propertyName = match[1].trim();
            const propertyValue = match[2].trim();

            const inputElement = document.getElementById(propertyName);
            if (inputElement) {
                inputElement.value = propertyValue;
            }
        }
    }

    const css = localStorage.getItem('customCSS');
    const cstmcsstxt = document.getElementById('customcss');
    cstmcsstxt.value = css || '';

    cstmcsstxt.addEventListener('input', function () {
        const newCustomCSS = cstmcsstxt.value;
        
        let customstyle = document.getElementById('customstyle');
        if (!customstyle) {
            customstyle = document.createElement('style');
            customstyle.id = 'customstyle';
            document.head.appendChild(customstyle);
        }
        
        customstyle.textContent = newCustomCSS;
        
        localStorage.setItem('customCSS', newCustomCSS);
    });

    const themeButtons = document.querySelectorAll('.theme-button');
    themeButtons.forEach((btn) => btn.classList.remove('selected'));
    document.querySelector('.theme-buttons .' + localStorage.getItem('theme') + '-theme').classList.add('selected');
}

function applyCustomTheme() {
    const customThemeParameters = document.querySelectorAll('.custom-theme-in input[type="color"]');
    let themeCSS = '';

    customThemeParameters.forEach(input => {
        const propertyName = input.name;
        const propertyValue = input.value;
        themeCSS += `--${propertyName}: ${propertyValue};`;
    });

    let customtheme = document.getElementById('customtheme');

    if (!customtheme) {
        customtheme = document.createElement('style');
        customtheme.id = 'customtheme';
        document.head.appendChild(customtheme);
    }

    customtheme.textContent = `.custom-theme { ${themeCSS} }`;

    localStorage.setItem('themeCSS', themeCSS);
}

function loadCustomTheme() {
    const themeCSS = localStorage.getItem('themeCSS');
    if (themeCSS) {
        let customtheme = document.getElementById('customtheme');
        if (!customtheme) {
            customtheme = document.createElement('style');
            customtheme.id = 'customtheme';
            document.head.appendChild(customtheme);
        }

        customtheme.textContent = `.custom-theme { ${themeCSS} }`;
    }
}

function saveCustomTheme() {
    const themeCSS = document.getElementById('customtheme');
    if (themeCSS) {
        const blob = new Blob([themeCSS.innerText.replace(/^\.custom-theme\s*{\s*|\s*}$/g, '')], { type: 'text/css' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'custom-theme.css';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } else {
        console.error('No cstcss found');
    }
}

function loadCustomThemeFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.css, .txt';

    input.addEventListener('change', function() {
        const file = this.files[0];

        const reader = new FileReader();

        reader.onload = function(event) {
            const themeCSS = event.target.result;

            applyCustomThemeFromFile(themeCSS);
        };

        reader.readAsText(file);
    });

    input.click();
}

function applyCustomThemeFromFile(themeCSS) {
    let customtheme = document.getElementById('customtheme');
    if (!customtheme) {
        customtheme = document.createElement('style');
        customtheme.id = 'customtheme';
        document.head.appendChild(customtheme);
    }

    customtheme.textContent = `.custom-theme { ${themeCSS} }`;

    localStorage.setItem('themeCSS', themeCSS);
}

function loadCustomCss() {
    const css = localStorage.getItem('customCSS');

    let customstyle = document.getElementById('customstyle');
    if (!customstyle) {
        customstyle = document.createElement('style');
        customstyle.id = 'customstyle';
        document.head.appendChild(customstyle);
    }

    customstyle.textContent = css || '';
}

function changeTheme(theme, button) {
    const selectedTheme = theme;
  
    const previousTheme = localStorage.getItem("theme");
    if (previousTheme) {
      document.documentElement.classList.remove(previousTheme + "-theme");
    }
    document.documentElement.classList.add(selectedTheme + "-theme");
    localStorage.setItem("theme", selectedTheme);

    const themeColorMetaTag = document.querySelector('meta[name="theme-color"]');
    themeColorMetaTag.setAttribute('content', getComputedStyle(document.documentElement).getPropertyValue('--background'));

    const themeButtons = document.querySelectorAll('.theme-button');
    themeButtons.forEach((btn) => btn.classList.remove('selected'));
    button.classList.add('selected');
    const lightThemeBody = document.querySelector('body');
    if (lightThemeBody) {
        lightThemeBody.style.backgroundImage = ``;
    }
    loadBG();
}

function loadLanguages() {
    setTop();
    const pageContainer = document.getElementById("main");
    const settingsContent = `
    <div class="settings">
        <h1>${lang().settings_languages}</h1>
        <h3>${lang().languages_sub.title}</h3>
        <div class="msgs"></div>
        <div class="languages">
            <button class="language button" id="en" onclick="changeLanguage('en')"><span class="language-l">${en.language}</span><span class="language-r">English, US</span></button>
            <button class="language button" id="enuk" onclick="changeLanguage('enuk')"><span class="language-l">${enuk.language}</span><span class="language-r">English, UK</span></button>
            <button class="language button" id="es" onclick="changeLanguage('es')"><span class="language-l">${es.language}</span><span class="language-r">Spanish (Latin America)</span></button>
            <button class="language button" id="de" onclick="changeLanguage('de')"><span class="language-l">${de.language}</span><span class="language-r">German</span></button>
        </div>
        <hr>
        <span>${lang().languages_sub.desc} <a href='https://github.com/3r1s-s/meo' target="_blank" id='link'>${lang().languages_sub.link}</a></span>
    </div>
    `;
    pageContainer.innerHTML = settingsContent;
    document.getElementById(language).classList.add("language-selected");
    if (settingsstuff().underlinelinks) {
        document.getElementById("link").classList.add("underline");
    }
}

function changeLanguage(lang) {
    setlang(lang)
    sidebars();
    loadstgs();
    renderChats();
    loadLanguages();
}

function loginLang(lang) {
    setlang(lang)
    loadLogin();
}

function setlang(lang) {
    localStorage.setItem("language", lang);
    language = lang;
}

function settingsstuff() {
    const storedsettings = localStorage.getItem('settings');
    if (!storedsettings) {
        const defaultSettings = {
            "homepage": "false",
            "consolewarnings": "false",
        };
        localStorage.setItem('settings', JSON.stringify(defaultSettings));
        return defaultSettings;
    }

    return JSON.parse(storedsettings);
}

function formattime(timestamp) {
    const now = new Date();
    const timeDiff = now.getTime() - timestamp;
    const seconds = Math.floor(timeDiff / 1000);

    if (seconds < 60) {
        return seconds + (seconds === 1 ? ' second ago' : ' seconds ago');
    }

    const minutes = Math.floor(seconds / 60);

    if (minutes < 60) {
        return minutes + (minutes === 1 ? ' minute ago' : ' minutes ago');
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
        return hours + (hours === 1 ? ' hour ago' : ' hours ago');
    }

    const days = Math.floor(hours / 24);

    return days + (days === 1 ? ' day ago' : ' days ago');
}

function ping() {
    meowerConnection.send(JSON.stringify({
        cmd: "ping",
        val: ""
    }));
}

function launchscreen() {
    page = "load";
    const green = `<div class="launch">
        <svg class="launch-logo" width="128" height="128" viewBox="0 0 512 512" fill="var(--color)" xmlns="http://www.w3.org/2000/svg">
        <g>
            <path d="M468.42 20.5746L332.997 65.8367C310.218 58.8105 284.517 55.049 255.499 55.6094C226.484 55.049 200.78 58.8105 178.004 65.8367L42.5803 20.5746C18.9102 16.3251 -1.81518 36.2937 2.5967 59.1025L38.7636 200.894C18.861 248.282 12.1849 296.099 12.1849 325.027C12.1849 399.343 44.6613 492 255.499 492C466.339 492 498.815 399.343 498.815 325.027C498.815 296.099 492.139 248.282 472.237 200.894L508.404 59.1025C512.814 36.2937 492.09 16.3251 468.42 20.5746Z"/>
        </g>
        </svg>
    </div>`
    const orange = document.getElementById("main");
    orange.innerHTML = green;
    if (document.getElementById("msgs"))
    document.getElementById("msgs").innerHTML = "";
    if (document.getElementById("nav"))
    document.getElementById("nav").innerHTML = "";
    if (document.getElementById("groups"))
    document.getElementById("groups").innerHTML = "";
}

function autoresize() {
    const textarea = document.getElementById('msg');
    textarea.style.height = 'auto';
    textarea.style.height = (((textarea.scrollHeight)) - 26) + 'px';
}

async function deletePost(postid) {
    try {
        const response = await fetch(`https://api.meower.org/posts?id=${postid}`, {
            method: "DELETE",
            headers: {
                "token": localStorage.getItem("token")
            }
        });

        if (response.ok) {
            console.log(`Post with ID ${postid} deleted successfully.`);
            closemodal();
        } else {
            console.error(`Error deleting post with ID ${postid}: ${response.status} - ${response.statusText}`);
        }
    } catch (error) {
        console.error("Error deleting post:", error);
    }
}

function editPost(postOrigin, postid) {
    const post = postCache[postOrigin].find(post => post._id === postid);
    if (!post) return;

    document.getElementById("attach").hidden = true;

    const editIndicator = document.getElementById("edit-indicator");
    editIndicator.setAttribute("data-postid", postid);
    editIndicator.innerHTML = `
    <span class="edit-info">${lang().info.editingpost} ${postid}</span>
    <span onclick="cancelEdit()">
    <svg width="14" height="14" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M2.05026 11.9497C4.78394 14.6834 9.21607 14.6834 11.9497 11.9497C14.6834 9.21607 14.6834 4.78394 11.9497 2.05026C9.21607 -0.683419 4.78394 -0.683419 2.05026 2.05026C-0.683419 4.78394 -0.683419 9.21607 2.05026 11.9497ZM9.3065 10.2946L7.00262 7.99112L4.69914 10.295C4.42624 10.5683 3.98395 10.5683 3.71065 10.295C3.43754 10.0219 3.43754 9.5788 3.71065 9.3065L6.01432 7.00282L3.7048 4.69371C3.4317 4.4206 3.4317 3.97791 3.7048 3.7048C3.97751 3.4317 4.4202 3.4317 4.6933 3.7048L7.00262 6.01412L9.3065 3.71065C9.4791 3.53764 9.71978 3.4742 9.94253 3.52012C10.0718 3.5467 10.1949 3.61014 10.2952 3.71044C10.5683 3.98315 10.5683 4.42624 10.2952 4.69894L7.99132 7.00242L10.295 9.30609C10.5683 9.579 10.5683 10.0213 10.295 10.2946C10.0221 10.5679 9.5794 10.5679 9.3065 10.2946Z" fill="currentColor"/>
    </svg>
    </span>
`;

    const msgbox = document.getElementById("msg");
    msgbox.value = post.unfiltered_p || post.p;
    msgbox.focus();
    autoresize();
    closemodal();
}

function cancelEdit() {
    const editIndicator = document.getElementById("edit-indicator");
    editIndicator.removeAttribute("data-postid");
    editIndicator.innerText = "";
    document.getElementById("attach").hidden = false;
    document.getElementById('msg').value = "";
    autoresize();
}

function openImage(url) {
    const baseURL = url.split('?')[0];
    const fileName = baseURL.split('/').pop();
    
    document.documentElement.style.overflow = "hidden";
    const mdlbck = document.querySelector('.image-back');
    
    if (mdlbck) {
        mdlbck.style.display = 'flex';
        
        const mdl = mdlbck.querySelector('.image-mdl');
        if (mdl) {
            mdl.innerHTML = `
            <img class='embed-large' src='${url}' alt="${fileName}" onclick='preventClose(event)'>
            <div class="img-links">
            <span class="img-link-outer"><a onclick="closeImage()" class="img-link">${lang().action.close}</a></span>
            <span><a href="${url}" target="_blank" class="img-link">${lang().action.opennewtab}</a></span>
            </div>
            `;
        }
    }  
}

function preventClose(event) {
    event.stopPropagation();
}

function closeImage() {
    document.documentElement.style.overflow = "";
    
    const mdlbck = document.querySelector('.image-back');
    
    if (mdlbck) {
        mdlbck.style.display = 'none';
    }
    
    const mdl = document.querySelector('.image-mdl');
    
    if (mdlbck) {
        mdl.style.background = '';
        mdl.classList.remove('custom-bg');
        mdl.innerHTML = '';
    }
}

function createChat() {
    const nickname = document.getElementById("chat-nick-input").value.trim();
    if (nickname.length < 1) {
        openUpdate("Chat nickname too short!");
        return;
    } else if (nickname.length > 20) {
        openUpdate("Chat nickname too long!");
        return;
    }
    fetch("https://api.meower.org/chats", {
        method: "POST",
        headers: {
            token: localStorage.getItem("token"),
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ nickname })
    })
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    })
    .then(data => {
        chatCache[data._id] = data;
        loadchat(data._id);
        closemodal();
    })
    .catch(e => {
        openUpdate(`Failed to create chat: ${e}`);
    });
}

function favChat(e, chatId) {
    e.stopPropagation();

    // Filter faved chats
    favoritedChats = favoritedChats.filter(_chatId => chatCache[_chatId]);

    if (favoritedChats.includes(chatId)) {
        favoritedChats = favoritedChats.filter(_chatId => _chatId !== chatId);
    } else {
        favoritedChats.push(chatId);
    }
    renderChats();
    fetch("https://api.meower.org/me/config", {
        method: "PATCH",
        headers: {
            token: localStorage.getItem("token"),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ favorited_chats: favoritedChats })
    });
}

function closeChatModal(e, chatId, chatName) {
    e.stopPropagation();

    const chat = chatCache[chatId];
    if (chat && chat.type === 1) {
        closeChat(chat._id);
        return;
    }

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
                <h3>${lang().action.leavegc}</h3>
                <hr class="mdl-hr">
                <span class="subheader">${lang().leave_sub.desc} ${chatName}${lang().leave_sub.end}</span>
                `;
            }
            const mdbt = mdl.querySelector('.modal-bottom');
            if (mdbt) {
                mdbt.innerHTML = `
                <button class="modal-back-btn" onclick="closeChat('${chatId}')">${lang().action.yes}</button>
                `;
            }
        }
    }
}

function closeChat(chatId) {
    closemodal();
    fetch(`https://api.meower.org/chats/${chatId}`, {
        method: "DELETE",
        headers: { token: localStorage.getItem("token") }
    });
}

function openModal(postId) {
    document.documentElement.style.overflow = "hidden";
    const mdlbck = document.querySelector('.modal-back');
    
    if (mdlbck) {
        mdlbck.style.display = 'flex';
        
        const mdl = mdlbck.querySelector('.modal');
        if (mdl) {
            mdl.id = postId;
            let mdbt = mdl.querySelector('.modal-bottom');
            if (mdbt) {
                mdbt.innerHTML = `
                <button class="modal-back-btn" onclick="openModModal();">${lang().action.back}</button>
                `;
            }
            const mdlt = mdl.querySelector('.modal-top');
            if (mdlt) {
                mdlt.innerHTML = `
                <button class="modal-button" onclick="mdlreply(event)"><div>${lang().action.reply}</div><div class="modal-icon"><svg class="icon_d1ac81" width="24" height="24" viewBox="0 0 24 24"><path d="M10 8.26667V4L3 11.4667L10 18.9333V14.56C15 14.56 18.5 16.2667 21 20C20 14.6667 17 9.33333 10 8.26667Z" fill="currentColor"></path></svg></div></button>
                <button class="modal-button" onclick="mdlpingusr(event)"><div>${lang().action.mention}</div><div class="modal-icon"><svg class="icon" height="24" width="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.486 2 2 6.486 2 12C2 17.515 6.486 22 12 22C14.039 22 15.993 21.398 17.652 20.259L16.521 18.611C15.195 19.519 13.633 20 12 20C7.589 20 4 16.411 4 12C4 7.589 7.589 4 12 4C16.411 4 20 7.589 20 12V12.782C20 14.17 19.402 15 18.4 15L18.398 15.018C18.338 15.005 18.273 15 18.209 15H18C17.437 15 16.6 14.182 16.6 13.631V12C16.6 9.464 14.537 7.4 12 7.4C9.463 7.4 7.4 9.463 7.4 12C7.4 14.537 9.463 16.6 12 16.6C13.234 16.6 14.35 16.106 15.177 15.313C15.826 16.269 16.93 17 18 17L18.002 16.981C18.064 16.994 18.129 17 18.195 17H18.4C20.552 17 22 15.306 22 12.782V12C22 6.486 17.514 2 12 2ZM12 14.599C10.566 14.599 9.4 13.433 9.4 11.999C9.4 10.565 10.566 9.399 12 9.399C13.434 9.399 14.6 10.565 14.6 11.999C14.6 13.433 13.434 14.599 12 14.599Z"></path></svg></div></button>
                <button class="modal-button" onclick="reportModal(event)"><div>${lang().action.report}</div><div class="modal-icon"><svg height="20" width="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M20 6.00201H14V3.00201C14 2.45001 13.553 2.00201 13 2.00201H4C3.447 2.00201 3 2.45001 3 3.00201V22.002H5V14.002H10.586L8.293 16.295C8.007 16.581 7.922 17.011 8.076 17.385C8.23 17.759 8.596 18.002 9 18.002H20C20.553 18.002 21 17.554 21 17.002V7.00201C21 6.45001 20.553 6.00201 20 6.00201Z"></path></svg></div></button>      
                <button class="modal-button" onclick="mdlshare(event)"><div>${lang().action.share}</div><div class="modal-icon"><svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18"><path d="M12.9297 3.25007C12.7343 3.05261 12.4154 3.05226 12.2196 3.24928L11.5746 3.89824C11.3811 4.09297 11.3808 4.40733 11.5739 4.60245L16.5685 9.64824C16.7614 9.84309 16.7614 10.1569 16.5685 10.3517L11.5739 15.3975C11.3808 15.5927 11.3811 15.907 11.5746 16.1017L12.2196 16.7507C12.4154 16.9477 12.7343 16.9474 12.9297 16.7499L19.2604 10.3517C19.4532 10.1568 19.4532 9.84314 19.2604 9.64832L12.9297 3.25007Z"></path><path d="M8.42616 4.60245C8.6193 4.40733 8.61898 4.09297 8.42545 3.89824L7.78047 3.24928C7.58466 3.05226 7.26578 3.05261 7.07041 3.25007L0.739669 9.64832C0.5469 9.84314 0.546901 10.1568 0.739669 10.3517L7.07041 16.7499C7.26578 16.9474 7.58465 16.9477 7.78047 16.7507L8.42545 16.1017C8.61898 15.907 8.6193 15.5927 8.42616 15.3975L3.43155 10.3517C3.23869 10.1569 3.23869 9.84309 3.43155 9.64824L8.42616 4.60245Z"></path></svg></div></button>      
                `;

                const postDiv = document.getElementById(postId);
                const usernameElement = postDiv.querySelector('#username').innerText;

                if (usernameElement === localStorage.getItem("username")) {
                    mdlt.innerHTML += `
                    <button class="modal-button" onclick="deletePost('${postId}')"><div>${lang().action.delete}</div><div class="modal-icon"><svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M15 3.999V2H9V3.999H3V5.999H21V3.999H15Z"></path><path fill="currentColor" d="M5 6.99902V18.999C5 20.101 5.897 20.999 7 20.999H17C18.103 20.999 19 20.101 19 18.999V6.99902H5ZM11 17H9V11H11V17ZM15 17H13V11H15V17Z"></path></svg></div></button>      
                    <button class="modal-button" onclick="editPost('${page}', '${postId}')"><div>${lang().action.edit}</div><div class="modal-icon"><svg width="20" height="20" viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M19.2929 9.8299L19.9409 9.18278C21.353 7.77064 21.353 5.47197 19.9409 4.05892C18.5287 2.64678 16.2292 2.64678 14.817 4.05892L14.1699 4.70694L19.2929 9.8299ZM12.8962 5.97688L5.18469 13.6906L10.3085 18.813L18.0201 11.0992L12.8962 5.97688ZM4.11851 20.9704L8.75906 19.8112L4.18692 15.239L3.02678 19.8796C2.95028 20.1856 3.04028 20.5105 3.26349 20.7337C3.48669 20.9569 3.8116 21.046 4.11851 20.9704Z" fill="currentColor"></path></svg></div></button>      
                    `; 
                }

                if (localStorage.getItem("permissions") === "1") {
                    mdlt.innerHTML += `
                    <button class="modal-button" onclick="modPostModal('${postId}')"><div>${lang().action.mod}</div><div class="modal-icon"><svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M19 6.00001C15.56 6.00001 12.826 2.43501 12.799 2.39801C12.421 1.89801 11.579 1.89801 11.201 2.39801C11.174 2.43501 8.44 6.00001 5 6.00001C4.447 6.00001 4 6.44801 4 7.00001V14C4 17.807 10.764 21.478 11.534 21.884C11.68 21.961 11.84 21.998 12 21.998C12.16 21.998 12.32 21.96 12.466 21.884C13.236 21.478 20 17.807 20 14V7.00001C20 6.44801 19.553 6.00001 19 6.00001ZM15 16L12 14L9 16L10 13L8 11H11L12 8.00001L13 11H16L14 13L15 16Z"></path></svg></div></button>      
                    `; 
                }
            }
            mdbt = mdl.querySelector('.modal-bottom');
            if (mdbt) {
                mdbt.innerHTML = ``;
            }
        }
    }  
}

function openUsrModal(uId) {
    document.documentElement.style.overflow = "hidden";
    
    const mdlbck = document.querySelector('.modal-back');

    if (mdlbck) {
        mdlbck.style.display = 'flex';
        const mdl = mdlbck.querySelector('.modal');
        if (mdl) {
            const mdlt = mdl.querySelector('.modal-top');
            if (mdlt) {
                mdlt.innerHTML = `
                <iframe class="profile" src="profile/?u=${uId}"></iframe>
                `;
                
                fetch(`https://api.meower.org/users/${uId}`)
                .then(response => response.json())
                .then(data => {
                    if (data.avatar_color !== "!color") {
                        const clr1 = darkenColour(data.avatar_color, 3);
                        const clr2 = darkenColour(data.avatar_color, 5);
                        mdl.style.background = `linear-gradient(180deg, ${clr1} 0%, ${clr2} 100%`;
                        mdl.style.setProperty('--accent', clr1);
                        mdl.classList.add('custom-bg');
                    }
                })
                .catch(error => console.error('Error fetching user profile:', error));
                }
        }
        const mdbt = mdl.querySelector('.modal-bottom');
        if (mdbt) {
            mdbt.innerHTML = ``;
        }
    }
}

function reportModal(id) {
    document.documentElement.style.overflow = "hidden";
    
    const mdlbck = document.querySelector('.modal-back');

    if (mdlbck) {
        mdlbck.style.display = 'flex';

        const mdl = mdlbck.querySelector('.modal');
        if (mdl) {
            const mdlt = mdl.querySelector('.modal-top');
            if (mdlt) {
                mdlt.innerHTML = `
                <h3>${lang().modals.report}</h3>
                <hr class="mdl-hr">
                <span class="subheader">${lang().action.reason}</span>
                <select id="report-reason" class="modal-select">
                    <option value="Spam">${lang().reports.spam}</option>
                    <option value="Harassment or abuse towards others">${lang().reports.harrassment}</option>
                    <option value="Rude, vulgar or offensive language">${lang().reports.lanugage}</option>
                    <option value="NSFW (sexual, alcohol, violence, gore, etc.)">${lang().reports.nsfw}</option>
                    <option value="Scams, hacks, phishing or other malicious content">${lang().reports.scam}</option>
                    <option value="Threatening violence or real world harm">${lang().reports.harm}</option>
                    <option value="Illegal activity">${lang().reports.illegal}</option>
                    <option value="Self-harm/suicide">${lang().reports.suicide}</option>
                    <option value="This person is too young to use Meower">${lang().reports.age}</option>
                    <option value="Other">${lang().reports.other}</option>
                </select>
                <span class="subheader">${lang().action.comment}</span>
                <textarea class="mdl-txt" id="report-comment"></textarea>
                <button class="modal-button" onclick="sendReport('${id}')">${lang().action.sendreport}</button>
                `;
            }
            const mdbt = mdl.querySelector('.modal-bottom');
            if (mdbt) {
                mdbt.innerHTML = ``;
            }
        }
    }
}

function sendReport(id) {
    const data = {
        cmd: "direct",
        val: {
            cmd: "report",
            val: {
                type: 0,
                id: id,
                reason: document.getElementById('report-reason').value,
                comment: document.getElementById('report-comment').value
            }
        }
    };
    meowerConnection.send(JSON.stringify(data));
    console.log("Report Sent!");
    closemodal(lang().info.reportsent);
}

async function closemodal(message) {
    document.documentElement.style.overflow = "";
    
    const mdlbck = document.querySelector('.modal-back');
    
    if (mdlbck) {
        mdlbck.style.display = 'none';
    }
    
    const mdl = document.querySelector('.modal');
    
    if (mdlbck) {
        mdl.id = '';
        mdl.style.background = '';
        mdl.classList.remove('custom-bg');
    }
    
    if (message) {
        const delay = ms => new Promise(res => setTimeout(res, ms));
        await delay(100);
        openUpdate(message);
    }
}

function openModModal() {
    document.documentElement.style.overflow = "hidden";
    
    const mdlbck = document.querySelector('.modal-back');

    if (mdlbck) {
        mdlbck.style.display = 'flex';

        const mdl = mdlbck.querySelector('.modal');
        mdl.id = 'mdl-big';
        if (mdl) {
            const mdlt = mdl.querySelector('.modal-top');
            if (mdlt) {
                mdlt.innerHTML = `
                <h3>Moderation Panel</h3>
                <hr class="mdl-hr">
                <span class="subheader">Moderate User (Case Sensitive)</span>
                <div class="mod-goto">
                <form class="section-form" onsubmit="modgotousr();">
                <input type="text" class="mdl-inp" id="usrinpmd" placeholder="Tnix">
                <button class="md-inp-btn button">Go!</button>
                </form>
                </div>
                <span class="subheader">Actions</span>
                
                <div class="mod-actions">
                <button class="modal-button md-fx">Kick Everyone</button>
                <button class="modal-button md-fx">Enable Repair Mode</button>
                <button class="modal-button md-fx">Disable Registration</button>
                </div>
                <span class="subheader">Reports</span>
                <div class="mod-reports mdl-ovr"></div>

                `;
                loadreports();
            }
            const mdbt = mdl.querySelector('.modal-bottom');
            if (mdbt) {
                mdbt.innerHTML = ``;
            }
        }
    }
}

async function loadreports() {
    fetch("https://api.meower.org/admin/reports?autoget=1&page=1&status=pending", {
        method: "GET",
        headers: {
            "token": localStorage.getItem("token")
        }
    })
    .then(response => response.json())
    .then(data => {
        const reports = data.autoget;
        const modreports = document.querySelector('.modal-top');
        
        reports.forEach(report => {
            if (report.type === 'post') {
                const rprtbx = document.createElement('div');
                rprtbx.classList.add('report-box');
                rprtbx.innerHTML = `
                    <div class="buttonContainer">
                        <div class='toolbarContainer'>
                            <div class='toolButton' onclick='closeReport("${report._id}", "false")'>
                                <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M14.3527 12.0051L19.8447 6.51314C20.496 5.86247 20.496 4.80714 19.8447 4.15647C19.1933 3.50514 18.1387 3.50514 17.488 4.15647L11.996 9.64847L6.50401 4.15647C5.85334 3.50514 4.79734 3.50514 4.14734 4.15647C3.49601 4.80714 3.49601 5.86247 4.14734 6.51314L9.63934 12.0051L4.13401 17.5105C3.48267 18.1618 3.48267 19.2165 4.13401 19.8671C4.45934 20.1925 4.88601 20.3551 5.31267 20.3551C5.73934 20.3551 6.16601 20.1925 6.49134 19.8671L11.9967 14.3611L17.4887 19.8531C17.814 20.1785 18.2407 20.3411 18.6673 20.3411C19.094 20.3411 19.52 20.1785 19.846 19.8531C20.4973 19.2018 20.4973 18.1471 19.846 17.4965L14.3527 12.0051Z" fill="currentColor"/></svg>
                            </div>
                            <div class='toolButton' onclick='closeReport("${report._id}", "true")'>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19.52 4.24127C18.7494 3.7406 17.7174 3.95993 17.2147 4.73193L9.95735 15.9179L6.60468 12.8179C5.92868 12.1926 4.87402 12.2346 4.24935 12.9099C3.62468 13.5859 3.66602 14.6406 4.34202 15.2653L9.14802 19.7093C9.46802 20.0059 9.87468 20.1526 10.2787 20.1526C10.7274 20.1526 11.3014 19.9646 11.678 19.3933C11.8994 19.0559 20.0114 6.5466 20.0114 6.5466C20.512 5.77393 20.292 4.74193 19.52 4.24127Z" fill="currentColor"/></svg>
                            </div>
                        </div>
                    </div>
                    <p>ID: ${report._id}</p>
                    <p>Type: ${report.type}</p>
                    <p>Status: ${report.status}</p>
                    <p>Origin: ${report.content.post_origin}</p>
                    <ul class="reports-list"></ul>
                    
                    <div class="report-post" id="username" onclick="modPostModal('${report.content._id}')">
                        <div class="pfp">
                            <img src="" alt="Avatar" class="avatar" style="border: 3px solid rgb(15, 15, 15);">
                        </div>
                        <div class="wrapper">
                        <h3><span class="username">${escapeHTML(report.content.u)}</span></h3>
                        <p>${escapeHTML(report.content.p)}</p>
                        </div>
                    </div>
                `;
                
                modreports.appendChild(rprtbx);
                
                const reportsList = rprtbx.querySelector('.reports-list');
                
                report.reports.forEach(item => {
                    reportsList.innerHTML += `
                    <li>
                        <p>User: ${item.user}</p>
                        <p>Reason: ${item.reason}</p>
                        <p>Comment: ${item.comment}</p>
                    </li>
                    `;
                    
                    loadPfp(report.content.u, 1)
                    .then(pfpElement => {
                        if (pfpElement) {
                            const rpfp = rprtbx.querySelector('.avatar');
                            rpfp.replaceWith(pfpElement);
                        }
                    });
                });

            } else if (report.type === 'user') {                
                const rprtbx = document.createElement('div');
                rprtbx.classList.add('report-box');
                rprtbx.innerHTML = `
                    <div class="buttonContainer">
                        <div class='toolbarContainer'>
                            <div class='toolButton' onclick='closeReport("${report._id}", "false")'>
                                <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M14.3527 12.0051L19.8447 6.51314C20.496 5.86247 20.496 4.80714 19.8447 4.15647C19.1933 3.50514 18.1387 3.50514 17.488 4.15647L11.996 9.64847L6.50401 4.15647C5.85334 3.50514 4.79734 3.50514 4.14734 4.15647C3.49601 4.80714 3.49601 5.86247 4.14734 6.51314L9.63934 12.0051L4.13401 17.5105C3.48267 18.1618 3.48267 19.2165 4.13401 19.8671C4.45934 20.1925 4.88601 20.3551 5.31267 20.3551C5.73934 20.3551 6.16601 20.1925 6.49134 19.8671L11.9967 14.3611L17.4887 19.8531C17.814 20.1785 18.2407 20.3411 18.6673 20.3411C19.094 20.3411 19.52 20.1785 19.846 19.8531C20.4973 19.2018 20.4973 18.1471 19.846 17.4965L14.3527 12.0051Z" fill="currentColor"/></svg>
                            </div>
                            <div class='toolButton' onclick='closeReport("${report._id}", "true")'>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19.52 4.24127C18.7494 3.7406 17.7174 3.95993 17.2147 4.73193L9.95735 15.9179L6.60468 12.8179C5.92868 12.1926 4.87402 12.2346 4.24935 12.9099C3.62468 13.5859 3.66602 14.6406 4.34202 15.2653L9.14802 19.7093C9.46802 20.0059 9.87468 20.1526 10.2787 20.1526C10.7274 20.1526 11.3014 19.9646 11.678 19.3933C11.8994 19.0559 20.0114 6.5466 20.0114 6.5466C20.512 5.77393 20.292 4.74193 19.52 4.24127Z" fill="currentColor"/></svg>
                            </div>
                        </div>
                    </div>
                    <p>ID: ${report._id}</p>
                    <p>Type: ${report.type}</p>
                    <p>Status: ${report.status}</p>
                    <ul class="reports-list"></ul>
                    
                    <div class="report-user" id="username" onclick="modUserModal('${report.content._id}')">
                    <div class="pfp">
                        <img src="" alt="Avatar" class="avatar" style="border: 3px solid rgb(15, 15, 15);">
                    </div>    
                    <div class="wrapper">
                        <h3><span>${report.content._id}</span></h3>
                        <p>${report.content.quote}</p>
                    </div>
                    </div>
                `;
                
                modreports.appendChild(rprtbx);
                
                const reportsList = rprtbx.querySelector('.reports-list');
                
                report.reports.forEach(item => {
                    reportsList.innerHTML += `
                    <li>
                        <p>User: ${item.user}</p>
                        <p>Reason: ${item.reason}</p>
                        <p>Comment: ${item.comment}</p>
                    </li>
                    `;

                    const rpfp = rprtbx.querySelector('.avatar');
                    if (report.content.avatar) {
                        rpfp.src = `https://uploads.meower.org/icons/${report.content.avatar}`
                        rpfp.style = `border: 3px solid #${report.content.avatar_color};background-color:#${report.content.avatar_color};`
                    } else {
                        rpfp.src = `images/avatars/icon_${report.content.pfp_data - 1}.svg`
                        rpfp.style = `border: 3px solid #${report.content.avatar_color};background-color:#fff;`
                    }
                });
            }
        });
    })
    .catch(error => {
        console.error("Error loading reports:", error);
    });

}

function modUserModal(user) {
    document.documentElement.style.overflow = "hidden";
    
    const mdlbck = document.querySelector('.modal-back');

    if (mdlbck) {
        mdlbck.style.display = 'flex';

        const mdl = mdlbck.querySelector('.modal');
        mdl.id = 'mdl-big';
        mdl.style.background = '';
        mdl.classList.remove('custom-bg');
        if (mdl) {
            const mdlt = mdl.querySelector('.modal-top');
            if (mdlt) {
                mdlt.innerHTML = `
                <h3>Moderate ${user}</h3>
                <hr class="mdl-hr">
                <div class="mod-user"></div>
                `;
                loadmoduser(user);
            }
            const mdbt = mdl.querySelector('.modal-bottom');
            if (mdbt) {
                mdbt.innerHTML = `
                <button class="modal-back-btn" onclick="openModModal();">back</button>
                `;
            }
        }
    }
}

async function loadmoduser(user) {
    fetch(`https://api.meower.org/admin/users/${user}`, {
        method: "GET",
        headers: {
            "token": localStorage.getItem("token")
        }
    })
    .then(response => response.json())
    .then(data => {
        const modusr = document.querySelector('.mod-user');
        modusr.innerHTML = `
        <span class="subheader">User Info</span>
        <div class="mod-post">
        <div class="pfp">
            <img src="" alt="Avatar" class="avatar" style="">
        </div>
        <div class="wrapper">
            <h3><span>${data._id}</span></h3>
            <p>${data.quote}</p>
        </div>
        </div>
            <span class="subheader">User Info</span>
            <ul>
            <li>UUID: ${data.uuid}</li>
            <li>Flags: ${data.flags}</li>
            <li>Permissions: ${data.permissions}</li>
            <li>Pfp: ${data.pfp_data}</li>
            </ul>
            <span class="subheader">Alts</span>
            <ul id="alts">
            </ul>
            <span class="subheader">Recent IPs</span>
            <div id="ips" class="mod-table">
            <div class="table-section">
                <div class="mod-td">IP Address</div>
                <div class="mod-td">Last Used</div>
                <div class="mod-td">Flags</div>
            </div>
            </div>
            <span class="subheader">Note</span>
            <textarea id="mod-post-note" class="mdl-txt"></textarea>
            <button class="modal-button" onclick="updateNote('${data.uuid}')">Update Note</button>
            <span class="subheader">Alert</span>
            <textarea id="mod-user-alert" class="mdl-txt"></textarea>
            <button class="modal-button" onclick="sendAlert('${data._id}')">Send Alert</button>
        `;

        const rpfp = document.querySelector('.mod-post .avatar');
        if (data.avatar) {
            rpfp.src = `https://uploads.meower.org/icons/${data.avatar}`;
            rpfp.style.border = `3px solid #${data.avatar_color}`;
            rpfp.style.backgroundColor = `#${data.avatar_color}`;
        } else if (data.pfp_data) {
            // legacy avatars
            rpfp.src = `images/avatars/icon_${data.pfp_data - 1}.svg`;
            rpfp.classList.add('svg-avatar');
            rpfp.style.border = `3px solid #${data.avatar_color}`;
            rpfp.style.backgroundColor = `#fff`;
        } else {
            rpfp.src = `images/avatars/icon_-4.svg`;
            rpfp.classList.add('svg-avatar');
            rpfp.style.border = `3px solid #fff`;
            rpfp.style.backgroundColor = `#fff`;
        }

        const altlist = modusr.querySelector('#alts');
        const iplist = modusr.querySelector('#ips');

        data.alts.forEach(item => {
            altlist.innerHTML += `
            <li>
                <span id="username" onclick="modUserModal('${item}')">${item}</span>
            </li>
            `;
        });

        data.recent_ips.forEach(item => {
            iplist.innerHTML += `
            <div class="table-section">
                <div class="mod-td" onclick="openUpdate('${item.netinfo._id}')">${item.ip}</div>
                <div class="mod-td">${createDate(item.last_used)}</div>
                <div class="mod-td">${item.netinfo.vpn}</div>
            </div>
            `;
        });
    
        fetch(`https://api.meower.org/admin/notes/${data.uuid}`, {
            method: "GET",
            headers: {
                "token": localStorage.getItem("token")
            }
        })
        .then(response => response.json())
        .then(noteData => {
            if (noteData && noteData.notes) {
                const mdpsnt = document.getElementById('mod-post-note');
                mdpsnt.value = noteData.notes;
            } else {
                console.log("No data received from server, the note is probably blank");
            }
        })
        .catch(error => {
            console.error("Error loading note data:", error);
        });
    
    })
    .catch(error => {
        console.error("Error loading post:", error);
    });
}

function modPostModal(postid) {
    document.documentElement.style.overflow = "hidden";
    
    const mdlbck = document.querySelector('.modal-back');

    if (mdlbck) {
        mdlbck.style.display = 'flex';

        const mdl = mdlbck.querySelector('.modal');
        mdl.id = 'mdl-big';
        if (mdl) {
            const mdlt = mdl.querySelector('.modal-top');
            if (mdlt) {
                mdlt.innerHTML = `
                <h3>Moderate ${postid}</h3>
                <hr class="mdl-hr">
                <span class="subheader">Post</span>
                <div class="mod-posts"></div>
                <span class="subheader">Note</span>

                <textarea id="mod-post-note" class="mdl-txt"></textarea>
                <button class="modal-button" onclick="updateNote('${postid}')">Update Note</button>
                `;
                loadmodpost(postid);
            }
            const mdbt = mdl.querySelector('.modal-bottom');
            if (mdbt) {
                mdbt.innerHTML = `
                <button class="modal-back-btn" onclick="openModModal();">back</button>
                `;
            }
        }
    }
}

async function loadmodpost(postid) {
    fetch(`https://api.meower.org/admin/posts/${postid}`, {
        method: "GET",
        headers: {
            "token": localStorage.getItem("token")
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data) {
            fetch(`https://api.meower.org/users/${data.u}`)
                .then(response => response.json())
                .then(userData => {
                    if (userData) {
                        if (data.unfiltered_p) {
                            const modpst = document.querySelector('.mod-posts');
                            modpst.innerHTML = `
                                <div class="mod-post">
                                    <div class="pfp">
                                        <img src="" alt="Avatar" class="avatar" style="" onclick="modUserModal('${data.u}')">
                                    </div>
                                    <div class="wrapper">
                                    <div class="mdbtcntner">
                                        <div class='toolButton' onclick='modDeletePost("${postid}")'>
                                            <svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M15 3.999V2H9V3.999H3V5.999H21V3.999H15Z"></path><path fill="currentColor" d="M5 6.99902V18.999C5 20.101 5.897 20.999 7 20.999H17C18.103 20.999 19 20.101 19 18.999V6.99902H5ZM11 17H9V11H11V17ZM15 17H13V11H15V17Z"></path></svg>
                                        </div>
                                    </div>    
                                    <h3><span id="username" onclick="modUserModal('${data.u}')">${data.u}</span></h3>
                                        <p>${data.unfiltered_p}</p>
                                    </div>
                                </div>
                            `;
                        } else {
                            const modpst = document.querySelector('.mod-posts');
                            modpst.innerHTML = `
                                <div class="mod-post">
                                    <div class="pfp">
                                        <img src="" alt="Avatar" class="avatar" style="" onclick="modUserModal('${data.u}')">
                                    </div>
                                    <div class="wrapper">
                                    <div class="mdbtcntner">
                                        <div class='toolButton' onclick='modDeletePost("${postid}")'>
                                            <svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M15 3.999V2H9V3.999H3V5.999H21V3.999H15Z"></path><path fill="currentColor" d="M5 6.99902V18.999C5 20.101 5.897 20.999 7 20.999H17C18.103 20.999 19 20.101 19 18.999V6.99902H5ZM11 17H9V11H11V17ZM15 17H13V11H15V17Z"></path></svg>
                                        </div>
                                    </div>    
                                    <h3><span id="username" onclick="modUserModal('${data.u}')">${data.u}</span></h3>
                                        <p>${data.p}</p>
                                    </div>
                                </div>
                            `;
                        }
                        const rpfp = document.querySelector('.mod-posts .avatar');
                        if (userData.avatar) {
                            rpfp.src = `https://uploads.meower.org/icons/${userData.avatar}`;
                            rpfp.style.border = `3px solid #${userData.avatar_color}`;
                            rpfp.style.backgroundColor = `#${userData.avatar_color}`;
                        } else {
                            // legacy avatars
                            rpfp.src = `images/avatars/icon_${userData.pfp_data - 1}.svg`;
                            rpfp.classList.add('svg-avatar');
                        }

                        fetch(`https://api.meower.org/admin/notes/${postid}`, {
                            method: "GET",
                            headers: {
                                "token": localStorage.getItem("token")
                            }
                        })
                        .then(response => response.json())
                        .then(noteData => {
                            if (noteData && noteData.notes) {
                                const mdpsnt = document.getElementById('mod-post-note');
                                mdpsnt.value = noteData.notes;
                            } else {
                                console.log("No data received from server, the note is probably blank");
                            }
                        })
                        .catch(error => {
                            console.error("Error loading note data:", error);
                        });
                        
                    } else {
                        console.error("Error: No user data received from server.");
                    }
                })
                .catch(error => {
                    console.error("Error loading user data:", error);
                });
        } else {
            console.error("Error: No data received from server.");
        }
    })
    .catch(error => {
        console.error("Error loading post:", error);
    });
}

async function modDeletePost(postid) {
    try {
        const response = await fetch(`https://api.meower.org/admin/posts/${postid}`, {
            method: "DELETE",
            headers: {
                "token": localStorage.getItem("token")
            }
        });

        if (response.ok) {
            console.log(`Post with ID ${postid} deleted successfully.`);
        } else {
            console.error(`Error deleting post with ID ${postid}: ${response.status} - ${response.statusText}`);
        }
    } catch (error) {
        console.error("Error deleting post:", error);
    }
}

function updateNote(postid) {
    const note = document.getElementById('mod-post-note').value;
    
    fetch(`https://api.meower.org/admin/notes/${postid}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "token": localStorage.getItem("token")
        },
        body: JSON.stringify({
            notes: note
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Note updated successfully:", data);
    })
    .catch(error => {
        console.error("Error updating note:", error);
    });
}

function sendAlert(userid) {
    const note = document.getElementById('mod-user-alert').value;
    
    fetch(`https://api.meower.org/admin/users/${userid}/alert`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "token": localStorage.getItem("token")
        },
        body: JSON.stringify({
            content: note
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Alerted successfully:", data);
    })
    .catch(error => {
        console.error("Error sending alert:", error);
    });
}

function closeReport(postid, action) {
    if (action) {
        fetch(`https://api.meower.org/admin/reports/${postid}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "token": localStorage.getItem("token")
            },
            body: JSON.stringify({
                status: "action.taken"
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log("Report updated successfully:", data);
        })
        .catch(error => {
            console.error("Error updating report:", error);
        });
    } else {
        fetch(`https://api.meower.org/admin/reports/${postid}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "token": localStorage.getItem("token")
            },
            body: JSON.stringify({
                status: "no_action_taken"
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log("Report updated successfully:", data);
        })
        .catch(error => {
            console.error("Error updating report:", error);
        });
    }
}

function openUpdate(message) {
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
                <h3>${message}</h3>
                `;
            }
            const mdbt = mdl.querySelector('.modal-bottom');
            if (mdbt) {
                mdbt.innerHTML = ``;
            }
        }
    }
}

function createChatModal() {
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
                <h3>${lang().action.creategc}</h3>
                <input id="chat-nick-input" class="mdl-inp" placeholder="${lang().action.nick}" minlength="1" maxlength="20">
                `;
            }
            const mdbt = mdl.querySelector('.modal-bottom');
            if (mdbt) {
                mdbt.innerHTML = `
                <button class="modal-back-btn" onclick="createChat()">${lang().action.create}</button>
                `;
            }
        }
    }
}

function blockWordSel() {
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
                    <h3>${lang().modals.blockword}</h3>
                    <input id="block-word-input" class="mdl-inp" placeholder="Word">
                    `;
            }
            const mdbt = mdl.querySelector('.modal-bottom');
            if (mdbt) {
                mdbt.innerHTML = `
                <button class="modal-back-btn" onclick="blockWord(document.getElementById('block-word-input').value)">${lang().action.block}</button>
                `;
            }
        }
    }
}

function blockUserSel() {
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
                    <h3>${lang().modals.blockauser}</h3>
                    <input id="block-user-input" class="mdl-inp" placeholder="JoshAtticus">
                    `;
            }
            const mdbt = mdl.querySelector('.modal-bottom');
            if (mdbt) {
                mdbt.innerHTML = `
                <button class="modal-back-btn" onclick="blockUserModal(document.getElementById('block-user-input').value)">${lang().action.block}</button>
                `;
            }
        }
    }
}

function blockUserModal(user) {
    document.documentElement.style.overflow = "hidden";
    
    const mdlbck = document.querySelector('.modal-back');
    if (mdlbck) {
        mdlbck.style.display = 'flex';
        
        const mdl = mdlbck.querySelector('.modal');
        mdl.id = 'mdl-uptd';
        if (mdl) {
            const mdlt = mdl.querySelector('.modal-top');
            if (mdlt) {
                if (blockedUsers.hasOwnProperty(user)) {
                    mdlt.innerHTML = `
                    <h3>${lang().modals.unblockuser} ${user}?</h3>
                    `;
                } else {
                    mdlt.innerHTML = `
                    <h3>${lang().modals.blockuser} ${user}?</h3>
                    `;
                }
            }
            const mdbt = mdl.querySelector('.modal-bottom');
            if (mdbt) {
                mdbt.innerHTML = `
                <button class="modal-back-btn" onclick="blockUser('${user}')">${lang().action.yes}</button>
                `;
            }
        }
    }
}

function imagemodal() {
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
                <h3>${lang().modals.bgimage}</h3>
                <input id="bg-image-input" class="mdl-inp" placeholder="https://512pixels.net/downloads/macos-wallpapers/10-3.png">
                `;
            }
            const mdbt = mdl.querySelector('.modal-bottom');
            if (mdbt) {
                mdbt.innerHTML = `
                <button class="modal-back-btn" onclick="updateBG()">${lang().action.update}</button>
                `;
            }
        }
    }
}

function loadBG() {
    const bgImageURL = localStorage.getItem('backgroundImageURL');
    console.log(bgImageURL)
    if (bgImageURL) {
        const lightThemeBody = document.querySelector('.glight-theme body');
        if (lightThemeBody) {
            lightThemeBody.style.backgroundImage = `url('${bgImageURL}')`;
        }

        const darkThemeBody = document.querySelector('.gdark-theme body');
        if (darkThemeBody) {
            darkThemeBody.style.backgroundImage = `url('${bgImageURL}')`;
        }
    }
}

function updateBG() {
    const bgImageInput = document.getElementById('bg-image-input');
    if (bgImageInput) {
        const bgImageURL = bgImageInput.value;

        localStorage.setItem('backgroundImageURL', bgImageURL);

        const lightThemeBody = document.querySelector('.glight-theme body');
        if (lightThemeBody) {
            lightThemeBody.style.backgroundImage = `url('${bgImageURL}')`;
        }

        const darkThemeBody = document.querySelector('.gdark-theme body');
        if (darkThemeBody) {
            darkThemeBody.style.backgroundImage = `url('${bgImageURL}')`;
        }
    }
    closemodal();
}

// credit: theotherhades
function ipBlockedModal() {
    console.log("Showing IP blocked modal");
    document.documentElement.style.overflow = "hidden";

    let modalback = document.querySelector(".modal-back");

    if (modalback) {
        modalback.style.display = "flex";

        let modal = modalback.querySelector(".modal");
        if (modal) {
            let modaltop = modal.querySelector(".modal-top");
            if (modaltop) {
                modaltop.innerHTML = `
                <h3>${lang().modals.blockedip}</h3>
                <hr class="mdl-hr">
                <span class="subheader">Your current IP address is blocked from accessing Meower.<br /><br />If you think this is a mistake, please contact the moderation team via <a href="${communityDiscordLink}" target="_blank">Discord</a> or email us <a href="${forumLink}" target="_blank">${forumLink}</a>, or try a different network.</span>
                `
            }
        }
        const mdbt = modalback.querySelector('.modal-bottom');
        if (mdbt) {
            mdbt.innerHTML = ``;
        }
    }
}

document.addEventListener('click', function (event) {
    const modalButton = event.target.closest('.modal-button');
    const modal = event.target.closest('.modal');
    const isInsideModal = modal && modal.contains(event.target);

    if (modalButton && !isInsideModal) {
        event.stopPropagation();
    }
});

function mdlreply(event) {
    const modalId = event.target.closest('.modal').id;
    const postContainer = document.getElementById(modalId);

    let postcont = "";
    if (postContainer) {
        const username = postContainer.querySelector('#username').innerText;
        if (postContainer.querySelector('p')) {
            postcont = postContainer.querySelector('p').innerText
            .replace(/\n/g, ' ')
            .replace(/@\w+/g, '')
            .split(' ')
            .slice(0, 6)
            .join(' ');
        } else {
            postcont = "";
        }
        const ogmsg = document.getElementById('msg').value
        
        const postId = postContainer.id;
        document.getElementById('msg').value = `@${username} "${postcont}..." (${postId})\n${ogmsg}`;
        document.getElementById('msg').focus();
        autoresize();
    }
    
    closemodal();
}

function mdlpingusr(event) {
    const modalId = event.target.closest('.modal').id;
    const postContainer = document.getElementById(modalId);

    if (postContainer) {
        const username = postContainer.querySelector('#username').innerText;
        document.getElementById('msg').value = `@${username} `;
        document.getElementById('msg').focus();
        autoresize();
    }

    closemodal();
}

function mdlshare(event) {
    const postId = event.target.closest('.modal').id;
    window.open(`https://leo.atticat.tech/share?id=${postId}`, '_blank');
    closemodal();
}

function loadexplore() {
    page = "explore";
    pre = "explore";
    document.getElementById("main").innerHTML = `
    <div class="explore">
    <h1>${lang().page_explore}</h1>
    <h3>Open User</h3>
    <form class="section-form" onsubmit="gotousr();">
        <input type="text" class="section-input" id="usrinp" placeholder="MikeDEV">
        <button class="section-send button">Go!</button>
    </form>
    <h3>Statistics</h3>
    <div class="section stats">
    </div>
    <div class="trending">
        <span class="user-header"><span>Trending</span><bridge>Beta</bridge></span>
        <div class="section trending-topics">
        </div>
        <div class="section trending-inner">
        </div>
        <hr>
        <p style="font-size: 12px;">Powered by AtticusAI | Trending (Beta) updates every 30 seconds | AI can make things up, take everything with a grain of salt.</p>
    </div>
    </div>
    <br>
    `;
    
    sidebars();

    loadstats();

    loadTrending();
}

function loadTrending() {
    const currentLanguage = currentlang();
    if (currentLanguage !== 'en' && currentLanguage !== 'enuk') {
        document.querySelector('.trending-inner').innerHTML = lang().explore_sub.trendingunavailable;
        return;
    }

    // Show loading text
    document.querySelector('.trending-inner').innerHTML = 'Loading...';

    fetch('https://leoextended.atticat.tech/ai/trending')
    .then(response => response.json())
    .then(data => {
        // Split the data into an array, then map each item to a list item
        const topics = data.trends;
        const listData = data.list.split('\n').map(item => {
            // Replace @username with the desired HTML structure
            const replacedItem = item.replace(/@([-\w]+)/g, (match, username) => {
                return `<span id="username" class="attachment" onclick="openUsrModal('${username}')">@${username}</span>`;
            });
            return `<p class="trending-item">${replacedItem.replace(/^- /, '')}</p>`;
        }).join('');
        document.querySelector('.trending-inner').innerHTML = `
        <div>${listData}</div>
        `;
        document.querySelector('.trending-topics').innerHTML = `
        <div><span style="font-weight: bold;">${topics}</span></div>
        `;
    })
    .catch((error) => {
        console.error('Error:', error);
        document.querySelector('.trending-inner').innerHTML = "Ruh roh! Something went wrong and Trending (Beta) couldn't load :(";
    });
}

function gotousr() {
    event.preventDefault(); 
    openUsrModal(document.getElementById("usrinp").value);
    document.getElementById("usrinp").blur();
}

function modgotousr() {
    event.preventDefault(); 
    modUserModal(document.getElementById("usrinpmd").value);
}

async function loadstats() {
    try {
        const response = await fetch('https://api.meower.org/statistics');
        const data = await response.json();

        const formattedData = {
            chats: formatNumber(data.chats),
            posts: formatNumber(data.posts),
            users: formatNumber(data.users)
        };

        const statsDiv = document.querySelector('.stats');
        statsDiv.innerHTML = `
            <p>There are ${formattedData.chats} chats, ${formattedData.posts} posts, ${formattedData.users} users and counting!</p>
        `;
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

function formatNumber(number) {
    if (number >= 1e6) {
        return (number / 1e6).toFixed(1) + 'm';
    } else if (number >= 1e3) {
        return (number / 1e3).toFixed(1) + 'k';
    } else {
        return number.toString();
    }
}

function darkenColour(hex, amount) {
    hex = hex.replace(/^#/, '');

    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    const nr = Math.max(0, r) / amount;
    const ng = Math.max(0, g) / amount;
    const nb = Math.max(0, b) / amount;

    const nh = `#${(nr << 16 | ng << 8 | nb).toString(16).padStart(6, '0')}`;

    return nh;
}

function lightenColour(hex, amount) {
    hex = hex.replace(/^#/, '');

    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    const nr = Math.min(255, r + (255 - r) / amount);
    const ng = Math.min(255, g + (255 - g) / amount);
    const nb = Math.min(255, b + (255 - b) / amount);

    const nh = `#${(nr << 16 | ng << 8 | nb).toString(16).padStart(6, '0')}`;

    return nh;
}

function createDate(tsmp) {
    const tsr = tsmp;
    tsra = tsr * 1000;
    tsrb = Math.trunc(tsra);
    const ts = new Date();
    ts.setTime(tsrb);
    return new Date(tsrb).toLocaleString([], { month: '2-digit', day: '2-digit', year: '2-digit', hour: 'numeric', minute: 'numeric' });
}

function addAttachment() {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.click();

    input.onchange = function(e) {
        const files = Array.from(e.target.files);
        if (files.some(file => file.size > (25 << 20))) {
            errorModal("File too large", "Please upload files smaller than 25MiB."); // add a lang prop to this
            return;
        }

        for (const file of files) {
            const formData = new FormData();
            formData.append('file', file);
            pendingAttachments.push({
                id: Math.random(),
                file,
                req: fetch('https://uploads.meower.org/attachments', {
                    method: 'POST',
                    headers: { Authorization: localStorage.getItem("token") },
                    body: formData
                })
                .then(response => {
                    return response.json();
                })
                .catch(error => errorModal("Error uploading attachment", error))
            });
        }
        setAttachmentContainer();
    };
}

function deleteAttachment(id) {
    pendingAttachments = pendingAttachments.filter(item => item.id.toString() !== id);
    console.debug(id.toString());
    setAttachmentContainer();
}

function setAttachmentContainer() {
    const container = document.getElementById('images-container');
    container.innerHTML = '';    
    //reminder to check if all the drag stuff was removed
    pendingAttachments.forEach((item, index) => {
        item.req.then(data => {
            const filetype = data.filename.split('.').pop().toLowerCase();

            if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(filetype)) {
                const element = document.createElement('div');
                element.classList.add("attach-pre-outer");
                element.title = data.filename;
                element.id = data.id;
                element.innerHTML = `
                <div class="attachment-wrapper">
                <div class="attachment-media">
                <img src="https://uploads.meower.org/attachments/${data.id}/${data.filename}" onclick="openImage('https://uploads.meower.org/attachments/${data.id}/${data.filename}')" class="image-pre">
                </div>
                <div class="attachment-name">
                <span>${data.filename}</span>
                </div>
                <div class="delete-attach" onclick="deleteAttachment('${item.id.toString()}')">
                <svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M15 3.999V2H9V3.999H3V5.999H21V3.999H15Z"></path><path fill="currentColor" d="M5 6.99902V18.999C5 20.101 5.897 20.999 7 20.999H17C18.103 20.999 19 20.101 19 18.999V6.99902H5ZM11 17H9V11H11V17ZM15 17H13V11H15V17Z"></path></svg>
                </div>
                </div>
                `;
                container.appendChild(element);
            } else {
                const element = document.createElement('div');
                element.classList.add("attach-pre-outer");
                element.title = data.filename;
                element.id = data.id;
                element.innerHTML = `
                <div class="attachment-wrapper">
                <div class="attachment-other">
                <div class="other-pre">
                <span class="other-in">.${filetype.toLowerCase()}</span>
                </div>
                </div>
                <div class="attachment-name">
                <span>${data.filename}</span>
                </div>
                <div class="delete-attach" onclick="deleteAttachment('${item.id.toString()}')">
                <svg height="24" viewBox="0 0 24 24" style="width: 100%;"><path fill="currentColor" d="M15 3.999V2H9V3.999H3V5.999H21V3.999H15Z"></path><path fill="currentColor" d="M5 6.99902V18.999C5 20.101 5.897 20.999 7 20.999H17C18.103 20.999 19 20.101 19 18.999V6.99902H5ZM11 17H9V11H11V17ZM15 17H13V11H15V17Z"></path></svg>                </div>
                </div>
                `;
                container.appendChild(element);
            }
// remember to fix delete button alignment

            console.debug("item added" + index);
            console.debug(data);
            console.debug(filetype);
        });
    });
}

function dropFiles(files) {
    const fileArray = Array.from(files);
    if (fileArray.some(file => file.size > (25 << 20))) {
        errorModal("File too large", "Please upload files smaller than 25MiB."); // add a lang prop to this
        return;
    }

    for (const file of fileArray) {
        const formData = new FormData();
        formData.append('file', file);
        pendingAttachments.push({
            id: Math.random(),
            file,
            req: fetch('https://uploads.meower.org/attachments', {
                method: 'POST',
                headers: { Authorization: localStorage.getItem("token") },
                body: formData
            })
            .then(response => {
                return response.json();
            })
            .catch(error => errorModal("Error uploading attachment", error))
        });
    }
    setAttachmentContainer();
}

function goAnywhere() {
    document.documentElement.style.overflow = "hidden";
    
    const mdlbck = document.querySelector('.modal-back');
    if (mdlbck) {
        mdlbck.style.display = 'flex';
        
        const mdl = mdlbck.querySelector('.modal');
        mdl.id = 'mdl-qkshr';
        if (mdl) {
            const mdlt = mdl.querySelector('.modal-top');
            if (mdlt) {
                mdlt.innerHTML = `
                    <form class="section-form" onsubmit="goTo();">
                        <input type="text" id="goanywhere" class="big-mdl-inp" placeholder="${lang().meo_goanywhere}" autocomplete="off">
                    </form>
                    <div class="search-population" tabindex="-1">
                        <div class="searchitem">${lang().info.searchany}</div>
                        <div class="searchitem">Use <span id="scil" title="Profile"> !</span><span id="scil" title="DM"> @</span><span id="scil" title="Chat"> #</span> for something specific.</div>            
                    </div>
                `;
                const goanywhereInput = mdlt.querySelector('#goanywhere');
                goanywhereInput.addEventListener('input', populateSearch);
            }
            const mdbt = mdl.querySelector('.modal-bottom');
            if (mdbt) {
                mdbt.innerHTML = `
                <button class="modal-back-btn" onclick="goTo()">${lang().action.go}</button>
                `;
            }
        }
    }
    if (window.innerWidth >= 720) {
        document.getElementById("goanywhere").focus();
    }
}

function goTo() {
    event.preventDefault();
    const place = document.getElementById("goanywhere").value.toLowerCase();
    closemodal();
    if (place.charAt(0) === "#") {
        const nickname = place.substring(1);
        const chatId = searchChats(nickname);
        if (chatId) {
            loadchat(chatId);
        }
    } else if (place.charAt(0) === "@") {
        opendm(place.substring(1));
    } else if (place.charAt(0) === "!") {
        openUsrModal(place.substring(1));
    } else if (place === "home") {
        loadhome();
    } else if (place === "start") {
        loadstart();
    } else if (place === "settings") {
        loadstgs();
        loadGeneral();
    } else if (place === "general") {
        loadstgs();
        loadGeneral();
    } else if (place === "appearance") {
        loadstgs();
        loadAppearance();
    } else if (place === "plugins") {
        loadstgs();
        loadPlugins();
    } else if (place === "languages") {
        loadstgs();
        loadLanguages();
    } else if (place === "explore") {
        loadexplore();
    } else if (place === "inbox") {
        loadinbox();
    } else if (place === "livechat") {
        loadlive();
    }
}

function searchChats(nickname) {
    for (const chatId in chatCache) {
      if (chatCache.hasOwnProperty(chatId)) {
        const chat = chatCache[chatId];
        if (chat.nickname) {
          if (chat.nickname.toLowerCase() === nickname.toLowerCase()) {
            return chat._id;
          }
        }
      }
    }
    return null;
  }
  

function populateSearch() {
    const query = document.getElementById("goanywhere").value.toLowerCase();
    const searchPopulation = document.querySelector('.search-population');
    if (query !== '') {
        searchPopulation.innerHTML = '';
        const usernames = Object.keys(pfpCache).filter(username => username.toLowerCase().includes(query));
        const groupChats = Object.values(chatCache).filter(chat => chat.nickname && chat.nickname.toLowerCase().includes(query));
        usernames.forEach(username => {        
            const item = document.createElement('button');
            item.innerText = '@' + username
            item.classList.add('searchitem');
            item.id = 'srchuser';
            item.setAttribute("tabindex", "0");
            item.onclick = function() {
                opendm(username);
                closemodal();
            };
            searchPopulation.appendChild(item);
        });
        
        groupChats.forEach(chat => {        
            const item = document.createElement('button');
            item.innerText = chat.nickname
            item.classList.add('searchitem');
            item.id = 'srchchat';
            item.setAttribute("tabindex", "0");
            item.onclick = function() {
                loadchat(chat._id);
                closemodal();
            };
            searchPopulation.appendChild(item);
        });
    } else {
        searchPopulation.innerHTML = `
        <div class="searchitem">${lang().info.searchany}</div>
        <div class="searchitem">Use <span id="scil" title="Profile"> !</span><span id="scil" title="DM"> @</span><span id="scil" title="Chat"> #</span> for something specific.</div>
        `;
    }
}

function blockWord(word) {
    blockedWords[word] = true;
    localStorage.setItem("blockedWords", JSON.stringify(blockedWords));
    if (page === 'settings') {
        loadstgs();
    }
    closemodal();
}

function unblockWord(word) {
    delete blockedWords[word];
    localStorage.setItem("blockedWords", JSON.stringify(blockedWords));
    if (page === 'settings') {
        loadstgs();
    }
    closemodal();
}

function blockUser(user) {
    let toggle;
    if (blockedUsers.hasOwnProperty(user)) {
        toggle = 0;
        delete blockedUsers[user];
    } else {
        toggle = 2;
        blockedUsers[user] = true;
    }
    
    fetch(`https://api.meower.org/users/${user}/relationship`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "token": localStorage.getItem("token")
        },
        body: JSON.stringify({
            state: toggle
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log("sent", data);
    })
    .catch(error => {
        console.error("error:", error);
    });
    if (page = 'settings') {
        loadstgs();
    }
    closemodal();
}

function deleteTokensModal() {
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
                <h3>${lang().modals.cleartokens}</h3>
                <hr class="mdl-hr">
                <span class="subheader">${lang().info.cleartokens}</span>
                `;
            }
            const mdbt = mdl.querySelector('.modal-bottom');
            if (mdbt) {
                mdbt.innerHTML = `
                <button class="modal-back-btn" onclick="deleteTokens()">${lang().action.confirm}</button>
                `;
            }
        }
    }
}

function changePasswordModal() {
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
                <h3>${lang().modals.changepass}</h3>
                <hr class="mdl-hr">
                <p class="mdl-w">${lang().info.changepwwarn}</p>
                <span class="subheader mdl-lb" for="oldpass-input">${lang().login_sub.oldpass}</span>
                <input id="oldpass-input" class="mdl-inp mdl-lg" placeholder="${lang().login_sub.oldpass}" type="password">
                <span class="subheader mdl-lb" for="newpass-input">${lang().login_sub.newpass}</span>
                <input id="newpass-input" class="mdl-inp mdl-lg" placeholder="${lang().login_sub.newpass}" type="password" minlength="8">
                `;
            }
            const mdbt = mdl.querySelector('.modal-bottom');
            if (mdbt) {
                mdbt.innerHTML = `
                <button class="modal-back-btn" onclick="changePassword()" id="changepw">${lang().action.confirm}</button>
                `;
            }
        }
    }
}

function clearLocalstorageModal() {
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
                <h3>${lang().modals.clearls}</h3>
                <hr class="mdl-hr">
                <span class="subheader">${lang().info.clearls}</span>
                `;
            }
            const mdbt = mdl.querySelector('.modal-bottom');
            if (mdbt) {
                mdbt.innerHTML = `
                <button class="modal-back-btn" onclick="clearLocalstorage()" id="clearls">${lang().action.confirm}</button>
                `;
            }
        }
    }
}

function shareModal() {
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
                <h3>${lang().modals.share}</h3>
                <input id="share" class="mdl-inp" type="text" value="https://leo.atticat.tech/" readonly>
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

function agreementModal() {
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
                <h3>${lang().action.signup}</h3>
                <hr class="mdl-hr">
                <p>${lang().info.signup}</p>
                <iframe src="https://meower.org/legal" title="Meower TOS" class="legal">
                `;
            }
            const mdbt = mdl.querySelector('.modal-bottom');
            if (mdbt) {
                mdbt.innerHTML = `
                <button class="modal-back-btn" onclick="toggleLogin(true);signup(document.getElementById('userinput').value, document.getElementById('passinput').value)" aria-label="log in">${lang().action.signup}</button>
                `;
            }
        }
    }
}

function errorModal(header, text) {
    document.documentElement.style.overflow = "hidden";
    
    const mdlbck = document.querySelector('.modal-back');
    const mdl = mdlbck.querySelector('.modal');
    const mdlt = mdl.querySelector('.modal-top');
    const mdbt = mdl.querySelector('.modal-bottom');

    if (mdlbck) mdlbck.style.display = 'flex';
    if (mdlt) mdlt.innerHTML = `<h3>${header}</h3><hr class="mdl-hr"><span class="subheader">${text}</span>`;
    if (mdbt) mdbt.innerHTML = ``;
}

function changePassword() {
    const data = {
        cmd: "change_pswd",
        val: {
            old: document.getElementById("oldpass-input").value,
            new: document.getElementById("newpass-input").value
        },
        listener: "chpw"
    };
    meowerConnection.send(JSON.stringify(data));
    document.getElementById("changepw").disabled = true;
}

function deleteTokens() {
    closemodal();
    launchscreen();
    const data = {
        cmd: "direct",
        val: {
            cmd: "del_tokens",
            val: ""
        }
    };
    meowerConnection.send(JSON.stringify(data));
    logout(true);
    closemodal(lang().info.tokenscleared);
}

function deleteAccount(pass) {
    const data = {
        cmd: "direct",
        val: {
            cmd: "del_account",
            val: pass
        }
    };
    meowerConnection.send(JSON.stringify(data));
    closemodal(lang().info.accscheduled);
}

function DeleteAccountModal() {
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
                <h3>${lang().modals.deleteacc}</h3>
                <hr class="mdl-hr">
                <p class="mdl-w">${lang().info.deletewarn}</p>
                <span class="mdl-lb" for="userinput">${lang().meo_username}</span>
                <input type='text' id='userinput' placeholder='${lang().meo_username}' class='mdl-inp mdl-lg text' aria-label="username input" autocomplete="username">
                <span class="mdl-lb" for="passinput">${lang().meo_password}</span>
                <input type='password' id='passinput' placeholder='${lang().meo_password}' class='mdl-inp  mdl-lg text' aria-label="password input" autocomplete="current-password">
                `;
            }
            const mdbt = mdl.querySelector('.modal-bottom');
            if (mdbt) {
                mdbt.innerHTML = `
                <button class="modal-back-btn" onclick="confirmDelete()" aria-label="delete account">${lang().action.confirm}</button>
                `;
            }
        }
    }
}

function confirmDelete() {
    let comfirmation = window.prompt('Type your "Delete" +  your username');

    if (comfirmation === "Delete " + localStorage.getItem("username")) {
        if (document.getElementById("userinput").value === localStorage.getItem("username")) {
            deleteAccount(document.getElementById("passinput").value)
        } else {
            closemodal(lang().info.invaliduser);
        }
    } else {
        closemodal(lang().info.tryagain);
    }
}

function modalPluginup() {
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
                <h3>${lang().modals.plugin}</h3>
                <hr class="mdl-hr">
                <p class="subheader">${lang().info.plugin}</p>
                `;
            }
            const mdbt = mdl.querySelector('.modal-bottom');
            if (mdbt) {
                mdbt.innerHTML = `
                <button class="modal-back-btn" onclick="window.location.reload();" aria-label="refresh">${lang().action.confirm}</button>
                `;
            }
        }
    }
}

function clearLocalstorage() {
    localStorage.clear();
    logout(true);
    closemodal(lang().info.cleared);
}

function setAccessibilitySettings() {
    // reduce motion
    const b = document.querySelector('.modal');
    const c = document.querySelector('.image-mdl');
    if (settingsstuff().reducemotion) {
        b.classList.add("reduced-ani");
        c.classList.add("reduced-ani");
    } else {
        b.classList.remove("reduced-ani");
        c.classList.remove("reduced-ani");
    }
}

function jumpToTop() {
    let scroll
    if (settingsstuff().reducemotion) {
        scroll = "auto";
    } else {
        scroll = "smooth";
    }

    if (window.innerWidth < 720) {
        const outer = document.getElementById("main");
        outer.scrollTo({
            top: 0,
            behavior: scroll
        });
    } else {
        window.scrollTo({
            top: 0,
            behavior: scroll
        });
    }
}

function setTop() {
    if (window.innerWidth < 720) {
        const outer = document.getElementById("main");
        outer.scrollTo({
            top: 0,
        });
    } else {
        window.scrollTo({
            top: 0,
        });
    }
}

function openGcModal() {
    document.documentElement.style.overflow = "hidden";
    
    const mdlbck = document.querySelector('.modal-back');

    if (mdlbck) {
        mdlbck.style.display = 'flex';

        const mdl = mdlbck.querySelector('.modal');
        mdl.id = 'mdl-big';
        if (mdl) {
            const mdlt = mdl.querySelector('.modal-top');
            if (mdlt) {
                mdlt.innerHTML = `
                <img class="avatar-big" style="border: 6px solid rgb(31, 88, 49);" src="images/GC.svg">
                <div class="gctitle">
                <h2 class="gcn">Chat</h2> <i class="subtitle">7d48d687-ab68-4fe1-96a1-4aacbff36a12</i>
                </div>
                <hr class="mdl-hr">
                <span class="subheader">${lang().profile.persona}</span>
                <div class="duo-cl">
                <div class="gcsec">
                <span>Chat Color:</span>
                        <input id="gc-clr" type="color" value="#1f5831">
                    </div>
                    <div class="gcsec">
                        <label for="gc-photo" class="filesel">Chat Icon</label>
                        <input type="file" id="gc-photo" accept="image/png,image/jpeg,image/webp,image/gif">
                    </div>        
                </div>
                <span class="subheader">${lang().chats.members}</span>

                `;
            }
            const mdbt = mdl.querySelector('.modal-bottom');
            if (mdbt) {
                mdbt.innerHTML = ``;
            }
        }
    }
}
// work on this
main();
setInterval(ping, 5000);