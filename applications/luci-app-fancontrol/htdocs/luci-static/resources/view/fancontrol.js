/* SPDX-License-Identifier: Apache-2.0
 *
 * Copyright (C) 2026 JiaY-shi
 */

'use strict';
'require dom';
'require form';
'require fs';
'require poll';
'require rpc';
'require uci';
'require view';

const callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: [ 'name' ],
	expect: { '': {} }
});

const HISTORY_WINDOW_MS = 2 * 60 * 1000;
const TIME_GRID_INTERVAL_MS = 10 * 1000;
const TIME_LABEL_INTERVAL_MS = 30 * 1000;
const VALUE_GRID_DIVISIONS = 4;

function serviceRunning(result) {
	const instances = result?.fancontrol?.instances || {};

	return Object.keys(instances).some(function(name) {
		return instances[name].running === true;
	});
}

function parseStatus(text) {
	const status = {};

	String(text || '').split(/\n/).forEach(function(line) {
		const separator = line.indexOf('=');

		if (separator > 0)
			status[line.substring(0, separator)] = line.substring(separator + 1);
	});

	return status;
}

function validStatusNumber(value) {
	const number = Number(value);

	return Number.isFinite(number) && number >= 0 ? number : null;
}

function appendHistory(history, running, status) {
	const now = Date.now();
	const temperature = validStatusNumber(status.temperature_mc);
	const pwm = validStatusNumber(status.pwm);
	const rpm = validStatusNumber(status.rpm);

	history.push({
		time: now,
		temperature: running && temperature != null ? temperature / 1000 : null,
		pwm: running && pwm != null ? pwm * 100 / 255 : null,
		rpm: running ? rpm : null
	});

	while (history.length && history[0].time < now - HISTORY_WINDOW_MS)
		history.shift();
}

function chartScale(history, key, minimumMax, step) {
	let maximum = minimumMax;

	history.forEach(function(sample) {
		if (sample[key] != null)
			maximum = Math.max(maximum, sample[key]);
	});

	return Math.ceil(maximum / step) * step;
}

function drawChart(canvas, history, key, options) {
	const style = window.getComputedStyle(canvas);
	const width = Math.max(canvas.clientWidth, 1);
	const height = Math.max(canvas.clientHeight, 1);
	const ratio = Math.min(window.devicePixelRatio || 1, 2);
	const context = canvas.getContext('2d');
	const padding = { left: 28, right: 5, top: 6, bottom: 14 };
	const plotWidth = Math.max(width - padding.left - padding.right, 1);
	const plotHeight = Math.max(height - padding.top - padding.bottom, 1);
	const plotBottom = padding.top + plotHeight;
	const now = history.length ? history[history.length - 1].time : Date.now();
	const start = now - HISTORY_WINDOW_MS;
	const maximum = chartScale(history, key, options.minimumMax, options.step);
	const lineColor = style.getPropertyValue('--fancontrol-chart-line').trim() || '#1976d2';
	const fillColor = style.getPropertyValue('--fancontrol-chart-fill').trim() || 'rgba(25, 118, 210, .2)';
	const labelColor = style.color || '#666';
	const gridColor = 'rgba(127, 127, 127, .2)';
	let segment = [];

	canvas.width = Math.round(width * ratio);
	canvas.height = Math.round(height * ratio);
	context.setTransform(ratio, 0, 0, ratio, 0, 0);
	context.clearRect(0, 0, width, height);

	context.strokeStyle = gridColor;
	context.lineWidth = 1;
	context.beginPath();
	for (let elapsed = 0; elapsed <= HISTORY_WINDOW_MS; elapsed += TIME_GRID_INTERVAL_MS) {
		const x = padding.left + plotWidth * elapsed / HISTORY_WINDOW_MS;

		context.moveTo(x, padding.top);
		context.lineTo(x, plotBottom);
	}
	for (let division = 0; division <= VALUE_GRID_DIVISIONS; division++) {
		const y = padding.top + plotHeight * division / VALUE_GRID_DIVISIONS;

		context.moveTo(padding.left, y);
		context.lineTo(padding.left + plotWidth, y);
	}
	context.stroke();

	context.fillStyle = labelColor;
	context.font = '9px sans-serif';
	context.textAlign = 'right';
	context.textBaseline = 'top';
	context.fillText(options.format(maximum), padding.left - 4, padding.top - 1);
	context.textBaseline = 'bottom';
	context.fillText(options.format(0), padding.left - 4, plotBottom + 1);
	context.textBaseline = 'middle';
	context.fillText(options.format(maximum / 2), padding.left - 4,
		padding.top + plotHeight / 2);

	context.textBaseline = 'bottom';
	for (let elapsed = 0; elapsed <= HISTORY_WINDOW_MS; elapsed += TIME_LABEL_INTERVAL_MS) {
		const x = padding.left + plotWidth * elapsed / HISTORY_WINDOW_MS;
		const remaining = (HISTORY_WINDOW_MS - elapsed) / 1000;

		context.textAlign = elapsed === 0 ? 'left' :
			elapsed === HISTORY_WINDOW_MS ? 'right' : 'center';
		context.fillText(remaining ? '-%ds'.format(remaining) : '0', x, height);
	}

	function point(sample) {
		return {
			x: padding.left + (sample.time - start) / HISTORY_WINDOW_MS * plotWidth,
			y: plotBottom - sample[key] / maximum * plotHeight
		};
	}

	function drawSegment() {
		if (!segment.length)
			return;

		if (segment.length > 1) {
			context.beginPath();
			context.moveTo(segment[0].x, plotBottom);
			segment.forEach(function(item) { context.lineTo(item.x, item.y); });
			context.lineTo(segment[segment.length - 1].x, plotBottom);
			context.closePath();
			context.fillStyle = fillColor;
			context.fill();

			context.beginPath();
			segment.forEach(function(item, index) {
				if (index)
					context.lineTo(item.x, item.y);
				else
					context.moveTo(item.x, item.y);
			});
			context.strokeStyle = lineColor;
			context.lineWidth = 1.5;
			context.lineJoin = 'round';
			context.stroke();
		} else {
			context.beginPath();
			context.arc(segment[0].x, segment[0].y, 2, 0, Math.PI * 2);
			context.fillStyle = lineColor;
			context.fill();
		}

		segment = [];
	}

	history.forEach(function(sample) {
		if (sample[key] == null) {
			drawSegment();
			return;
		}

		segment.push(point(sample));
	});
	drawSegment();
}

