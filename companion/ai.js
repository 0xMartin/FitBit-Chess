import * as figure from "../common/figure";


//## AI API [START] ###############################################################################

export class AI {
  constructor(depth, color) {
    this.depth = depth;
    this.color = color;
  }
  
  updateBoard(board) {
    //board: [figure, figure, ...]
    //figure: {x, y, color, type}
    this.board = board;
  }
  
  solve() {
    if(this.board == null) return;
    
    var bestValue = Number.NEGATIVE_INFINITY;
    var best = {from: null, to: null};

    var possible_moves = getMoves(this.board, this.color);
    possible_moves.forEach((mov) => {    
      var killed = doMove(this.board, mov);
      
      var value = minMax(this.depth - 1, this.board, this.color, false);
      
      undoMove(this.board, mov, killed);
      
      if(value > bestValue) {
        bestValue = value;
        best = mov;
      }
    });
    
    //console.log(bestValue);
    //move: {from, to}
    return best;
  }
}

//## AI API [END] #################################################################################

function minMax(depth, board, color, isMaximizingPlayer, alpha, beta) {
  if(depth == 0) {
    return evaluateBoard(board, color);
  }
  
  var possible_moves = getMoves(board, color);
  
  if(possible_moves.length == 0) {
    return evaluateBoard(board, color);  
  }
    
  var cut = false;
  if(isMaximizingPlayer) {
    var value = Number.NEGATIVE_INFINITY;  

    possible_moves.forEach((mov) => { 
      if(cut) return;
      
      var killed = doMove(board, mov);
      
      var current = minMax(depth - 1, board, color, false, alpha, beta);
      value = Math.max(value, current);
      alpha = Math.max(alpha, value);

      undoMove(board, mov, killed);
      if(beta <= alpha) {
        cut = true;  
      }
    });
    
    return value; 
  } else {
    var value = Number.POSITIVE_INFINITY;    
    
    possible_moves.forEach((mov) => { 
      if(cut) return;
      
      var killed = doMove(board, mov);
      
      var current = minMax(depth - 1, board, color, true, alpha, beta);
      value = Math.min(value, current);
      beta = Math.min(beta, value);
      
      undoMove(board, mov, killed);
      
      if(beta <= alpha) {
        cut = true;    
      }
    });
    
    return value;
  }
}


function getMoves(board, color) {
  var moves = [];
  
  //sort figures on color groups
  var white_virtual_player = {figures: []};
  var black_virtual_player = {figures: []};
  board.forEach((fig) => {
    if(fig != null) {
      if(fig.color == figure.COLOR_WHITE) {
        white_virtual_player.figures.push(fig);   
      } else {
        black_virtual_player.figures.push(fig);  
      }
    }
  });
  
  //add all moves
  board.forEach((fig) => {
    if(fig != null) {
      if(fig.color == color) {
        var f_moves = figure.getPosibleMoves(color, fig, white_virtual_player, black_virtual_player);
        f_moves.forEach((f_move) => {
          moves.push({
            from: {x: fig.x,      y: fig.y},
            to:   {x: f_move.x,   y: f_move.y}
          });
        });
      }
    }
  });

  //random sorting
  moves.sort(function(a, b){return 0.5 - Math.random()});
  
  return moves;
}


function doMove(board, move) {
  const from = move.from;
  const to = move.to;
  
  //check for killed figure
  var killed = null;
  for (var i = 0; i < board.length; i++) {
    if(board[i] == null) continue;
    if(board[i].x == to.x && board[i].y == to.y) {
      killed = board[i];
      board.splice(i, 1);
      break;
    }
  }
  
  //do move
  for (var i = 0; i < board.length; i++) {
    if(board[i] == null) continue;
    if(board[i].x == from.x && board[i].y == from.y) {
      board[i].x = to.x;
      board[i].y = to.y;
      break;
    }
  }   
 
  return killed;
}


function undoMove(board, move, killed) {
  const from = move.from;
  const to = move.to;
  
  //move back
  for (var i = 0; i < board.length; i++) {
    if(board[i] == null) continue;
    if(board[i].x == to.x && board[i].y == to.y) {
      board[i].x = from.x;
      board[i].y = from.y;
      break;
    }
  }  
  
  //return back killed
  if(killed != null) {
    board.push(killed);
  }
}



//## EVALUATOR [START] #################################################################################

// FIGURE_VALUE[figure.type]
const FIGURE_VALUE = [
  400,     //PAWN
  1916,    //ROOK
  1120,    //KNIGHT
  1280,    //BISHOP
  9999,   //KING
  3716     //QUEEN
  ];

function evaluateBoard(board, color) {

  var value = 0;
  
  board.forEach((figure, i) => {
    if(figure != null) {
      var sign = (figure.color == color ? 1 : -1);
      
      //material score
      value += FIGURE_VALUE[figure.type] * sign;
      
      board.forEach((figure2, j) => {
        if(i != j) {
          //attack score
          if(figure2.color != figure.color) {
            value += ray_hit(figure, figure2) * sign * FIGURE_VALUE[figure2.type] / 10;    
          } 

          //defend score
          if(figure2.color == figure.color) {
            if(figure2.type != figure.KING) {
              value += ray_hit(figure, figure2) * sign * FIGURE_VALUE[figure2.type] / 20;    
            }
          }
        }
      });

    }
  });
 

  return value;
}

function ray_hit(fig1, fig2) {
  
  //difference
  var dx = fig2.x - fig1.x;
  var dy = fig2.y - fig1.y;
  
  //ray match expression
  switch(fig1.type) {
    case figure.PAWN:
      return Math.abs(dx) == 1 && (dy == (fig1.color == figure.COLOR_WHITE ? -1 : 1));
    case figure.ROOK:
      return (dx * dy == 0) && (dx + dy != 0);
    case figure.KNIGHT:
      return Math.abs(dx * dy) == 2;
    case figure.BISHOP:
      return Math.abs(dx) == Math.abs(dy);
    case figure.KING:
      return dx != 0 && dy != 0 && Math.abs(dx) <= 1 && Math.abs(dy) <= 1;
    case figure.QUEEN:
      return ((dx * dy == 0) && (dx + dy != 0)) || (Math.abs(dx) == Math.abs(dy));
  }
  
  return false; 
}




