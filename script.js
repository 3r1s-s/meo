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
let sul = "";

const pfpCache = {};

loadsavedplugins();
loadcstmcss();

function replsh(rpl) {
    const trimmedString = rpl.length > 25 ?
        rpl.substring(0, 22) + "..." :
        rpl;
    return trimmedString;
}

function main() {
    meowerConnection = new WebSocket("wss://server.meower.org/");
    let loggedin = false;
    
    meowerConnection.addEventListener('error', function(event) {
        if (!page==="load") {
            launchscreen();
        }
    });
    
    meowerConnection.onclose = (event) => {
        logout(true);
    };
    page = "login";
    loadtheme();
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
            if (localStorage.getItem("token") != undefined && localStorage.getItem("uname") != undefined) {
                login(localStorage.getItem("uname"), localStorage.getItem("token"));
            } else {
                const pageContainer = document.getElementById("main");
                pageContainer.innerHTML = 
                `<div class='settings'>
                    <div class='login'>
                        <h1>Login</h1>
                        <input type='text' id='userinput' placeholder='Username' class='login-input text'>
                        <input type='password' id='passinput' placeholder='Password' class='login-input text'>
                        <input type='button' id='submit' value='Log in' class='login-input button' onclick='login(document.getElementById("userinput").value, document.getElementById("passinput").value)'><input type='button' id='submit' value='Sign up' class='login-input button' onclick='signup(document.getElementById("userinput").value, document.getElementById("passinput").value)'>
                        <small>This client was made by eri :></small>
                        <div id='msgs'></div>
                        </div>
                        <div class='footer'>
                        <svg width="80" height="44.25" viewBox="0 0 321 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M124.695 17.2859L175.713 0.216682C184.63 -1.38586 192.437 6.14467 190.775 14.7463L177.15 68.2185C184.648 86.0893 187.163 104.122 187.163 115.032C187.163 143.057 174.929 178 95.4997 178C16.0716 178 3.83691 143.057 3.83691 115.032C3.83691 104.122 6.35199 86.0893 13.8498 68.2185L0.224791 14.7463C-1.43728 6.14467 6.3705 -1.38586 15.2876 0.216682L66.3051 17.2859C74.8856 14.6362 84.5688 13.2176 95.4997 13.429C106.431 13.2176 116.114 14.6362 124.695 17.2859ZM174.699 124.569H153.569V80.6255C153.569 75.6157 151.762 72.1804 146.896 72.1804C143.143 72.1804 139.529 74.6137 135.775 78.3353V124.569H114.785V80.6255C114.785 75.6157 112.977 72.1804 108.112 72.1804C104.22 72.1804 100.744 74.6137 96.9909 78.3353V124.569H76V54.4314H94.4887L96.0178 64.0216C102.134 57.5804 108.39 53 117.148 53C126.462 53 131.605 57.7235 134.107 64.0216C140.224 57.7235 146.896 53 155.376 53C168.026 53 174.699 61.1588 174.699 74.7569V124.569ZM247.618 89.3569C247.618 91.5039 247.479 93.7941 247.201 94.9392H206.331C207.443 105.961 213.838 110.255 223.012 110.255C230.519 110.255 237.887 107.392 245.393 102.955L247.479 118.127C240.111 122.994 231.075 126 220.371 126C199.936 126 185.34 114.835 185.34 89.7863C185.34 66.8843 198.963 53 217.452 53C238.304 53 247.618 69.0314 247.618 89.3569ZM227.6 83.0588C226.905 72.4667 223.29 67.0274 216.896 67.0274C211.057 67.0274 206.887 72.3235 206.192 83.0588H227.6ZM288.054 126C306.96 126 321 111.973 321 89.5C321 67.0274 307.099 53 288.193 53C269.426 53 255.525 67.1706 255.525 89.6431C255.525 112.116 269.287 126 288.054 126ZM288.193 70.749C296.256 70.749 300.704 78.3353 300.704 89.6431C300.704 100.951 296.256 108.537 288.193 108.537C280.269 108.537 275.821 100.808 275.821 89.5C275.821 78.049 280.13 70.749 288.193 70.749Z" fill="#FEFEFE"/>
                        </svg>
                    </div>
                </div>
                `;
            };
        } else if (sentdata.listener == "auth") {
            if (sentdata.val.mode && sentdata.val.mode == "auth") {
                loggedin = true;
                page = "home";
                if (localStorage.getItem("token") == undefined || localStorage.getItem("uname") == undefined || localStorage.getItem("permissions") == undefined) {
                    localStorage.setItem("uname", sentdata.val.payload.username);
                    localStorage.setItem("token", sentdata.val.payload.token);
                    localStorage.setItem("permissions", sentdata.val.payload.account.permissions);
                }
                loadhome();
                console.log("Logged in!");
            } else if (sentdata.cmd == "statuscode" && sentdata.val != "I:100 | OK") {
                if ("token" in localStorage)
                    logout(false);
                switch (sentdata.val) {
                    case "I:015 | Account exists":
                        openUpdate("Username Already Taken!");
                        break;
                    case "E:103 | ID not found":
                        openUpdate("Invalid Username!");
                        break;
                    case "I:011 | Invalid Password":
                        openUpdate("Invalid Password!");
                        break;
                    case "E:018 | Account Banned":
                        openUpdate("Account Banned!");
                        break;
                    case "E:025 | Deleted":
                        openUpdate("Account Deleted!");
                        break;
                    case "E:110 | ID conflict":
                        openUpdate("You probably logged in on another client. Refresh the page and log back in to continue.");
                        break;
                    default:
                        openUpdate(`Unknown Login Status: ${sentdata.val}`);
                        break;
                }
            }
        } else if (sentdata.val.post_origin == page) {
            if (loggedin == true) {
                loadpost(sentdata.val);
            }
        } else if (end) {
            return 0;
        } else if (sentdata.val.mode == "update_post") {
            const postId = sentdata.val.payload.post_id;
            const postElement = document.getElementById(postId);
            
            if (postElement) {
                const postMessage = sentdata.val.payload.p;
                postElement.querySelector('.post-content').innerHTML = md.render(postMessage);
                console.log("Edited " + sentdata.val.payload._id);
            } else {
                console.log(postId + " not found.");
            }
        } else if (sentdata.cmd == "ulist") {
            const iul = sentdata.val;
            sul = iul.trim().split(";");
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
          const divToDelete = document.getElementById(sentdata.val.id);
          if (divToDelete) {
            divToDelete.parentNode.removeChild(divToDelete);
            console.log(sentdata.val.id, "deleted successfully.");
          } else {
            console.warn(sentdata.val.id, "not found.");
          }
        }
    };
    document.addEventListener("keydown", function(event) {    
        if (page !== "settings" && page !== "explore" && page !== "login") {
            if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendpost();
            const textarea = document.getElementById('msg');
            textarea.style.height = 'auto';
        } else if (event.key === "Enter" && event.shiftKey) {
        } else if (event.key === "Escape") {
            closemodal();
            closeImage();
            if (opened===1) {
                closepicker();
            }
            document.getElementById("msg").blur();
        }
    }
    });
    addEventListener("keydown", () => {
        if (!event.ctrlKey && event.keyCode >= 48 && event.keyCode <= 90) {
            console.log(document.activeElement);
            if (!document.activeElement || document.activeElement.tagName !== 'INPUT') {
                document.getElementById("msg").focus();
            }
        }
      });

}

