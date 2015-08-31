(function(window) {

    Tuner = function(baseFrequency) {
        this.VERSION = 0.8;
        this.baseFrequency = typeof(baseFrequency) == "number" ? baseFrequency : 440.0;

        AudioContext = window.AudioContext || window.webkitAudioContext;
        this.context = new AudioContext();
        this.output = this.context.createGain();
        this.output.connect(this.context.destination);

        this.nowPlaying = undefined;

    };

    Tuner.prototype.calculateFrequency = function(nsteps) {
        var a = Math.pow(2, 1/12.0)
        var fn = this.baseFrequency * Math.pow(a, nsteps);
        return fn;
    };

    Tuner.prototype.noteFrequency = function(note) {
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
    }

    Tuner.prototype.stopSounds = function() {
        if (typeof(this.nowPlaying) != "undefined") {
            for (var i = 0; i < this.nowPlaying.length; i++) {
                this.nowPlaying[i].stop();
            }
        }
    }

    Tuner.prototype.playTone = function(frequency) {
        this.stopSounds();
        console.log("playing note @ freq="+frequency);

        var osc = this.context.createOscillator();
        osc.connect(this.output);
        osc.frequency.value = frequency;
        osc.type = "sine";

        var osc2 = this.context.createOscillator();
        osc2.connect(this.output);
        osc2.frequency.value = frequency;
        osc2.type = "sawtooth";

        this.output.connect(this.context.destination);
        osc.start(this.context.currentTime);
        osc2.start(this.context.currentTime);

        this.nowPlaying = [osc, osc2];
    }

    Tuner.prototype.playNote = function(note) {
        if (frequency = this.noteFrequency(note)) {this.playTone(frequency)} else {return false;};
    }



    Tuner.prototype.setVolume = function(vol) {
        this.output.gain.value = vol;
        localStorage.setItem('volume', vol);
        console.log("Set volume to " + vol);
    }


}(window));

// this.Tuner = new Tuner();



var instruments =
{
    cello: ["A3", "D3", "G2", "C2"],
    violin: ["G2", "D3", "A3", "E4"],
    guitar: ["E2", "A2", "D3", "G3", "B3", "E4"],
    bass: ["E1", "A1", "D2", "G2"]
};
