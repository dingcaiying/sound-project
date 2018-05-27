import Sound from './Audio/Sound';
import MyRecorder from './Audio/MyRecorder';
import { loadSound } from './utils/helper';

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
    this.onendedCallback = this.onendedCallback.bind(this);
  }

  init() {
    this.disableButtons();
    navigator.mediaDevices.getUserMedia({audio: true})
      .then((stream) => {
        this.myReco = new MyRecorder(this.audioCtx, stream);
        return loadSound(this.audioCtx, '/assets/music/juanji-shandong.wav'); // load filter wave
      }, (err) => {
        console.log('Uh oh... unable to get stream...', err)
      })
      .then(() => {
        this.enableButton('startRecord');
      });
    this.bindEvent();
  }

  initWithSampleSound() {
    loadSound(this.audioCtx).then(([buffer, cBuffer]) => {
      console.log('buffer', buffer);
      const sound = new Sound(this.audioCtx, buffer);
      // lowpass filter
      // const destLowpassNode = this.audioCtx.createBiquadFilter();
      // destLowpassNode.type = 'lowpass';
      // destLowpassNode.frequency.value = 880;
      // destLowpassNode.Q.value = 0.7;
      // sound.setOutput(destLowpassNode);
      // destLowpassNode.connect(this.audioCtx.destination);
      // lowpass end

      // convolver / 卷积
      // loadSound(this.audioCtx, '/assets/music/juanji-shandong.wav').then(cBuffer => {
      //   const convolverNode = this.audioCtx.createConvolver();
      //   convolverNode.buffer = cBuffer;
      //   sound.setOutput(convolverNode);
      //   convolverNode.connect(this.audioCtx.destination);
      // });
      // convolver / 卷积 end

      const btnFilter = document.getElementById('btn_filter');
      btnFilter.addEventListener('click', () => {
        if (sound.isPlaing) sound.stop();
        btnFilter.classList.toggle('selected');
        if (!btnFilter.classList.contains('selected')) {
          sound.setOutput(this.audioCtx.destination);
        } else {
          const convolverNode = this.audioCtx.createConvolver();
          convolverNode.buffer = cBuffer;
          sound.setOutput(convolverNode);
          convolverNode.connect(this.audioCtx.destination);
        }
        sound.play();
      });
      // sound.play();
    });
  }

  bindEvent() {
    const { startRecord, stopRecord, playRaw, playFiltered } = this.buttons;
    startRecord.addEventListener('click', () => {
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
          this.enableButton(['playRaw', 'playFiltered']);
        });
    });

    playRaw.addEventListener('click', () => {
      const buffer = this.current.id ? this.bufferList[this.current.id] : null
      if (!buffer) return;
      // check curent sound type and switch
      if (this.current.type === 'filtered' && this.current.filteredSound) {
        this.current.filteredSound.stop();
        delete this.current.filteredSound;
        this.current.filteredSound = null;
        playFiltered.classList.remove('playing');
      }
      this.current.type = 'raw';
      this.current.rawSound = this.current.rawSound || new Sound(this.audioCtx, buffer, { onended: this.onendedCallback });

      const { rawSound } = this.current;
      if (!rawSound.isPlaying) {
        rawSound.play();
        playRaw.classList.add('playing');
      }
      else {
        rawSound.stop();
        playRaw.classList.remove('playing');
      }
    });

    playFiltered.addEventListener('click', () => {
      const buffer = this.current.id ? this.bufferList[this.current.id] : null
      if (!buffer) return;
      // check curent sound type and switch
      if (this.current.type === 'raw' && this.current.rawSound) {
        this.current.rawSound.stop();
        delete this.current.rawSound;
        this.current.rawSound = null;
        playRaw.classList.remove('playing');
      }
      this.current.type = 'filtered';

      if (!this.current.filteredSound) {
        playFiltered.classList.add('loading');
        loadSound(this.audioCtx, '/assets/music/juanji-shandong.wav')
          .then(cBuffer => {
            playFiltered.classList.remove('loading');
            this.current.filteredSound = new Sound(this.audioCtx, buffer, { onended: this.onendedCallback });

            const convolverNode = this.audioCtx.createConvolver();
            convolverNode.buffer = cBuffer;
            this.current.filteredSound.setOutput(convolverNode);
            convolverNode.connect(this.audioCtx.destination);

            this.current.filteredSound.play();
            playFiltered.classList.add('playing');
          });
      } else if (!this.current.filteredSound.isPlaying) {
        this.current.filteredSound.play();
        playFiltered.classList.add('playing');
      } else {
        this.current.filteredSound.stop();
        playFiltered.classList.remove('playing');
      }
    });
  }

  onendedCallback() {
    // const { playRaw, playFiltered } = this.buttons;
    // playRaw.classList.remove('playing');
    // playFiltered.classList.remove('playing');
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
