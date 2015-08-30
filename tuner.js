window.AudioContext = window.AudioContext || window.webkitAudioContext;

var context = new AudioContext();

function playSin(frequency) {
        var source = context.createOscillator();
        source.frequency = frequency;
        source.connect(context.destination);
        source.start(0);
        source.stop(10);
        return source;
}

var mainSource;
function main() {
    mainSource = playSin(440);
}

window.addEventListener("load", main, false);
