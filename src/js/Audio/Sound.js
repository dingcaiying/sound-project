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
    // source properies
    this.sourcePropperties = {};
    if (typeof options.playbackRate === 'number') {
      this.sourcePropperties.playbackRate =  options.playbackRate;
    }
    this.compressor = this.context.createDynamicsCompressor();
    this.compressor.connect(this.context.destination);
    this.bgSound = options.bgSound;
    if (this.bgSound) this.bgSound.setOutput(this.compressor);
  }

  setup() {
    this.source = this.context.createBufferSource();
    this.source.buffer = this.buffer;
    this.source.loop = true;
    Object.keys(this.sourcePropperties).forEach(k => {
      this.source[k].value = this.sourcePropperties[k];
    });

    this.gainNode = this.context.createGain();
    // this.gainNode.gain.value = 0;
    this.source.connect(this.gainNode);

    // with bg sound or not
    if (this.bgSound) {
      this.destinationNode = this.compressor;
    }

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
    if (this.bgSound) this.bgSound.play();
  }

  stop() {
    this.gainNode.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.5);
    this.source.stop(this.context.currentTime + 0.5);
    this.isPlaying = false;
    this.playButton && this.playButton.classList.remove('playing');
    if (this.bgSound) this.bgSound.stop();
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
