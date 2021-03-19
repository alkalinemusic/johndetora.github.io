/////////// COLORS ///////////////
let bgColor = 'white';
let defaultColor = 'black';
let offColor = 'gray';

//// Audio play confirmation
document.querySelector('button')?.addEventListener('click', async () => {
    await Tone.start();
    console.log('audio is ready');
});

/////// BPM Set ///////

window.addEventListener('load', () => {
    init();
    let bpm = transport.value;
    Tone.Transport.bpm.value = bpm;
});

//// BPM Change
let transport = document.querySelector('#bpm');
transport.addEventListener('input', function () {
    bpm = this.value;
    Tone.Transport.bpm.value = bpm;
});
///// Test Note Array Button
function tester() {
    console.log(notes);
    console.log(slider);
    //console.log(notes[0].velocity);
}
//////////////// Start Stop Init ////////////////////////
let playButton = document.getElementById('play-button');
playButton.addEventListener('click', () => {
    if (Tone.Transport.state !== 'started') {
        playButton.style.backgroundColor = 'rgb(142, 209, 168)';
        playButton.innerHTML = '❚❚';
        Tone.Transport.start();
        animate(0);
        playHeadUpdate(0);
        index = 0;
    } else {
        playButton.style.backgroundColor = 'rgb(227, 157, 157)';
        playButton.innerHTML = '►';
        Tone.Transport.stop();
        index = 0;
        document.getElementById('ascii-spin').innerHTML = '&ndash;';
    }
});

/////////////// Elements /////////////////////////////
const synthControls = document.querySelector('#synth-container');
const fxControls = document.querySelector('#fx-container');
const stepContainer = document.querySelector('#steps');
const paramContainer = document.querySelector('#params');
const playHead = document.querySelector('#playhead');
const checks = document.querySelectorAll('#check');
const meter = document.getElementById('ascii-meter');
const meters = document.querySelectorAll('#ascii-meter');
const paraMeters = document.querySelectorAll('#para-meter');
const asciiCheck = document.querySelectorAll('#ascii-checkbox');
const envelope = document.querySelector('#envelope-container');
const mod = document.querySelector('#modulation-envelope');
const oscWave = document.querySelector('#osc-wave');
const modWave = document.querySelector('#mod-wave');
const steps = 8; // Total step length
const max = 10; // Max slider value for note meters
const filterControls = document.querySelector('#filter-container');
const delayControl = document.querySelector('#delay-container');

///////// SYNTH CONTROLS //////////////
const synth = new Tone.FMSynth({
    harmonicity: 1,
    modulationIndex: 10,
    portamento: 0.06,
    detune: 0,
    oscillator: {
        type: 'sine',
    },

    envelope: {
        attack: 0.01,
        decay: 0,
        sustain: 1,
        release: 0.2,
        attackCurve: 'exponential',
    },
    modulation: {
        type: 'sine',
    },
    modulationEnvelope: {
        attack: 0.01,
        decay: 0,
        sustain: 1,
        release: 0.2,
        attackCurve: 'exponential',
    },
});

/////// OSC ///////
oscWave.addEventListener('change', ({ target }) => {
    console.log(target.value);
    synth.oscillator.type = target.value;
});

console.log(synth.get());
// const glide = document.getElementById('glide');
// glide.addEventListener('change', function () {
//     if (!glide.checked) {
//         console.log('checked');
//     } else {
//         synth.portamento = 0.25;
//         console.log('unchecked');
//     }
// });

/////// MOD WAVE ///////
modWave.addEventListener('change', ({ target }) => {
    console.log(target.value);
    synth.modulation.type = target.value;
});

///// HARMONICITY ///////
let harmonicity = document.querySelector('#harmonicity');
harmonicity.addEventListener('change', ({ target }) => {
    synth.harmonicity.value = target.value;
});

//// ENVELOPE ///////
envelope.addEventListener('input', ({ target }) => {
    synth.envelope[target.dataset.action] = target.value;
});

///// MOD ENVELOPE
mod.addEventListener('input', ({ target }) => {
    synth.modulationEnvelope[target.dataset.action] = target.value;
    if (target.dataset.action === 'modulationIndex')
        synth[target.dataset.action].value = target.value;
});

////// CROSSFADER ////////
let crossFadeInput = document.getElementById('crossfader');
crossFadeInput.addEventListener('input', () => {
    crossFade.fade.value = crossFadeInput.value;
});

const filter = new Tone.BiquadFilter({
    frequency: 1500,
    type: 'lowpass',
});
/////// FILTER ///////

filterControls.addEventListener('input', ({ target }) => {
    filter[target.dataset.parameter].value = target.value;
    circleGrow(target);
});

//// LFO
const lfo = new Tone.LFO(1, 0.1, 1500).start();

