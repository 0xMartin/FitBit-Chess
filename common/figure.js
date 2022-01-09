
//COLOR
export const WHITE = true;
export const BLACK = false;

//TYPE OF FIGURE
export const W_PAWN   = 'P';
export const W_ROOK   = 'R';
export const W_KNIGHT = 'N';
export const W_BISHOP = 'B';
export const W_KING   = 'K';
export const W_QUEEN  = 'Q';

export const B_PAWN   = 'p';
export const B_ROOK   = 'r';
export const B_KNIGHT = 'n';
export const B_BISHOP = 'b';
export const B_KING   = 'k';
export const B_QUEEN  = 'q';

export const EMPTY    = ' ';


export class Figure {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
  }
}


export function isPawn(fig) {
  return fig == W_PAWN || fig == B_PAWN;
}

export function isRook(fig) {
  return fig == W_ROOK || fig == B_ROOK;
}

export function isKnight(fig) {
  return fig == W_KNIGHT || fig == B_KNIGHT;
}

export function isBishop(fig) {
  return fig == W_BISHOP || fig == B_BISHOP;
}

export function isKing(fig) {
  return fig == W_KING || fig == B_KING;
}

export function isQueen(fig) {
  return fig == W_QUEEN || fig == B_QUEEN;
}

export function isWhite(fig) {
  return fig == fig.toUpperCase();
}

export function isEmpty(fig) {
  return fig == EMPTY;
}

export function isInBoard(x, y) {
  if(x >= 0 && x < 8 && y >= 0 && y < 8) {
    return {x: x, y: y}; 
  } else {
    return null; 
  }
}

export function doMove(move, board) {
  const from = move.from;
  const to = move.to;
  const from_i = from.x + from.y * 8;
  const to_i = to.x + to.y * 8;
  
  const killed = board[to.x + to.y * 8]; 
  
  //move figure and kill figure (if some exists)
  var f = board[from_i];
  board[to_i] =  f;
  board[from_i] = EMPTY;
  
  //change to queen
  if(isPawn(f)) {
    if(isWhite(f) ? to.y == 0 : to.y == 7) {
      board[to_i] = isWhite(f) ? W_QUEEN : B_QUEEN;  
      return {killed: killed, changed_to_queen: true};
    }
    
  //castling  
  } else if(isKing(f)) {
    if(Math.abs(to.x - from.x) == 2) {
      //move rook
      if(to.x - from.x > 0) {
        //right 
        board[5 + to.y * 8] = board[7 + to.y * 8];
        board[7 + to.y * 8] = EMPTY;
      } else {
        //left
        board[3 + to.y * 8] = board[to.y * 8];
        board[to.y * 8] = EMPTY;
      } 
    }      
  }
  
  return {killed: killed, changed_to_queen: false};
}

export function undoMove(move, board, status) {
  const from = move.from;
  const to = move.to;
  const from_i = from.x + from.y * 8;
  const to_i = to.x + to.y * 8;
    
  //move figure back
  if(status.changed_to_queen) {
    //if it was pawn that changed to queen then change back queen to pawn
    board[from_i] = isWhite(board[to_i]) ? W_PAWN : B_PAWN;  
  } else {
    board[from_i] = board[to_i];
  }
  
  //undo castling  
  if(isKing(board[from_i])) {
    if(Math.abs(to.x - from.x) == 2) {
      //move rook
      if(to.x - from.x > 0) {
        //right 
        board[5 + to.y * 8] = board[5 + to.y * 8];
        board[5 + to.y * 8] = EMPTY;
      } else {
        //left
        board[to.y * 8] = board[3 + to.y * 8];
        board[3 + to.y * 8] = EMPTY;
      } 
    }      
  }
  
  //return killed figure (some figure or empty space)
  board[to_i] = status.killed;  
}

