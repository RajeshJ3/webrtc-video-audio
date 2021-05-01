const config = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
};

const peerConnection = new RTCPeerConnection(config);

const main = async () => {
  document
    .getElementById("submitAnswer")
    .addEventListener("click", submitAnswer);

  console.log("[Peer 1]");

  const remoteStream = new MediaStream();

  peerConnection.ontrack = (e) => {
    console.log("[TRACK ADDED]");
    remoteStream.addTrack(e.track);
  };

  const localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });

  const localVideo = document.getElementById("localVideo");
  localVideo.srcObject = localStream;

  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });

  const playRemoteVideo = () => {
    const remoteVideo = document.getElementById("remoteVideo");
    remoteVideo.srcObject = remoteStream;
  };

  const dataChannel = peerConnection.createDataChannel("channel");

  dataChannel.onopen = () => {
    var status = document.getElementById("status");
    status.innerHTML = '<span style="color: green;">CONNECTED</span>';

    playRemoteVideo();
    console.log("1. [OPEN]");
  };

  dataChannel.onclose = () => {
    var status = document.getElementById("status");
    status.innerHTML = '<span style="color: red;">NOT CONNECTED</span>';

    console.log("1. [CLOSE]");
  };

  dataChannel.onmessage = (msg) => {
    console.log("1. [MESSAGE]", msg.data);
  };

  peerConnection.onicecandidate = () => {
    console.log("1. [ICE-CANDIDATE]");
  };

  peerConnection
    .createOffer()
    .then((offer) => peerConnection.setLocalDescription(offer))
    .then(() => {
      console.log("1. [OFFER CREATED]");
      let offerTextArea = document.getElementById("offer");
      offerTextArea.innerHTML = JSON.stringify(peerConnection.localDescription);
    });
};

const submitAnswer = () => {
  let answer = document.getElementById("answer").value;
  peerConnection.setRemoteDescription(JSON.parse(answer));
};

main();
