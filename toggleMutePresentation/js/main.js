/*
 *  Copyright (c) 2017 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

'use strict';

const startButton = document.getElementById('startButton');
const callButton = document.getElementById('callButton');
const hangupButton = document.getElementById('hangupButton');
callButton.disabled = true;
hangupButton.disabled = true;
startButton.onclick = start;
callButton.onclick = call;
hangupButton.onclick = hangup;

let startTime;
let videoIsOn = true;
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');

localVideo.addEventListener('loadedmetadata', function() {
    console.log(`Local video videoWidth: ${this.videoWidth}px,  videoHeight: ${this.videoHeight}px`);
});

remoteVideo.addEventListener('loadedmetadata', function() {
    console.log(`Remote video videoWidth: ${this.videoWidth}px,  videoHeight: ${this.videoHeight}px`);
});

remoteVideo.onresize = () => {
    console.log(`Remote video size changed to ${remoteVideo.videoWidth}x${remoteVideo.videoHeight}`);
    console.log('RESIZE', remoteVideo.videoWidth, remoteVideo.videoHeight);
    // We'll use the first onsize callback as an indication that video has started
    // playing out.
    if (startTime) {
        const elapsedTime = window.performance.now() - startTime;
        console.log(`Setup time: ${elapsedTime.toFixed(3)}ms`);
        startTime = null;
    }
};

let localStream = undefined;
let fakeStream  = undefined;
let remoteStream = undefined;
let pc1;
let pc2;
const offerOptions = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1
};


function getName(pc) {
    return (pc === pc1) ? 'pc1' : 'pc2';
}

function getOtherPc(pc) {
    return (pc === pc1) ? pc2 : pc1;
}

function gotStream(stream) {
    console.log('Received local stream');
    localVideo.srcObject = stream;
    localStream = stream;

    if (fakeStream) {
        callButton.disabled = false;
    }
}

function gotFakeStream(stream) {
    console.log('Received fake stream');
    fakeStream = stream;

    if (localStream) {
        callButton.disabled = false;
    }
}

function start() {
    console.log('Requesting local stream');
    startButton.disabled = true;
    navigator.mediaDevices
        .getUserMedia({
            audio: true,
            video: videoIsOn
        })
        .then(gotStream)
        .catch(e => alert(`getUserMedia() error: ${e.name}`));

    /*For remote peerconnection*/
    navigator.mediaDevices
        .getUserMedia( {
            audio: false,
            video: true,
            fake: true
        })
        .then(gotFakeStream)
        .catch(e => alert(`getUserMedia() fake stream error: ${ e.name }`));
}

function call() {
    callButton.disabled = true;
    hangupButton.disabled = false;
    console.log('Starting call');
    startTime = window.performance.now();
    const audioTracks = localStream.getAudioTracks();
    if (audioTracks.length > 0) {
        console.log(`Using audio device: ${audioTracks[0].label}`);
    }
    const servers = null;
    pc1 = new RTCPeerConnection(servers);
    console.log('Created local peer connection object pc1');
    pc1.onicecandidate = e => onIceCandidate(pc1, e);

    pc2 = new RTCPeerConnection(servers);
    console.log('Created remote peer connection object pc2');
    pc2.onicecandidate = e => onIceCandidate(pc2, e);
    pc1.oniceconnectionstatechange = e => onIceStateChange(pc1, e);
    pc2.oniceconnectionstatechange = e => onIceStateChange(pc2, e);
    pc2.ontrack = gotRemoteStream;

    pc1.onaddstream = function (evt) {
        console.warn("__on_add_stream 添加流", evt.stream);
    };
    pc1.onremovestream = function (evt) {
        console.warn("__on_remove_stream 删除流");
    }

    console.log('Added local stream to pc1');
    // pc1.addStream(localStream);
    // pc2.addStream(fakeStream);
    localStream.getTracks().forEach(track => pc1.addTrack(track, localStream));
    fakeStream.getVideoTracks().forEach(track => pc2.addTrack(track, fakeStream));

    console.log('pc1 createOffer start');
    pc1.createOffer(offerOptions).then(onCreateOfferSuccess, onCreateSessionDescriptionError);
}

function onCreateSessionDescriptionError(error) {
    console.log(`Failed to create session description: ${error.toString()}`);
}

var saveMsid;
var lines;
var newLinesForBitrate;
function onCreateOfferSuccess(desc) {
    console.log('pc1 setLocalDescription start');
    console.log(`create Offer之后的sdp :\n${desc.sdp}`);

    // Bug 139880：chrome 52&opera36 暂停演示后继续演示不再发流，（chrome60+/opera47+后正常）
    if( adapter.browserDetails.version <= 60){
        lines = desc.sdp.split("\n");
        if(!saveMsid){
            console.log("保存部分sdp，以备后用");
            saveMsid = lines.slice(lines.length - 10, lines.length);
        }else {
            console.warn("sdp 替换");
            newLinesForBitrate = lines.slice(0, -10);
            desc.sdp = newLinesForBitrate.concat(saveMsid).join("\n");
        }
    }
    console.warn(`修改后的sdp： \n${desc.sdp}`);


    pc1.setLocalDescription(desc).then(() => onSetLocalSuccess(pc1), onSetSessionDescriptionError);
    console.log('pc2 setRemoteDescription start');
    pc2.setRemoteDescription(desc).then(() => onSetRemoteSuccess(pc2), onSetSessionDescriptionError);
    console.log('pc2 createAnswer start');
    // Since the 'remote' side has no media stream we need
    // to pass in the right constraints in order for it to
    // accept the incoming offer of audio and video.
    pc2.createAnswer().then(onCreateAnswerSuccess, onCreateSessionDescriptionError);
}

