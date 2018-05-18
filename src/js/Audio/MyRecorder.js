import Recorder from 'recorder-js';

class MyRecorder {

  // audio context; stream from `navigator.mediaDevices.getUserMedia`
  constructor(context, stream) {
    this.context = context;
    this.recorder = new Recorder(this.context, {
      // onAnalysed: data => console.log(data),
    });
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
      .then(() => this.isRecording = true));
  }

  stopRecording() {
    if (!this.isRecording) return Promise.resolve(); // if !isRecording return directly
    return recorder.stop()
      .then(({blob, buffer}) => {
        this.isRecording = false;
        this.blob = blob;
        this.buffer = buffer;
      }));
  }

  download() {
    if (this.blob) {
      Recorder.download(this.blob, 'my recorded audio');
    } else {
      throw new Error('no blob');
    }
  }

}


export default MyRecorder;