export function getLegalMoves(fig, board) {
  var moves = [];
  
  var dx = 0;
  var dy = 0;
  var p;
  
  const fig_isWhite = isWhite(fig.type);
  
  //PAWN --------------------------------------------------------------------------------->
  if(isPawn(fig.type)) {
    dx = 0;
    dy = fig_isWhite ? -1 : 1;  
    
    //forward move
    p = isInBoard(fig.x + dx, fig.y + dy);
    if(p != null) {
      if(isEmpty(board[p.x + p.y * 8])) {
        moves.push({x: p.x, y: p.y});    
        //double move on start ?
        if(fig.y == (fig_isWhite ? 6 : 1)) {
          p = isInBoard(fig.x + dx, fig.y + dy * 2);
          if(p != null) {
            if(isEmpty(board[p.x + p.y * 8])) {
              moves.push({x: p.x, y: p.y});   
            }
          }
        }  
      }
    
    //attack
    for(dx = -1; dx <= 1; dx += 2) {
      p = isInBoard(fig.x + dx, fig.y + dy);
      if(p != null) {
        if(!isEmpty(board[p.x + p.y * 8])) {
          if(isWhite(board[p.x + p.y * 8]) != fig_isWhite) {
            moves.push({x: p.x, y: p.y});      
          }
        }
      }
    }
  }

    
  //ROOK --------------------------------------------------------------------------------->
  } else if(isRook(fig.type)) {
    for(dx = -1; dx <= 1; dx++) {
      for(dy = -1; dy <= 1; dy++) {
        if((dx * dy == 0) && (dx + dy != 0)) {
          fieldsChecker(moves, fig, dx, dy, board); 
        }
      } 
    }
    
    
  //KNIGHT ---------------------------------------------------------------------------------> 
  } else if(isKnight(fig.type)) {
    for(dx = -2; dx <= 2; dx++) {
      for(dy = -2; dy <= 2; dy++) {
        if(dx != 0 && dy != 0 && Math.abs(dx * dy) == 2) {
          p = isInBoard(fig.x + dx, fig.y + dy);
          if(p != null) {
            if(isEmpty(board[p.x + p.y * 8])) {
              moves.push({x: p.x, y: p.y});        
            } else {
              if(isWhite(board[p.x + p.y * 8]) != fig_isWhite) {
                moves.push({x: p.x, y: p.y});    
              }
            }
          }
        }  
      }
    }
    
    
  //BISHOP ---------------------------------------------------------------------------------> 
  } else if(isBishop(fig.type)) {
    for(dx = -1; dx <= 1; dx++) {
      for(dy = -1; dy <= 1; dy++) {
        if(Math.abs(dx) == Math.abs(dy)) {
          fieldsChecker(moves, fig, dx, dy, board); 
        }
      } 
    }
    
    
  //QUEEN --------------------------------------------------------------------------------->
  } else if(isQueen(fig.type)) {
    for(dx = -1; dx <= 1; dx++) {
      for(dy = -1; dy <= 1; dy++) {
        if((Math.abs(dx) == Math.abs(dy)) || (dx * dy == 0) && (dx + dy != 0)) {
          fieldsChecker(moves, fig, dx, dy, board); 
        }
      } 
    }
    
    
  //KING ---------------------------------------------------------------------------------> 
  } else if(isKing(fig.type)) {
     for(dx = -1; dx <= 1; dx++) {
      for(dy = -1; dy <= 1; dy++) {
        if(dx != 0 || dy != 0) {
          p = isInBoard(fig.x + dx, fig.y + dy);
          if(p != null) {
            if(isEmpty(board[p.x + p.y * 8])) {
              moves.push({x: p.x, y: p.y});        
            } else {
              if(isWhite(board[p.x + p.y * 8]) != fig_isWhite) {
                moves.push({x: p.x, y: p.y});    
              }
            }
          }
        }  
      }
    }
    //castling
    if(fig.x == 4) {
      if((fig_isWhite && fig.y == 7) || (!fig_isWhite && fig.y == 0)) {
        //left
        if(isRook(board[fig.y * 8])) {
          if(isEmpty(board[1 + fig.y * 8]) && isEmpty(board[2 + fig.y * 8]) && isEmpty(board[3 + fig.y * 8])) {
            moves.push({x: fig.x - 2, y: fig.y});       
          }   
        }
        //right
        if(isRook(board[7 + fig.y * 8])) {
          if(isEmpty(board[6 + fig.y * 8]) && isEmpty(board[5 + fig.y * 8])) {
            moves.push({x: fig.x + 2, y: fig.y});     
          }   
        }
      }
    }
    
    
  }
  
  return moves;
}
  
