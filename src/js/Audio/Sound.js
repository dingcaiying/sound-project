// https://css-tricks.com/introduction-web-audio-api/

class Sound {

  constructor(context, buffer, options = {}) {
    this.context = context;
    this.buffer = buffer;
    this.source = null;
    this.gainNode = null;
    this.destinationNode = context.destination;
    this.isPlaying = false;
    this.onended = options.onended;
    this.playButton = options.button;
  }

  setup() {
    this.source = this.context.createBufferSource();
    this.source.buffer = this.buffer;
    this.source.loop = true;
    this.gainNode = this.context.createGain();
    // this.gainNode.gain.value = 0;
    this.source.connect(this.gainNode);

    this.bindEvent();
  }

  setOutput(node) {
    this.destinationNode = node;
  }

  applyPattern() {}

  play() {
    this.setup();
    this.gainNode.connect(this.destinationNode);
    this.source.start();
    this.isPlaying = true;
    this.playButton && this.playButton.classList.add('playing');
  }

  stop() {
    this.gainNode.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.5);
    this.source.stop(this.context.currentTime + 0.5);
    this.isPlaying = false;
    this.playButton && this.playButton.classList.remove('playing');
  }

  bindEvent() {
    this.source.onended = () => {
      this.isPlaying = false;
      this.playButton && this.playButton.classList.remove('playing');
      if (this.onended) this.onended() ;
    };
  }

}

export default Sound;
