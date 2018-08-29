import MyRecorder from './Audio/MyRecorder';
import { createDownloadLink } from './utils/helper';

class App {

  constructor() {
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.buttons = {
      startRecord: document.getElementById('btn_start_record'),
      stopRecord: document.getElementById('btn_stop_record'),
      // playRaw: document.getElementById('btn_play_raw'),
      // playFiltered: document.getElementById('btn_play_filtered'),
    };
    this.myReco = null;
  }

  init() {
    this.disableButtons();
    navigator.mediaDevices.getUserMedia({audio: true})
      .then((stream) => {
        this.myReco = new MyRecorder(this.audioCtx, stream);
        this.enableButton('startRecord');
      });
    this.bindEvent();
  }

  bindEvent() {
    const { startRecord, stopRecord } = this.buttons;
    startRecord.addEventListener('click', () => {
      this.myReco.startRecording()
        .then(() => {
          this.enableButton('stopRecord');
        });
    });
    stopRecord.addEventListener('click', () => {
      this.myReco.stopRecording()
        .then((buffers) => {
          const newBuffer = this.audioCtx.createBuffer(1, buffers[0].length, this.audioCtx.sampleRate);
          newBuffer.getChannelData(0).set(buffers[0]);
          // newBuffer.getChannelData(1).set(buffers[1]);

          this.enableButton(['startRecord']);

          const resultBlob = this.myReco.blob;
          console.log('resultBlob', resultBlob)

          const div = createDownloadLink(resultBlob);
          document.getElementById('page_container').appendChild(div);

          var filename = new Date().toISOString();
          var xhr = new XMLHttpRequest();
          xhr.onload = function(e) {
            if(this.readyState === 4) {
              console.log("Server returned: ",e.target.responseText);
            }
          };
          var fd = new FormData();
          fd.append("audio_data", resultBlob, filename);
          xhr.open("POST","http://10.106.76.109/test.php",true);
          xhr.send(fd);
        });
    });
  }

  disableButtons() {
    Object.keys(this.buttons).forEach(key => {
      this.buttons[key].disabled = true;
    });
  }

  // string or array
  disableButton(names) {
    Object.keys(this.buttons).forEach(key => {
      this.buttons[key].disabled = false;
    });
    if (Array.isArray(names)) {
      names.forEach(na => this.buttons[na].disabled = true);
    } else {
      this.buttons[names].disabled = true;
    }
  }

  enableButtons() {
    Object.keys(this.buttons).forEach(key => {
      this.buttons[key].disabled = false;
    });
  }

  // string or array
  enableButton(names) {
    Object.keys(this.buttons).forEach(key => {
      this.buttons[key].disabled = true;
    });
    if (Array.isArray(names)) {
      names.forEach(na => this.buttons[na].disabled = false);
    } else {
      this.buttons[names].disabled = false;
    }
  }
}

export default App;
