/*
 * Entry point for the watch app
 */
import * as document from "document";

import * as game from "./game/game";

//views
const view_main = document.getElementById("view_main");
const view_game = document.getElementById("view_game");


const play_btn = document.getElementById("play");
play_btn.addEventListener("click", (evt) => {
  //change view visibility
  view_main.style.display = "none";
  view_game.style.display = "inline";
  
  //run game
  game.init();
  game.run();
  
  game.event_game_end = function() {
    //change view visibility
    view_main.style.display = "inline";
    view_game.style.display = "none";  
  };
})