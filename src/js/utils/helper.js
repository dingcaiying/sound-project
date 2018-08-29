const musicUrls = [
  '/assets/music/35.2.7.mp3',
  '/assets/music/35.2.6.mp3',
  '/assets/music/35.1.8.mp3',
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


const createDownloadLink = (blob) => {

  const elemLinkContainer = document.getElementById('audio_container');
  if (elemLinkContainer) elemLinkContainer.parentNode.removeChild(elemLinkContainer);
   
  var url = URL.createObjectURL(blob);
  var div = document.createElement('div');
  div.id = 'audio_container';
  var au = document.createElement('audio');
  var link = document.createElement('a');

  //add controls to the <audio> element
  au.controls = true;
  au.src = url;

  //link the a element to the blob
  link.href = url;
  link.download = new Date().toISOString() + '.wav';
  link.innerHTML = link.download;

  //add the new audio and a elements to the li element
  div.appendChild(au);
  div.appendChild(link);

  //add the li element to the ordered list
  return div;
}

export { loadSound, createDownloadLink };
