import * as messaging from "messaging";
import * as figure from "./figure";

//msg types
export const AI_MOVE = "ai_move";
export const BOARD_DATA = "board_data";
export const SETTINGS_SYNC = "setting_sync";


export var receivMsgEvt = null; 
messaging.peerSocket.addEventListener("message", (evt) => {
  if(receivMsgEvt != null) {
    receivMsgEvt(evt);
  }  
});

export function sendMessage(type, data) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send({type: type, msg: data});
  }
}

export function isConnected() {
  return messaging.peerSocket.readyState === messaging.peerSocket.OPEN;
}


export function sendBoardData(board) {
  sendMessage(BOARD_DATA, board);    
}

export function sendAIMove(from, to) {
  var mv = {from: from, to: to};
  sendMessage(AI_MOVE, mv);
}

export function sendSettings(white) {
  sendMessage(SETTINGS_SYNC, {is_white: white});
}

export function requestSettingsSync() {
  sendMessage(SETTINGS_SYNC, null);
}



