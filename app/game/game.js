import * as document from "document";

import * as utils from "./utils";
import * as player from "./player";
import * as figure from "../../common/figure";
import * as comm from "../../common/communication";


//control
export var event_game_end = null;
var ai_enabled = false;


const bg = document.getElementById("bg");
const info = document.getElementById("info");
const board = document.getElementById("board"); 
const fields = document.getElementsByClassName("field");

const white_player = new player.Player("White", player.COLOR_WHITE);
const black_player = new player.Player("Black", player.COLOR_BLACK);

var selected_figure = null;
var possible_moves = null;
var onturn = null;


function addFigureToGame(player, figure) {
  player.addFigure(figure);
  figure.element.style.display = "inline";
  utils.updateFigurePosition(figure);    
}

function unselectAllMosibleFields() {
  if(possible_moves != null) {
    possible_moves.forEach((mov) => {
      utils.removeClass(fields[mov.x + mov.y * 8] , "possible_move");
    });
  }
}

function doMove(selected_fig, mov) {
  //safe position if undo turn is needed
  const last = {x: selected_fig.x, y: selected_fig.y};
  
  //move with figure
  selected_fig.x = mov.x;
  selected_fig.y = mov.y;
  
  //find king
  var king = {x: 0, y: 0};
  if(selected_fig.type == figure.KING) {
    king.x = selected_fig.x;
    king.y = selected_fig.y;
    
    //remove "king danger" highlight
    utils.removeClass(fields[last.x + last.y * 8], "king_danger");
  } else {
    king = figure.findKing(onturn.color, white_player, black_player); 
    
    //remove "king danger" highlight
    utils.removeClass(fields[king.x + king.y * 8], "king_danger");
  }
  
  //first check if king is in safe
  var stat = figure.checkKing(onturn.color, king, white_player, black_player);
  
  if(stat == true) {
    //undo turn
    selected_fig.x = last.x;
    selected_fig.y = last.y;  
    
    if(selected_fig.type == figure.KING) {
      king.x = selected_fig.x;
      king.y = selected_fig.y;
    }
    
    //highlight field where si king
    utils.addClass(fields[king.x + king.y * 8], "king_danger");
    
    return false;
  } else {
    //change player
    if(onturn == white_player) {
      onturn = black_player;
      bg.class = "bg_black_on_turn";
      
      if(ai_enabled) {
         comm.sendBoardData(white_player.figures, black_player.figures);
      }
      
    } else {
      onturn = white_player;  
      bg.class = "bg_white_on_turn";
    }

    return true;
  }
}

function figureEvent(fig, player) {
  if(onturn == null) return;
  
  if(onturn.color == player.color) {
    if(!ai_enabled || onturn == white_player) {
      //select figure of current player (find all posible moves with this figure)

      selected_figure = fig;
      //unselect all
      unselectAllMosibleFields();
      //find possible moves for figure and highlight all this field on the board
      possible_moves = figure.getPosibleMoves(player.color, fig, white_player, black_player);
      possible_moves.forEach((m) => {
        utils.addClass(fields[m.x + m.y * 8], "possible_move");
      });
    }
  } else {    
    //do move with other figure and kill this "fig" figure
    if(selected_figure == null) return;
    
    //do move on new position
    possible_moves.forEach((mov) => {
      if(selected_figure == null) return;
      if(mov.x == fig.x && mov.y == fig.y) {
        
        //kill figure
        utils.killFigure(fig, player);
        
        //do move on new position
        if(!doMove(selected_figure, mov)) {
          //undo kill (set last position of figure again, add to player list)
          fig.x = mov.x;
          fig.y = mov.y;
          fig.element.style.display = "inline";
          player.addFigure(fig);
        }
        utils.updateFigurePosition(selected_figure);
        
        //unselect all
        selected_figure = null;
        unselectAllMosibleFields();
        
        //check for game end
        checkGameEnd();
      } 
    });
  }
}

function checkGameEnd() {
  var end = true;
  
  //find king
  var king = figure.findKing(onturn.color, white_player, black_player); 
  
  onturn.figures.forEach((fig) => {
    if(!end) return;
    
    var moves = figure.getPosibleMoves(onturn.color, fig, white_player, black_player);
    moves.forEach((mov) => {
      if(!end) return;
      
      //position for restore
      var last = {x: fig.x, y: fig.y};

      //move with figure
      fig.x = mov.x;
      fig.y = mov.y;

      //change king position (if now is moving)
      if(fig.type == figure.KING) {
        king.x = fig.x;
        king.y = fig.y;
      }

      //first check if king is in safe
      end = figure.checkKing(onturn.color, king, white_player, black_player);

      //restore
      fig.x = last.x;
      fig.y = last.y;

      //restore king position
      if(fig.type == figure.KING) {
        king.x = last.x;
        king.y = last.y;  
      }
    });
    
  });

  if(end) {
    //stop game
    info.style.display = "inline";  
    info.text = (onturn == white_player ? black_player : white_player).name + " win!";
    onturn = null;
    
    //return back to main menu
    setTimeout(() => {
      info.style.display = "none"; 
      if(event_game_end != null) {
        event_game_end();  
      }
    }, 5000);
  }
  
  
}




