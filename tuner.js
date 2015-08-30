var playingSource;

window.AudioContext = window.AudioContext || window.webkitAudioContext;

var context = new AudioContext();
var masterVolume = context.createGain();

masterVolume.connect(context.destination);
masterVolume.gain.value = 0.15;

var instruments =
{
    cello: ["A3", "D3", "G2", "C2"],
    guitar: ["E2", "A2", "D3", "G3", "B3", "E4"],
    bass: ["E1", "A1", "D2", "G2"]
};


function noteFrequency(note) {
    // Normalise:
    note = note.toUpperCase();
    var semitoneOffset = 0; // relative to A, ignoring octaves

    //Only allow valid notes
    if (note.match(/^[ABCDEFG]S?/)) {
            note = note + "4"; // Assume octave 4 if none given.
    }
    if (note.match(/^[ABCDEFG]S?\d/) == null) { return false; }

    if (note.match(/^[CDFG]S/)) { // Only allowed certain notes to be sharp
         console.log("sharp");
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
    return calculateFrequency(totalSemitoneOffset);
}


function calculateFrequency(nsteps) {
    var f0 = 440.0; // A4 (440 Hz)
    var a = Math.pow(2, 1/12.0)
    var fn = f0 * Math.pow(a, nsteps);
    return fn;
}

function playSin(frequency) {
    if (frequency) {
        stop();
        console.log("playing note @ freq="+frequency);

        var osc = context.createOscillator();
        osc.connect(masterVolume);
        osc.frequency.value = frequency;
        osc.type = "sine";

        var osc2 = context.createOscillator();
        osc2.connect(masterVolume);
        osc2.frequency.value = frequency;
        osc2.type = "sawtooth";

        masterVolume.connect(context.destination);
        osc.start(context.currentTime);
        osc2.start(context.currentTime);

        return [osc, osc2];
    }
}

function stop() {
    if (typeof(playingSource) != "undefined") {
        for (var i = 0; i < playingSource.length; i++) {
            playingSource[i].stop();
        }
    }
}

function playNote(e) {
    e.preventDefault();
    var note = e.srcElement.dataset.note.toUpperCase();
    console.log(note);
    playingSource = playSin(noteFrequency(note));
}

function setVolume() {
    var vol = document.querySelector("input#volume").value;
    masterVolume.gain.value = vol;
    console.log("Set volume to " + vol);
}

function main() {
    // playSin(instruments.cello.G2);

    var buttons = document.querySelectorAll(".note");
    for (var i = 0; i < buttons.length; i++) {
        buttons.item(i).addEventListener("click", playNote, false);
    }
    document.querySelector("button#stop").addEventListener("click", stop, false);
    document.querySelector("input#volume").addEventListener("input", setVolume, false);
    setVolume();
    console.log("Ready");
}

window.addEventListener("load", main, false);
