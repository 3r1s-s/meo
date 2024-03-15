        function fetchprofile() {
            const urlParams = new URLSearchParams(window.location.search);
            const username = urlParams.get('u');
            
            fetch(`https://api.meower.org/users/${username}`)
                .then(response => response.json())
                .then(data => {
                    const profilecont = document.createElement('div');
                    profilecont.classList.add('mdl-sec');
                    if (data.avatar) {
                        profilecont.innerHTML = `
                        <img class="avatar-big" style="border: 6px solid #${data.avatar_color}"; src="https://uploads.meower.org/icons/${data.avatar}"></img>
                        `
                    } else if (data.pfp_data) {                        
                        profilecont.innerHTML = `
                        <img class="avatar-big" style="border: 6px solid #${data.avatar_color}"; src="images/avatars/icon_${data.pfp_data - 1}.svg"></img>
                        `
                    }

                    if (data._id === localStorage.getItem('uname')) {
                        profilecont.innerHTML += `
                        <div class="usr-header">
                        <h2 class="uname">${data._id}</h2>
                        </div>
                        <hr>
                        `
                        profilecont.innerHTML += `
                        <span class="subheader">Quote</span>
                        <div class="sec">
                        <textarea class="quote-edit" id="quote">${data.quote}</textarea>
                        </div>
                        <span class="subheader">Personalization</span>
                        <div class="sec"><span>Profile Colour:</span><input id="avtr-clr" type="color" value="#${data.avatar_color}"></input>
                        </div>
                        <dic class="sec">
                        <span>Profile Picture:</span><input type="file" id="profile-photo" accept="image/png,image/jpeg,image/webp,image/gif">
                        </div>
                        `;
                    } else {
                        profilecont.innerHTML += `
                        <div class="usr-header">
                        <h2 class="uname">${data._id}</h2>
                        <button class="button dm-btn" onclick="opendm('${data._id}');">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 22a10 10 0 1 0-8.45-4.64c.13.19.11.44-.04.61l-2.06 2.37A1 1 0 0 0 2.2 22H12Z" class=""></path></svg>
                        </button>
                        </div>
                        <hr>
                        `
                        profilecont.innerHTML += `
                        <span class="subheader">Quote</span>
                        <div class="sec">
                        <span>${data.quote}</span>
                        </div>
                        `;
                    }              

                    profilecont.innerHTML += `
                    <i>Created: ${new Date(data.created * 1000).toLocaleDateString()} | Last Seen: ${timeago(data.last_seen)}</i>
                    `;
                    
                    if (data._id === localStorage.getItem('uname')) {
                        profilecont.innerHTML += `
                        <button class="modal-button updt-prfl" onclick="updateprofile()"><div>Update</div></button>      
                        `;
                    }                    
                    
                    document.getElementById('page').appendChild(profilecont);
                })
                .catch(error => console.error('Error fetching user profile:', error));

                var t = localStorage.getItem('theme');
                if (t) {
                    document.documentElement.classList.add(t + "-theme");
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
            const avatarColor = document.getElementById("avtr-clr").value.substring(1);
            const fileInput = document.getElementById("profile-photo");
            const file = fileInput.files[0];
            const token = localStorage.getItem("token");
        
            const xhttp = new XMLHttpRequest();
        
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4) {
                    if (this.status == 200) {
                        console.log('Profile updated successfully.');
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
                avatar_color: avatarColor
            };
        
            if (file) {
                const formData = new FormData();
                formData.append("file", file);
        
                fetch("https://api.meower.org/uploads/token/icon", {
                    method: "GET",
                    headers: {
                        "token": token
                    }
                })
                .then(response => response.json())
                .then(tokenData => {
                    fetch("https://uploads.meower.org/icons", {
                        method: "POST",
                        headers: {
                            "Authorization": tokenData.token
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
                })
                .catch(error => console.error('Error fetching uploads token:', error));
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
                parent.loadchat(data._id);
                parent.closemodal();
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
        }
        
        