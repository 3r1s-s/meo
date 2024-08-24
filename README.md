# leo with legacy firefox patches
An awesome fork of meo with more features & patches to work on legacy firefox. Accessible at [https://old-firefox-fix.leo-b79.pages.dev](https://old-firefox-fix.leo-b79.pages.dev)

## what works (& doesn't)
*Tested using jamesh's Fennec 55.0.3 on Asus Transformer TF101 running Android 4.0.3*

### Working
- Logging in
- Start Page
- Posting
- Editing Posts
- Deleting Posts
- Home
- Livechat
- Chats
- Uploading Files
- Emoji Picker
- Animated (GIF) Emojis, PFPs and Chat icons
- Replies
- General Settings, Profile Settings (only bio update tested), Account (no functions tested), Appearance, Languages, Plugins
- Explore & Inbox tabs
- User Profiles

### Not Working
- Static (webp) Emojis, PFPs and Chat icons (should work if your browser supports webp!)
- Unicode Emojis (should work if your browser & OS supports unicode emojis!)
- Viewing uploaded files
- Leo Trending

Anything not listed here is untested, feel free to test yourself and make a GitHub issue about it.

## changes
leo has the following additions to meo so far

- Trending powered by AtticusAI on Start Page and the Explore tab that summarises home into a few topics and dot points. (English only)
- Double border radius for rounder buttons and other elements
- Easy PWA install when using Chrome for Android or ChromeOS
- Collapsable window bar on ChromeOS
- Plugins.js library for easier plugin interactions. Documentation available [here](https://github.com/JoshAtticus/leo/wiki/Plugins.js-Documentation)
