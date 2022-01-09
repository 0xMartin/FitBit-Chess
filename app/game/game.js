import * as document from "document";

import * as utils from "./utils";
import * as figure from "../../common/figure";
import * as comm from "../../common/communication";


//control
export var event_game_end = null;
var ai_enabled = false;

//game data
var board = [];
var white_on_turn = true;
var selected_figure = null;

var figures = null;
var fields = null;

//ui components
const bg = document.getElementById("bg");
const info = document.getElementById("info");
const board = document.getElementById("board"); 


//###################################################################################################################
// LOCAL FUNCS
//###################################################################################################################
function changePlayer() {
  white_on_turn = !white_on_turn;
  if(white_on_turn) {
    utils.removeClass(bg, "bg_black_on_turn");  
    utils.addClass(bg, "bg_white_on_turn"); 
  } else {
    utils.removeClass(bg, "bg_white_on_turn");  
    utils.addClass(bg, "bg_black_on_turn");   
  }
  
  //test chess met
  if(figure.checkChessMet(white_on_turn, board)) {
    //game over
    info.style.display = "inline";  
    info.text = (white_on_turn ? "Black" : "White") + " win!";
    white_on_turn = true;
    
    //return back to main menu
    setTimeout(() => {
      info.style.display = "none"; 
      if(event_game_end != null) {
        event_game_end();  
      }
    }, 5000);
  }
  
  //ai play
  if(!white_on_turn) {
    if(ai_enabled) {
      comm.sendBoardData(board);
    }
  }
}

function clearFields(all) {
  fields.forEach((f) => {
    utils.removeClass(f, "possible_move");
    if(all) {
      utils.removeClass(f, "king_danger");
    }
  });
}

function figure_event(fig) {
  if(figure.isWhite(fig.type) != white_on_turn) {
    //move with figure
    move_event(fig.x, fig.y);
    return;  
  } 
  
  //only currently playing player can select figure ...
  if(ai_enabled && !white_on_turn) return;  //is AI is enabled => you cant play with black player
  
  //select figure
  selected_figure = fig;  
  
  //clear fields
  clearFields(false);
  
  //show legfigureal moves
  var moves = figure.getLegalMoves(selected_figure, board);
  moves.forEach((mov) => {
    utils.addClass(fields[mov.x + mov.y * 8], "possible_move");
  });
}

function move_event(x, y) {
  if(selected_figure != null) {
    const from = {x: selected_figure.x, y: selected_figure.y};
    const to = {x: x, y: y};

    const fig = new figure.Figure(from.x, from.y, board[from.x + from.y * 8]);
    const moves = figure.getLegalMoves(fig, board);  
    if(moves.some((m) => {return m.x == to.x && m.y == to.y})) {
      //do move
      const status = figure.doMove({from: from, to: to}, board);
      
      //check king
      if(figure.kingAttacked(white_on_turn, board)) {
        //undo move
        figure.undoMove({from: from, to: to}, board, status);
        
        //highlight field with king
        const pos = figure.findKing(white_on_turn, board);
        utils.addClass(fields[pos.x + pos.y * 8], "king_danger");
        
        //clear (only possible moves "green")
        clearFields(false);
        
        return false;
      }
      
      //update board
      updateBoard(board);
      
      //change player
      changePlayer();
      
      return true;
    } 
    
    //unselect figure
    selected_figure = null;
  } else {
    clearFields(false);
  }  
}

function updateBoard(board) {
  //update figures
  for(var x = 0; x < 8; ++x) {
    for(var y = 0; y < 8; ++y) {
      var figure_exists = true;
      switch(board[x + y * 8]) {
        //pawn
        case figure.W_PAWN:
          figures[x + y * 8].class = "figure w_pawn";
          break;
        case figure.B_PAWN:
          figures[x + y * 8].class = "figure b_pawn";
          break;
       //knight
        case figure.W_KNIGHT:
          figures[x + y * 8].class = "figure w_knight";
          break;
        case figure.B_KNIGHT:
          figures[x + y * 8].class = "figure b_knight";
          break;
        //bishop
        case figure.W_BISHOP:
          figures[x + y * 8].class = "figure w_bishop";
          break;
        case figure.B_BISHOP:
          figures[x + y * 8].class = "figure b_bishop";
          break;
        //rook
        case figure.W_ROOK:
          figures[x + y * 8].class = "figure w_rook";
          break;
        case figure.B_ROOK:
          figures[x + y * 8].class = "figure b_rook";
          break;
        //queen
        case figure.W_QUEEN:
          figures[x + y * 8].class = "figure w_queen";
          break;
        case figure.B_QUEEN:
          figures[x + y * 8].class = "figure b_queen";
          break;
        //king
        case figure.W_KING:
          figures[x + y * 8].class = "figure w_king";
          break;
        case figure.B_KING:
          figures[x + y * 8].class = "figure b_king";
          break;
        default:
          figures[x + y * 8].class = "figure";
          figures[x + y * 8].style.display = "none";
          figure_exists = false;
      }     
      if(figure_exists) {
        figures[x + y * 8].style.display = "inline";
      }  
    } 
  }
  
  //clear fields
  clearFields(true);
}

//###################################################################################################################
// GAME CONTROL FUNCTIONS
//###################################################################################################################

export function init() {
  //init board
  board = [
    'r', 'n', 'b', 'q', 'k', 'b', 'n', 'r',
    'p', 'p', 'p', 'p', 'p', 'p', 'p', 'p',
    ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ',
    ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ',
    ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ',
    ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ',
    'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P',
    'R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'
  ];

  //figure events
  figures = document.getElementsByClassName("figure"); 
  figures.forEach((f, index) => {
    var x = index % 8;
    var y = (index / 8) | 0;
    f.addEventListener("click", (evt) => {figure_event(new figure.Figure(x, y, board[x + y * 8]))});
  });
  
  //field events
  fields = document.getElementsByClassName("field");
  fields.forEach((f, index) => {
    var x = index % 8;
    var y = (index / 8) | 0;
    f.addEventListener("click", (evt) => move_event(x, y));
  });
  
  //update board
  updateBoard(board);
  
  //reset
  white_on_turn = true;
  selected_figure = null;
}


export function run() {
  //RUN GAME
  white_on_turn = true; 
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
    if(!white_on_turn) {
      
      const from = evt.data.from;
      const to = evt.data.to;
  
      selected_figure = new figure.Figure(from.x, from.y, board[from.x + from.y * 8]);
      if(!move_event(to.x, to.y)) {
        //error 
        console.log("!!! AI ERROR !!!");
        console.log("[" + from.x + ", " + from.y + "] -> [" + to.x + ", " + to.y + "]");
        //stop game
        info.style.display = "inline";  
        info.text ="AI give up!";
        white_on_turn = true;
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



