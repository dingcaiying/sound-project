import Recorder from 'recorder-js';

window.Recorder = Recorder;

class MyRecorder {

  // audio context; stream from `navigator.mediaDevices.getUserMedia`
  constructor(context, stream) {
    this.context = context;
    this.recorder = new Recorder(this.context, {
      // onAnalysed: data => console.log(data),
    });
    window.recorder = this.recorder;
    this.stream = stream;
    this.isRecording = false;
    this.blob = null;
    this.buffer = null;
    this.setup();
  }

  setup() {
    this.recorder.init(this.stream);
  }

  startRecording() {
    if (this.isRecording) return Promise.resolve(); // if isRecording return directly
    return this.recorder.start()
      .then(() => this.isRecording = true);
  }

  stopRecording() {
    if (!this.isRecording) return Promise.resolve(); // if !isRecording return directly
    return this.recorder.stop()
      .then(({blob, buffer}) => {
        this.isRecording = false;
        this.blob = blob;
        this.buffer = buffer;
        return Promise.resolve(buffer);
      });
  }

  download() {
    if (this.blob) {
      // this.recorder.download(this.blob, 'my recorded audio');
      Recorder.download(this.blob, 'recorded-audio');
    } else {
      throw new Error('no blob');
    }
  }

}


export default MyRecorder;
