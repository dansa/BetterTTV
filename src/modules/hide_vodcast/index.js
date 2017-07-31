const $ = require('jquery');
const settings = require('../../settings');
const watcher = require('../../watcher');
const debug = require('../../utils/debug');

class HideVodCastModule {
    constructor() {
        settings.add({
            id: 'hideVodCast',
            name: 'Hide Vodcasts',
            defaultValue: true,
            description: 'Hides Vodcast channels when browsing stream directories'
        });
        settings.on('changed.hideVodCast', () => this.load());
        watcher.on('load.directory.index', () => this.load());
    }

    load() {
        const viewRegistry = window.App.__container__.lookup('-view-registry:main');
        const components = [
            window.App.resolveRegistration('component:stream-preview'),
            window.App.resolveRegistration('component:stream/lol-metadata'),
            window.App.resolveRegistration('component:stream/snapshot-card'),
            window.App.resolveRegistration('component:twitch-communities/stream-list-item'),

            // App.resolveRegistration('component:csgo-channel-preview')
            // The csgo channel component does not (for some reason) have the stream/content object implemented as of 2017 07 31
            // This means that there is no way to know from our side if the stream is a vodcast or not. Perhaps it will be implemented later..
        ];
        components.forEach(component => this.modifyViews(viewRegistry, component));
    }

    modifyViews(registry, component) {
        this.reopenComponent(component);

        // It's unfortunate but the function also has to be added to already rendered views.
        $.each(registry, (i, view) => {
            if (view instanceof component && view.get('stream').stream_type === 'watch_party') {
                debug.log('found vodcast');

                this.reopenComponent(view);
                view.bttv_hide_vodcast();
            }
        });
    }

    reopenComponent(component) {
        if (component.bttv_hide_vodcast) return;
        component.reopen({
            bttv_hide_vodcast: function() {
                if (this.get('stream').stream_type === 'watch_party') {
                    this.get('element').style.background = settings.get('hideVodCast') ? 'white' : 'blue';
                    debug.log('Found watchparty');
                }
            },
            didRender: function() {
                this.bttv_hide_vodcast();
            }
        });
    }
}

module.exports = new HideVodCastModule();
