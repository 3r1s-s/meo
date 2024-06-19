let bridges = ["Discord", "SplashBridge"];

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

function settingsstuff() {
    return false;
}

function loadpost(p) {
    let user, content;
    let bridged = bridges.includes(p.u);

    if (bridged) {
        const rcon = p.p;
        const match = rcon.match(/^([a-zA-Z0-9_-]{1,20})?: ([\s\S]+)?/m);
        user = match ? match[1] : p.u;
        content = match ? match[2] : rcon;
    } else {
        content = p.p;
        user = p.u;
    }

    const postContainer = document.createElement("div");
    postContainer.classList.add("post");

    const wrapperDiv = document.createElement("div");
    wrapperDiv.classList.add("wrapper");

    const pfpDiv = document.createElement("div");
    pfpDiv.classList.add("pfp");

    const pstdte = document.createElement("i");
    pstdte.classList.add("date");
    const ts = new Date(p.t.e * 1000);
    pstdte.innerText = ts.toLocaleString([], { month: '2-digit', day: '2-digit', year: '2-digit', hour: 'numeric', minute: 'numeric' });

    const pstinf = document.createElement("span");
    pstinf.classList.add("user-header");
    pstinf.innerHTML = `<span id='username'>${user}</span>`;

    if (bridged) {
        const bridgedElem = document.createElement("bridge");
        bridgedElem.innerText = "Bridged";
        bridgedElem.setAttribute("title", "This post has been bridged from another platform.");
        pstinf.appendChild(bridgedElem);
    }

    pstinf.appendChild(pstdte);
    wrapperDiv.appendChild(pstinf);

    const roarer = /@([\w-]+)\s+"([^"]*)"\s+\(([^)]+)\)/g;
    const bettermeower = /@([\w-]+)\[([a-zA-Z0-9]+)\]/g;

    let matches1 = [...content.matchAll(roarer)];
    let matches2 = [...content.matchAll(bettermeower)];

    let allMatches = matches1.concat(matches2);

    if (allMatches.length > 0) {
        const replyIds = allMatches.map(match => match[3] || match[2]);
        loadreplies(p.post_origin, replyIds).then(replyContainers => {
            replyContainers.forEach(replyContainer => {
                pstinf.after(replyContainer);
            });
        });

        allMatches.forEach(match => {
            content = content.replace(match[0], '').trim();
        });
    }

    let postContentText = document.createElement("p");
    postContentText.className = "post-content";

    if (typeof md !== 'undefined') {
        md.disable(['image']);
        postContentText.innerHTML = erimd(md.render(content));
        postContentText.innerHTML = buttonbadges(postContentText);
    } else {
        postContentText.innerHTML = oldMarkdown(content);
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

    loadPfp(user).then(pfpElement => {
        if (pfpElement) {
            pfpDiv.appendChild(pfpElement);
            postContainer.insertBefore(pfpDiv, wrapperDiv);
        }
    });

    postContainer.appendChild(wrapperDiv);
    const pageContainer = document.getElementById("msgs");
    pageContainer.insertBefore(postContainer, pageContainer.firstChild);
}

function loadPfp(username) {
    return new Promise((resolve, reject) => {
        fetch(`https://api.meower.org/users/${username}`)
            .then(userResp => userResp.json())
            .then(userData => {
                let pfpElement;
                if (userData.avatar) {
                    const pfpurl = `https://uploads.meower.org/icons/${userData.avatar}`;
                    pfpElement = document.createElement("img");
                    pfpElement.setAttribute("src", pfpurl);
                    pfpElement.setAttribute("alt", username);
                    pfpElement.classList.add("avatar");
                    if (userData.avatar_color) {
                        pfpElement.style.border = `3px solid #${userData.avatar_color}`;
                        pfpElement.style.backgroundColor = `#${userData.avatar_color}`;
                    }
                    pfpElement.addEventListener('error', () => {
                        pfpElement.setAttribute("src", `${pfpurl}.png`);
                    });
                } else {
                    pfpElement = document.createElement("img");
                    pfpElement.setAttribute("src", `images/avatars/icon_err.svg`);
                    pfpElement.setAttribute("alt", username);
                    pfpElement.classList.add("avatar");
                    pfpElement.classList.add("svg-avatar");
                    pfpElement.style.border = `3px solid #fff`;
                    pfpElement.style.backgroundColor = `#fff`;
                }
                resolve(pfpElement);
            })
            .catch(error => {
                console.error("Failed to fetch:", error);
                resolve(null);
            });
    });
}

async function loadreplies(postOrigin, replyIds) {
    const replies = await Promise.all(replyIds.map(replyid => loadreply(postOrigin, replyid)));
    return replies;
}

async function loadreply(postOrigin, replyid) {
    const roarRegex = /^@[\w-]+ (.+?) \(([^)]+)\)/;
    const betterMeowerRegex = /@([\w-]+)\[([a-zA-Z0-9]+)\]/g;

    try {
        const replyresp = await fetch(`https://api.meower.org/posts?id=${replyid}`);
        let replydata;
        if (replyresp.status === 404) {
            replydata = { p: "[original message was deleted]" };
        } else {
            replydata = await replyresp.json();
        }

        const replycontainer = document.createElement("div");
        replycontainer.classList.add("reply");

        let content = replydata.p || '';
        let user = replydata.u || '';

        const match = content.replace(roarRegex, "").replace(betterMeowerRegex, "").trim();
        if (match) {
            content = match;
        }

        replycontainer.innerHTML = `<p style='font-weight:bold;margin: 10px 0 10px 0;'>${escapeHTML(user)}</p><p style='margin: 10px 0 10px 0;'>${escapeHTML(content)}</p>`;

        return replycontainer;
    } catch (error) {
        console.error("Error fetching reply:", error);
        return document.createElement("p");
    }
}

window.onload = loadsharedpost;
