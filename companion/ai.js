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

    return best;
  }
}

//## AI API [END] #################################################################################
/*
function minMax(depth, board, color, isMaximizingPlayer, alpha, beta) {
  if(depth == 0) {
    return evaluateBoard(board, color);
  }
  
  var possible_moves = getMoves(board, color);
  
  if(possible_moves.length == 0) {
    return evaluateBoard(board, color);  
  }
    
  if(isMaximizingPlayer) {
    var value = Number.NEGATIVE_INFINITY;  

    for(var i = 0; i < possible_moves.length; ++i) {    
      var mov = possible_moves[i];
      var killed = doMove(board, mov);
      
      if(killed != null) {
        if(killed.type == figure.KING) {
          undoMove(board, mov, killed);
          return Number.POSITIVE_INFINITY;
        }
      }
      
      var current = minMax(depth - 1, board, color, false, alpha, beta);
      value = Math.max(value, current);
      alpha = Math.max(alpha, value);

      undoMove(board, mov, killed);
      
      if(beta <= alpha) {
        break; 
      }
      
    }
    
    return value; 
  } else {
    var value = Number.POSITIVE_INFINITY;    
    
    for(var i = 0; i < possible_moves.length; ++i) {    
      var mov = possible_moves[i];
      
      var killed = doMove(board, mov);
      
      if(killed != null) {
        if(killed.type == figure.KING) {
          undoMove(board, mov, killed);
          return Number.NEGATIVE_INFINITY;
        }
      }
      
      var current = minMax(depth - 1, board, color, true, alpha, beta);
      value = Math.min(value, current);
      beta = Math.min(beta, value);
      
      undoMove(board, mov, killed);
      
      if(beta <= alpha) {
        break; 
      }
      
    }
    
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
            })
          
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
const POSITION_SCORE = [
  //PAWN
  [
    0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,
    5.0,  5.0,  5.0,  5.0,  5.0,  5.0,  5.0,  5.0,
    1.0,  1.0,  2.0,  3.0,  3.0,  2.0,  1.0,  1.0,
    0.5,  0.5,  1.0,  2.5,  2.5,  1.0,  0.5,  0.5,
    0.0,  0.0,  0.0,  2.0,  2.0,  0.0,  0.0,  0.0,
    0.5,  -0.5, -1.0, 0.0,  0.0,  -1.0, -0.5, 0.5,
    0.5,  1.0,  1.0,  -2.0, -2.0, 1.0,  1.0,  0.5,
    0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0
  ],
  //ROOK
  [
    0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,
    0.5,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  0.5,
    -0.5, 0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5,
    -0.5, 0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5,
    -0.5, 0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5,
    -0.5, 0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5,
    -0.5, 0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5,
    0.0,  0.0,  0.0,  0.5,  0.5,  0.0,  0.0,  0.0
  ],
  //KNIGHT
  [
   -5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0,
   -4.0, -2.0,  0.0,  0.0,  0.0,  0.0, -2.0, -4.0,
   -3.0,  0.0,  1.0,  1.5,  1.5,  1.0,  0.0, -3.0,
   -3.0,  0.5,  1.5,  2.0,  2.0,  1.5,  0.5, -3.0,
   -3.0,  0.0,  1.5,  2.0,  2.0,  1.5,  0.0, -3.0,
   -3.0,  0.5,  1.5,  2.0,  2.0,  1.5,  0.5, -3.0,
   -4.0, -2.0,  0.0,  0.5,  0.5,  0.0, -2.0, -4.0,
   -5.0, -4.0, -3.0, -3.0,  3.0, -3.0, -4.0, -5.0
  ],
  //BISHOP
  [
   -2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0,
   -1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0,
   -1.0,  0.0,  0.5,  1.0,  1.0,  0.5,  0.0, -1.0,
   -1.0,  0.5,  0.5,  1.0,  1.0,  0.5,  0.5, -1.0,
   -1.0,  0.0,  1.0,  1.0,  1.0,  1.0,  0.0, -1.0,
   -1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0, -1.0,
   -1.0,  0.5,  0.0,  0.0,  0.0,  0.0,  0.5, -1.0,
   -2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0
  ],
  //KING
  [
   -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0,
   -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0,
   -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0,
   -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0,
   -2.0, -3.0, -3.0, -4.0, -4.0, -3.0, -3.0, -2.0,
   -1.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -1.0,
    2.0,  2.0,  0.0,  0.0,  0.0,  0.0,  2.0,  2.0,
    2.0,  3.0,  1.0,  0.0,  0.0,  1.0,  3.0,  2.0
  ],
  //QUEEN
  [
   -2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0,
   -1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0,
   -1.0,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -1.0,
   -0.5,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -0.5,
    0.0,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -0.5,
   -1.0,  0.5,  0.5,  0.5,  0.5,  0.5,  0.0, -1.0,
   -1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0,
   -2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0
  ]
];

// FIGURE_VALUE[figure.type]
const FIGURE_VALUE = [
  10,     //PAWN
  50,     //ROOK
  30,     //KNIGHT
  35,     //BISHOP
  9999,   //KING
  90      //QUEEN
  ];

function evaluateBoard(board, color) {
  var value = 0;
  
  board.forEach((figure, i) => {
    if(figure != null) {
      var sign = (figure.color == color ? 1 : -1);
      
      //material score
      value += FIGURE_VALUE[figure.type] * sign;
      
      //position score
      if(figure.color == figure.COLOR_WHITE) {
        value += POSITION_SCORE[figure.type][figure.x + figure.y * 8] * sign;
      } else {
        value += POSITION_SCORE[figure.type][(7 - figure.x) + (7 - figure.y) * 8] * sign; 
      }
    }
  });
 
  return value;
}
*/
