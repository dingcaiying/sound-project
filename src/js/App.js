import Sound from './Audio/Sound';
import MyRecorder from './Audio/MyRecorder';
import { loadSound, createDownloadLink } from './utils/helper';

class App {

  constructor() {
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.buttons = {
      startRecord: document.getElementById('btn_start_record'),
      stopRecord: document.getElementById('btn_stop_record'),
      playRaw: document.getElementById('btn_play_raw'),
      playFiltered: document.getElementById('btn_play_filtered'),
    };
    this.myReco = null;
    this.current = {
      id: null,
      type: null, // { 'raw', 'filtered' }
      filteredSound: null,
      rawSound: null,
    };
    this.bufferList = {}; // index by timestamp
    window.bufferList = this.bufferList;

    this.bgSound = null;
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
    const { startRecord, stopRecord, playRaw, playFiltered } = this.buttons;
    startRecord.addEventListener('click', () => {
      this.current.id = null;
      this.current.rawSound && this.current.rawSound.stop();
      this.current.rawSound = null;
      this.current.filteredSound && this.current.filteredSound.stop();
      this.current.filteredSound = null;
      this.setSelectedDomLi(null);
      this.myReco.startRecording()
        .then(() => {
          this.enableButton('stopRecord');
        });
    });
    stopRecord.addEventListener('click', () => {
      this.myReco.stopRecording()
        .then(buffers => {
          const newBuffer = this.audioCtx.createBuffer(2, buffers[0].length, this.audioCtx.sampleRate);
          newBuffer.getChannelData(0).set(buffers[0]);
          newBuffer.getChannelData(1).set(buffers[1]);

          const id = String((new Date()).getTime());
          this.bufferList[id] = newBuffer;
          this.current.id = id;
          this.enableButton(['playRaw', 'playFiltered', 'startRecord']);

          // append audio to list
          document.getElementById('audio_list').innerHTML = '' +
            Object.keys(this.bufferList).map(k => `<li data-id=${k}>${k}<span class="select">select</span><span class="delete">delete</span></li>`).join('');
          
          this.setSelectedDomLi(id);


          // generate file 
          // this.myReco.download();
          const div = createDownloadLink(this.myReco.blob);
          document.body.appendChild(div);

          var filename = new Date().toISOString(); //filename to send to server without extension
          //upload link
          
          var xhr=new XMLHttpRequest();
          xhr.onload=function(e) {
              if(this.readyState === 4) {
                  console.log("Server returned: ",e.target.responseText);
              }
          };
          var fd=new FormData();
          fd.append("audio_data", this.myReco.blob, filename);
          console.log('fd', fd);
          xhr.open("POST","http://10.106.76.109/test.php",true);
          xhr.send(fd);
          // li.appendChild(document.createTextNode (" "))//add a space in between
          // li.appendChild(upload)//add the upload link to li
        });
    });

    playRaw.addEventListener('click', () => {
      const buffer = this.current.id ? this.bufferList[this.current.id] : null
      if (!buffer) return;
      // check curent sound type and switch
      if (this.current.type === 'filtered' && this.current.filteredSound) {
        this.current.filteredSound.stop();
        this.current.filteredSound = null;
      }
      this.current.type = 'raw';
      this.current.rawSound = this.current.rawSound || new Sound(this.audioCtx, buffer, { button: playRaw });

      const { rawSound } = this.current;
      if (!rawSound.isPlaying) {
        rawSound.play();
      }
      else {
        rawSound.stop();
      }
    });

    playFiltered.addEventListener('click', () => {
      const buffer = this.current.id ? this.bufferList[this.current.id] : null
      if (!buffer) return;
      // check curent sound type and switch
      if (this.current.type === 'raw' && this.current.rawSound) {
        this.current.rawSound.stop();
        this.current.rawSound = null;
      }
      this.current.type = 'filtered';

      if (!this.current.filteredSound) {
        playFiltered.classList.add('loading');
        Promise.all([loadSound(this.audioCtx, '/assets/music/juanji-shandong.wav')])
          .then(cBuffers => {
            playFiltered.classList.remove('loading');
            this.current.filteredSound = new Sound(this.audioCtx, buffer, { button: playFiltered, playbackRate: 0.5, bgSound: this.bgSound });

            const convolverNode = this.audioCtx.createConvolver();
            convolverNode.buffer = cBuffers[0];
            this.current.filteredSound.setOutput(convolverNode);
            convolverNode.connect(this.audioCtx.destination);

            this.current.filteredSound.play();
          });
      } else if (!this.current.filteredSound.isPlaying) {
        this.current.filteredSound.play();
      } else {
        this.current.filteredSound.stop();
      }
    });

    document.getElementById('audio_list').addEventListener('click', e => {
      const target = e.target;
      if (target.classList.contains('select')) {
        const id = target.parentNode.getAttribute('data-id');
        if (this.current.id !== id) {
          this.current.id = id;
          this.current.rawSound && this.current.rawSound.stop();
          this.current.rawSound = null;
          this.current.filteredSound && this.current.filteredSound.stop();
          this.current.filteredSound = null;
          this.setSelectedDomLi(id);
        }
      }
      else if (target.classList.contains('delete')) {
        const id = target.parentNode.getAttribute('data-id');
        target.parentNode.parentNode.removeChild(target.parentNode);
        delete this.bufferList[id];
        if (this.current.id === id) {
          this.current.id = null;
          this.current.rawSound && this.current.rawSound.stop();
          this.current.rawSound = null;
          this.current.filteredSound && this.current.filteredSound.stop();
          this.current.filteredSound = null;
        }
        if (Object.keys(this.bufferList).length === 0) {
          this.enableButton('startRecord');
        }
      }
    });
  }

  setSelectedDomLi(id) {
    Array.from(document.getElementById('audio_list').querySelectorAll('li')).forEach(el => {
      if (el.getAttribute('data-id') !== id) el.classList.remove('selected');
      else el.classList.add('selected');
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
