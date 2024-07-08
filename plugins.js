const plugins = {
    disable: function(pluginName) {
        let enabledPlugins = JSON.parse(localStorage.getItem('enabledPlugins')) || {};
        enabledPlugins[pluginName] = false;
        localStorage.setItem('enabledPlugins', JSON.stringify(enabledPlugins));
    },

    enable: function(pluginName) {
        let enabledPlugins = JSON.parse(localStorage.getItem('enabledPlugins')) || {};
        enabledPlugins[pluginName] = true;
        localStorage.setItem('enabledPlugins', JSON.stringify(enabledPlugins));
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
