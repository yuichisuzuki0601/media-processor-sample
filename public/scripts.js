import YsdMediaProcessor from './ysd/YsdMediaProcessor.js';

// document.querySelectorとaddEventListener書くのがめんどいからショートカットを用意しとく
const element = (query) => {
	const result = document.querySelector(query);
	result.on = result.addEventListener;
	return result;
};

const mediaProcessor = new YsdMediaProcessor();

// volume
const volumeBox = mediaProcessor.getVolumeBox();

element('#fade-in-duration').value = volumeBox.getFadeInDuration();

element('#fade-out-start-time').value = volumeBox.getFadeOutStartTime();
element('#fade-out-duration').value = volumeBox.getFadeOutDuration();

element('#cut-start-time').value = volumeBox.getCutStartTime();
element('#cut-end-time').value = volumeBox.getCutEndTime();

element('#switch-fade-in').on('click', () => {
	mediaProcessor.toggleFadeIn();
	element('#fade-in-status').innerText = volumeBox.isOnFadeIn() ? 'ON' : 'OFF';
});

element('#switch-fade-out').on('click', () => {
	mediaProcessor.toggleFadeOut();
	element('#fade-out-status').innerText = volumeBox.isOnFadeOut() ? 'ON' : 'OFF';
});

element('#switch-cut').on('click', () => {
	mediaProcessor.toggleCut();
	element('#cut-status').innerText = volumeBox.isOnCut() ? 'ON' : 'OFF';
});

element('#fade-in-duration').on('change', (e) => {
	volumeBox.setFadeInDuration(Number(e.target.value));
});

element('#fade-out-start-time').on('change', (e) => {
	volumeBox.setFadeOutStartTime(Number(e.target.value));
});

element('#fade-out-duration').on('change', (e) => {
	volumeBox.setFadeOutDuration(Number(e.target.value));
});

element('#cut-start-time').on('change', (e) => {
	volumeBox.setCutStartTime(Number(e.target.value));
});

element('#cut-end-time').on('change', (e) => {
	volumeBox.setCutEndTime(Number(e.target.value));
});

// delay
const delayBox = mediaProcessor.getDelayBox();

element('#delay-time').value = delayBox.getDelayTime();
element('#delay-feedback').value = delayBox.getFeedback();

element('#switch-delay').on('click', () => {
	mediaProcessor.toggleDelay();
	element('#delay-status').innerText = delayBox.isOn() ? 'ON' : 'OFF';
});

element('#delay-time').on('change', (e) => {
	delayBox.setDelayTime(Number(e.target.value));
});

element('#delay-feedback').on('change', (e) => {
	delayBox.setFeedback(Number(e.target.value));
});

// convolverReverb
const convolverReverbBox = mediaProcessor.getConvolverReverbBox();

const reverbTypes = convolverReverbBox.getReverbTypes();
for (let i = 0; i < reverbTypes.length; ++i) {
	const type = reverbTypes[i];
	const option = document.createElement('option');
	option.value = type;
	element('#c-reverb-type').appendChild(option).appendChild(document.createTextNode(type));
}

element('#c-reverb-type').value = convolverReverbBox.getReverbType();
element('#c-reverb-gain').value = convolverReverbBox.getOutputGain();

element('#switch-c-reverb').on('click', () => {
	mediaProcessor.toggleConvolverReverb();
	element('#c-reverb-status').innerText = convolverReverbBox.isOn() ? 'ON' : 'OFF';
});

element('#c-reverb-type').on('change', (e) => {
	convolverReverbBox.setReverbType(e.target.value);
});

element('#c-reverb-gain').on('change', (e) => {
	convolverReverbBox.setOutputGain(Number(e.target.value));
});

// schroederReverb
const schroederReverbBox = mediaProcessor.getSchroederReverbBox();

element('#d-reverb-gain').value = schroederReverbBox.getOutputGain();

element('#switch-d-reverb').on('click', () => {
	mediaProcessor.toggleSchroederReverb();
	element('#d-reverb-status').innerText = schroederReverbBox.isOn() ? 'ON' : 'OFF';
});

element('#d-reverb-gain').on('change', (e) => {
	schroederReverbBox.setOutputGain(Number(e.target.value));
});

// !!!new!!! download
element('#download').on('click', () => {
	const style = element('#loading').style;
	style.display = 'block';
	mediaProcessor.export().then(() => {
		style.display = 'none';
	});
});

// おまけ weveDrawing
const waveDrawingModes = mediaProcessor.getWaveDrawingModes();
for (let i = 0; i < waveDrawingModes.length; ++i) {
	const mode = waveDrawingModes[i];
	const option = document.createElement('option');
	option.value = mode;
	element('#wave-drawing-mode').appendChild(option).appendChild(document.createTextNode(mode));
}

element('#wave-drawing-mode').value = mediaProcessor.getWaveDrawingMode();

element('#wave-drawing-mode').on('change', (e) => {
	mediaProcessor.setWaveDrawingMode(e.target.value);
});

mediaProcessor.setWaveDrawingTarget('#wave-canvas');

// おまけ recordDiwnload
if(window.MediaRecorder) {
	mediaProcessor.setOnRecordingFinishedCallback((dataUrl) => {
		document.querySelector('#recorded-audio').src = dataUrl;
		document.querySelector('#recorded-anchor').href = dataUrl;
	});
} else {
	element('#warn-media-recorder').innerText = 'レコーダーがサポートされていないブラウザです';
}

// load audio from server
const req = new XMLHttpRequest();
req.open('GET', 'drum.wav', true);
req.responseType = 'arraybuffer';
req.onload = function() {
	mediaProcessor.setArrayBuffer(req.response).then(() => {
		element('#start').disabled = false;
	});
}
req.send();

// set audio
element('#file').on('change', (e) => {
	const file = e.target.files[0];
	if (file) {
		mediaProcessor.setAudioFile(file).then(() => {
			element('#start').disabled = false;
		});
	}
});

// on start
element('#start').on('click', () => {
	// ※ボリューム関連の設定は再生中に行ってもリアルタイムに反映されないので操作不可にすると良い
	element('#switch-fade-in').disabled = true;
	element('#fade-in-duration').disabled = true;
	element('#switch-fade-out').disabled = true;
	element('#fade-out-start-time').disabled = true;
	element('#fade-out-duration').disabled = true;
	element('#switch-cut').disabled = true;
	element('#cut-start-time').disabled = true;
	element('#cut-end-time').disabled = true;

	element('#start').disabled = true;
	element('#stop').disabled = false;

	mediaProcessor.setOnPlayTimeIncrementedCallback((playTime) => {
		element('#play-time').innerText = playTime;
	});

	mediaProcessor.start();

	mediaProcessor.setOnEndedCallback((playTime) => {
		element('#switch-fade-in').disabled = false;
		element('#fade-in-duration').disabled = false;
		element('#switch-fade-out').disabled = false;
		element('#fade-out-start-time').disabled = false;
		element('#fade-out-duration').disabled = false;
		element('#switch-cut').disabled = false;
		element('#cut-start-time').disabled = false;
		element('#cut-end-time').disabled = false;

		element('#start').disabled = false;
		element('#stop').disabled = true;
		element('#play-time').innerText = playTime;
	});
});

// on stop
element('#stop').on('click', () => {
	mediaProcessor.stop();
});