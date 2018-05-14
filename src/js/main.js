import './../scss/main.scss';
import './../index.html';
import Sound from './Audio/Sound';

// load assets
function requireAll(r) { r.keys().forEach(r); }
requireAll(require.context('../assets/', true));

const musicUrls = [
  './assets/music/35.2.7.mp3',
  './assets/music/example.mp3',
  './assets/music/35.2.6.mp3',
  './assets/music/35.1.8.mp3',
];

let container, stats;
let camera, scene, renderer, particles, particle;
let ambientLight, particleLight; // particleLight: mesh contain pointLight, make light visible
let mouseX = 0, mouseY = 0;
let count = 0;

let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

let raycaster, mouse;

let sound;
let analyser, freqByteData;
let panner;
let rad = 0;
let waveDataType = 'freq';

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const sceneHeight = 2000;
const cameraRatio = window.innerWidth / window.innerHeight;
const sceneWidth = cameraRatio * sceneHeight;

initSound()
  .then(initScene)
  .then(bindEvent)
  .then(animate);

// scene size: height: 2000, width: cameraRatio * height
function initScene() {
  container = document.createElement('div');
  document.body.appendChild(container);

  camera = new THREE.PerspectiveCamera(75, cameraRatio, 1, 3000);
  camera.position.z = sceneHeight / (2 * Math.atan(75 / 2));

  scene = new THREE.Scene();

  ambientLight = new THREE.AmbientLight(0x666666);
  scene.add(ambientLight);

  // var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  // directionalLight.position.set(1, 1, 1).normalize();
  // scene.add(directionalLight);

  var pointLight = new THREE.PointLight(0xffffff, 5, 800);
  particleLight = new THREE.Mesh(new THREE.SphereBufferGeometry(8, 32, 32), new THREE.MeshBasicMaterial({ color: 0xffffff } ));
  particleLight.position.set(0, 0, 0);
  particleLight.add(pointLight);
  scene.add(particleLight);


  particles = new Array();

  for (let i = 0; i < freqByteData.length; i++) {
    const material = new THREE.MeshPhongMaterial({
      color: Math.random() * 0x808008 + 0x808080,
      shininess: 50
    });
    particle = particles[i] = new THREE.Mesh(new THREE.CircleGeometry(5, 64), material);

    particle.position.x = randomNumberInRange(-sceneWidth / 2 + 100, sceneWidth / 2 - 100);
    particle.position.y = randomNumberInRange(-sceneHeight / 2 + 100, sceneHeight / 2 - 100);
    particle.position.z = randomNumberInRange(-camera.position.z, camera.position.z); // camera.position.z > 0
    scene.add(particle);
  }

  // intersection
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);
  return Promise.resolve();
}

function initSound(url = musicUrls[0]) {
  return loadSound(url).then(buffer => {
    sound = new Sound(audioCtx, buffer);

    panner = audioCtx.createPanner();

    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 128;

    sound.setOutput(panner);
    panner.connect(analyser);
    analyser.connect(audioCtx.destination);

    freqByteData = new Uint8Array(analyser.frequencyBinCount);

    sound.play();
  });
}

function render() {
  count++;
  // camera.position.x += (mouseX - camera.position.x) * 0.05;
  // camera.position.y += (- mouseY - camera.position.y) * 0.05;
  // camera.lookAt(scene.position);

  rad += 1;
  if (rad > 360) rad -= 360;
  const nx = Math.sin(rad * Math.PI / 180);
  const ny = Math.cos(rad * Math.PI / 180);
  const nz = Math.cos(rad * Math.PI / 180);
  particleLight.position.x = nx * 300;
  particleLight.position.y = ny * 300;
  particleLight.lookAt(scene.position);
  panner.setPosition(nx, ny, nz);

  updateFFT();

  let scaler;
  for (let i = 0; i < freqByteData.length; i ++) {
    particle = particles[i];
    scaler = freqByteData[i] / 20 + 1;
    particle.scale.x = particle.scale.y = scaler;
    // if (count % 100 > 0) console.log('scaler', scaler);
  }

  renderer.render(scene, camera);
}

function animate() {
  requestAnimationFrame(animate);
  render();
}

function onDocumentMouseDown(event) {
  event.preventDefault();
  mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
  mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  var intersects = raycaster.intersectObjects(scene.children);
  if (intersects.length) {
    sound.stop();
    initSound(musicUrls[Math.floor(randomNumberInRange(0, 4))]);
  }
}

function updateFFT() {
  if (waveDataType === 'freq') {
    analyser.getByteFrequencyData(freqByteData);
  } else {
    analyser.getByteTimeDomainData(freqByteData);
  }
}

function loadSound(url) {
  return new Promise((resolve, reject) => {
    let request = new XMLHttpRequest();
    request.open('get', url, true);
    request.responseType = 'arraybuffer';
    request.onload = function() {
      audioCtx.decodeAudioData(request.response, buffer => {
        // received buffer
        resolve(buffer);
      }, error => {
        reject('get audio source error: ', error);
      });
    };
    request.send();
  });
}

function bindEvent() {
  document.getElementById('btn_start').addEventListener('click', () => {
    if (sound) {
      console.log('has sound and play');
      sound.play();
    }
  });
  document.getElementById('btn_stop').addEventListener('click', () => {
    if (sound) {
      console.log('has sound and stop');
      sound.stop();
    }
  });
  document.getElementById('btn_ft').addEventListener('click', () => {
    if (sound) {
      if (waveDataType === 'freq') waveDataType = 'time';
      else waveDataType = 'freq';
      console.log('switch freq / time, changed to ', waveDataType);
    }
  });

  // intersection
  document.addEventListener('dblclick', onDocumentMouseDown, false);
}

function randomNumberInRange(min, max) {
  return Math.random() * (max - min) + min;
}