function statusMetric(title, value, unit, chartClass) {
	const canvas = E('canvas', {
		'class': 'fancontrol-chart fancontrol-chart-%s'.format(chartClass),
		'role': 'img',
		'aria-label': title
	});
	const children = [
		E('span', { 'class': 'fancontrol-metric-label' }, title),
		E('div', { 'class': 'fancontrol-metric-reading' }, [
			E('span', { 'class': 'fancontrol-metric-value' }, value),
			unit ? E('span', { 'class': 'fancontrol-metric-unit' }, unit) : ''
		]),
		E('div', { 'class': 'fancontrol-chart-wrap' }, canvas)
	];

	return {
		node: E('div', { 'class': 'fancontrol-metric' }, children),
		canvas: canvas
	};
}

function statusDetail(title, value) {
	return E('div', { 'class': 'fancontrol-detail' }, [
		E('span', { 'class': 'fancontrol-detail-label' }, title),
		E('span', { 'class': 'fancontrol-detail-value' }, value)
	]);
}

function renderStatus(node, running, status, history) {
	const temp = Number(status.temperature_mc);
	const pwm = Number(status.pwm);
	const rpm = Number(status.rpm);
	const tempValid = Number.isFinite(temp) && temp >= 0;
	const pwmValid = Number.isFinite(pwm) && pwm >= 0;
	const rpmValid = Number.isFinite(rpm) && rpm >= 0;
	const pwmPercent = pwmValid ? Math.round(pwm * 100 / 255) : null;
	const fault = status.error
		? E('span', { 'class': 'label warning' }, status.error)
		: E('span', { 'class': 'fancontrol-ok' }, _('None'));
	const temperatureMetric = statusMetric(_('Temperature'),
		tempValid ? '%.1f'.format(temp / 1000) : '-', tempValid ? '°C' : '', 'temperature');
	const pwmMetric = statusMetric(_('PWM output'), pwmValid ? String(pwm) : '-',
		pwmValid ? '/ 255 · %d%%'.format(pwmPercent) : '', 'pwm');
	const rpmMetric = statusMetric(_('Fan speed'), rpmValid ? String(rpm) : '-',
		rpmValid ? 'RPM' : '', 'rpm');

	dom.content(node, E('div', { 'class': 'fancontrol-status' }, [
		E('div', { 'class': 'fancontrol-status-head' }, [
			E('span', { 'class': 'fancontrol-status-title' }, _('Runtime Status')),
			E('span', { 'class': running ? 'label success' : 'label warning' },
				running ? _('Running') : _('Stopped'))
		]),
		E('div', { 'class': 'fancontrol-metrics' }, [
			temperatureMetric.node,
			pwmMetric.node,
			rpmMetric.node
		]),
		E('div', { 'class': 'fancontrol-details' }, [
			statusDetail(_('Temperature input'), status.thermal_file || '-'),
			statusDetail(_('PWM device'), status.fan_file || '-'),
			statusDetail(_('Fault'), fault)
		])
	]));

	drawChart(temperatureMetric.canvas, history, 'temperature', {
		minimumMax: 100,
		step: 10,
		format: function(value) { return '%d°'.format(value); }
	});
	drawChart(pwmMetric.canvas, history, 'pwm', {
		minimumMax: 100,
		step: 100,
		format: function(value) { return '%d%%'.format(value); }
	});
	drawChart(rpmMetric.canvas, history, 'rpm', {
		minimumMax: 1000,
		step: 500,
		format: function(value) { return String(value); }
	});
}

