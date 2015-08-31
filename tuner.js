(function(window) {

    JSTuner = function(baseFrequency) {
        this.VERSION = 0.8;
        this.baseFrequency = typeof(baseFrequency) == "number" ? baseFrequency : 440.0;

        AudioContext = window.AudioContext || window.webkitAudioContext;
        this.context = new AudioContext();
        this.output = this.context.createGain();
        this.output.connect(this.context.destination);

        this.nowPlaying = undefined;

    };

    JSTuner.prototype.tones = {
        sine: [{type: "sine", gain: 1}],
        saw: [{type: "sawtooth", gain: 1}],
        string: [{type: "sine", gain: 1},
                {type: "sawtooth", gain: 0.75}]
    }

    JSTuner.prototype.calculateFrequency = function(nsteps) {
        var a = Math.pow(2, 1/12.0)
        var fn = this.baseFrequency * Math.pow(a, nsteps);
        return fn;
    };

    JSTuner.prototype.noteFrequency = function(note) {
        // Normalise:
        note = note.toUpperCase();
        var semitoneOffset = 0; // relative to A, ignoring octaves

        //Only allow valid notes
        if (note.match(/^[ABCDEFG]S?/)) {
                note = note + "4"; // Assume octave 4 if none given.
        }
        if (note.match(/^[ABCDEFG]S?\d/) == null) { return false; }

        if (note.match(/^[CDFG]S/)) { // Only allowed certain notes to be sharp
             semitoneOffset += 1;
             note = note.replace("S", ""); // Get rid of the sharp, we've dealt with it...
        } else if (note.match(/^[ABE]S/)) {
            console.log("Error: invalid note. Not all notes can be \"sharp\"!");
            return false; // Invalid note!
        }

        switch (note[0]) {
            case "A":
                break;
            case "B":
                semitoneOffset += 2;
                break;
            case "C":
                semitoneOffset += 3 - 12; // base of numbering is C, so C and above need to be taken an octave down.
                break;
            case "D":
                semitoneOffset += 5 - 12;
                break;
            case "E":
                semitoneOffset += 7 - 12;
                break;
            case "F":
                semitoneOffset += 8 - 12;
                break;
            case "G":
                semitoneOffset += 10 - 12;
                break;
        }

        var octave = parseInt(note[1]);
        var octaveOffset = octave - 4; // Relative to A4...
        var totalSemitoneOffset = semitoneOffset + 12 * octaveOffset;
        return this.calculateFrequency(totalSemitoneOffset);
    };

    JSTuner.prototype.stopSounds = function() {
        if (typeof(this.nowPlaying) != "undefined") {
            for (var i = 0; i < this.nowPlaying.length; i++) {
                this.nowPlaying[i].stop();
            }
        }
    };

    JSTuner.prototype.playTone = function(frequency, tone) {
        this.stopSounds();
        console.log("playing note @ freq="+frequency);

        if (!(tone in this.tones)) { tone = this.tones.string;} // default to stings

        var oscillators = [];
        var gainNodes = [];
        // Setup:
        for (var i = 0; i < tone.length; i++) {
            oscillators[i] = this.context.createOscillator();
            gainNodes[i] = this.context.createGain();

            gainNodes[i].gain.value = tone[i].gain;
            gainNodes[i].connect(this.output);

            oscillators[i].connect(gainNodes[i]);
            oscillators[i].frequency.value = frequency;
            oscillators[i].type = tone[i].type;
        }

        // Start:
        for (var i = 0; i < oscillators.length; i++) {
            oscillators[i].start(this.context.currentTime);
        }

        this.nowPlaying = oscillators;
    };

    JSTuner.prototype.playNote = function(note) {
        if (frequency = this.noteFrequency(note)) {this.playTone(frequency)} else {return false;};
    };



    JSTuner.prototype.setVolume = function(vol) {
        this.output.gain.value = vol;
        localStorage.setItem('volume', vol);
        console.log("Set volume to " + vol);
    };

    JSTuner.prototype.instruments = {
        cello: ["A3", "D3", "G2", "C2"],
        violin: ["G2", "D3", "A3", "E4"],
        guitar: ["E2", "A2", "D3", "G3", "B3", "E4"],
        bass: ["E1", "A1", "D2", "G2"]
    };


}(window));
// this.Tuner = new Tuner();
