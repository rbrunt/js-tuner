(function (window) {
	var JSTuner = function (baseFrequency) {
		this.VERSION = 0.8;
		this.baseFrequency = typeof (baseFrequency) === 'number' ? baseFrequency : 440.0;

		var AudioContext = window.AudioContext || window.webkitAudioContext;
		this.context = new AudioContext();
		this.output = this.context.createGain();
		this.output.connect(this.context.destination);

		this.nowPlaying = undefined;
	};

	/*
	Each 'tone' is a list of oscillators used to make up the sound.
	Options for type are 'sine', 'sawtooth', 'square', 'triangle'. REQUIRED
	The gain parameter says how loud each oscillator is set. (default: 1)
	The detune is detuning (+-) of the oscillator (default: 0)
	TODO: maybe allow custom waveforms.
	*/
	JSTuner.prototype.tones = {
		sine: [{type: 'sine', gain: 1}],
		saw: [{type: 'sawtooth', gain: 1}],
		strings: [
			{type: 'sine', gain: 0.5},
			{type: 'sawtooth', gain: 0.5}
		],
		pulse: [
			{type: 'sine', detune: -5},
			{type: 'sine', detune: 5}
		]
	};

	JSTuner.prototype.calculateFrequency = function (nsteps) {
		var a = Math.pow(2, 1 / 12.0);
		var fn = this.baseFrequency * Math.pow(a, nsteps);
		return fn;
	};

	JSTuner.prototype.noteFrequency = function (note) {
		// Normalise:
		note = note.toUpperCase();
		// relative to A, ignoring octaves
		var semitoneOffset = 0;

		// Only allow valid notes
		if (note.match(/^[ABCDEFG]S?/)) {
			// Assume octave 4 if none given.
			note += '4';
		}
		if (note.match(/^[ABCDEFG]S?\d/) === null) {
			return false;
		}

		// Only allowed certain notes to be sharp
		if (note.match(/^[CDFG]S/)) {
			semitoneOffset += 1;
			// Get rid of the sharp, we've dealt with it...
			note = note.replace('S', '');
		} else if (note.match(/^[ABE]S/)) {
			console.log('Error: invalid note. Not all notes can be \'sharp\'!');
			// Invalid note!
			return false;
		}

		switch (note[0]) {
			case 'A':
				break;
			case 'B':
				semitoneOffset += 2;
				break;
			case 'C':
				// base of numbering is C, so C and above need to be taken an octave down.
				semitoneOffset += 3 - 12;
				break;
			case 'D':
				semitoneOffset += 5 - 12;
				break;
			case 'E':
				semitoneOffset += 7 - 12;
				break;
			case 'F':
				semitoneOffset += 8 - 12;
				break;
			case 'G':
				semitoneOffset += 10 - 12;
				break;
			default:
				break;
		}

		var octave = parseInt(note[1], 10);
		// Relative to A4:
		var octaveOffset = octave - 4;
		var totalSemitoneOffset = semitoneOffset + 12 * octaveOffset;
		return this.calculateFrequency(totalSemitoneOffset);
	};

	JSTuner.prototype.stopSounds = function () {
		if (typeof (this.nowPlaying) !== 'undefined') {
			for (var i = 0; i < this.nowPlaying.length; i++) {
				this.nowPlaying[i].stop();
			}
		}
	};

	JSTuner.prototype.playTone = function (frequency, tone) {
		this.stopSounds();

		// Get tone object, and default to strings if not provided.
		tone = !(tone in this.tones) ? this.tones.strings : this.tones[tone];

		console.log('playing note @ freq=' + frequency);

		var oscillators = [];
		var gainNodes = [];
		// Setup:
		console.log(tone.length);
		console.log(tone);

		var i;
		for (i = 0; i < tone.length; i++) {
			oscillators[i] = this.context.createOscillator();
			gainNodes[i] = this.context.createGain();

			gainNodes[i].gain.value = tone[i].gain || 1;
			gainNodes[i].connect(this.output);

			oscillators[i].connect(gainNodes[i]);
			oscillators[i].frequency.value = frequency;
			oscillators[i].detune.value = tone[i].detune || 0;
			oscillators[i].type = tone[i].type;
		}

		// Start:
		for (i = 0; i < oscillators.length; i++) {
			oscillators[i].start(this.context.currentTime);
		}

		this.nowPlaying = oscillators;
	};

	JSTuner.prototype.playNote = function (note) {
		var frequency = this.noteFrequency(note);
		if (frequency) {
			this.playTone(frequency, 'string');
		} else {
			return false;
		}
	};

	JSTuner.prototype.setVolume = function (vol) {
		this.output.gain.value = vol;
		localStorage.setItem('volume', vol);
		console.log('Set volume to ' + vol);
	};

	JSTuner.prototype.instruments = {
		cello: ['A3', 'D3', 'G2', 'C2'],
		violin: ['G2', 'D3', 'A3', 'E4'],
		guitar: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
		bass: ['E1', 'A1', 'D2', 'G2']
	};
})(window);
// this.Tuner = new Tuner();
