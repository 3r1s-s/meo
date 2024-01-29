// ==UserScript==
// @name         Meo Glass
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Give Meo Glass UI
// @author       JoshAtticus
// @match        https://meo-32r.pages.dev/*
// @run-at       document-start
// @license      MIT
// @downloadURL https://update.greasyfork.org/scripts/485845/Meo%20Glass.user.js
// @updateURL https://update.greasyfork.org/scripts/485845/Meo%20Glass.meta.js
// ==/UserScript==

(function() {
    'use strict';

    const mainOpacity = 0.3; // Adjust the main opacity value from 0.0 to 1
    const blur = '10px'; // Adjust the blur value as per your preference
    const backgroundImage = 'https://i.ibb.co/s2JWJnR/Dark.png'; // Adjust the background image URL

    const repliesOpacity = mainOpacity + 0.1; // Opacity for replies div DO NOT EDIT

    const style = document.createElement('style');
    style.innerHTML = `
        html, body {
            height: 100%;
            margin: 0;
            padding: 0;
            background-image: url('${backgroundImage}');
            background-repeat: no-repeat;
            background-size: cover;
            background-attachment: fixed;
            overflow: visible !important;
        }

        input.login-input.text, /* Login textboxes */
        input.login-input.button, /* Login buttons */

        textarea.message-input.text, /* Post Content box */
        button.message-send.button, /* Send Post button */
        div.post, /* Posts */

        input.navigation-button.button /* Most buttons */{
            background-color: rgba(0, 0, 0, ${mainOpacity});
            backdrop-filter: blur(${blur});
            border: none;
            box-shadow: none;
        }

         div.message-container /* Message Area box */ {
            background-color: rgba(0, 0, 0, ${repliesOpacity});
        }
    `;
    document.head.appendChild(style);
})();
