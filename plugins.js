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