const toFilt = new Tone.Gain(0);
const toFreq = new Tone.Gain(0);
lfo.connect(toFilt);
toFilt.connect(filter.frequency);
const lfoRate = document.getElementById('lfo-rate');
const lfoAmt = document.querySelector('#lfo-amount');
lfoRate.addEventListener('input', function () {
    lfo.frequency.value = this.value;
});
lfoAmt.addEventListener('input', function () {
    console.log(this.value);
    toFilt.gain.value = this.value;
});

//////// FX /////////////

const delay = new Tone.FeedbackDelay({
    delayTime: '0',
    feedback: 0.3,
    wet: 0,
});

////// Distortion ////// doesn't sound that good :/
// const dist = new Tone.Distortion(0.2);
// const distControl = document.getElementById('distortion');

// distControl.addEventListener('input', ({ target }) => {
//     dist.distortion = target.value;
//     console.log(dist.distortion);
// });

// ////// !!! ROUTING  !!!////////

let gain = new Tone.Gain(0.7);
let modGain = new Tone.Gain(0.2);
let crossFade = new Tone.CrossFade(0);
synth.chain(gain, crossFade.a);
synth.modulationEnvelope.chain(modGain, crossFade.b);
//gain.toDestination();
crossFade.connect(filter);
filter.connect(delay);
delay.toDestination(0.8);

/////////// SEQUENCER DATA ///////////////
// Range slider note values
let sliderNotes = {
    0: 'C3',
    1: 'D3',
    2: 'E3',
    3: 'F3',
    4: 'G3',
    5: 'A3',
    6: 'B3',
    7: 'C4',
    8: 'D4',
    9: 'E4',
    10: 'F4',
};

////// Notes, value time object
let notes = [
    {
        time: '0',
        note: 'A3',
        velocity: 1,
        timing: '16n',
    },
    {
        time: '0:1',
        note: 'A3',
        velocity: 1,
        timing: '16n',
    },
    {
        time: '0:2',
        note: 'A3',
        velocity: 1,
        timing: '16n',
    },
    {
        time: '0:3',
        note: 'A3',
        velocity: 1,
        timing: '16n',
    },
    {
        time: '1:0',
        note: 'A3',
        velocity: 1,
        timing: '16n',
    },
    {
        time: '1:1',
        note: 'A3',
        velocity: 1,
        timing: '16n',
    },
    {
        time: '1:2',
        note: 'A3',
        velocity: 1,
        timing: '16n',
    },
    {
        time: '1:3',
        note: 'A3',
        velocity: 1,
        timing: '16n',
    },
];

let index = 0;

///// ASCII Playhead Animation
function playHeadUpdate(step) {
    if (step > 0 && step <= 8) {
        playHead.prepend('─────');
    } else {
        playHead.innerHTML = '►';
    }
}
///// Part - To Do: move the ascii animation to its own function once it's good
let part = new Tone.Part(function (time, value) {
    let step = index % steps;
    playHeadUpdate(step);
    index++;
    synth.triggerAttackRelease(value.note, value.timing, time, value.velocity);
}, notes);

/////// Transport and Loop ////////////
part.start('0m');
part.loopStart = '0m';
part.loopEnd = '2m';
part.loop = true;
Tone.Transport.loopStart = '0m';
Tone.Transport.loopEnd = '2m';
Tone.Transport.loop = true;

/////// MAIN NOTE SLIDERS /////////
stepContainer.addEventListener('input', ({ target }) => {
    if (target.type === 'range') {
        meters[target.dataset.index].innerHTML = bars(target.value); // Sets bar animation value
        notes[target.dataset.index].note = sliderNotes[target.value];
    }
    if (target.type == 'checkbox' && !target.checked) {
        notes[target.dataset.index].velocity = 0;
        //       notes[target.dataset.index - 1].timing = '16n';        Not sure if this is desired behavior but it works
    } else if (target.type == 'checkbox' && target.checked) {
        notes[target.dataset.index].velocity = 1;
        //      notes[target.dataset.index - 1].timing = '16n';
    }
});

stepContainer.addEventListener('change', ({ target }) => {
    if (target.type == 'checkbox' && target.checked) {
        asciiCheck[target.dataset.index].innerHTML = '[#]';
        asciiCheck[target.dataset.index].style.color = defaultColor;
        meters[target.dataset.index].style.color = defaultColor;
        console.log('checked');
    } else if (target.type == 'checkbox' && !target.checked) {
        asciiCheck[target.dataset.index].innerHTML = '[ ]';
        asciiCheck[target.dataset.index].style.color = offColor;
        meters[target.dataset.index].style.color = offColor;
        console.log('not checked');
    }
});

//////// FX  /////////

delayControl.addEventListener('input', ({ target }) => {
    console.log(target.dataset.parameter);
    delay[target.dataset.parameter].value = target.value;
});

///////  Bar  ////////
function bars(v) {
    let top = ' _' + '<br>';
    let bottom = ' ^' + '<br>';
    let row = '|░|' + '<br>';
    let filled = '|▓|' + '<br>';
    return top + row.repeat(max - v) + filled.repeat(v) + filled + bottom;
}

