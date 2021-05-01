const config = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
};

const peerConnection = new RTCPeerConnection(config);

const main = async () => {
  document.getElementById("submitOffer").addEventListener("click", submitOffer);

  console.log("[Peer 2]");

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

  peerConnection.ondatachannel = (e) => {
    peerConnection.dataChannel = e.channel;

    peerConnection.dataChannel.onopen = () => {
      var status = document.getElementById("status");
      status.innerHTML = '<span style="color: green;">CONNECTED</span>';

      playRemoteVideo();

      console.log("2. [OPEN]");
    };

    peerConnection.dataChannel.onclose = () => {
      var status = document.getElementById("status");
      status.innerHTML = '<span style="color: red;">NOT CONNECTED</span>';

      console.log("2. [CLOSE]");
    };

    peerConnection.dataChannel.onmessage = (msg) => {
      console.log("2. [MESSAGE]: ", msg.data);
    };
  };

  peerConnection.onicecandidate = () => {
    let answerText = document.getElementById("answer");
    answerText.innerText = JSON.stringify(peerConnection.localDescription);

    console.log("2. [ICE-CANDIDATE]");
  };
};

const submitOffer = () => {
  offer = document.getElementById("offer").value;
  offer = JSON.parse(offer);

  peerConnection
    .setRemoteDescription(offer)
    .then(() => console.log("2. [OFFER SET]"));

  peerConnection
    .createAnswer()
    .then((ans) => peerConnection.setLocalDescription(ans))
    .then(() => {
      let answerText = document.getElementById("answer");
      answerText.innerText = JSON.stringify(peerConnection.localDescription);
    });
  console.log("2. [ANSWER CREATED]");
};

main();
