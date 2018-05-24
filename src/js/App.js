import Sound from './Audio/Sound';
import MyRecorder from './Audio/MyRecorder';
import { loadSound } from './utils/helper';

class App {

  constructor() {
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.sound = null;
    this.myReco = null;
    this.buttons = {
      start: document.getElementById('btn_start_record'),
      stop: document.getElementById('btn_stop_record'),
      play: document.getElementById('btn_play_record'),
    };
    this.rad = 0;
    this.initWithSampleSound = this.initWithSampleSound.bind(this);
  }

  init() {
    this.disableButtons();
    navigator.mediaDevices.getUserMedia({audio: true})
      .then(stream => {
        this.myReco = new MyRecorder(this.audioCtx, stream);
        this.enableButton('start');
      })
      .catch(err => console.log('Uh oh... unable to get stream...', err));
    this.bindEvent();
  }

  initWithSampleSound() {
    Promise.all([loadSound(this.audioCtx), loadSound(this.audioCtx, '/assets/music/juanji-shandong.wav')]).then(([buffer, cBuffer]) => {
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
    const btnStart = this.buttons.start;
    const btnStop = this.buttons.stop;
    const btnPlay = this.buttons.play;
    btnStart.addEventListener('click', () => {
      this.myReco.startRecording()
        .then(() => {
          this.enableButton('stop');
        });
    });
    btnStop.addEventListener('click', () => {
      console.log('stop');
      this.myReco.stopRecording()
        .then(buffers => {
          const newBuffer = this.audioCtx.createBuffer(2, buffers[0].length, this.audioCtx.sampleRate);
          newBuffer.getChannelData(0).set(buffers[0]);
          newBuffer.getChannelData(1).set(buffers[1]);
          this.sound = new Sound(this.audioCtx, newBuffer);
          this.enableButton('play');
        });
    });

    btnPlay.addEventListener('click', () => {
      if (!this.sound) return;
      console.log('this.sound.isPlaying', this.sound.isPlaying);
      if (!this.sound.isPlaying) this.sound.play();
      else this.sound.stop();
    });
  }

  disableButtons() {
    Object.keys(this.buttons).forEach(key => {
      this.buttons[key].disabled = true;
    });
  }

  disableButton(name) {
    Object.keys(this.buttons).forEach(key => {
      this.buttons[key].disabled = false;
    });
    this.buttons[name].disabled = true;
  }

  enableButtons() {
    Object.keys(this.buttons).forEach(key => {
      this.buttons[key].disabled = false;
    });
  }

  enableButton(name) {
    Object.keys(this.buttons).forEach(key => {
      this.buttons[key].disabled = true;
    });
    this.buttons[name].disabled = false;
  }
}

export default App;
