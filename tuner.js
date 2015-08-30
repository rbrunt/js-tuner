var playingSource;

window.AudioContext = window.AudioContext || window.webkitAudioContext;

var context = new AudioContext();
var masterVolume = context.createGain();

masterVolume.connect(context.destination);
masterVolume.gain.value = 0.5;

var instruments =
{
    cello: {
        A3: 220.0,
        D3: 146.83,
        G2: 98.0,
        C2: 65.41
    }

};

var notes =
{
    frequencies: {
        A3: 220.0,
        D3: 146.83,
        G2: 98.0,
        C2: 65.41
    }
}

function playSin(frequency) {
    stop();
    console.log("playing note @ freq="+frequency);
    var osc = context.createOscillator();
    osc.connect(context.destination);
    osc.frequency.value = frequency;

    var osc2 = context.createOscillator();
    osc2.connect(context.destination);
    osc2.frequency.value = frequency;
    osc2.type = "sawtooth";


    osc.start(context.currentTime);
    osc2.start(context.currentTime);
    console.log([osc, osc2]);
    return [osc, osc2];
}

function stop() {
    try {
        for (var i = 0; i < playingSource.length; i++) {
            playingSource[i].stop();
        }

    } catch (e) {
        console.log(e);
    }
}

function playNote(e) {
    e.preventDefault();
    var note = e.srcElement.dataset.note.toUpperCase();
    console.log(note);
    playingSource = playSin(notes.frequencies[note]);
}

function main() {
    // playSin(instruments.cello.G2);

    var buttons = document.querySelectorAll(".note");
    for (var i = 0; i < buttons.length; i++) {
        buttons.item(i).addEventListener("click", playNote, false);
    }
    document.querySelector("button#stop").addEventListener("click", stop, false);
    console.log("Ready");
}

window.addEventListener("load", main, false);
