import * as messaging from "messaging";
import * as figure from "./figure";


export var receivMsgEvt = null; 
messaging.peerSocket.addEventListener("message", (evt) => {
  if(receivMsgEvt != null) {
    receivMsgEvt(evt);
  }  
});

export function sendMessage(data) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(data);
  }
}

export function isConnected() {
  return messaging.peerSocket.readyState === messaging.peerSocket.OPEN;
}


export function sendBoardData(board) {
  sendMessage(board);    
}

export function sendAIMove(from, to) {
  var mv = {from: from, to: to};
  sendMessage(mv);
}


