// https://css-tricks.com/introduction-web-audio-api/

class Sound {

  // options: { destinationNode }
  constructor(context, buffer, options = {}) {
    this.context = context;
    this.buffer = buffer;
    this.source = null;
    this.gainNode = null;
    this.destinationNode = context.destination;
  }

  setup() {
    this.source = this.context.createBufferSource();
    this.source.buffer = this.buffer;
    this.source.loop = false;
    this.gainNode = this.context.createGain();
    this.source.connect(this.gainNode);
    this.gainNode.connect(this.destinationNode);
  }

  // setOutput(node) {
  //   if (node) {
  //     this.destinationNode = node;
  //     this.destinationNode.connet(context.destination);
  //   } else {
  //     this.destinationNode = context.destination;
  //   }
  // }
  connect(node) {}

  play() {
    this.setup();
    this.source.start();
  }  

  stop() {
    this.gainNode.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.5);
    this.source.stop(this.context.currentTime + 0.5);
  }

}

export default Sound;
