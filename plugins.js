const plugins = {
    disable: function(pluginName, reload = true) {
        let enabledPlugins = JSON.parse(localStorage.getItem('enabledPlugins')) || {};
        if (!enabledPlugins.hasOwnProperty(pluginName) || enabledPlugins[pluginName] === false) {
            throw new Error(`Plugin "${pluginName}" is not enabled or does not exist.`);
        }
        enabledPlugins[pluginName] = false;
        localStorage.setItem('enabledPlugins', JSON.stringify(enabledPlugins));
        if (reload) {
            location.reload();
        }
    },
    
    enable: function(pluginName, reload = true) {
        let enabledPlugins = JSON.parse(localStorage.getItem('enabledPlugins')) || {};
        enabledPlugins[pluginName] = true;
        localStorage.setItem('enabledPlugins', JSON.stringify(enabledPlugins));
        if (reload) {
            location.reload();
        }
    },

    test: function() {
        return "Hello, world! If you see this message Plugins.js has imported successfully and is working!";
    },

    client: function() {
        const url = window.location.href;
        if (url.includes('meo-32r.pages.dev')) {
            console.warn("Old meo; most functions won't work");
            return "meo old";
        } else if (url.includes('eris.pages.dev/meo')) {
            console.log("New meo; all functions should work");
            return "meo official";
        } else if (url.includes('leo-b79.pages.dev')) {
            console.log("Development leo; all functions should work")
            return "leo development";
        } else if (url.includes('leo.atticat.tech')) {
            console.log("Official leo; all functions should work")
            return "leo official";
        } else if (url.includes('127.0.0.1') || url.includes('localhost')) {
            console.warn("Local development build; some functions may not work");
            return "Unknown local development build";
        } else if (url.includes('mybearworld.github.io')) {
            console.error("Roarer/Jeow; incompatible with Plugins.js")
            return "Roarer/Jeow";
        } else {
            console.error("Unknown client; Plugins.js only supports meo/leo and derivatives")
            return "Unknown Client";
        }
    }
};

const settings = {
    disable: function(settingName) {
        let settings = JSON.parse(localStorage.getItem('settings')) || {};
        if (settings.hasOwnProperty(settingName)) {
            settings[settingName] = false;
            localStorage.setItem('settings', JSON.stringify(settings));
        } else {
            throw new Error("Setting not found");
        }
    },

    enable: function(settingName) {
        let settings = JSON.parse(localStorage.getItem('settings')) || {};
        if (settings.hasOwnProperty(settingName)) {
            settings[settingName] = true;
            localStorage.setItem('settings', JSON.stringify(settings));
        } else {
            throw new Error("Setting not found");
        }
    }
};