function loadpost(p) {
    let user
    let content
    if (p.u == "Discord" || p.u == "SplashBridge") {
        const rcon = settingsstuff().swearfilter && p.unfiltered_p ? p.unfiltered_p : p.p;
        const parts = rcon.split(': ');
        user = parts[0];
        content = parts.slice(1).join(': ');
    } else {
        content = settingsstuff().swearfilter && p.unfiltered_p ? p.unfiltered_p : p.p;
        user = p.u;
    }
    
    const postContainer = document.createElement("div");
    postContainer.id = p._id;
    postContainer.classList.add("post");

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

    const pstinf = document.createElement("h3");
    pstinf.innerHTML = `<span id='username' onclick='openUsrModal("${user}")'>${user}</span>`;

    if (p.u == "Discord" || p.u == "SplashBridge") {
        const bridged = document.createElement("bridge");
        bridged.innerText = "Bridged";
        bridged.setAttribute("title", "This post has been bridged from another platform.");
        pstinf.appendChild(bridged);
    }
    
    pstinf.appendChild(pstdte);
    wrapperDiv.appendChild(pstinf);

    const replyregex = /@(\w+)\s+"([^"]*)"\s+\(([^)]+)\)/g;
    let match = replyregex.exec(content);
    if (match) {
        const replyid = match[3];
        const pageContainer = document.getElementById("msgs");
    
        if (pageContainer.firstChild) {
            pageContainer.insertBefore(postContainer, pageContainer.firstChild);
        } else {
            pageContainer.appendChild(postContainer);
        }
    
        loadreply(replyid).then(replycontainer => {
            wrapperDiv.insertBefore(replycontainer, wrapperDiv.querySelector(".post-content"));
        });
    
        content = content.replace(match[0], '').trim();
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
    
    if (content) {
        wrapperDiv.appendChild(postContentText);
    } 

    const links = content.match(/(?:https?|ftp):\/\/[^\s(){}[\]]+/g);
    const embd = embed(links);
    if (embd) {
        embd.forEach(embeddedElement => {
            wrapperDiv.appendChild(embeddedElement);
        });
    }

    loadPfp(user)
        .then(pfpElement => {
            if (pfpElement) {
                pfpDiv.appendChild(pfpElement);
                //thx stackoverflow
                pfpCache[user] = pfpElement.cloneNode(true);
                postContainer.insertBefore(pfpDiv, wrapperDiv);
            }
        });
        
    postContainer.appendChild(wrapperDiv);

    const pageContainer = document.getElementById("msgs");
    if (pageContainer.firstChild) {
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
                        pfpElement.setAttribute("alt", "Avatar");
                        if (!button) {
                            pfpElement.setAttribute("onclick", `openUsrModal('${username}')`);
                        }
                        pfpElement.classList.add("avatar");
                        
                        if (userData.avatar_color) {
                            pfpElement.style.border = `3px solid #${userData.avatar_color}`;
                            pfpElement.style.backgroundColor = `#${userData.avatar_color}`;
                        }
                    } else if (userData.pfp_data) {
                        //legacy avatar
                        let pfpurl;
                        if (userData.pfp_data > 0 && userData.pfp_data <= 37) {
                            pfpurl = `images/avatars/icon_${userData.pfp_data - 1}.svg`;
                        } else {
                            pfpurl = `images/avatars/icon_err.svg`; // Default to icon_err if index is out of range
                        }
                        
                        pfpElement = document.createElement("img");
                        pfpElement.setAttribute("src", pfpurl);
                        pfpElement.setAttribute("alt", "Avatar");
                        if (!button) {
                            pfpElement.setAttribute("onclick", `openUsrModal('${username}')`);
                        }
                        pfpElement.classList.add("avatar");
                        pfpElement.classList.add("svg-avatar");

                        if (userData.avatar_color) {
                            pfpElement.style.border = `3px solid #${userData.avatar_color}`;
                        }
                    } else {
                        const pfpurl = `images/avatars/icon_-4.svg`;
                        
                        pfpElement = document.createElement("img");
                        pfpElement.setAttribute("src", pfpurl);
                        pfpElement.setAttribute("alt", "Avatar");
                        if (!button) {
                            pfpElement.setAttribute("onclick", `openUsrModal('${username}')`);
                        }
                        pfpElement.classList.add("avatar");
                        pfpElement.classList.add("svg-avatar");
                        
                        pfpElement.style.border = `3px solid #fff`;
                        pfpElement.style.backgroundColor = `#fff`;
                        
                        console.error("No avatar or pfp_data available for: ", username);
                        resolve(null);
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

async function loadreply(replyid) {
    try {
        const replyresp = await fetch(`https://api.meower.org/posts?id=${replyid}`, {
            headers: {token: localStorage.getItem("token")}
        });
        const replydata = await replyresp.json();

        const replycontainer = document.createElement("div");
        replycontainer.classList.add("reply");
        if (replydata.u === "Discord" || replydata.u === "SplashBridge") {
            const rcon = replydata.p;
            const parts = rcon.split(': ');
            const user = parts[0];
            const content = parts.slice(1).join(': ');
            replycontainer.innerHTML = `<p style='font-weight:bold;margin: 10px 0 10px 0;'>${user}</p><p style='margin: 10px 0 10px 0;'>${content}</p>`;
        } else {
            replycontainer.innerHTML = `<p style='font-weight:bold;margin: 10px 0 10px 0;'>${replydata.u}</p><p style='margin: 10px 0 10px 0;'>${replydata.p}</p>`;
        }
        
        return replycontainer;
    } catch (error) {
        console.error("Error fetching reply:", error);
        return document.createElement("p");
    }
}

function reply(event) {
    const postContainer = event.target.closest('.post');
    if (postContainer) {
        const username = postContainer.querySelector('#username').innerText;
        const postcont = postContainer.querySelector('p').innerText
        .replace(/\n/g, ' ')
        .replace(/@\w+/g, '')
        .split(' ')
        .slice(0, 6)
        .join(' ');
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
    const rootBackgroundColor = rootStyles.getPropertyValue('--background-color');
    
    const metaThemeColor = document.querySelector("meta[name=theme-color]");
    if (metaThemeColor) {
        metaThemeColor.setAttribute("content", rootBackgroundColor);
    }
}

function sharepost() {
    const postId = event.target.closest('.post').id;
    window.open(`https://meo-32r.pages.dev/share?id=${postId}`, '_blank');
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
}

function sendpost() {
    const message = document.getElementById('msg').value;

    if (!message.trim()) {
        console.log("The message is blank.");
        return;
    }

    fetch(`https://api.meower.org/${page === "home" ? "home" : `posts/${page}`}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token")
        },
        body: JSON.stringify({content: message})
    });

    document.getElementById('msg').value = "";
    autoresize();
}

function loadhome() {
    page = "home";
    let pageContainer
    pageContainer = document.getElementById("main");
    pageContainer.innerHTML = `<div class='info'><h1 class='header-top'>Home</h1><p id='info'></p></div>` + loadinputs();
    pageContainer = document.getElementById("nav");
    pageContainer.innerHTML = `
    <div class='navigation'>
    <div class='nav-top'>
    <button class='trans' id='submit' value='Home' onclick='loadhome()'>
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
    <input type='button' class='navigation-button button' id='submit' value='Profile' onclick='openUsrModal("${localStorage.getItem("uname")}")'>
    <input type='button' class='navigation-button button' id='submit' value='Explore' onclick='loadExplore();'>
    <input type='button' class='navigation-button button' id='submit' value='Inbox' onclick='loadinbox()'>
    <input type='button' class='navigation-button button' id='submit' value='Settings' onclick='loadstgs()'>
    <input type='button' class='navigation-button button' id='submit' value='Logout' onclick='logout(false)'>
    `;

    if (localStorage.getItem("permissions") === "1") {
    console.log(localStorage.getItem("permissions"));
    navlist = `<input type='button' class='navigation-button button' id='submit' value='Moderate' onclick='openModModal()'>` + navlist;
    }

    let mdmdl = document.getElementsByClassName('navigation')[0];
    mdmdl.innerHTML += navlist;


    document.getElementById("info").innerText = lul + " users online (" + sul + ")";
    
    const char = new XMLHttpRequest();
    char.open("GET", "https://api.meower.org/chats?autoget");
    char.setRequestHeader("token", localStorage.getItem('token'));
    char.onload = async () => {
        const response = JSON.parse(char.response);
        console.log(char.response);
    
        const groupsdiv = document.getElementById("groups");
        const gcdiv = document.createElement("div");
        gcdiv.className = "gcs";

        groupsdiv.innerHTML = `<h1 class="groupheader">Chats</h1>`;
        gcdiv.innerHTML += `<button class="navigation-button button" onclick="loadhome()">Home</button>`;

        response.autoget.forEach(chat => {
            const r = document.createElement("button");
            r.id = `submit`;
            r.className = `navigation-button button`;
            r.onclick = function() {
                loadchat(chat._id);
            };
            r.innerHTML = escapeHTML(chat.nickname || `DM with ${chat.members.find(v => v !== localStorage.getItem("uname"))}`);
    
            gcdiv.appendChild(r);
        });
    
        groupsdiv.appendChild(gcdiv);
    };
    char.send();
    
    const xhttp = new XMLHttpRequest();
    xhttp.open("GET", "https://api.meower.org/home?autoget");
    xhttp.onload = async () => {
        const c = JSON.parse(xhttp.response);
        let i = 24;
        while (i != 0) {
            i -= 1;
            console.log("Loading post: " + i.toString());
            await loadpost(c["autoget"][i]);
        }
    };
    xhttp.send();
    const sidediv = document.querySelectorAll(".side");
    sidediv.forEach(function(sidediv) {
      sidediv.classList.remove("hidden");
  });
}

function loadchat(chatId) {
    page = chatId;

    const xhttp = new XMLHttpRequest();
    const chaturl = `https://api.meower.org/chats/${chatId}`;
    const posturl = `https://api.meower.org/posts/${chatId}?autoget`;

    xhttp.open("GET", chaturl);
    xhttp.setRequestHeader("token", localStorage.getItem('token'));
    xhttp.onload = () => {
        const data = JSON.parse(xhttp.response);
        const nickname = data.nickname;
        const mainContainer = document.getElementById("main");
        mainContainer.innerHTML = `<div class='info'><h1 id='nickname'></h1><p id='info'></p></div>` + loadinputs();
        const nicknameElement = document.getElementById('nickname');
        nicknameElement.textContent = nickname;

        const sidedivs = document.querySelectorAll(".side");
        sidedivs.forEach(sidediv => sidediv.classList.remove("hidden"));

        const xhttpPosts = new XMLHttpRequest();
        xhttpPosts.open("GET", posturl);
        xhttpPosts.setRequestHeader("token", localStorage.getItem('token'));
        xhttpPosts.onload = () => {
            const postsData = JSON.parse(xhttpPosts.response);
            const postsarray = postsData.autoget || [];

            postsarray.reverse();

            postsarray.forEach(postId => {
                loadpost(postId);
            });
            
        };
        xhttpPosts.send();
    };
    xhttp.send();
}

function loadinbox() {
    page = "inbox"
    const inboxUrl = 'https://api.meower.org/inbox?autoget=1';

    const xhttp = new XMLHttpRequest();
    xhttp.open("GET", inboxUrl);
    xhttp.setRequestHeader("token", localStorage.getItem('token'));
    xhttp.onload = () => {
        const mainContainer = document.getElementById("main");
        mainContainer.innerHTML = `
            <div class='info'>
                <h1>Inbox</h1>
                <p id='info'>Notifications are displayed here</p>
            </div>
            <div class='message-container'>
            </div>
            <div id='msgs' class='posts'></div>
        `;

        const sidedivs = document.querySelectorAll(".side");
        sidedivs.forEach(sidediv => sidediv.classList.remove("hidden"));

        const xhttpPosts = new XMLHttpRequest();
        xhttpPosts.open("GET", inboxUrl);
        xhttpPosts.setRequestHeader("token", localStorage.getItem('token'));
        xhttpPosts.onload = () => {
            const postsData = JSON.parse(xhttpPosts.response);
            const postsarray = postsData.autoget || [];

            postsarray.reverse();

            postsarray.forEach(postId => {
                loadpost(postId);
            });
        };
        xhttpPosts.send();
    };
    xhttp.send();
}

function logout(iskl) {
    if (!iskl) {
        localStorage.clear();
        meowerConnection.close();
    }
    end = true;
    if (document.getElementById("msgs"))
        document.getElementById("msgs").innerHTML = "";
    if (document.getElementById("nav"))
        document.getElementById("nav").innerHTML = "";
    if (document.getElementById("groups"))
        document.getElementById("groups").innerHTML = "";
    end = false;
    main();
}

function loadstgs() {
    page = "settings";
    const gcsc = document.getElementById("groups");
    gcsc.innerHTML = ""
    const navc = document.getElementById("nav");
    navc.innerHTML = `
    <div class='navigation'>
    <div class='nav-top'>
    <input type='button' class='navigation-button button' id='submit' value='General' onclick='loadgeneral()'>
    <input type='button' class='navigation-button button' id='submit' value='Appearance' onclick='loadappearance()'>
    <input type='button' class='navigation-button button' id='submit' value='Plugins' onclick='loadplugins()'>
    </div>
    <input type='button' class='navigation-button button' id='submit' value='Go Home' onclick='loadhome()'>
    </div>
    `;

    loadgeneral();
}

function loadgeneral() {
    const pageContainer = document.getElementById("main");
    const settingsContent = `
        <div class="settings">
            <h1>General</h1>
            <h3>Chat</h3>
            <div class="msgs"></div>
            <div class='section'>
            <label>
            Disable swear filter
            <input type="checkbox" id="swearfilter">
            </label>
            </div>
            <h3>About</h3>
            <div class="section">
            <span>meo v1.20</span>
            </div>
            </div>
            `;

            pageContainer.innerHTML = settingsContent;

            const swftcheckbox = document.getElementById("swearfilter");
        
            swftcheckbox.addEventListener("change", function () {
                localStorage.setItem('settings', JSON.stringify({ swearfilter: swftcheckbox.checked }));
            });
        
            const storedsettings = JSON.parse(localStorage.getItem('settings')) || {};
            const swearfiltersetting = storedsettings.swearfilter || false;
        
            swftcheckbox.checked = swearfiltersetting;
}

async function loadplugins() {
    let pageContainer = document.getElementById("main");
    let settingsContent = `
        <div class="settings">
            <h1>Plugins</h1>
            <h3>Usually requires a refresh</h3>
            <div class="msgs"></div>
            <div class='plugins'>
    `;

    const pluginsdata = await fetchplugins();

    pluginsdata.forEach(plugin => {
        const isEnabled = localStorage.getItem(plugin.name) === 'true';

        settingsContent += `
            <div class='plugin'>
                <h3>${plugin.name}</h3>
                <i class='desc'>Created by <a href='https://github.com/${plugin.creator}'>${plugin.creator}</a></i>
                <p class='desc'>${plugin.description}</p>
                <label>
                    enable
                    <input type="checkbox" id="${plugin.name}" ${isEnabled ? 'checked' : ''}>
                </label>
            </div>
        `;
    });

    settingsContent += `
        </div>
            <h1>Custom Plugin</h1>
            <h3>Caution: can be very dangerous</h3>
            <div class='customplugin'>
                <textarea class="editor" id='customplugininput' placeholder="// you put stuff here"></textarea>
                <input class='cstpgbt' type='button' value='Run' onclick="customplugin()">
            </div>
        </div>
    `;
    pageContainer.innerHTML = settingsContent;

    pluginsdata.forEach(plugin => {
        const checkbox = document.getElementById(plugin.name);
        checkbox.addEventListener('change', function() {
            if (checkbox.checked) {
                localStorage.setItem(plugin.name, 'true');
                loadpluginscript(plugin.script);
            } else {
                localStorage.removeItem(plugin.name);
            }
        });
    });
}

function loadpluginscript(scriptUrl) {
    const script = document.createElement('script');
    script.src = scriptUrl;
    script.async = true;
    document.head.appendChild(script);
}

async function fetchplugins() {
    try {
    // remember to bring this back when final
    //    const response = await fetch('./plugins.json');
        const response = await fetch('https://meo-32r.pages.dev/plugins.json');
        const pluginsdata = await response.json();
        return pluginsdata;
    } catch (error) {
        console.error('Error fetching or parsing plugins data:', error);
        return [];
    }
}

async function loadsavedplugins() {
    const pluginsdata = await fetchplugins();
    pluginsdata.forEach(plugin => {
        const isEnabled = localStorage.getItem(plugin.name) === 'true';

        if (isEnabled) {
            loadpluginscript(plugin.script);
        }
    });
}

function customplugin() {
    const customplugininput = document.getElementById("customplugininput").value;
    if (customplugininput.trim() !== "") {
        try {
            const script = document.createElement('script');
            script.textContent = customplugininput;
            document.head.appendChild(script);
        } catch (error) {
            console.error('Something happened:', error);
        }
    }
}

function loadappearance() {
    let pageContainer = document.getElementById("main");
    let settingsContent = `
    <div class="settings">
        <h1>Appearance</h1>
        <div class="msgs"></div>
            <h2>Theme</h2>

            <div id="example" class="post"><div class="pfp"><img src="https://uploads.meower.org/icons/09M4f10bxn4AbvadnNCKZCiP" alt="Avatar" class="avatar" style="border: 3px solid #b190fe;"></div><div class="wrapper"><div class="buttonContainer">
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
            </div><h3><span id="username">Eris</span><bridge title="This post has been bridged from another platform.">Bridged</bridge><i class="date">06/03/2024, 3:36:53 pm</i></h3><p>Hi</p></div></div>

            <div class="theme-buttons">
            <div class="theme-buttons-inner">
                <button onclick='changetheme(\"light\", this)' class='theme-button light-theme'>Light</button>
                <button onclick='changetheme(\"dark\", this)' class='theme-button dark-theme'>Dark</button>
            </div>
            <div class="theme-buttons-inner">
                <button onclick='changetheme(\"cosmic\", this)' class='theme-button cosmic-theme'>Cosmic Latte</button>
                <button onclick='changetheme(\"bsky\", this)' class='theme-button bsky-theme'>Midnight</button>
                <button onclick='changetheme(\"oled\", this)' class='theme-button oled-theme'>Black</button>
                <button onclick='changetheme(\"roarer\", this)' class='theme-button roarer-theme'>Roarer</button>
            </div>
        </div>
    <br>
    <h2 style="display:none;">Icons</h2>
    <div class="icons" style="display:none;">
        <button class="icon-button"><img class="icon" src="images/Meo.png" width="64px"></button>
        <button class="icon-button"><img class="icon" src="images/Blue Gradient.png" width="64px"></button>
        <button class="icon-button"><img class="icon" src="images/Blue Solid.png" width="64px"></button>
        <button class="icon-button"><img class="icon" src="images/Enceladus.png" width="64px"></button>
        <button class="icon-button"><img class="icon" src="images/Mars.png" width="64px"></button>
        <button class="icon-button"><img class="icon" src="images/Orange Gradient.png" width="64px"></button>
        <button class="icon-button"><img class="icon" src="images/Orange Solid.png" width="64px"></button>

        <button class="icon-button"><img class="icon" src="images/Meower iOS Stripe.png" width="64px"></button>
        <button class="icon-button"><img class="icon" src="images/Meower iOS.png" width="64px"></button>
        <button class="icon-button"><img class="icon" src="images/Revolt.png" width="64px"></button>
        <button class="icon-button"><img class="icon" src="images/Flamingo.png" width="64px"></button>
        <button class="icon-button"><img class="icon" src="images/Blurple.png" width="64px"></button>
    </div>
    <h2>Custom CSS</h2>
    <div class='customcss'>
        <textarea class="editor" id='customcss' placeholder="// you put stuff here"></textarea>
    </div>
    `

    pageContainer.innerHTML = settingsContent;

    const selectedTheme = localStorage.getItem("theme");
    const themeButtons = document.querySelectorAll('.theme-button');
    themeButtons.forEach((btn) => {
        if (btn.textContent.toLowerCase().includes(selectedTheme)) {
            btn.classList.add('selected');
        }
    });

    const storedIconIndex = localStorage.getItem('selectedIcon');
    if (storedIconIndex !== null) {
        changecon(parseInt(storedIconIndex, 10));
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
    

}

function loadcstmcss() {
    const css = localStorage.getItem('customCSS');

    let customstyle = document.getElementById('customstyle');
    if (!customstyle) {
        customstyle = document.createElement('style');
        customstyle.id = 'customstyle';
        document.head.appendChild(customstyle);
    }

    customstyle.textContent = css || '';
}

function changecon(index) {

    const icons = [
        'Meo.png',
        'Blue Gradient.png',
        'Blue Solid.png',
        'Enceladus.png',
        'Mars.png',
        'Orange Gradient.png',
        'Orange Solid.png',
        'Meower iOS Stripe.png',
        'Meower iOS.png',
        'Revolt.png',
        'Flamingo.png',
        'Blurple.png'
    ];

    const iconLink = document.querySelector('link[rel="apple-touch-icon"]');
    if (iconLink) {
        iconLink.href = `images/${icons[index]}`;
        localStorage.setItem('selectedIcon', index);
    }
}

function changetheme(theme, button) {
    const selectedTheme = theme;
  
    const previousTheme = localStorage.getItem("theme");
    if (previousTheme) {
      document.documentElement.classList.remove(previousTheme + "-theme");
    }
    document.documentElement.classList.add(selectedTheme + "-theme");
    localStorage.setItem("theme", selectedTheme);

    const themeColorMetaTag = document.querySelector('meta[name="theme-color"]');
    themeColorMetaTag.setAttribute('content', getComputedStyle(document.documentElement).getPropertyValue('--background-color'));

    const themeButtons = document.querySelectorAll('.theme-button');
    themeButtons.forEach((btn) => btn.classList.remove('selected'));
    button.classList.add('selected');
}

function settingsstuff() {
    const storedsettings = localStorage.getItem('settings');
    if (!storedsettings) {
        const defaultSettings = {
            swearfilter: false,
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

    let nv = document.getElementById("nav");
    nv.innerHTML = ``;
    nv = document.getElementById("groups");
    nv.innerHTML = ``;
    meowerConnection.close();
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

function openImage(url) {
    document.documentElement.style.overflow = "hidden";
    const mdlbck = document.querySelector('.image-back');
    
    if (mdlbck) {
        mdlbck.style.display = 'flex';
        
        const mdl = mdlbck.querySelector('.image-mdl');
        if (mdl) {
            mdl.innerHTML = `
            <img class='embed-large' src='${url}' onclick='preventClose(event)'>
            <div class="img-links">
            <span class="img-link-outer"><a onclick="closeImage()" class="img-link">close</a></span>
            <span><a href="${url}" target="_blank" class="img-link">open in browser</a></span>
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
    }
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
                <button class="modal-back-btn" onclick="openModModal();">back</button>
                `;
            }
            const mdlt = mdl.querySelector('.modal-top');
            if (mdlt) {
                mdlt.innerHTML = `
                <button class="modal-button" onclick="mdlreply(event)"><div>Reply</div><div class="modal-icon"><svg class="icon_d1ac81" width="24" height="24" viewBox="0 0 24 24"><path d="M10 8.26667V4L3 11.4667L10 18.9333V14.56C15 14.56 18.5 16.2667 21 20C20 14.6667 17 9.33333 10 8.26667Z" fill="currentColor"></path></svg></div></button>
                <button class="modal-button" onclick="mdlpingusr(event)"><div>Mention</div><div class="modal-icon"><svg class="icon" height="24" width="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.486 2 2 6.486 2 12C2 17.515 6.486 22 12 22C14.039 22 15.993 21.398 17.652 20.259L16.521 18.611C15.195 19.519 13.633 20 12 20C7.589 20 4 16.411 4 12C4 7.589 7.589 4 12 4C16.411 4 20 7.589 20 12V12.782C20 14.17 19.402 15 18.4 15L18.398 15.018C18.338 15.005 18.273 15 18.209 15H18C17.437 15 16.6 14.182 16.6 13.631V12C16.6 9.464 14.537 7.4 12 7.4C9.463 7.4 7.4 9.463 7.4 12C7.4 14.537 9.463 16.6 12 16.6C13.234 16.6 14.35 16.106 15.177 15.313C15.826 16.269 16.93 17 18 17L18.002 16.981C18.064 16.994 18.129 17 18.195 17H18.4C20.552 17 22 15.306 22 12.782V12C22 6.486 17.514 2 12 2ZM12 14.599C10.566 14.599 9.4 13.433 9.4 11.999C9.4 10.565 10.566 9.399 12 9.399C13.434 9.399 14.6 10.565 14.6 11.999C14.6 13.433 13.434 14.599 12 14.599Z"></path></svg></div></button>
                <button class="modal-button" onclick="reportModal(event)"><div>Report</div><div class="modal-icon"><svg height="20" width="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M20 6.00201H14V3.00201C14 2.45001 13.553 2.00201 13 2.00201H4C3.447 2.00201 3 2.45001 3 3.00201V22.002H5V14.002H10.586L8.293 16.295C8.007 16.581 7.922 17.011 8.076 17.385C8.23 17.759 8.596 18.002 9 18.002H20C20.553 18.002 21 17.554 21 17.002V7.00201C21 6.45001 20.553 6.00201 20 6.00201Z"></path></svg></div></button>      
                <button class="modal-button" onclick="mdlshare(event)"><div>Share</div><div class="modal-icon"><svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18"><path d="M12.9297 3.25007C12.7343 3.05261 12.4154 3.05226 12.2196 3.24928L11.5746 3.89824C11.3811 4.09297 11.3808 4.40733 11.5739 4.60245L16.5685 9.64824C16.7614 9.84309 16.7614 10.1569 16.5685 10.3517L11.5739 15.3975C11.3808 15.5927 11.3811 15.907 11.5746 16.1017L12.2196 16.7507C12.4154 16.9477 12.7343 16.9474 12.9297 16.7499L19.2604 10.3517C19.4532 10.1568 19.4532 9.84314 19.2604 9.64832L12.9297 3.25007Z"></path><path d="M8.42616 4.60245C8.6193 4.40733 8.61898 4.09297 8.42545 3.89824L7.78047 3.24928C7.58466 3.05226 7.26578 3.05261 7.07041 3.25007L0.739669 9.64832C0.5469 9.84314 0.546901 10.1568 0.739669 10.3517L7.07041 16.7499C7.26578 16.9474 7.58465 16.9477 7.78047 16.7507L8.42545 16.1017C8.61898 15.907 8.6193 15.5927 8.42616 15.3975L3.43155 10.3517C3.23869 10.1569 3.23869 9.84309 3.43155 9.64824L8.42616 4.60245Z"></path></svg></div></button>      
                `;

                const postDiv = document.getElementById(postId);
                const usernameElement = postDiv.querySelector('#username').innerText;

                if (usernameElement === localStorage.getItem("uname")) {
                    mdlt.innerHTML += `
                    <button class="modal-button" onclick="deletePost('${postId}')"><div>Delete</div><div class="modal-icon"><svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M15 3.999V2H9V3.999H3V5.999H21V3.999H15Z"></path><path fill="currentColor" d="M5 6.99902V18.999C5 20.101 5.897 20.999 7 20.999H17C18.103 20.999 19 20.101 19 18.999V6.99902H5ZM11 17H9V11H11V17ZM15 17H13V11H15V17Z"></path></svg></div></button>      
                    <button class="modal-button" onclick="editPost('${postId}')"><div>Edit</div><div class="modal-icon"><svg width="20" height="20" viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M19.2929 9.8299L19.9409 9.18278C21.353 7.77064 21.353 5.47197 19.9409 4.05892C18.5287 2.64678 16.2292 2.64678 14.817 4.05892L14.1699 4.70694L19.2929 9.8299ZM12.8962 5.97688L5.18469 13.6906L10.3085 18.813L18.0201 11.0992L12.8962 5.97688ZM4.11851 20.9704L8.75906 19.8112L4.18692 15.239L3.02678 19.8796C2.95028 20.1856 3.04028 20.5105 3.26349 20.7337C3.48669 20.9569 3.8116 21.046 4.11851 20.9704Z" fill="currentColor"></path></svg></div></button>      
                    `; 
                }

                if (localStorage.getItem("permissions") === "1") {
                    mdlt.innerHTML += `
                    <button class="modal-button" onclick="modPostModal('${postId}')"><div>Moderate</div><div class="modal-icon"><svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M19 6.00001C15.56 6.00001 12.826 2.43501 12.799 2.39801C12.421 1.89801 11.579 1.89801 11.201 2.39801C11.174 2.43501 8.44 6.00001 5 6.00001C4.447 6.00001 4 6.44801 4 7.00001V14C4 17.807 10.764 21.478 11.534 21.884C11.68 21.961 11.84 21.998 12 21.998C12.16 21.998 12.32 21.96 12.466 21.884C13.236 21.478 20 17.807 20 14V7.00001C20 6.44801 19.553 6.00001 19 6.00001ZM15 16L12 14L9 16L10 13L8 11H11L12 8.00001L13 11H16L14 13L15 16Z"></path></svg></div></button>      
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
                <iframe class="profile" src="users.html?u=${uId}"></iframe>
                `;
                
                fetch(`https://api.meower.org/users/${uId}`)
                .then(response => response.json())
                .then(data => {
                    if (data.avatar_color !== "!color") {
                        const clr1 = darkenColour(data.avatar_color, 3);
                        const clr2 = darkenColour(data.avatar_color, 5);
                        mdl.style.background = `linear-gradient(180deg, ${clr1} 0%, ${clr2} 100%`;
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
                <h3>Report Post</h3>
                <hr class="mdl-hr">
                <span class="subheader">Reason</span>
                <select id="report-reason" class="modal-select">
                <option value="Spam">Spam</option>
                    <option value="Harassment or abuse towards others">Harassment or abuse towards others</option>
                    <option value="Rude, vulgar or offensive language">Rude, vulgar or offensive language</option>
                    <option value="NSFW (sexual, alcohol, violence, gore, etc.)">NSFW (sexual, alcohol, violence, gore, etc.)</option>
                    <option value="Scams, hacks, phishing or other malicious content">Scams, hacks, phishing or other malicious content</option>
                    <option value="Threatening violence or real world harm">Threatening violence or real world harm</option>
                    <option value="Illegal activity">Illegal activity</option><option value="Self-harm/suicide">Self-harm/suicide</option>
                    <option value="Other">This person is too young to use Meower</option>
                    <option value="Other">Other</option>
                    </select>
                <span class="subheader">Comment</span>
                <textarea class="mdl-txt" id="report-comment"></textarea>
                <button class="modal-button" onclick="sendReport('${id}')">Send Report</button>
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
    closemodal("Report Sent!");
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
                <input type="text" class="mdl-inp" id="usrinpmd" placeholder="Username...">
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
    console.log(postid);
    if (action) {
        fetch(`https://api.meower.org/admin/reports/${postid}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "token": localStorage.getItem("token")
            },
            body: JSON.stringify({
                status: "action_taken"
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

    if (postContainer) {
        const username = postContainer.querySelector('#username').innerText;
        const postContent = postContainer.querySelector('p').innerText
            .replace(/\n/g, ' ')
            .replace(/@\w+/g, '')
            .split(' ')
            .slice(0, 6)
            .join(' ');

        const postId = postContainer.id;
        document.getElementById('msg').value = `@${username} "${postContent}..." (${postId})\n`;
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
    window.open(`https://meo-32r.pages.dev/share?id=${postId}`, '_blank');
    closemodal();
}

function loadExplore() {
    page = "explore";
    document.getElementById("main").innerHTML = `
    <div class="explore">
    <h1>Explore</h1>
    <h3>Open User</h3>
    <form class="section-form" onsubmit="gotousr();">
        <input type="text" class="section-input" id="usrinp" placeholder="MikeDEV">
        <button class="section-send button">Go!</button>
    </form>
    <h3>Statistics</h3>
    <div class="section stats">
    </div>
    </div>
    `;

    loadstats();

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

main();
setInterval(ping, 5000);