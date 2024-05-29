let pfpCache = "";

async function loadsharedpost() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        return;
    }

    const api = `https://api.meower.org/posts?id=${id}`;
    console.debug(api);
    try {
        const response = await fetch(api);
        const data = await response.json();

        loadpost(data);

    } catch (error) {
        console.error('Fetch Error:', error);
    }
}

function loadpost(p) {
    let user
    let content
    if (p.u == "Discord" || p.u == "SplashBridge") {
        const rcon = p.p;
        const parts = rcon.split(': ');
        user = parts[0];
        content = parts.slice(1).join(': ');
    } else {
        content = p.p;
        user = p.u;
    }
    
    let postContainer = document.getElementById(p._id);
    if (!postContainer) {
        postContainer = document.createElement("div");
        postContainer.id = p._id;
        postContainer.classList.add("post");
    }

    while (postContainer.firstChild) {
        postContainer.firstChild.remove();
    }

    const wrapperDiv = document.createElement("div");
    wrapperDiv.classList.add("wrapper");

    const pfpDiv = document.createElement("div");
    pfpDiv.classList.add("pfp");

    const pstdte = document.createElement("i");
    pstdte.classList.add("date");
    tsr = p.t.e;
    tsra = tsr * 1000;
    tsrb = Math.trunc(tsra);
    const ts = new Date();
    ts.setTime(tsrb);
    pstdte.innerText = new Date(tsrb).toLocaleString([], { month: '2-digit', day: '2-digit', year: '2-digit', hour: 'numeric', minute: 'numeric' });

    const pstinf = document.createElement("h3");
    pstinf.innerHTML = `<span id='username'>${user}</span>`;

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
    
        loadreply(p.post_origin, replyid).then(replycontainer => {
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
    const emojiRgx = /^(?:\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])+$/gi;
    const discordRgx = /^<(a)?:\w+:\d+>$/gi;
    if (emojiRgx.test(content) || discordRgx.test(content)) {
        postContentText.classList.add('big');
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

    if (!document.getElementById(p._id)) {
        const pageContainer = document.getElementById("msgs");
        if (pageContainer.firstChild) {
            pageContainer.insertBefore(postContainer, pageContainer.firstChild);
        } else {
            pageContainer.appendChild(postContainer);
        }
    }
}

function loadPfp(username) {
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

async function loadreply(postOrigin, replyid) {
    const replyregex = /^@[^ ]+ (.+?) \(([^)]+)\)/;
    try {
        let replydata = postCache[postOrigin].find(post => post._id === replyid);
        if (!replydata) {
            const replyresp = await fetch(`https://api.meower.org/posts?id=${replyid}`, {
                headers: { token: localStorage.getItem("token") }
            });
            replydata = await replyresp.json();
        }

        const replycontainer = document.createElement("div");
        replycontainer.classList.add("reply");
        let replyContent = replydata.p;
        
        const match = replydata.p.replace(replyregex, "").trim();
        if (match) {
            replyContent = match;
        }
        
        if (replydata.u === "Discord" || replydata.u === "SplashBridge") {
            const rcon = replyContent;
            const parts = rcon.split(': ');
            const user = parts[0];
            const content = parts.slice(1).join(': ');
            replycontainer.innerHTML = `<p style='font-weight:bold;margin: 10px 0 10px 0;'>${escapeHTML(user)}</p><p style='margin: 10px 0 10px 0;'>${escapeHTML(content)}</p>`;
        } else {
            replycontainer.innerHTML = `<p style='font-weight:bold;margin: 10px 0 10px 0;'>${escapeHTML(replydata.u)}</p><p style='margin: 10px 0 10px 0;'>${escapeHTML(replyContent)}</p>`;
        }
        
        return replycontainer;
    } catch (error) {
        console.error("Error fetching reply:", error);
        return document.createElement("p");
    }
}

window.onload = loadsharedpost();