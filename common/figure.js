//COLOR OF FIGURE
export const COLOR_WHITE = 0;
export const COLOR_BLACK = 1;


//TYPE OF FIGURE
export const PAWN = 0;
export const ROOK = 1;
export const KNIGHT = 2;
export const BISHOP = 3;
export const KING = 4;
export const QUEEN = 5;


//FIGURE
export class Figure {
  constructor(element, x, y, type) {
    this.element = element;
    this.x = x;
    this.y = y;
    this.type = type;
  }
}

export function getFigureOnPosition(x, y, white_player, black_player) {
  var fig;
  var status = white_player.figures.some((f)=> { 
    var b = (f.x == x && f.y == y);
    if(b) {
      fig = f;  
    }
    return b;
  });
  if(status) {
    return {color: COLOR_WHITE, figure: fig};    
  }
  
  status = black_player.figures.some((f)=> { 
    var b = (f.x == x && f.y == y);
    if(b) {
      fig = f;  
    }
    return b;
  });
  if(status) {
    return {color: COLOR_BLACK, figure: fig};    
  }
  
  return null;
}

function checkField(moves, dx, dy, color, fig, white_player, black_player) {
  var pt = {x: fig.x, y: fig.y};
  var enemy_f;
  while(pt.x >= 0 && pt.y >= 0 && pt.x < 8 && pt.y < 8) {
    if(pt.x != fig.x || pt.y != fig.y) {
      enemy_f = getFigureOnPosition(pt.x, pt.y, white_player, black_player);
      if(enemy_f != null) {
        if(enemy_f.color != color) {
          //can kill enemy
          moves.push({x: pt.x, y: pt.y});   
        }
        break;
      } else {
        //normal move
        moves.push({x: pt.x, y: pt.y});  
      }
    }
    pt.x += dx;
    pt.y += dy;
  }
}

export function getPosibleMoves(color, fig, white_player, black_player) {
  var moves = [];
  
  var enemy_f;
  var dx;
  var dy;
  
  var pt = {x: 0, y: 0};
  
  switch(fig.type) {
    case PAWN:
      //attack
      for(var offset = -1; offset <=1; offset += 2) {
        pt.x = fig.x + offset;
        pt.y = fig.y + (color == COLOR_WHITE ? -1 : 1);
        enemy_f = getFigureOnPosition(pt.x, pt.y, white_player, black_player);
        if(enemy_f != null) {
          if(enemy_f.color != color) {
            moves.push({x: pt.x, y: pt.y}); 
          }
        }
      }
      
      //start extra move for pawn (2 fields)
      pt.x = fig.x;
      pt.y = fig.y;
      if(fig.y == (color == COLOR_WHITE ? 6 : 1)) {
        pt.y += (color == COLOR_WHITE ? -1 : 1);
        if(getFigureOnPosition(pt.x, pt.y, white_player, black_player) == null) {
          moves.push({x: pt.x, y: pt.y});            
        }
      } 
      
      //default move
      pt.y += (color == COLOR_WHITE ? -1 : 1);
      if(getFigureOnPosition(pt.x, pt.y, white_player, black_player) == null) {
        moves.push({x: pt.x, y: pt.y}); 
      }
      break;
    case ROOK:
      //for each direction of rook
      for(dx = -1; dx <= 1; dx++) {
        for(dy = -1; dy <= 1; dy++) {
          if(dx * dy == 0 && dx + dy != 0) {
            //check each field in line
            checkField(moves, dx, dy, color, fig, white_player, black_player);
          }
        }  
      }
      break;
    case KNIGHT:
       for(dx = -2; dx <= 2; dx++) {
        for(dy = -2; dy <= 2; dy++) {
          if(dx == 0 || dy == 0) continue;  
          if(Math.abs(dx * dy) == 2) {
            pt.x = fig.x + dx;
            pt.y = fig.y + dy;
            if(pt.x >= 0 && pt.y >= 0 && pt.x < 8 && pt.y < 8) {
              enemy_f = getFigureOnPosition(pt.x, pt.y, white_player, black_player);
              if(enemy_f != null) {
                if(enemy_f.color != color) {
                  //can kill enemy
                  moves.push({x: pt.x, y: pt.y});   
                }
              } else {
                //normal move
                moves.push({x: pt.x, y: pt.y});  
              }
            }
          }
        }
       }
      break;
    case BISHOP:
      for(dx = -1; dx <= 1; dx++) {
        for(dy = -1; dy <= 1; dy++) {
          if(dx * dy != 0) {         
            //check each field in diagonal
            checkField(moves, dx, dy, color, fig, white_player, black_player);
          }
        }
      }
      break;
    case KING:
      for(dx = -1; dx <= 1; dx++) {
        for(dy = -1; dy <= 1; dy++) {
          if(dx != 0 || dy != 0) {     
            pt.x = fig.x + dx;
            pt.y = fig.y + dy;
            if(pt.x >= 0 && pt.y >= 0 && pt.x < 8 && pt.y < 8) {
              enemy_f = getFigureOnPosition(pt.x, pt.y, white_player, black_player);
              if(enemy_f != null) {
                if(enemy_f.color != color) {
                  //can kill enemy
                  moves.push({x: pt.x, y: pt.y});   
                }
              } else {
                //normal move
                moves.push({x: pt.x, y: pt.y});  
              }
            }
          }
        }
      }
      break;
    case QUEEN:
       for(dx = -1; dx <= 1; dx++) {
        for(dy = -1; dy <= 1; dy++) {
          if(dx != 0 || dy != 0) {         
            //check each field in diagonal and veritcal + horisontal
            checkField(moves, dx, dy, color, fig, white_player, black_player);
          }
        }
      }
      break;
  }
  
  return moves;
}

export function findKing(color, white_player, black_player) {
  var kx = -1;
  var ky = -1;
  (color == COLOR_WHITE ? white_player : black_player).figures.some((f)=> { 
    if(f.type == KING) {
      kx = f.x;
      ky = f.y;
      return true;
    } else {
      return false;
    }
  });
  return {x: kx, y: ky};
}

export function checkKing(color, king_position, white_player, black_player) {

  //check if some posible move interact with field where is king
  var moves = null;
  var status = (color == COLOR_WHITE ? black_player : white_player).figures.some((fig) => {
    moves = getPosibleMoves((color == COLOR_WHITE ? COLOR_BLACK : COLOR_WHITE),
                            fig, white_player, black_player); 
    return moves.some((mov) => {return mov.x == king_position.x && mov.y == king_position.y;});
  });
  
  return status;
}