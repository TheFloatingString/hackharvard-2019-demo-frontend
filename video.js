// Setting up global variables
// These are references to elements we need to work with.
let preview = document.getElementById("preview");
let recording = document.getElementById("recording");
let startButton = document.getElementById("startButton");
let stopButton = document.getElementById("stopButton");
let downloadButton = document.getElementById("downloadButton");
let logElement = document.getElementById("log");

// recordingTimeMS, is set to 5000 milliseconds (5 seconds);
// this specifies the length of the videos we'll record
let recordingTimeMS = 5000;

// The log() function is used to output text strings to a <div>
// so we can share information with the user.
function log(msg) {
  logElement.innerHTML += msg + "\n";
}

// The wait() function returns a new Promise which resolves once the specified
// number of milliseconds have elapsed.
// works by using an arrow function which calls window.setTimeout(),
// specifying the promise's resolution handler as the timeout handler function.
// That lets us use promise syntax when using timeouts,
// which can be very handy when chaining promises
// We'll see later.
function wait(delayInMS) {
  return new Promise(resolve => setTimeout(resolve, delayInMS));
}

// The startRecording() function handles starting the recording process:
// startRecording() takes two input parameters: a MediaStream to record from
// and the length in milliseconds of the recording to make
function startRecording(stream, lengthInMS) {
  let recorder = new MediaRecorder(stream);
  let data = [];

  recorder.ondataavailable = event => data.push(event.data);
  recorder.start();
  log(recorder.state + " for " + (lengthInMS/1000) + " seconds...");

  let stopped = new Promise((resolve, reject) => {
    recorder.onstop = resolve;
    recorder.onerror = event => reject(event.name);
  });

  let recorded = wait(lengthInMS).then(
    () => recorder.state == "recording" && recorder.stop()
  );

  return Promise.all([
    stopped,
    recorded
  ])
  .then(() => data);
}


//The stop() function simply stops the input media:

//This works by calling MediaStream.getTracks(),
//using forEach() to call MediaStreamTrack.stop() on each track in the stream.
function stop(stream) {
  stream.getTracks().forEach(track => track.stop());
}


//Getting an input stream and setting up the recorder

//our event handler for clicks on the start button:
startButton.addEventListener("click", function() {
  navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  }).then(stream => {
    preview.srcObject = stream;
    downloadButton.href = stream;

    //we arrange for preview.captureStream() to call preview.mozCaptureStream()
    //so that our code will work on Firefox,
    //on which the MediaRecorder.captureStream() method is prefixed
    preview.captureStream = preview.captureStream || preview.mozCaptureStream;

    return new Promise(resolve => preview.onplaying = resolve);
  }).then(() => startRecording(preview.captureStream(), recordingTimeMS))
  .then (recordedChunks => {
    let recordedBlob = new Blob(recordedChunks, { type: "video/webm" });
    recording.src = URL.createObjectURL(recordedBlob);
    downloadButton.href = recording.src;
    downloadButton.download = "RecordedVideo.webm";

    log("Successfully recorded " + recordedBlob.size + " bytes of " +
        recordedBlob.type + " media.");
  })
  .catch(log);
}, false);



// Handling the stop button
// The last bit of code adds a handler for the click event
// on the stop button using addEventListener():
stopButton.addEventListener("click", function() {
  stop(preview.srcObject);
}, false);


.row-about{display:flex;flex-wrap:wrap;margin-right:-15px;margin-left:-15px;border-style:solid;border-width:thick;background-color:white;}
