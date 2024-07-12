import {constants} from "./constants.js";
import {DOM} from "./dom.js";

export default class ScreenRecorder {
  constructor() {
    this.blob = null;
    this.videoStream = null;
    this.mediaRecorder = null;
  }

  async start() {
    if (!navigator.mediaDevices.getDisplayMedia) {
      throw new Error('Screen capturing not supported in your browser.');
    }

    if (this.videoStream?.active) {
      throw new Error('There is an ongoing recording. Please stop it before recording a new one.');
    }

    try {
      this.videoStream = await this.getMediaStreams();

      this.recordStream();
    } catch (error) {
      console.error('Error starting screen capture:', error);
      throw error;
    }
  }

  async getMediaStreams() {
    const videoStream = await navigator.mediaDevices.getDisplayMedia({
      audio: true,
      surfaceSwitching: 'include'
    });

    const audioStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100,
        suppressLocalAudioPlayback: false
      }
    });

    const audioTrack = audioStream.getTracks()[0];
    videoStream.addTrack(audioTrack);

    return videoStream;
  }

  countdown() {
    DOM.countDownElement.style.display = 'grid';

    let count = constants.COUNTDOWN_DURATION;

    function reduceCount() {
      DOM.countDownElement.textContent = count;
      count--;

      if (count >= 0) {
        setTimeout(reduceCount, 1000);
      } else {
        DOM.countDownElement.style.display = 'none';
      }
    }

    reduceCount();
  }

  recordStream() {
    this.countdown();

    this.mediaRecorder = new MediaRecorder(this.videoStream, {mimeType: constants.MIME_TYPE});
    const recordedChunks = [];

    this.mediaRecorder.addEventListener('dataavailable', (e) => recordedChunks.push(e.data));

    this.videoStream.getVideoTracks()[0].addEventListener('ended', () => this.stopRecording());

    this.mediaRecorder.addEventListener('stop', () => {
      this.createVideoBlob(recordedChunks);
      this.showRecordedVideo();
    });

    setTimeout(() => this.mediaRecorder.start(constants.RECORDING_INTERVAL), constants.RECORDING_DELAY);
  }

  stopRecording() {
    this.mediaRecorder.stop();
    this.videoStream.getAudioTracks()[0].stop();
  }

  createVideoBlob(recordedChunks) {
    this.blob = new Blob(recordedChunks, {type: recordedChunks[0].type});
  }

  showRecordedVideo() {
    DOM.video.src = URL.createObjectURL(this.blob);
    this.calculateVideoDuration();
  }

  calculateVideoDuration() {
    DOM.video.addEventListener('loadedmetadata', () => {
      if (DOM.video.duration === Infinity) {
        DOM.video.currentTime = 1e101;
        DOM.video.addEventListener('timeupdate', () => {
          DOM.video.currentTime = 0;
        }, {once: true});
      }
    });
  }

  prepareDownload() {
    const fileName = prompt('What is the name of your video?') || 'screen_recording';

    DOM.downloadLink.href = URL.createObjectURL(this.blob);
    DOM.downloadLink.download = `${fileName}${constants.FILE_EXTENSION}`;
    DOM.downloadLink.type = constants.MIME_TYPE;
  }
}
