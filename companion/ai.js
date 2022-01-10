import * as figure from "../common/figure";


//## AI API [START] ###############################################################################

export class AI {
  constructor(depth, color) {
    this.depth = depth;
    this.color = color;
    console.log("AI depth: " + depth + ", Color: " + (color ? "white" : "black"));
  }
  
  updateBoard(board) {
    //board: [figure, figure, ...]
    //figure: {x, y, color, type}
    this.board = board;
  }
  
  solve() {
    if(this.board == null) return;
    
    //time start
    var start = new Date().getTime();
    
    
    var bestValue = Number.NEGATIVE_INFINITY;
    var bestMov = {from: null, to: null};

    var moves = getMoves(this.board, this.color);
    for(var i = 0; i < moves.length; i++){
      
      var status = figure.doMove(moves[i], this.board);
      var val = minMax(this.depth - 1, this.board, this.color, false, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);
      figure.undoMove(moves[i], this.board, status);
      
      if(bestValue < val) {
        bestValue = val;
        bestMov = moves[i];
      }
      
    }
    
    
    //time end
    var end = new Date().getTime();
    var time = end - start;
    console.log("Time: " + time + " ms");
    
    return bestMov;
  }
}

//## AI API [END] #################################################################################
function minMax(depth, board, color, isMaximizingPlayer, alpha, beta) {
  if(depth == 0) {
    return evaluateBoard(board, color);
  }
  
  var possible_moves = getMoves(board, (isMaximizingPlayer ? color : !color));
  
  if(possible_moves.length == 0) {
    return evaluateBoard(board, color);  
  }
    
  
  var value = isMaximizingPlayer ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
  
  for(var i = 0; i < possible_moves.length; ++i) {    
      var mov = possible_moves[i];
    
      //do move
      var status = figure.doMove(mov, board);
    
      //king killed
      if(figure.isKing(status.killed)) {
        figure.undoMove(mov, board, status);
        return isMaximizingPlayer ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
      }
     
      //min max
      var current = minMax(depth - 1, board, color, !isMaximizingPlayer, alpha, beta);
      
      //undo move
      figure.undoMove(mov, board, status);
    
      //alpha and beta
      if(isMaximizingPlayer) {
        value = Math.max(value, current);
        alpha = Math.max(alpha, value);
      } else {
        value = Math.min(value, current);
        beta = Math.min(beta, value); 
      }

      //cut off
      if(beta <= alpha) {
        break; 
      }
      
   }
    
   return value; 
}


function getMoves(board, color) {
  var moves = [];
  
  //add all moves
  for(var x = 0; x < 8; x++) {
    for(var y = 0; y < 8; y++) {
      var f = board[x + y * 8];
      if(figure.isEmpty(f)) continue;
      
      if(figure.isWhite(f) == color) {
        var f_m = figure.getLegalMoves(new figure.Figure(x, y, f), board);
        f_m.forEach((mov) => {
          moves.push({
            from: {x: x,       y: y},
            to:   {x: mov.x,   y: mov.y}
          })  
        });
      }
    }  
  }
  //random sorting
  moves.sort(function(a, b){return 0.5 - Math.random()});
  
  return moves;
}

//## EVALUATOR [START] #################################################################################

