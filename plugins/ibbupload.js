let removedElements = [];

const observer = new MutationObserver(() => {
    if (!localStorage.getItem("No Emoji")) {
        removedElements.forEach(({ element, parent }) => parent.appendChild(element));
        removedElements = [];
    } else {
        const upbt = document.getElementById('attach');
        upbt.setAttribute("onlclick", "uploadImage()")
    }
});

observer.observe(document, { childList: true, subtree: true });



function uploadImage() {
    uploadModal()
}

function uploadModal() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = ".jpg,.jpeg,.png,.bmp,.gif,.tif,.webp,.heic,.avif";
    input.multiple = true;
    input.click();

    input.onchange = function(e) {
        const files = Array.from(e.target.files);
        if (files.some(file => file.size > 32 * 1024 * 1024)) {
            errorModal("File too large", "Please upload files smaller than 32MB.");
            return;
        }

        const textarea = document.querySelector('.message-input.text');
        textarea.placeholder = `Uploading ${files.length} ${files.length > 1 ? 'images' : 'image'}...`;
        textarea.disabled = true;


        const uploads = files.map(file => {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('username', localStorage.getItem("uname"));

            return fetch('https://meouploads.schafezr0000.workers.dev', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => data.data.url)
            .catch(error => errorModal("Error uploading image", error));
        });

        Promise.all(uploads).then(imageUrls => {
            textarea.value += imageUrls.join('\n') + '\n';
            autoresize();
            textarea.placeholder = lang().meo_messagebox;
            textarea.disabled = false;
        });
    };
}
