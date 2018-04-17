const PLUGINS_ROOT_URL = '/api/plugins';

export default class PluginsService {
    static findPlugins(f) {
        fetch(
            PLUGINS_ROOT_URL
        ).then(function (response) {
            if (response.status >= 200 && response.status < 300) {
                return response;
            }
            console.log(response.status);
            const error = new Error(`HTTP Error ${response.statusText}`);
            error.status = response.statusText;
            error.response = response;
            throw error;
        }).then(response => {
            return response.json();
        }).then(f);
    }

    static findPluginById(f, id) {
        fetch(
            `${PLUGINS_ROOT_URL}/${id}`
        ).then(function (response) {
            if (response.status >= 200 && response.status < 300) {
                return response;
            }
            console.log(response.status);
            const error = new Error(`HTTP Error ${response.statusText}`);
            error.status = response.statusText;
            error.response = response;
            throw error;
        }).then(response => {
            return response.json();
        }).then(f);
    }
}