const POSITION_SCORE_W = {
    'p':[
            100, 100, 100, 100, 105, 100, 100,  100,
              78,  83,  86,  73, 102,  82,  85,  90,
               7,  29,  21,  44,  40,  31,  44,   7,
             -17,  16,  -2,  15,  14,   0,  15, -13,
             -26,   3,  10,   9,   6,   1,   0, -23,
             -22,   9,   5, -11, -10,  -2,   3, -19,
             -31,   8,  -7, -37, -36, -14,   3, -31,
               0,   0,   0,   0,   0,   0,   0,   0
        ],
    'n': [ 
            -66, -53, -75, -75, -10, -55, -58, -70,
             -3,  -6, 100, -36,   4,  62,  -4, -14,
             10,  67,   1,  74,  73,  27,  62,  -2,
             24,  24,  45,  37,  33,  41,  25,  17,
             -1,   5,  31,  21,  22,  35,   2,   0,
            -18,  10,  13,  22,  18,  15,  11, -14,
            -23, -15,   2,   0,   2,   0, -23, -20,
            -74, -23, -26, -24, -19, -35, -22, -69
        ],
    'b': [ 
            -59, -78, -82, -76, -23,-107, -37, -50,
            -11,  20,  35, -42, -39,  31,   2, -22,
             -9,  39, -32,  41,  52, -10,  28, -14,
             25,  17,  20,  34,  26,  25,  15,  10,
             13,  10,  17,  23,  17,  16,   0,   7,
             14,  25,  24,  15,   8,  25,  20,  15,
             19,  20,  11,   6,   7,   6,  20,  16,
             -7,   2, -15, -12, -14, -15, -10, -10
        ],
    'r': [  
             35,  29,  33,   4,  37,  33,  56,  50,
             55,  29,  56,  67,  55,  62,  34,  60,
             19,  35,  28,  33,  45,  27,  25,  15,
              0,   5,  16,  13,  18,  -4,  -9,  -6,
            -28, -35, -16, -21, -13, -29, -46, -30,
            -42, -28, -42, -25, -25, -35, -26, -46,
            -53, -38, -31, -26, -29, -43, -44, -53,
            -30, -24, -18,   5,  -2, -18, -31, -32
        ],
    'q': [   
              6,   1,  -8,-104,  69,  24,  88,  26,
             14,  32,  60, -10,  20,  76,  57,  24,
             -2,  43,  32,  60,  72,  63,  43,   2,
              1, -16,  22,  17,  25,  20, -13,  -6,
            -14, -15,  -2,  -5,  -1, -10, -20, -22,
            -30,  -6, -13, -11, -16, -11, -16, -27,
            -36, -18,   0, -19, -15, -15, -21, -38,
            -39, -30, -31, -13, -31, -36, -34, -42
        ],
    'k': [  
              4,  54,  47, -99, -99,  60,  83, -62,
            -32,  10,  55,  56,  56,  55,  10,   3,
            -62,  12, -57,  44, -67,  28,  37, -31,
            -55,  50,  11,  -4, -19,  13,   0, -49,
            -55, -43, -52, -28, -51, -47,  -8, -50,
            -47, -42, -43, -79, -64, -32, -29, -32,
             -4,   3, -14, -50, -57, -18,  13,   4,
             17,  30,  -3, -14,   6,  -1,  40,  18
        ]
};

const POSITION_SCORE_B = {
    'p': POSITION_SCORE_W['p'].slice().reverse(),
    'n': POSITION_SCORE_W['n'].slice().reverse(),
    'b': POSITION_SCORE_W['b'].slice().reverse(),
    'r': POSITION_SCORE_W['r'].slice().reverse(),
    'q': POSITION_SCORE_W['q'].slice().reverse(),
    'k': POSITION_SCORE_W['k'].slice().reverse()
}

// FIGURE_VALUE[figure.type]
const FIGURE_VALUE = {
  'p' : 100,     //PAWN
  'r' : 479,     //ROOK
  'n' : 280,     //KNIGHT
  'b' : 320,     //BISHOP
  'k' : 88888,   //KING
  'q' : 929      //QUEEN
};


function evaluateBoard(board, color) {
  var value = 0;
 
  var fig;
  for(var i = 0; i < 64; i++) {
      fig = board[i];
      if(fig == ' ') continue;
      
      var type = fig.toLowerCase(); 
      var isWhite = (fig == fig.toUpperCase());
      
      if(isWhite == color) {
        //AI (positive values)
        
        //material score
        value += FIGURE_VALUE[type];  
        //position score
        if(isWhite) {
          value += POSITION_SCORE_W[type][i];
        } else {
          value += POSITION_SCORE_B[type][i]; 
        }
        
      } else {
        //ENEMY (negative values)
        
        //material score
        value -= FIGURE_VALUE[type];  
        //position score
        if(isWhite) {
          value -= POSITION_SCORE_W[type][i];
        } else {
          value -= POSITION_SCORE_B[type][i]; 
        } 
        
      }     
  }
  
  return value;
}