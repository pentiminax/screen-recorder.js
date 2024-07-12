import ScreenRecorder from "./ScreenRecorder.js";
import {DOM} from "./dom.js";

const screenCapture = new ScreenRecorder();

DOM.startBtn.addEventListener('click', async () => {
  try {
    await screenCapture.start();
  } catch (error) {
    alert(error.message);
  }
});

DOM.downloadLink.addEventListener('click', () => screenCapture.prepareDownload());