function onSetLocalSuccess(pc) {
    console.log(`${getName(pc)} setLocalDescription complete`);
}

function onSetRemoteSuccess(pc) {
    console.log(`${getName(pc)} setRemoteDescription complete`);
}

function onSetSessionDescriptionError(error) {
    console.log(`Failed to set session description: ${error.toString()}`);
}

function gotRemoteStream(e) {
    console.warn('gotRemoteStream', e.track, e.streams[0]);

    // reset srcObject to work around minor bugs in Chrome and Edge.
    remoteVideo.srcObject = null;

    if (!remoteStream) {
        if ( e.streams[0] ) {
            remoteStream = e.streams[0];
        } else {
            //For work around in Safari
            var newStream = new MediaStream();
            newStream.addTrack(e.track);
            remoteStream = newStream;
        }
        //remoteVideo.srcObject = remoteStream;
    } else {
        remoteStream.addTrack(e.track);
        //remoteVideo.srcObject = e.track.getSources();
    }

    remoteVideo.srcObject = remoteStream;
}

function onCreateAnswerSuccess(desc) {
    console.log(`Answer from pc2:
${desc.sdp}`);
    console.log('pc2 setLocalDescription start');
    pc2.setLocalDescription(desc).then(() => onSetLocalSuccess(pc2), onSetSessionDescriptionError);
    console.log('pc1 setRemoteDescription start');
    pc1.setRemoteDescription(desc).then(() => onSetRemoteSuccess(pc1), onSetSessionDescriptionError);
}

function onIceCandidate(pc, event) {
    getOtherPc(pc)
        .addIceCandidate(event.candidate)
        .then(() => onAddIceCandidateSuccess(pc), err => onAddIceCandidateError(pc, err));
    //console.log(`${getName(pc)} ICE candidate:\n${event.candidate ? event.candidate.candidate : '(null)'}`);
}

function onAddIceCandidateSuccess(pc) {
    //console.log(`${getName(pc)} addIceCandidate success`);
}

function onAddIceCandidateError(pc, error) {
    //console.log(`${getName(pc)} failed to add ICE Candidate: ${error.toString()}`);
}

function onIceStateChange(pc, event) {
    if (pc) {
        console.log(`${getName(pc)} ICE state: ${pc.iceConnectionState}`);
        console.log('ICE state change event: ', event);
    }
}

function hangup() {
    console.log('Ending call');
    pc1.close();
    pc2.close();
    pc1 = null;
    pc2 = null;

    const tracks = localStream.getTracks();
    tracks.forEach(track => {
        track.stop();
        localStream.removeTrack(track);
    });
    localVideo.srcObject = null;
    localVideo.srcObject = localStream;
    localStream = null;

    hangupButton.disabled = true;
    callButton.disabled = false;
    startButton.disabled = false;
}


/***
 * mute/unmute 方式处理暂停情况
 * @param b_mute
 * 删除流后又添加流，视频黑屏，不发流
 * 原因：msid 改变了
 */
function isMuteStream(b_mute) {
    if((adapter.browserDetails.browser === 'chrome' && adapter.browserDetails.version <= 59) || (adapter.browserDetails.browser === 'opera' && adapter.browserDetails.version <= 46)){
        if( localStream.getVideoTracks().length > 0 ){
            for ( var i = 0; i < localStream.getVideoTracks().length; i++ ) {
                if (b_mute){
                    if ( localStream.getVideoTracks()[i].enabled === true ) {
                        console.log("MuteStream exec mute present");
                        localStream.getVideoTracks()[i].enabled = false;
                    }
                }
                else{
                    if ( localStream.getVideoTracks()[i].enabled === false ) {
                        console.log("MuteStream exec unmute present");
                        localStream.getVideoTracks()[i].enabled = true;
                    }
                }
            }
        }else{
            console.log('toggleMutePresentation: no local stream');
        }
    }else {
        if(b_mute){
            console.log("mute")
            if( adapter.browserDetails.version >= 72 && pc1.getTransceivers()[0]){
                pc1.getTransceivers()[0].direction = 'recvonly';
                pc1.getSenders()[0].replaceTrack(null);
            }else {
                pc1.removeStream(localStream);
            }
        }else {
            if( adapter.browserDetails.version >= 72 && pc1.getTransceivers()[0]){
                pc1.getSenders()[0].replaceTrack(localStream.getTracks()[0]);
                pc1.getTransceivers()[0].direction = 'sendrecv';
            }else {
                pc1.addStream(localStream);
                pc1.createOffer(offerOptions).then(onCreateOfferSuccess, onCreateSessionDescriptionError);
            }
        }
    }
}
