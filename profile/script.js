let meourl = 'https://eris.pages.dev/meo'

function fetchprofile() {
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('u');

    fetch(`https://api.meower.org/users/${username}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('User not found');
            }
            return response.json();
        })
        .then(data => {
            const profilecont = document.createElement('div');
            profilecont.classList.add('mdl-sec');
            if (data.avatar_color !== "!color" && data.avatar_color) {
                profilecont.classList.add('custom-bg');
                profilecont.style.setProperty('--accent', lightenColour(data.avatar_color, 2));
                profilecont.style.setProperty('--color', lightenColour(data.avatar_color, 1.25));
                if (embedded) {
                    const clr1 = darkenColour(data.avatar_color, 3);
                    const clr2 = darkenColour(data.avatar_color, 5);
                    document.body.style.background = `linear-gradient(180deg, ${clr1} 0%, ${clr2} 100%`;
                    document.body.style.setProperty('--accent', clr1);
                    document.body.classList.add('custom-bg');
                }
            }

            if (data.avatar) {
                profilecont.innerHTML = `
                <div class="avatar-big pfp-inner" style="border: 6px solid #${data.avatar_color}; background-color:#${data.avatar_color}; background-image: url(https://uploads.meower.org/icons/${data.avatar});"></div>
                `
            } else if (data.pfp_data) {                    
                profilecont.innerHTML = `
                <div class="avatar-big pfp-inner svg-avatar" style="border: 6px solid #${data.avatar_color}; background-image: url(../images/avatars/icon_${data.pfp_data - 1}.svg);"></div>
                `
            } else {                        
                profilecont.innerHTML = `
                <div class="avatar-big pfp-inner svg-avatar" style="border: 6px solid #000; background-image: url(../images/avatars/icon_-4.svg);"></div>
                `
            }

            let quote;
            let pronouns;
            
            if (typeof md !== 'undefined') {
                md.disable(['image']);
                const regex = /\[(.*?)\]/;
                let match = data.quote.match(regex);
                pronouns = match ? match[1] : "";
                
                quote = data.quote.replace(regex, '');
                quote = erimd(md.render(quote).replace(/<a(.*?)>/g, '<a$1 target="_blank">'));                                            
            } else {
                quote = oldMarkdown(data.quote);
                console.error("Parsed with old markdown, fix later :)");
            }
            
            let profileContent = `
            <div class="usr-header">
            <div class="usr-header-inner">
                <h2 class="username" onclick="copy('${data._id}')">${data._id}</h2>
            </div> 
            <div class="usr-buttons-inner">
                ${data._id !== localStorage.getItem('username') && localStorage.getItem('permissions') === "1" ? `
                <button class="button dm-btn" onclick="openmdusr('${data._id}');" aria-label="moderate user" title="Moderate">
                    <svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M19 6.00001C15.56 6.00001 12.826 2.43501 12.799 2.39801C12.421 1.89801 11.579 1.89801 11.201 2.39801C11.174 2.43501 8.44 6.00001 5 6.00001C4.447 6.00001 4 6.44801 4 7.00001V14C4 17.807 10.764 21.478 11.534 21.884C11.68 21.961 11.84 21.998 12 21.998C12.16 21.998 12.32 21.96 12.466 21.884C13.236 21.478 20 17.807 20 14V7.00001C20 6.44801 19.553 6.00001 19 6.00001ZM15 16L12 14L9 16L10 13L8 11H11L12 8.00001L13 11H16L14 13L15 16Z"></path></svg>
                </button>` : ''}
                ${data._id !== localStorage.getItem('username') ? `
                <button class="button dm-btn" onclick="parent.opendm('${data._id}');" aria-label="dm user" title="DM">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 22a10 10 0 1 0-8.45-4.64c.13.19.11.44-.04.61l-2.06 2.37A1 1 0 0 0 2.2 22H12Z" class=""></path></svg>
                </button>` : ''}
            </div>
            </div>
            <hr>
            <span class="subheader">${lang().profile.quote}</span>
            <div class="sec">
                <span class="profile-qt">${quote}</span>
            </div>
            `;
            
            profilecont.innerHTML += profileContent;                                   

            profilecont.innerHTML += `
            <i>Created: ${new Date(data.created * 1000).toLocaleDateString()} | Last Seen: ${timeago(data.last_seen)}</i>
            `;
            
            if (data._id === localStorage.getItem('username')) {
                profilecont.innerHTML += `
                `;
            }
            
            if (embedded) {
                const href = document.createElement('a');
                href.href = `../?openprofile=${data._id}`;
                href.classList.add('openin');
                href.appendChild(profilecont);
                document.getElementById('page').appendChild(href);
            } else {
                document.getElementById('page').appendChild(profilecont);
            }
            
            const check = document.querySelector(".avatar-big");
            const pfpUrl = `../images/avatars/icon_${data.pfp_data - 1}.svg`;
            fetch(pfpUrl)
                .then(response => {
                    if (!response.ok) {
                        check.src = `../images/avatars/icon_err.svg`;
                    }
                })
                .catch(error => {
                    check.src = `../images/avatars/icon_err.svg`;
                    console.warn('Error fetching profile picture:', error);
                });
        })
        .catch(error => {
            const profilecont = document.createElement('div');
            profilecont.classList.add('mdl-sec');
            profilecont.innerHTML = '<h2>404: User not found</h2>';
            document.getElementById('page').appendChild(profilecont);
            console.error('Error fetching user profile:', error);
        });

    var t = localStorage.getItem('theme');
    if (t) {
        document.documentElement.classList.add(t + "-theme");
    }

    if (settingsstuff().widemode) {
        const stylesheet = document.createElement('link');
        stylesheet.rel = 'stylesheet';
        stylesheet.href = '../mui.css';
        document.head.appendChild(stylesheet);
    }
}

let embedded
let urlParams = new URLSearchParams(window.location.search);

if (window.self == window.top) {
    const username = urlParams.get('u');
    window.location.href = `../?openprofile=${username}`;
    embedded = false;
} else {
    const embed = urlParams.get('embed');
    if (embed === 'true') {
        document.body.classList.add("embedded");
        embedded = true;
    } 
}

fetchprofile();

function timeago(tstamp) {
    const currentTime = Date.now();
    const lastSeenTime = tstamp * 1000;
    const timeDifference = currentTime - lastSeenTime;
    const seconds = Math.floor(timeDifference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
        return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
    }
}


function updateprofile() {
    const quote = document.getElementById("quote").value;
    const avtrclr = document.getElementById("avtr-clr").value.substring(1);
    const fileInput = document.getElementById("profile-photo");
    const file = fileInput.files[0];
    const token = localStorage.getItem("token");

    const update = document.getElementById("updt-prfl");
    update.disabled = true;
    update.textContent = "Uploading...";

    const xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (this.status == 200) {
                console.log('Profile updated successfully.');
                parent.closemodal("Profile Updated!");
            } else {
                console.error('Failed to update profile. HTTP ' + this.status.toString());
            }
        }
    };

    xhttp.open("PATCH", "https://api.meower.org/me/config");

    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.setRequestHeader("token", token);

    const data = {
        quote: quote,
        avatar_color: avtrclr
    };

    if (file) {
        const formData = new FormData();
        formData.append("file", file);
            fetch("https://uploads.meower.org/icons", {
                method: "POST",
                headers: {
                    "Authorization": token
                },
                body: formData
            })
            .then(uploadResponse => uploadResponse.json())
            .then(uploadData => {
                const avatarId = uploadData.id;
                data.avatar = avatarId;
                xhttp.send(JSON.stringify(data));
            })
            .catch(error => console.error('Error uploading file:', error));
    } else {
        // If no file is selected, just send the data object
        xhttp.send(JSON.stringify(data));
    }
}

function opendm(user) {
    const token = localStorage.getItem("token");
    const url = `https://api.meower.org/users/${user}/dm`;

    fetch(url, {
        method: 'GET',
        headers: {
            'token': `${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log(data);
        //parent.[data._id] = data;
        parent.loadchat(data._id);
        parent.closemodal();
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
}

function openmdusr(user) {
    parent.modUserModal(user);
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

function copy(text) {
    const t = document.createElement('input');
    t.value = text;
    document.body.appendChild(t);
    t.select();
    document.execCommand('copy');
    document.body.removeChild(t);
    parent.closemodal(`${lang().modals.copyuser}`);
}

function handleHaptics() {
    if (settingsstuff().haptics) {
        navigator.vibrate(50);
    }
}