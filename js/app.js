import ScreenCapture from "./ScreenCapture.js";
import {DOM} from "./dom.js";

const screenCapture = new ScreenCapture();

DOM.startBtn.addEventListener('click', async () => {
  try {
    await screenCapture.start();
  } catch (error) {
    alert(error.message);
  }
});

DOM.downloadLink.addEventListener('click', () => screenCapture.prepareDownload());
