// dont be fooled 
// theres more than just markdown stuff in here
// im bad at naming things ok

let whitelist = [
    "https://uploads.meower.org/",
    "https://meower.org/",
    "https://http.meower.org/",
    "https://assets.meower.org/",
    "https://forums.meower.org/",
    "https://go.meower.org/",
    "https://hedgedoc.meower.org/",
    "https://docs.meower.org/",
    "https://i.ibb.co/",
    "https://u.cubeupload.com/",
    "https://cubeupload.com/",
    "https://media.tenor.com/",
    "https://tenor.com/",
    "https://c.tenor.com/",
    "https://assets.scratch.mit.edu/",
    "https://cdn2.scratch.mit.edu/",
    "https://cdn.scratch.mit.edu/",
    "https://uploads.scratch.mit.edu/",
    "https://cdn.discordapp.com/",
    "https://media.discordapp.net/",
];

function escapeHTML(content) {
    const escapedinput = content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')

    return escapedinput;
}

function erimd(content,isProfile) {
    const fixProfile = isProfile ? "parent." : "";
    const text = content
        .replace(/(?:^|(?<=\s|<p>))@([\w-]+)(?![^<]*?<\/code>)/g, `<span id="username" class="attachment" onclick="${fixProfile}openUsrModal(\'$1\')">@$1</span>`)
        .replace(/&lt;:(\w+):(\d+)&gt;/g, '<img src="https://cdn.discordapp.com/emojis/$2.webp?size=96&quality=lossless" alt="$1" title="$1" class="emoji">')
        .replace(/&lt;a:(\w+):(\d+)&gt;/g, '<img src="https://cdn.discordapp.com/emojis/$2.gif?size=96&quality=lossless" alt="$1" title="$1" class="emoji">')
        .replace(/<a\s+href="https:\/\/eris\.pages\.dev\/meo\/profile\?u=([\w-]+)".*?>(.*?)<\/a>/g, `<span id="username" class="attachment" onclick="${fixProfile}openUsrModal(\'$1\')">@$1</span>`)
        .replace(/<a\s+href="https:\/\/eris\.pages\.dev\/meo\?gc=([\w-]+)".*?>(.*?)<\/a>/g, `<span id="username" class="attachment" onclick="${fixProfile}loadchat(\'$1\')">#$1</span>`)
        .replace(/(?:^|\n|<p>)-# (.*)$/gm, '<span class="subsubheader">$1</span>')
        .replace(/<pre><code>\s*\*([\s\S]*?)<\/code><\/pre>/gm, '<pre class="undertale"><code>*$1</code></pre>')
    return text;
}

function meowerEmojis(content, emojis) {
    for (const emoji of emojis) {
        content = content.replaceAll(`&lt;:${emoji._id}&gt;`, `<img src="https://uploads.meower.org/emojis/${emoji._id}" alt="${escapeHTML(emoji.name)}" title="${escapeHTML(emoji.name)}" class="emoji">`);
    }
    return content;
}

function loadinputs() {
// this should be called preChatLoad or something
    setTop()
    let textin
    
    pendingAttachments = [];

    textin = `
    <textarea type="text" oninput="autoresize()" class="message-input text" id="msg" rows="1" autocomplete="false" placeholder="${lang().meo_messagebox}" aria-label="Message Input"></textarea>
    `

    const inputs = `
    <div class="message-outer">
        <div class="message-container">
            <button class="message-tool button" id="attach" value="Attachments" onclick="selectFiles()" aria-label="Attachments">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M8 16C12.4185 16 16 12.4185 16 8C16 3.58154 12.4185 0 8 0C3.58154 0 0 3.58154 0 8C0 12.4185 3.58154 16 8 16ZM7.06055 11.3604C7.06055 11.8794 7.48145 12.3003 8.00049 12.3003C8.51953 12.3003 8.94043 11.8794 8.94043 11.3604V8.94043H11.3604C11.8794 8.94043 12.3003 8.51953 12.3003 8C12.3003 7.48096 11.8794 7.06006 11.3604 7.06006H8.94043V4.64014C8.94043 4.12109 8.51953 3.7002 8.00049 3.7002C7.48145 3.7002 7.06055 4.12109 7.06055 4.64014V7.06006H4.64014C4.12109 7.06006 3.7002 7.48096 3.7002 8C3.7002 8.51953 4.12109 8.94043 4.64014 8.94043H7.06055V11.3604Z" fill="currentColor"/>
                </svg>
            </button>
            ${textin}
            <button class="message-tool button emoji-button-mobile" id="emojis" value="Emojis" onclick="emojimodal()" aria-label="Emoji Picker">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 9.77778C4 9.77778 5.33333 10.2222 8 10.2222C10.6667 10.2222 12 9.77778 12 9.77778C12 9.77778 11.1111 11.5556 8 11.5556C4.88889 11.5556 4 9.77778 4 9.77778Z" fill="currentColor"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M16 8C16 12.4184 12.4183 16 8 16C3.58171 16 0 12.4184 0 8C0 3.5816 3.58171 0 8 0C12.4183 0 16 3.5816 16 8ZM8 9.33377C6.38976 9.33377 5.32134 9.14627 4 8.88932C3.69824 8.83116 3.11111 8.88932 3.11111 9.77821C3.11111 11.556 5.15332 13.7782 8 13.7782C10.8462 13.7782 12.8889 11.556 12.8889 9.77821C12.8889 8.88932 12.3018 8.83073 12 8.88932C10.6787 9.14627 9.61024 9.33377 8 9.33377ZM5.33333 7.55556C5.94699 7.55556 6.44444 6.85894 6.44444 6C6.44444 5.14106 5.94699 4.44444 5.33333 4.44444C4.71967 4.44444 4.22222 5.14106 4.22222 6C4.22222 6.85894 4.71967 7.55556 5.33333 7.55556ZM11.7778 6C11.7778 6.85894 11.2803 7.55556 10.6667 7.55556C10.053 7.55556 9.55556 6.85894 9.55556 6C9.55556 5.14106 10.053 4.44444 10.6667 4.44444C11.2803 4.44444 11.7778 5.14106 11.7778 6Z" fill="currentColor"/>
                </svg>
            </button>
            <button class="message-tool button emoji-button" id="emojis" value="Emojis" onclick="togglePicker()" aria-label="Emoji Picker">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 9.77778C4 9.77778 5.33333 10.2222 8 10.2222C10.6667 10.2222 12 9.77778 12 9.77778C12 9.77778 11.1111 11.5556 8 11.5556C4.88889 11.5556 4 9.77778 4 9.77778Z" fill="currentColor"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M16 8C16 12.4184 12.4183 16 8 16C3.58171 16 0 12.4184 0 8C0 3.5816 3.58171 0 8 0C12.4183 0 16 3.5816 16 8ZM8 9.33377C6.38976 9.33377 5.32134 9.14627 4 8.88932C3.69824 8.83116 3.11111 8.88932 3.11111 9.77821C3.11111 11.556 5.15332 13.7782 8 13.7782C10.8462 13.7782 12.8889 11.556 12.8889 9.77821C12.8889 8.88932 12.3018 8.83073 12 8.88932C10.6787 9.14627 9.61024 9.33377 8 9.33377ZM5.33333 7.55556C5.94699 7.55556 6.44444 6.85894 6.44444 6C6.44444 5.14106 5.94699 4.44444 5.33333 4.44444C4.71967 4.44444 4.22222 5.14106 4.22222 6C4.22222 6.85894 4.71967 7.55556 5.33333 7.55556ZM11.7778 6C11.7778 6.85894 11.2803 7.55556 10.6667 7.55556C10.053 7.55556 9.55556 6.85894 9.55556 6C9.55556 5.14106 10.053 4.44444 10.6667 4.44444C11.2803 4.44444 11.7778 5.14106 11.7778 6Z" fill="currentColor"/>
                </svg>
            </button>
            <button class="message-send button" id="post" value="Post!" onclick="sendpost()" aria-label="Send Message">
                <svg class="sendicn" role="img" width="16" height="16" viewBox="0 0 16 16">
                    <path d="M8.2738 8.49222L1.99997 9.09877L0.349029 14.3788C0.250591 14.691 0.347154 15.0322 0.595581 15.246C0.843069 15.4597 1.19464 15.5047 1.48903 15.3613L15.2384 8.7032C15.5075 8.57195 15.6781 8.29914 15.6781 8.00007C15.6781 7.70101 15.5074 7.4282 15.2384 7.29694L1.49839 0.634063C1.20401 0.490625 0.852453 0.535625 0.604941 0.749376C0.356493 0.963128 0.259941 1.30344 0.358389 1.61563L2.00932 6.89563L8.27093 7.50312C8.52405 7.52843 8.71718 7.74125 8.71718 7.99531C8.71718 8.24938 8.52406 8.46218 8.27093 8.4875L8.2738 8.49222Z" fill="currentColor"></path>
                </svg>
            </button>
            </div>
        <div class="sub-msg-cnt">
            <div id="emojipicker"></div>
            <div id="images-container"></div>
            <span id="edit-indicator"></span>
            <div id="replies"></div>
        </div>
    </div>
    <div id="msgs" class="posts">
    </div>
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
        <div class="skeleton-post"><div class="pfp"><div class="skeleton-avatar"></div></div><div class="wrapper"><span class="skeleton-header"><div class="skeleton-username"></div><div class="skeleton-date"></div></span><div class="skeleton-content-1"></div><div class="skeleton-content-2"></div></div></div>
        <div class="skeleton-post"><div class="pfp"><div class="skeleton-avatar"></div></div><div class="wrapper"><span class="skeleton-header"><div class="skeleton-username"></div><div class="skeleton-date"></div></span><div class="skeleton-content-1"></div><div class="skeleton-content-2"></div></div></div>
    </div>
    <div class="jump" onclick="jumpToTop()">
        <svg viewBox="0 0 448 512" height="19" width="19"><path fill="currentColor" d="M201.4 137.4c12.5-12.5 32.8-12.5 45.3 0l160 160c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L224 205.3 86.6 342.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l160-160z"></path></svg>
    </div>
    `;
    return inputs;
}

function buttonbadges(content) {
    content.querySelectorAll('p a').forEach(link => {
        link.setAttribute('target', '_blank');
        if (settingsstuff().underlinelinks) {
            link.classList.add("underline");
        }

        let url;
        try {
            url = new URL(link.getAttribute('href'));
        } catch (e) {
            return;
        }
        const fileExtension = url.pathname.split('.').pop().toLowerCase().split('?')[0];
        const fileDomain = url.href.includes('tenor.com/view');

        if ((['png', 'jpg', 'jpeg', 'webp', 'gif', 'mp4', 'webm', 'mov', 'm4v', 'svg'].includes(fileExtension)) || fileDomain) {
            link.classList.add('attachment', 'tooltip', 'bottom', 'right', 'long');
            link.setAttribute('data-tooltip', url.href);
            link.innerHTML = `<svg class="icon_ecf39b icon__13ad2" xmlns="http://www.w3.org/2000/svg" width="0.8em" height="0.8em" viewBox="0 0 24 24">
                <path fill="currentColor" d="M10.57 4.01a6.97 6.97 0 0 1 9.86 0l.54.55a6.99 6.99 0 0 1 0 9.88l-7.26 7.27a1 1 0 0 1-1.42-1.42l7.27-7.26a4.99 4.99 0 0 0 0-7.06L19 5.43a4.97 4.97 0 0 0-7.02 0l-8.02 8.02a3.24 3.24 0 1 0 4.58 4.58l6.24-6.24a1.12 1.12 0 0 0-1.58-1.58l-3.5 3.5a1 1 0 0 1-1.42-1.42l3.5-3.5a3.12 3.12 0 1 1 4.42 4.42l-6.24 6.24a5.24 5.24 0 0 1-7.42-7.42l8.02-8.02Z"></path></svg><span> attachments</span>`;
        } else if (url.href === "https://eris.pages.dev/meo/") {
            link.classList.add('attachment');
            link.innerHTML = `<span class="ext-link-wrapper"><span class="link-icon-wrapper">
            <svg width="12" height="12" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                <g>
                    <path fill="currentColor" d="M468.42 20.5746L332.997 65.8367C310.218 58.8105 284.517 55.049 255.499 55.6094C226.484 55.049 200.78 58.8105 178.004 65.8367L42.5803 20.5746C18.9102 16.3251 -1.81518 36.2937 2.5967 59.1025L38.7636 200.894C18.861 248.282 12.1849 296.099 12.1849 325.027C12.1849 399.343 44.6613 492 255.499 492C466.339 492 498.815 399.343 498.815 325.027C498.815 296.099 492.139 248.282 472.237 200.894L508.404 59.1025C512.814 36.2937 492.09 16.3251 468.42 20.5746Z"></path>
                </g>
            </svg>
            </span>meo</span>`;
        } else {
            const socials = [
                { pattern: /^https:\/\/scratch\.mit\.edu\/users\/([^\/?#]+)\/?$/, icon: 'scratch_1x.png' },
                { pattern: /^https:\/\/www\.youtube\.com\/@([^\/?#]+)\/?$/, icon: 'youtube_1x.png' },
                { pattern: /^https:\/\/twitter\.com\/([^\/?#]+)\/?$/, icon: 'twitter_1x.png' },
                { pattern: /^https:\/\/www\.facebook\.com\/([^\/?#]+)\/?$/, icon: 'facebook_1x.png' },
                { pattern: /^https:\/\/x\.com\/([^\/?#]+)\/?$/, icon: 'twitter_1x.png' },
                { pattern: /^https:\/\/www\.instagram\.com\/([^\/?#]+)\/?$/, icon: 'instagram_1x.png' },
                { pattern: /^https:\/\/darflen\.com\/users\/([^\/?#]+)\/?$/, icon: 'darf.png' },
                { pattern: /^https:\/\/wasteof\.money\/users\/([^\/?#]+)\/?$/, icon: 'wasteof.png' },
                { pattern: /^https:\/\/eris\.pages\.dev\/meo\/profile\?u=([^\/?#]+)\/?$/, icon: 'meo_1x.png' },
                { pattern: /^https:\/\/www\.tiktok\.com\/@([^\/?#]+)\/?$/, icon: 'tiktok_1x.png' },
                { pattern: /^https:\/\/discord\.gg\/([^\/?#]+)\/?$/, icon: 'discord_1x.png' },
                { pattern: /^https:\/\/github\.com\/([^\/?#]+)\/?$/, icon: 'github.png' }

            ];

            for (let { pattern, icon } of socials) {
                const match = url.href.match(pattern);
                if (match) {
                    const username = match[1];
                    link.classList.add('ext-link');
                    link.innerHTML = `<span class="ext-link-wrapper"><span class="link-icon-wrapper">
                    <img width="14px" class="ext-icon" src="images/links/${icon}"></span>${username}</span>`;
                    break;
                }
            }
        }
    });
    
    return content.innerHTML;
}

function attach(attachment) {
    let link;
    if (attachment.filename) {
        link = `https://uploads.meower.org/attachments/${attachment.id}/${attachment.filename}`;
    } else {
        link = `https://uploads.meower.org/attachments/${attachment.id}`;
    }
    if (link) {
        const baseURL = link.split('?')[0];
        const fileName = baseURL.split('/').pop();

        let embeddedElement;

        if (attachment.mime.includes("image/") && attachment.size < (12 << 20)) {
            if (whitelist.some(source => link.includes(source))) {
                const element = document.createElement("div");
                element.classList.add("image-outer");

                let imgElement = document.createElement("img");
                imgElement.setAttribute("src", link + '?preview');
                imgElement.setAttribute("onclick", `openImage('${link}')`);
                imgElement.setAttribute("alt", fileName);
                imgElement.setAttribute("title", fileName);
                imgElement.classList.add("embed");
                if (settingsstuff().hideimages) {
                    imgElement.classList.add("spoiler");
                }

                element.appendChild(imgElement);
                embeddedElement = element;
            }
        } else if (attachment.mime.includes("video/") && attachment.size < (12 << 20)) {
            const element = document.createElement("div");
            element.classList.add("media-outer");

            let mediaElement = document.createElement("video");
            mediaElement.setAttribute("src", baseURL + '?preview');
            mediaElement.setAttribute("controls", "controls");
            mediaElement.setAttribute("playsinline", "");
            mediaElement.setAttribute("preload", "metadata");
            mediaElement.setAttribute("alt", fileName);
            mediaElement.setAttribute("title", fileName);
            mediaElement.classList.add("embed");
            
            element.appendChild(mediaElement);
            embeddedElement = element;
        } else if (attachment.mime.includes("audio/") && attachment.size < (12 << 20)) {

            const element = document.createElement("div");
            element.classList.add("media-outer");

            let mediaElement = document.createElement("audio");
            mediaElement.setAttribute("src", baseURL);
            mediaElement.setAttribute("controls", "controls");
            mediaElement.setAttribute("alt", fileName);
            mediaElement.setAttribute("title", fileName);
            mediaElement.classList.add("embed");
            
            element.appendChild(mediaElement);
            embeddedElement = element;
        } else {
            const element = document.createElement("div");
            element.classList.add("download");
            if (settingsstuff().underlinelinks) {
                element.classList.add("underline");
            }
            element.innerHTML = `
            <a href="${link}?download" target="_blank">${attachment.filename}</a>
            <span class="subsubheader">${formatSize(attachment.size)}</span>
            `;
            embeddedElement = element;
        }
        return embeddedElement;
    }
}

function embed(links) {
    if (links) {
        let embeddedElements = [];

        links.forEach(link => {
            const baseURL = link.split('?')[0];
            const fileExtension = baseURL.split('.').pop().toLowerCase();
            const fileName = baseURL.split('/').pop();

            let embeddedElement;

            if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(fileExtension)) {
                if (whitelist.some(source => link.includes(source))  || settingsstuff().imagewhitelist) {
                    const element = document.createElement("div");
                    element.classList.add("image-outer");

                    let imgElement = document.createElement("img");
                    const url = new URL(link);
                    imgElement.setAttribute("src", url.href);
                    imgElement.setAttribute("onclick", `openImage('${url.href}')`);
                    imgElement.setAttribute("alt", fileName);
                    imgElement.setAttribute("title", fileName);
                    imgElement.classList.add("embed");
                    if (settingsstuff().hideimages) {
                        imgElement.classList.add("spoiler");
                    }

                    element.appendChild(imgElement);

                    embeddedElement = element;
                }
            } else if (['mp4', 'webm', 'mov', 'mkv'].includes(fileExtension)) {
                const element = document.createElement("div");
                element.classList.add("media-outer");
                
                let mediaElement = document.createElement("video");
                mediaElement.setAttribute("src", baseURL);
                mediaElement.setAttribute("controls", "controls");
                mediaElement.setAttribute("playsinline", "");
                mediaElement.setAttribute("preload", "metadata");
                mediaElement.setAttribute("alt", fileName);
                mediaElement.setAttribute("title", fileName);
                mediaElement.setAttribute("style", "max-width:300px");
                mediaElement.classList.add("embed");

                element.appendChild(mediaElement);
                embeddedElement = element;
            } else if (['mp3', 'wav', 'ogg', 'flac'].includes(fileExtension)) {
                const element = document.createElement("div");
                element.classList.add("media-outer");

                let mediaElement = document.createElement("audio");
                mediaElement.setAttribute("src", baseURL);
                mediaElement.setAttribute("controls", "controls");
                mediaElement.setAttribute("alt", fileName);
                mediaElement.setAttribute("title", fileName);
                mediaElement.classList.add("embed");
                
                element.appendChild(mediaElement);
                embeddedElement = element;
            }
            if (settingsstuff().embeds) {
                if (link.includes('www.youtube.com') || link.includes('m.youtube.com')) {      
                const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(?:[^\/\n\s]+\/(?:shorts\/)?|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
                const youtubeMobRegex = /^(https?:\/\/)?(m\.)?(youtube\.com\/(?:[^\/\n\s]+\/(?:shorts\/)?|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
                if (youtubeRegex.test(link) || youtubeMobRegex.test(link)) {
                    let match
                    let videoId
                    if (youtubeRegex.test(link)) {
                        match = link.match(youtubeRegex);
                        videoId = match[4];
                    } else {
                        match = link.match(youtubeMobRegex);
                        videoId = match[4];
                    }
                
                    embeddedElement = document.createElement("iframe");
                    embeddedElement.setAttribute("width", "100%");
                    embeddedElement.setAttribute("height", "315");
                    embeddedElement.setAttribute("style", "max-width:500px;");
                    embeddedElement.setAttribute("class", "media");
                    embeddedElement.setAttribute("src", "https://www.youtube-nocookie.com/embed/" + videoId);
                    embeddedElement.setAttribute("title", "YouTube video player");
                    embeddedElement.setAttribute("frameborder", "0");
                    embeddedElement.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share");
                    embeddedElement.setAttribute("allowfullscreen", "");
                }
            } else if (link.includes('scratch.mit.edu/projects/')) {
                console.warn(link);
                const regex = /projects\/(\d+)/;
                const match = link.match(regex);
                if (match) {
                    const trackId = match[1];

                    embeddedElement = document.createElement("div");
                    embeddedElement.classList.add("scratch-embed");

                    const request = new XMLHttpRequest();
                    request.open('GET', `https://trampoline.turbowarp.org/api/projects/${escapeHTML(trackId)}`);
                    request.onload = () => {
                        const data = JSON.parse(request.responseText);
                        embeddedElement.innerHTML = `
                        <a href="https://scratch.mit.edu/projects/${escapeHTML(trackId)}/" target="_blank"><div class="scratch-thumbnail" style="background-image: url(https://cdn.scratch.mit.edu/get_image/project/${escapeHTML(trackId)}_1080x1080.png);"></div></a>
                        <div class="scratch-title"><a href="https://scratch.mit.edu/projects/${escapeHTML(trackId)}/" target="_blank" class="scratch-link">${escapeHTML(data.title)}</a></div>
                        `
                    }
                    request.send();
                    
                    embeddedElement.classList.add("media");
                }
            } else if (link.includes('turbowarp.org/')) {
                console.warn(link);
                const regex = /\/(\d+)/;
                const match = link.match(regex);
                if (match) {
                    const trackId = match[1];

                    embeddedElement = document.createElement("div");
                    embeddedElement.classList.add("scratch-embed");

                    const request = new XMLHttpRequest();
                    request.open('GET', `https://trampoline.turbowarp.org/api/projects/${escapeHTML(trackId)}`);
                    request.onload = () => {
                        const data = JSON.parse(request.responseText);
                        embeddedElement.innerHTML = `
                        <a href="https://turbowarp.org/${escapeHTML(trackId)}/" target="_blank"><div class="scratch-thumbnail" style="background-image: url(https://cdn.scratch.mit.edu/get_image/project/${escapeHTML(trackId)}_1080x1080.png);"></div></a>
                        <div class="scratch-title"><a href="https://turbowarp.org/${escapeHTML(trackId)}/" target="_blank" class="turbowarp-link">${escapeHTML(data.title)}</a></div>
                        `
                    }
                    request.send();
                    
                    embeddedElement.classList.add("media");
                }
            } else if (link.includes('darflen.com/posts/')) {
                console.warn(link);
                const regex = /posts\/([a-zA-Z0-9]+)/;
                const match = link.match(regex);
                if (match) {
                    const trackId = match[1];

                    embeddedElement = document.createElement("div");
                    embeddedElement.classList.add("darflen-embed");

                    const request = new XMLHttpRequest();
                    request.open('GET', `https://api.darflen.com/posts/${trackId}`);
                    request.onload = () => {
                        const data = JSON.parse(request.responseText);
                        let post;
                        if (data.post.content) {
                            post = data.post.content;
                        } else if (data.post.files) {
                            post = `<font style='background:#1c1a23;border-radius:5px;'>User submitted image</font>`;
                        }
                        embeddedElement.innerHTML = `
                        <a class="darflen-jump" href="https://darflen.com/posts/${escapeHTML(trackId)}/" target="_blank">
                            <div class="darflen-top-left">
                                <img class="darflen-pfp" src="${escapeHTML(data.post.author.profile.images.icon.thumbnail)}">
                                <div class="darflen-user-info">
                                    <span class="darflen-username">${escapeHTML(data.post.author.profile.username)}</span>
                                    <span class="darflen-stats">${timeago(data.post.miscellaneous.creation_time*1000)} ago • ${data.post.stats.views} Views</span>
                                </div>
                            </div>
                            <div class="darflen-content">
                                <span>${escapeHTML(post)}</span>
                            </div>
                            <div class="darflen-stats">
                                <div class="darflen-stat">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 4.528a6 6 0 0 0-8.243 8.715l6.829 6.828a2 2 0 0 0 2.828 0l6.829-6.828A6 6 0 0 0 12 4.528zm-1.172 1.644l.465.464a1 1 0 0 0 1.414 0l.465-.464a4 4 0 1 1 5.656 5.656L12 18.657l-6.828-6.829a4 4 0 0 1 5.656-5.656z" fill="currentColor"/></svg>
                                    <span>${data.post.stats.loves}</span>
                                </div>
                                <div class="darflen-stat">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20.924 5.617a.997.997 0 0 0-.217-.324l-3-3a1 1 0 1 0-1.414 1.414L17.586 5H8a5 5 0 0 0-5 5v2a1 1 0 1 0 2 0v-2a3 3 0 0 1 3-3h9.586l-1.293 1.293a1 1 0 0 0 1.414 1.414l3-3A.997.997 0 0 0 21 6m-.076-.383a.996.996 0 0 1 .076.38zm-17.848 12a.997.997 0 0 0 .217 1.09l3 3a1 1 0 0 0 1.414-1.414L6.414 19H16a5 5 0 0 0 5-5v-2a1 1 0 1 0-2 0v2a3 3 0 0 1-3 3H6.414l1.293-1.293a1 1 0 1 0-1.414-1.414l-3 3m-.217.324a.997.997 0 0 1 .215-.322z" fill="currentColor"/></svg>
                                    <span>${data.post.stats.reposts}</span>
                                </div>
                                <div class="darflen-stat">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-4.586l-2.707 2.707a1 1 0 0 1-1.414 0L8.586 19H4a2 2 0 0 1-2-2V6zm18 0H4v11h5a1 1 0 0 1 .707.293L12 19.586l2.293-2.293A1 1 0 0 1 15 17h5V6zM6 9.5a1 1 0 0 1 1-1h10a1 1 0 1 1 0 2H7a1 1 0 0 1-1-1zm0 4a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2H7a1 1 0 0 1-1-1z" fill="currentColor"/></svg>
                                    <span>${data.post.stats.comments}</span>
                                </div>
                            </div>
                        </a>
                        `
                    }
                    request.send();
                    
                    embeddedElement.classList.add("media");
                }
            } else if (link.includes('wasteof.money/posts/')) {
                console.warn(link);
                const regex = /posts\/([a-zA-Z0-9]+)/;
                const match = link.match(regex);
                if (match) {
                    const trackId = match[1];

                    embeddedElement = document.createElement("div");
                    embeddedElement.classList.add("wasteof-embed");

                    const request = new XMLHttpRequest();
                    request.open('GET', `https://corsproxy.io/?https://api.wasteof.money/posts/${escapeHTML(trackId)}`);
                    request.onload = () => {
                        const data = JSON.parse(request.responseText);
                        embeddedElement.innerHTML = `
                        <a class="wasteof-jump" href="https://wasteof.money/posts/${escapeHTML(trackId)}/" target="_blank">
                            <div class="wasteof-top-left">
                                <img class="wasteof-pfp" src="https://api.wasteof.money/users/${escapeHTML(data.poster.name)}/picture">
                                <div class="wasteof-user-info">
                                    <span class="wasteof-username">@${escapeHTML(data.poster.name)}</span>
                                    <span class="wasteof-color wasteof-${escapeHTML(data.poster.color)}"></span>
                                </div>
                            </div>
                            <div class="wasteof-content">
                                <span>${escapeHTML(data.content)}</span>
                            </div>
                            <div class="wasteof-stats">
                                <div class="wasteof-stat">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path></svg>
                                    <span>${escapeHTML(data.loves)}</span>
                                </div>
                                <div class="wasteof-stat">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" class=""><path d="M11.6 3.4l-.8-.8c-.5-.6-.4-1.5.3-1.8.4-.3 1-.2 1.4.2a509.8 509.8 0 012.7 2.7c.5.4.5 1.2.1 1.6l-2.8 2.9c-.5.5-1.3.5-1.8-.1-.3-.5-.2-1 .2-1.5l.8-1H7a4.3 4.3 0 00-4.1 4.7 2036.2 2036.2 0 01.2 8h2.4c.5 0 .8.2 1 .6.2.4.2.9 0 1.2-.2.4-.6.6-1 .6H1.8c-.7 0-1.2-.5-1.2-1.1v-.2V10c0-1.3.3-2.5 1-3.6 1.3-2 3.2-3 5.6-3h4.4zM12.3 18.3h4.6c2.3 0 4.2-2 4.2-4.3V5.9c0-.2 0-.2-.2-.2h-2.3c-.6 0-1-.3-1.2-.8a1.2 1.2 0 011.1-1.6h3.6c.8 0 1.3.5 1.3 1.3v9c0 1.1-.1 2.2-.6 3.2a6.4 6.4 0 01-5.6 3.7l-4.6.1h-.2l.7.8c.4.4.5.9.3 1.3-.3.8-1.3 1-1.9.4L9 20.6l-.4-.5c-.3-.4-.3-1 0-1.4l2.9-3c.6-.6 1.7-.3 2 .6 0 .4 0 .7-.3 1l-.9 1z" fill="currentColor"></path></svg>
                                    <span>${escapeHTML(data.reposts)}</span>
                                </div>
                                <div class="wasteof-stat">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor" class=""><path fill-rule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6a1 1 0 01-1-1z" clip-rule="evenodd"></path></svg>
                                    <span>${escapeHTML(data.comments)}</span>
                                </div>
                            </div>
                        </a>
                        `
                    }
                    request.send();
                    
                    embeddedElement.classList.add("media");
                }
            } else if (link.includes('open.spotify.com/track')) {
                const spotifyRegex = /track\/([a-zA-Z0-9]+)/;
                const match = link.match(spotifyRegex);
                if (match) {
                    const trackId = match[1];

                    embeddedElement = document.createElement("iframe");
                    embeddedElement.setAttribute("style", "border-radius: 12px;max-width:500px;");
                    embeddedElement.setAttribute("src", `https://open.spotify.com/embed/track/${trackId}?utm_source=generator`);
                    embeddedElement.setAttribute("width", "100%");
                    embeddedElement.setAttribute("height", "80px");
                    embeddedElement.setAttribute("frameBorder", "0");
                    embeddedElement.setAttribute("allowfullscreen", "");
                    embeddedElement.setAttribute("allow", "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture");
                    embeddedElement.setAttribute("loading", "lazy");
                    
                    embeddedElement.classList.add("media");
                }
            } else if (link.includes('open.spotify.com/album')) {
                const spotifyRegex = /album\/([a-zA-Z0-9]+)/;
                const match = link.match(spotifyRegex);
                if (match) {
                    const trackId = match[1];

                    embeddedElement = document.createElement("iframe");
                    embeddedElement.setAttribute("style", "border-radius: 12px;max-width:500px;");
                    embeddedElement.setAttribute("src", `https://open.spotify.com/embed/album/${trackId}?utm_source=generator`);
                    embeddedElement.setAttribute("width", "100%");
                    embeddedElement.setAttribute("height", "352");
                    embeddedElement.setAttribute("frameBorder", "0");
                    embeddedElement.setAttribute("allowfullscreen", "");
                    embeddedElement.setAttribute("allow", "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture");
                    embeddedElement.setAttribute("loading", "lazy");
                }
            } else if (link.includes('tenor.com')) {
                const tenorRegex = /\d+$/;
                const tenorMatch = link.match(tenorRegex);
                const postId = tenorMatch ? tenorMatch[0] : null;

                if (postId) {
                    embeddedElement = document.createElement('div');
                    embeddedElement.className = 'tenor-gif-embed';
                    embeddedElement.setAttribute('data-postid', postId);
                    embeddedElement.setAttribute('data-share-method', 'host');
                    embeddedElement.setAttribute('data-style', 'width: 100%; height: 100%; border-radius: 5px; max-width: 400px; aspect-ratio: 1 / 1; max-height: 400px;');
                    
                    embeddedElement.classList.add("media");
                    
                    let scriptTag = document.createElement('script');
                    scriptTag.setAttribute('type', 'text/javascript');
                    scriptTag.setAttribute('src', 'embed.js');
                    embeddedElement.appendChild(scriptTag);
                }
            }
        }
            if (embeddedElement) {
                embeddedElements.push(embeddedElement);
            }
        });
        return embeddedElements;
    }
}

function createButtonContainer(p) {
    let buttonContainer = document.createElement("div");
    buttonContainer.classList.add("buttonContainer");
    if (settingsstuff().showpostbuttons) {
        buttonContainer.classList.add("visibleButtonContainer");
    }
    buttonContainer.innerHTML = `
    <div class='toolbarContainer'>
        <div class='toolButton tooltip' onclick='sharepost()' aria-label="share" data-tooltip="${lang().action.share}" title="share" tabindex="0">
            <svg viewBox='0 0 20 20' fill='currentColor' width='19' height='19'><path d='M12.9297 3.25007C12.7343 3.05261 12.4154 3.05226 12.2196 3.24928L11.5746 3.89824C11.3811 4.09297 11.3808 4.40733 11.5739 4.60245L16.5685 9.64824C16.7614 9.84309 16.7614 10.1569 16.5685 10.3517L11.5739 15.3975C11.3808 15.5927 11.3811 15.907 11.5746 16.1017L12.2196 16.7507C12.4154 16.9477 12.7343 16.9474 12.9297 16.7499L19.2604 10.3517C19.4532 10.1568 19.4532 9.84314 19.2604 9.64832L12.9297 3.25007Z'></path><path d='M8.42616 4.60245C8.6193 4.40733 8.61898 4.09297 8.42545 3.89824L7.78047 3.24928C7.58466 3.05226 7.26578 3.05261 7.07041 3.25007L0.739669 9.64832C0.5469 9.84314 0.546901 10.1568 0.739669 10.3517L7.07041 16.7499C7.26578 16.9474 7.58465 16.9477 7.78047 16.7507L8.42545 16.1017C8.61898 15.907 8.6193 15.5927 8.42616 15.3975L3.43155 10.3517C3.23869 10.1569 3.23869 9.84309 3.43155 9.64824L8.42616 4.60245Z'></path></svg>
        </div>
        ${p.post_origin !== 'inbox' ? `<div class='toolButton tooltip' onclick='reportModal("${p._id}")' aria-label="report" data-tooltip="${lang().action.report}" title="report" tabindex="0">
            <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M20 6.00201H14V3.00201C14 2.45001 13.553 2.00201 13 2.00201H4C3.447 2.00201 3 2.45001 3 3.00201V22.002H5V14.002H10.586L8.293 16.295C8.007 16.581 7.922 17.011 8.076 17.385C8.23 17.759 8.596 18.002 9 18.002H20C20.553 18.002 21 17.554 21 17.002V7.00201C21 6.45001 20.553 6.00201 20 6.00201Z"></path></svg>
        </div>
        <div class='toolButton tooltip' onclick='pingusr(event)' aria-label="ping" data-tooltip="${lang().action.ping}" title="ping" tabindex="0">
            <svg height="24" width="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.486 2 2 6.486 2 12C2 17.515 6.486 22 12 22C14.039 22 15.993 21.398 17.652 20.259L16.521 18.611C15.195 19.519 13.633 20 12 20C7.589 20 4 16.411 4 12C4 7.589 7.589 4 12 4C16.411 4 20 7.589 20 12V12.782C20 14.17 19.402 15 18.4 15L18.398 15.018C18.338 15.005 18.273 15 18.209 15H18C17.437 15 16.6 14.182 16.6 13.631V12C16.6 9.464 14.537 7.4 12 7.4C9.463 7.4 7.4 9.463 7.4 12C7.4 14.537 9.463 16.6 12 16.6C13.234 16.6 14.35 16.106 15.177 15.313C15.826 16.269 16.93 17 18 17L18.002 16.981C18.064 16.994 18.129 17 18.195 17H18.4C20.552 17 22 15.306 22 12.782V12C22 6.486 17.514 2 12 2ZM12 14.599C10.566 14.599 9.4 13.433 9.4 11.999C9.4 10.565 10.566 9.399 12 9.399C13.434 9.399 14.6 10.565 14.6 11.999C14.6 13.433 13.434 14.599 12 14.599Z"></path></svg>
        </div>
        <div class='toolButton tooltip left' onclick='reply("${p._id}")' aria-label="reply" data-tooltip="${lang().action.reply}" title="reply" tabindex="0">
            <svg width='24' height='24' viewBox='0 0 24 24'><path d='M10 8.26667V4L3 11.4667L10 18.9333V14.56C15 14.56 18.5 16.2667 21 20C20 14.6667 17 9.33333 10 8.26667Z' fill='currentColor'></path></svg>
        </div>` : ''}
    </div>
    `;
    let nwbtn
    if (p.u === localStorage.getItem("username") && p.post_origin !== "inbox") {
        nwbtn = document.createElement("div");
        nwbtn.classList.add("toolButton");
        nwbtn.setAttribute("onclick", `editPost('${p.post_origin}', '${p._id}')`);
        nwbtn.setAttribute("title", `edit`);
        nwbtn.setAttribute("aria-label", `edit post`);
        nwbtn.setAttribute("tabindex", "0");
        nwbtn.classList.add("tooltip");
        nwbtn.setAttribute("data-tooltip", `${lang().action.edit}`);
        nwbtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M19.2929 9.8299L19.9409 9.18278C21.353 7.77064 21.353 5.47197 19.9409 4.05892C18.5287 2.64678 16.2292 2.64678 14.817 4.05892L14.1699 4.70694L19.2929 9.8299ZM12.8962 5.97688L5.18469 13.6906L10.3085 18.813L18.0201 11.0992L12.8962 5.97688ZM4.11851 20.9704L8.75906 19.8112L4.18692 15.239L3.02678 19.8796C2.95028 20.1856 3.04028 20.5105 3.26349 20.7337C3.48669 20.9569 3.8116 21.046 4.11851 20.9704Z" fill="currentColor"></path></svg>
        `;
        buttonContainer.querySelector('.toolbarContainer').prepend(nwbtn);
        nwbtn = document.createElement("div");
        nwbtn.classList.add("toolButton");
        nwbtn.setAttribute("onclick", `deletePost("${p._id}")`);
        nwbtn.setAttribute("title", `delete`);
        nwbtn.setAttribute("aria-label", `delete post`);
        nwbtn.setAttribute("tabindex", "0");
        nwbtn.classList.add("tooltip");
        nwbtn.setAttribute("data-tooltip", `${lang().action.delete}`);
        nwbtn.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M15 3.999V2H9V3.999H3V5.999H21V3.999H15Z"></path><path fill="currentColor" d="M5 6.99902V18.999C5 20.101 5.897 20.999 7 20.999H17C18.103 20.999 19 20.101 19 18.999V6.99902H5ZM11 17H9V11H11V17ZM15 17H13V11H15V17Z"></path></svg>
        `;
        buttonContainer.querySelector('.toolbarContainer').prepend(nwbtn);
    } else if (localStorage.getItem("permissions") === "1") {
        nwbtn = document.createElement("div");
        nwbtn.classList.add("toolButton");
        nwbtn.setAttribute("onclick", `modDeletePost("${p._id}")`);
        nwbtn.setAttribute("title", `mod delete`);
        nwbtn.setAttribute("aria-label", `mod delete`);
        nwbtn.setAttribute("tabindex", "0");
        nwbtn.classList.add("tooltip");
        nwbtn.setAttribute("data-tooltip", `${lang().action.moddel}`);
        nwbtn.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M15 3.999V2H9V3.999H3V5.999H21V3.999H15Z"></path><path fill="currentColor" d="M5 6.99902V18.999C5 20.101 5.897 20.999 7 20.999H17C18.103 20.999 19 20.101 19 18.999V6.99902H5ZM11 17H9V11H11V17ZM15 17H13V11H15V17Z"></path></svg>
        `;
        buttonContainer.querySelector('.toolbarContainer').prepend(nwbtn);
    }
    
    if (localStorage.getItem("permissions") === "1") {
        nwbtn = document.createElement("div");
        nwbtn.classList.add("toolButton");
        nwbtn.setAttribute("onclick", `modPostModal("${p._id}")`);
        nwbtn.setAttribute("title", `moderate`);
        nwbtn.setAttribute("aria-label", `moderate post`);
        nwbtn.setAttribute("tabindex", "0");
        nwbtn.classList.add("tooltip");
        nwbtn.setAttribute("data-tooltip", `${lang().action.modpost}`);
        nwbtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M19 6.00001C15.56 6.00001 12.826 2.43501 12.799 2.39801C12.421 1.89801 11.579 1.89801 11.201 2.39801C11.174 2.43501 8.44 6.00001 5 6.00001C4.447 6.00001 4 6.44801 4 7.00001V14C4 17.807 10.764 21.478 11.534 21.884C11.68 21.961 11.84 21.998 12 21.998C12.16 21.998 12.32 21.96 12.466 21.884C13.236 21.478 20 17.807 20 14V7.00001C20 6.44801 19.553 6.00001 19 6.00001ZM15 16L12 14L9 16L10 13L8 11H11L12 8.00001L13 11H16L14 13L15 16Z"></path></svg>
        `;
        buttonContainer.querySelector('.toolbarContainer').prepend(nwbtn);
    }

    return buttonContainer;
}

function oldMarkdown(content) {
    const escapedinput = content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const textContent = escapedinput
        .replace(/\*\*\*\*(.*?[^\*])\*\*\*\*/g, '$1')
        .replace(/\*\*(.*?[^\*])\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?[^\*])\*/g, '<em>$1</em>')
        .replace(/```([\s\S]*?)```/g, '<div class="code"><code>$1</code></div>')
        .replace(/``([^`]+)``/g, '<code>$1</code>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/^#+ (.*?$)/gm, (match, group1) => {
            const hash = match.match(/^#+/)[0].length;
            return `<h${hash}>${group1}</h${hash}>`;
        })
        .replace(/^&gt; (.*?$)/gm, '<blockquote>$1</blockquote>')
        .replace(/~~([\s\S]*?)~~/g, '<del>$1</del>')
        .replace(/(?:https?|ftp):\/\/[^\s(){}[\]]+/g, function (url) {
            return `<a href="${url.replace(/<\/?blockquote>/g, '')}" target="_blank">${url}</a>`;
        })
        .replace(/&lt;:(\w+):(\d+)&gt;/g, '<img src="https://cdn.discordapp.com/emojis/$2.webp?size=96&quality=lossless" alt="$1" width="16px" class="emoji">')
        .replace(/&lt;a:(\w+):(\d+)&gt;/g, '<img src="https://cdn.discordapp.com/emojis/$2.gif?size=96&quality=lossless" alt="$1" width="16px" class="emoji">')
        .replace(/\n/g, '<br>');

    if (/^(?:(?!\d)(?:\p{Emoji}|[\u200d\ufe0f\u{E0061}-\u{E007A}\u{E007F}]))+$/u.test(content)) {
        textContent = '<span class="big">' + textContent + '</span>';
    }

    return textContent;
}

function formatSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = (bytes / Math.pow(1024, i)).toFixed(2);
    return `${size} ${sizes[i]}`;
}

function timeago(date) {
    var seconds = Math.floor((new Date() - date) / 1000);
  
    var interval = seconds / 31536000;
  
    if (interval > 1) {
      return Math.floor(interval) + " years";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
      return Math.floor(interval) + " months";
    }
    interval = seconds / 86400;
    if (interval > 1) {
      return Math.floor(interval) + " days";
    }
    interval = seconds / 3600;
    if (interval > 1) {
      return Math.floor(interval) + " hours";
    }
    interval = seconds / 60;
    if (interval > 1) {
      return Math.floor(interval) + " minutes";
    }
    return Math.floor(seconds) + " seconds";
}