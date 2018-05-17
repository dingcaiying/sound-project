import './../scss/main.scss';
import './../index.html';
import Sound from './Audio/Sound';

// load assets
function requireAll(r) { r.keys().forEach(r); }
requireAll(require.context('../assets/', true));


const musicUrls = [
  './assets/music/35.2.7.mp3',
  './assets/music/35.2.6.mp3',
  './assets/music/35.1.8.mp3',
];

let sound;
let panner;
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

initSound()
  .then(bindEvent);

function initSound(url = musicUrls[0]) {
  return loadSound(url).then(buffer => {
    sound = new Sound(audioCtx, buffer);

    // panner = audioCtx.createPanner();
    // panner.connect(audioCtx.destination);

    sound.play();
  });
}

function loadSound(url) {
  return new Promise((resolve, reject) => {
    let request = new XMLHttpRequest();
    request.open('get', url, true);
    request.responseType = 'arraybuffer';
    request.onload = function() {
      audioCtx.decodeAudioData(request.response, buffer => {
        // received buffer
        resolve(buffer);
      }, error => {
        reject('get audio source error: ', error);
      });
    };
    request.send();
  });
}

function bindEvent() {
  console.log('bind evnet');
  return Promise.resolve();
}

