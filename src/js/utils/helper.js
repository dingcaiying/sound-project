const musicUrls = [
  './assets/music/35.2.7.mp3',
  './assets/music/35.2.6.mp3',
  './assets/music/35.1.8.mp3',
];

const loadSound = (audioCtx, url = musicUrls[0]) => {
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
};

export { loadSound };
