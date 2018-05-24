import './../scss/main.scss';
import './../index.html';
import App from './App';

// load assets
function requireAll(r) { r.keys().forEach(r); }
requireAll(require.context('../assets/', true));

const app = new App();

// app.init();

app.initWithSampleSound();
