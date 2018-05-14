// https://css-tricks.com/introduction-web-audio-api/

class Sound {

  constructor(context, buffer) {
    this.context = context;
    this.buffer = buffer;
    this.source = null;
    this.gainNode = null;
    this.destinationNode = context.destination;
  }

  setup() {
    this.source = this.context.createBufferSource();
    this.source.buffer = this.buffer;
    this.source.loop = true;
    this.gainNode = this.context.createGain();
    this.source.connect(this.gainNode);
  }

  setOutput(node) {
    this.destinationNode = node;
  }

  play() {
    this.setup();
    this.gainNode.connect(this.destinationNode);
    this.source.start();
  }  

  stop() {
    this.gainNode.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.5);
    this.source.stop(this.context.currentTime + 0.5);
  }

}

export default Sound;