function fieldsChecker(moves, fig, dx, dy, board) {
  var p = {x: (fig.x + dx), y: (fig.y + dy)};
  const fig_isWhite = isWhite(fig.type);
  
  var f;
  while(p.x >= 0 && p.x < 8 && p.y >= 0 && p.y < 8) {
    f = board[p.x + p.y * 8];
    
    if(isEmpty(f)) {
      moves.push({x: p.x, y: p.y});  
    } else {
      if(isWhite(f) != fig_isWhite) {
        moves.push({x: p.x, y: p.y});     
      }
      break;
    }
    
    p.x += dx;
    p.y += dy;
  }
}

export function findKing(king_isWhite, board) {
  var king = {x: -1, y: -1};
  
  //find king
  for(var x = 0; x < 8; x++) {
    for(var y = 0; y < 8; y++) {
      if(board[x + y * 8] == (king_isWhite ? W_KING : B_KING)) {
        king.x = x;
        king.y = y;
        //break loops
        x = 8;
        break;
      }
    }  
  }
  
  return king;
}

export function kingAttacked(king_isWhite, board) {
  var king = findKing(king_isWhite, board);
    
  //king not found
  if(king.x == -1 || king.y == -1) {
    return false;  
  }
  
  //check attacks 
  var f, offset;
  var x, y;
    
  //queens & bishops & rooks
  for(var dx = -1; dx <= 1; dx++) {
    for(var dy = -1; dy <= 1; dy++) {
      if(dx == 0 && dy == 0) continue;
      
      for(offset = 1; offset < 8; offset++) { //start from 1!! to 7 (offset)
        x = king.x + dx * offset;
        y = king.y + dy * offset;

        if(x < 0 || y < 0 || x > 7 || y > 7) {
          break;
        } else {
          f = board[x + y * 8];
          if(!isEmpty(f)) {
            //################################################
            if(isWhite(f) != king_isWhite) { 
              //vertical & horisontal
              if((dx * dy == 0) && (dx + dy != 0)) {
                if(isQueen(f) || isRook(f)) {
                  return true;
                }   
              //diagonals  
              } else if(Math.abs(dx) == Math.abs(dy)) {
                if(isQueen(f) || isBishop(f)) {
                  return true;
                }   
              }
            }
            break;
            //################################################
          }
        }
      }
      
    }
  }

  //knight
  for(dx = -2; dx <= 2; dx++) {
    for(dy = -2; dy <= 2; dy++) {
      if(dx != 0 && dy != 0 && Math.abs(dx * dy) == 2) {
        x = king.x + dx;
        y = king.y + dy;
        if(x < 0 || y < 0 || x > 7 || y > 7) continue;
        
        f = board[x + y * 8];
        if(!isEmpty(f)) {
          if(isWhite(f) != king_isWhite) {
            if(isKnight(f)) {
              return true;
            }
          }
        }
      }  
    }
  }
  
  //pawn
  for(dx = -1, dy = (king_isWhite ? -1 : 1); dx <= 1; dx += 2) {
    x = king.x + dx;
    y = king.y + dy;  
    if(x < 0 || y < 0 || x > 7 || y > 7) continue;
    
    f = board[x + y * 8];
    if(!isEmpty(f)) {
      if(isWhite(f) != king_isWhite) {
        if(isPawn(f)) {
          return true;
        }
       }
     }
  }
  
  //king
  for(dx = -1; dx <= 1; dx++) {
    for(dy = -1; dy <= 1; dy++) {
      if(dx != 0 || dy != 0) {
        x = king.x + dx;
        y = king.y + dy; 
        if(x < 0 || y < 0 || x > 7 || y > 7) continue;
        
        f = board[x + y * 8];
        if(!isEmpty(f)) {
          if(isWhite(f) != king_isWhite) {
            if(isKing(f)) {
              return true;
            }  
          }
        }
      }
    }
  }
  
  return false;
}

export function checkChessMet(player_isWhite, board) {
  
  for(var x = 0; x < 8; x++) {
    for(var y = 0; y < 8; y++) {
      
      var f = board[x + y * 8];
      if(isWhite(f) == player_isWhite) {
        var moves = getLegalMoves(new Figure(x, y, board[x + y * 8]), board);
        for(var i = 0; i < moves.length; i++) {
          var mv = {from: {x: x, y: y}, to: moves[i]};
          var status = doMove(mv, board);
          if(!kingAttacked(player_isWhite, board)) {
            undoMove(mv, board, status);
            return false;  
          }
          undoMove(mv, board, status);
        }
      }
      
    } 
  }
  
  return true;  
}