function validateAutoPath(sectionId, value) {
	if (value === 'auto' || value?.startsWith('/'))
		return true;

	return _('Enter "auto" or an absolute sysfs path.');
}

return view.extend({
	load() {
		return uci.load('fancontrol');
	},

	render() {
		let m, s, o;
		let startTemp, fullTemp, startSpeed, maxSpeed, kickSpeed, kickMs;

		m = new form.Map('fancontrol', _('Fan Control'),
			_('Configure a continuous PWM curve based on device temperature. Automatic hardware detection is suitable for most devices.'));

		s = m.section(form.TypedSection, 'fancontrol', _('Runtime Status'));
		s.anonymous = true;
		s.addremove = false;
		s.render = function() {
			const history = [];
			const node = E('div', { 'class': 'cbi-section fancontrol-runtime' }, [
				E('link', {
					'rel': 'stylesheet',
					'href': L.resource('view/fancontrol.css')
				}),
				E('div', { 'class': 'cbi-section-node' }, _('Collecting data...'))
			]);
			const statusNode = node.lastElementChild;

			poll.add(function() {
				return Promise.all([
					L.resolveDefault(callServiceList('fancontrol'), {}),
					L.resolveDefault(fs.read_direct('/var/run/fancontrol.status'), '')
				]).then(function(result) {
					const running = serviceRunning(result[0]);
					const status = parseStatus(result[1]);

					appendHistory(history, running, status);
					renderStatus(statusNode, running, status, history);
				});
			}, 5);

			return node;
		};

		s = m.section(form.NamedSection, 'settings', 'fancontrol', _('Settings'));
		s.addremove = false;
		s.tab('curve', _('Temperature Curve'),
			_('Controls when the fan starts and how its speed rises with temperature.'));
		s.tab('hardware', _('Hardware'),
			_('Automatic detection works on most devices. Select explicit sysfs entries only when necessary.'));
		s.tab('safety', _('Safety'),
			_('Controls startup assistance and fail-safe behavior. Full-speed safety defaults are recommended.'));

		o = s.taboption('curve', form.Flag, 'enabled', _('Enable'));
		o.default = o.disabled;
		o.rmempty = false;
		o.description = _('Run the controller and apply this temperature curve.');

		startTemp = s.taboption('curve', form.Value, 'start_temp', _('Start temperature'));
		startTemp.default = '45';
		startTemp.datatype = 'range(-40,200)';
		startTemp.rmempty = false;
		startTemp.description = _('The fan remains off below this temperature and starts at the minimum running PWM when it is reached. Unit: °C.');

		fullTemp = s.taboption('curve', form.Value, 'full_speed_temp', _('Full-speed temperature'));
		fullTemp.default = '85';
		fullTemp.datatype = 'range(-39,250)';
		fullTemp.rmempty = false;
		fullTemp.description = _('PWM rises linearly and reaches the configured maximum at this temperature. Unit: °C.');
		fullTemp.validate = function(sectionId, value) {
			if (Number(value) <= Number(startTemp.formvalue(sectionId)))
				return _('Full-speed temperature must be higher than start temperature.');
			return true;
		};

		o = s.taboption('curve', form.Value, 'hysteresis', _('Stop hysteresis'));
		o.default = '3';
		o.datatype = 'range(0,50)';
		o.rmempty = false;
		o.description = _('After starting, the fan stops only after temperature falls this many degrees below the start temperature. This prevents rapid on/off cycling.');

		startSpeed = s.taboption('curve', form.Value, 'start_speed', _('Minimum running PWM'));
		startSpeed.default = '64';
		startSpeed.datatype = 'range(1,255)';
		startSpeed.rmempty = false;
		startSpeed.description = _('Lowest PWM used while the fan is running. Increase it if the fan stalls or cannot maintain rotation. Range: 1–255.');

		maxSpeed = s.taboption('curve', form.Value, 'max_speed', _('Maximum PWM'));
		maxSpeed.default = '255';
		maxSpeed.datatype = 'range(1,255)';
		maxSpeed.rmempty = false;
		maxSpeed.description = _('Highest PWM allowed by the curve. A value of 255 means 100% duty cycle.');
		maxSpeed.validate = function(sectionId, value) {
			if (Number(value) < Number(startSpeed.formvalue(sectionId)))
				return _('Maximum PWM must not be lower than minimum running PWM.');
			return true;
		};

		o = s.taboption('curve', form.Value, 'interval', _('Polling interval'));
		o.default = '5';
		o.datatype = 'range(1,300)';
		o.rmempty = false;
		o.description = _('How often the temperature is read and the PWM output is updated. Unit: seconds.');

		o = s.taboption('hardware', form.Value, 'thermal_file', _('Temperature input'));
		o.default = 'auto';
		o.rmempty = false;
		o.validate = validateAutoPath;
		o.description = _('Use "auto" to select a CPU or SoC thermal sensor, or enter an absolute thermal zone or hwmon tempN_input path.');

		o = s.taboption('hardware', form.Value, 'thermal_zone', _('Thermal zone type'));
		o.default = 'auto';
		o.rmempty = false;
		o.description = _('Preferred thermal zone type when temperature input is automatic, for example cpu_top_thermal. Leave as "auto" unless several sensors are available.');

		o = s.taboption('hardware', form.Value, 'fan_file', _('PWM output'));
		o.default = 'auto';
		o.rmempty = false;
		o.validate = validateAutoPath;
		o.description = _('Use "auto" to select a writable hwmon pwmN output, or enter its absolute path. cooling_device cur_state is not a PWM output.');

		o = s.taboption('hardware', form.Value, 'fan_hwmon', _('Hwmon device name'));
		o.default = 'auto';
		o.rmempty = false;
		o.description = _('Preferred hwmon name when PWM output is automatic. The pwmfan driver is preferred by default.');

		o = s.taboption('hardware', form.Value, 'enable_file', _('PWM mode control'));
		o.default = 'auto';
		o.rmempty = false;
		o.validate = validateAutoPath;
		o.description = _('Optional pwmN_enable path used to select manual PWM mode. With "auto", the matching control is used when available.');

		o = s.taboption('hardware', form.Value, 'temp_div', _('Temperature divisor'));
		o.default = '1000';
		o.value('1');
		o.value('1000');
		o.datatype = 'range(1,1000000)';
		o.rmempty = false;
		o.description = _('Divides the raw sensor value before control calculations. Standard Linux temperature inputs use 1000; sensors reporting whole degrees use 1.');

		kickSpeed = s.taboption('safety', form.Value, 'kick_speed', _('Start kick PWM'));
		kickSpeed.default = '255';
		kickSpeed.datatype = 'range(0,255)';
		kickSpeed.rmempty = false;
		kickSpeed.description = _('Brief PWM applied when a stopped fan starts. It helps fans that cannot start reliably at low duty. Set to 0 together with a zero duration to disable.');

		kickMs = s.taboption('safety', form.Value, 'kick_ms', _('Start kick duration'));
		kickMs.default = '500';
		kickMs.datatype = 'range(0,10000)';
		kickMs.rmempty = false;
		kickMs.description = _('How long the startup kick is applied. Unit: milliseconds.');
		kickMs.validate = function(sectionId, value) {
			if (Number(value) > 0 && Number(kickSpeed.formvalue(sectionId)) === 0)
				return _('Start kick PWM must be non-zero when a kick duration is configured.');
			return true;
		};

		o = s.taboption('safety', form.Value, 'fail_safe_speed', _('Sensor failure PWM'));
		o.default = '255';
		o.datatype = 'range(0,255)';
		o.rmempty = false;
		o.description = _('PWM used when the temperature sensor cannot be read. Keeping 255 is the safest choice.');

		o = s.taboption('safety', form.Value, 'exit_speed', _('Service exit PWM'));
		o.default = '255';
		o.datatype = 'range(0,255)';
		o.rmempty = false;
		o.description = _('PWM written when the service stops. Keeping the fan at full speed avoids losing cooling after an unexpected exit.');

		o = s.taboption('safety', form.Flag, 'debug', _('Debug logging'));
		o.default = o.disabled;
		o.rmempty = false;
		o.description = _('Write temperature, PWM and RPM values to the system log at every polling interval.');

		return m.render();
	}
});