///////  Spin  ////////

const ASCIIs = [
    ['&ndash;', '\\', '|', '/'], // Forward Spin
    ['&ndash;', '/', '|', '\\'], // Backward Spin
];

function animate(index) {
    // Update the element id of elementID to have the index-th ASCII array entry in it. (Note: arrays start at 0)
    document.getElementById('ascii-spin').innerHTML = ASCIIs[0][index];
    let inputSlider = document.getElementById('bpm');
    let frequency = inputSlider.value;
    // Call the update function after 1 second / frequency (Hz).
    setTimeout(function () {
        if (Tone.Transport.state === 'started') {
            // Pass the update function the index that it was called with this time, plus 1.
            // % means modulus (remainder when divided by)
            // This way, it doesnt' try to look for the 1000th element which doesn't exist
            animate((index + 1) % ASCIIs[0].length);
        }
    }, 10000 / frequency);
}

/////// Horizontal Slider Animation ////////
let tempoMeter = document.getElementById('ascii-bpm');
const lines = '|';
const block = '▓';

tempoMeter.innerHTML = '||||||||||||||▓';
transport.addEventListener('input', function () {
    let animBars = this.value / 15;

    tempoMeter.innerHTML = lines + lines.repeat(animBars) + block;
});
/// Initialization
function init() {
    for (let i = 0; i < meters.length; i++) {
        meters[i].innerHTML = bars(5);
    }
}

///// Horizontal Slider for Parameters /////

synthControls.addEventListener('input', ({ target }) => {
    console.log(target.max);
    //// The '/ n' parts make it so the lines amount equal 31 at their max. Just divide/multiply target max so it reaches 31
    /// Mod index
    if (target.max == 100) {
        let linesAmount = parseInt(target.value) / 3.2;
        document.getElementById(target.dataset.ascii).innerHTML =
            lines + lines.repeat(linesAmount) + block;
    } else if (target.id === 'crossfader') {
        let linesAmount = parseInt(target.value * 18); // Change this value back to 31 if width is reverted
        document.getElementById(target.dataset.ascii).innerHTML =
            lines + lines.repeat(linesAmount) + block;
    } else if (target.id === 'distortion') {
        /// Envelopes
        let linesAmount = parseInt(target.value * 31);
        document.getElementById(target.dataset.ascii).innerHTML =
            lines + lines.repeat(linesAmount) + block;
        /// Filter
    } else if (target.max == 1) {
        /// Envelopes
        let linesAmount = parseInt(target.value * 31);
        document.getElementById(target.dataset.ascii).innerHTML =
            lines + lines.repeat(linesAmount) + block;
        /// Filter
    } else if (target.max == 1500) {
        let linesAmount = parseInt(target.value / 47);
        document.getElementById(target.dataset.ascii).innerHTML =
            lines + lines.repeat(linesAmount) + block;
    } else if (target.max == 10) {
        let linesAmount = parseInt(target.value * 3.1);
        document.getElementById(target.dataset.ascii).innerHTML =
            lines + lines.repeat(linesAmount) + block;
    } else if (target.id === 'lfo-rate') {
        let linesAmount = parseInt(target.value * 2.1);
        document.getElementById(target.dataset.ascii).innerHTML =
            lines + lines.repeat(linesAmount) + block;
    }
});

/////// Circle Grow Animation
let circle = document.getElementById('ascii-cutoff');
console.log(circle.style.left);
function circleGrow(target) {
    if (target.id === 'cutoff') {
        let circleSize = parseInt(target.value / 50);
        let circleX = parseInt(target.value / 25);
        /// IMPORTANT This value is the top position + font.size and may need to be adjusted later
        let circleLocation = 35;
        let circlePosition = -circleSize + circleLocation;

        // When the animation turns into a period
        if (target.value <= 250) {
            circle.style.opacity = 0;
            document.getElementById('filterLabel').innerHTML = '&nbsp;Cutoff.';
            // When the animation is growing/shrinking
        } else {
            document.getElementById('filterLabel').innerHTML = '&nbsp;Cutoff';
            circle.style.fontSize = circleSize + '.px';
            circle.style.opacity = 1;
            circle.style.top = circlePosition + '.px';
            circle.style.left = circleX + 50 + '.px'; // Comment this out to have circle stay in x position
        }
    }
}

//////////////// SWAP PARAMETERS ///////////////

let paramState = 'synth';
const fxSwap = document.getElementById('param-swap');

fxSwap.addEventListener('click', function () {
    if (paramState === 'fx') {
        console.log('fx state');

        synthControls.style.display = 'grid';
        fxControls.style.display = 'none';

        return (paramState = 'synth');
    } else {
        fxControls.style.display = 'grid';
        synthControls.style.display = 'none';
        console.log('synth state');
        return (paramState = 'fx');
    }
    console.log(paramState);
});
