/*
 * Entry point for the companion app
 */

import * as comm from "../common/communication";
import * as ai from "./ai";
import * as figure from "../common/figure";


const chess_ai = new ai.AI(3, figure.BLACK);


comm.receivMsgEvt = function(evt) {
  if(evt != null) {
    const board = evt.data;
    
    chess_ai.updateBoard(board);
    const move = chess_ai.solve();
    
    comm.sendAIMove(move.from, move.to);
  }
};