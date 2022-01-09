/*
 * Entry point for the companion app
 */

import { settingsStorage } from "settings";
import * as comm from "../common/communication";
import * as ai from "./ai";
import * as figure from "../common/figure";


const AI_LEVEL = "ai_level";
const AI_COLOR = "ai_color";


//AI
var chess_ai = new ai.AI(parseInt(settingsStorage.getItem(AI_LEVEL)) + 1, 
                         settingsStorage.getItem('ai_color') == "true");

comm.receivMsgEvt = function(evt) {
  switch(evt.data.type) {
    case comm.SETTINGS_SYNC:
      //send setting to watch
      comm.sendSettings(chess_ai.color);
      break;
      
    case comm.BOARD_DATA:
      //get board data from watch and AI find best turn and send it back
      const board = evt.data.msg;
      chess_ai.updateBoard(board);  

      const move = chess_ai.solve();

      comm.sendAIMove(move.from, move.to);
      break;
  }
};


//SETTINGS
// Event fires when a setting is changed
settingsStorage.addEventListener("change", (evt) => {
  console.log(evt.key + " set on " + evt.newValue);
  
  switch(evt.key) {
    case AI_LEVEL:
      //set ai level
      chess_ai.depth = parseInt(evt.newValue) + 1;
      break;
    case AI_COLOR:
      //change color of ai
      chess_ai.color = (evt.newValue == "true");
      comm.sendSettings(chess_ai.color);
      break;
  }
});