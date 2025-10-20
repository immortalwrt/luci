// SPDX-License-Identifier: Apache-2.0

'use strict';
'require view';

return view.extend({
	render() {
		return E('div', {'class': 'cbi-map' }, [
			E('h2', {'name': 'content'}, [
				_('Netdata Dashboard')
			]),
			E('iframe', {
				'src': 'http://' + window.location.hostname + ':19999',
				'style': 'width: 100%; min-height: 1200px; border: none; border-radius: 3px; resize: vertical;'
			}, null)
		]);
	},

	handleSaveApply: null,
	handleSave: null,
	handleReset: null
});