//###################################################################################################################
// INIT INIT INIT INIT INIT INIT INIT INIT INIT INIT INIT INIT INIT INIT INIT INIT INIT INIT INIT INIT INIT INIT INIT
//###################################################################################################################
export function init() {
  //RESET
  white_player.figure_list = [];
  black_player.figure_list = [];
 
  //PLACE ON CORRECT POSITION AND LINK IMAGE OF FIGURE WITH OBJECT OF FIGURE AND ADD TO LIST OF FIGURES
  //WHITE FIGURES ##############################################################################
  
  //PAWNS
  var figures = document.getElementsByClassName("white_figure pawn"); 
  figures.forEach((element, index) => {
    if(index < 8) {
      addFigureToGame(white_player, new figure.Figure(element, index, 6, figure.PAWN));
    }
  });
  
  //ROOKS
  figures = document.getElementsByClassName("white_figure rook"); 
  addFigureToGame(white_player, new figure.Figure(figures[0], 0, 7, figure.ROOK));
  addFigureToGame(white_player, new figure.Figure(figures[1], 7, 7, figure.ROOK));
  
  //KNIGHT
  figures = document.getElementsByClassName("white_figure knight"); 
  addFigureToGame(white_player, new figure.Figure(figures[0], 1, 7, figure.KNIGHT));
  addFigureToGame(white_player, new figure.Figure(figures[1], 6, 7, figure.KNIGHT));
  
  //BISHOP
  figures = document.getElementsByClassName("white_figure bishop"); 
  addFigureToGame(white_player, new figure.Figure(figures[0], 2, 7, figure.BISHOP));
  addFigureToGame(white_player, new figure.Figure(figures[1], 5, 7, figure.BISHOP));
  
  //QUEEN
  figures = document.getElementsByClassName("white_figure queen"); 
  addFigureToGame(white_player, new figure.Figure(figures[0], 3, 7, figure.QUEEN));
  
  //KING
  figures = document.getElementsByClassName("white_figure king"); 
  addFigureToGame(white_player, new figure.Figure(figures[0], 4, 7, figure.KING));
  
  
  
  //BLACK FIGURES ##############################################################################
  
  //PAWNS
  figures = document.getElementsByClassName("black_figure pawn"); 
  figures.forEach((element, index) => {
    if(index < 8) {
      addFigureToGame(black_player, new figure.Figure(element, index, 1, figure.PAWN));
    }
  });
  
  //ROOKS
  figures = document.getElementsByClassName("black_figure rook"); 
  addFigureToGame(black_player, new figure.Figure(figures[0], 0, 0, figure.ROOK));
  addFigureToGame(black_player, new figure.Figure(figures[1], 7, 0, figure.ROOK));
  
  //KNIGHT
  figures = document.getElementsByClassName("black_figure knight"); 
  addFigureToGame(black_player, new figure.Figure(figures[0], 1, 0, figure.KNIGHT));
  addFigureToGame(black_player, new figure.Figure(figures[1], 6, 0, figure.KNIGHT));
  
  //BISHOP
  figures = document.getElementsByClassName("black_figure bishop"); 
  addFigureToGame(black_player, new figure.Figure(figures[0], 2, 0, figure.BISHOP));
  addFigureToGame(black_player, new figure.Figure(figures[1], 5, 0, figure.BISHOP));
  
  //QUEEN
  figures = document.getElementsByClassName("black_figure queen"); 
  addFigureToGame(black_player, new figure.Figure(figures[0], 3, 0, figure.QUEEN));
  
  //KING
  figures = document.getElementsByClassName("black_figure king"); 
  addFigureToGame(black_player, new figure.Figure(figures[0], 4, 0, figure.KING));
  
  
  //create events for each figure ##############################################################################
  white_player.figures.forEach((fig) => {
    fig.element.addEventListener("click", (evt) => figureEvent(fig, white_player))
  });
  black_player.figures.forEach((fig) => {
    fig.element.addEventListener("click", (evt) => figureEvent(fig, black_player))
  });
  
  //normal move event (only move, not remove enemy figure)
  board.addEventListener("click", (evt) => {
    if(selected_figure == null) return;
    if(possible_moves == null) return;
    
    var pt = utils.xyToIndexPosition(evt.screenX, evt.screenY);
    //do move on new position
    possible_moves.forEach((mov) => {
      if(selected_figure == null) return;
      if(mov.x == pt[0] && mov.y == pt[1]) {
        
        //do move on new position
        doMove(selected_figure, mov);
        utils.updateFigurePosition(selected_figure);
        
        //unselect all
        selected_figure = null;
        unselectAllMosibleFields();
        
        //check for game end
        checkGameEnd();
      } 
    });
  });
  
  //reset highlights
  fields.forEach((f) => {
    utils.removeClass(f, "king_danger");
  });
}

export function run() {
  //RUN GAME
  onturn = white_player;  
}



//###################################################################################################################
// AI
//###################################################################################################################

export function enableAI() {
  ai_enabled = true;  
}

export function disableAI() {
  ai_enabled = false;  
}

comm.receivMsgEvt = function (evt) {
  if(ai_enabled) {
    if(onturn == black_player) {
      const move = evt.data;
      const from = move.from;
      const to = move.to;
         
      const fig = figure.getFigureOnPosition(from.x, from.y, white_player, black_player);
      
      var error = false;    
      if(fig != null) {
        //remove figure (only in attack)
        const enemy_fig = figure.getFigureOnPosition(to.x, to.y, white_player, black_player);
        if(enemy_fig != null) {
          if(enemy_fig.color == white_player.color) {
            //kill figure
            utils.killFigure(enemy_fig.figure, white_player);  
          }
        }
        
        //do move
        if(doMove(fig.figure, to)) {
          utils.updateFigurePosition(fig.figure);  
        } else {
          error = true;
        }     
        
      } else {
        error = true;
      }
      
      if(error) {
        console.log("!!! AI ERROR !!!");
        //error 
        //stop game
        info.style.display = "inline";  
        info.text ="AI give up!";
        onturn = null;

        //return back to main menu
        setTimeout(() => {
          info.style.display = "none"; 
          if(event_game_end != null) {
            event_game_end();  
          }
        }, 5000);
      }
      
    }
  }
}



