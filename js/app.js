import ScreenRecorder from "./ScreenRecorder.js";
import {DOM} from "./dom.js";

const screenRecorder = new ScreenRecorder();

DOM.startBtn.addEventListener('click', async () => {
    try {
        await screenRecorder.start();
    } catch (error) {
        alert(error.message);
    }
});

DOM.downloadLink.addEventListener('click', () => screenRecorder.prepareDownload());
