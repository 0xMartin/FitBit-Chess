// x="8%" y="8%" width="84%" height="84%"
const board_size = 84 * 336 / 100;

export function xyToIndexPosition(x, y) {
  if(x < 0 || y < 0 || x > 336 || y > 336) {
    return [-1, -1];
  }
  
  var x_i = (x / board_size * 100 - 2) / 12 - 0.7;
  var y_i = (y / board_size * 100 - 2) / 12 - 0.7;
  return [x_i - x_i % 1, y_i - y_i % 1];
}

export function setFigurePosition(element, x, y) {
  if(x < 0 || y < 0 || x > 8 || y > 8) {
    return;
  }  
  
  element.x = (2 + x * 12) * board_size / 100;
  element.y = (2 + y * 12) * board_size / 100;
}

export function updateFigurePosition(figure) { 
  setFigurePosition(figure.element, figure.x, figure.y);
}

export function addClass(element, class_name) {
  if(element.class.length == 0) {
    element.class = class_name;
  } else {
    element.class += (" " + class_name);
  }
} 

export function removeClass(element, class_name) {
  const classes = element.class.split(" ").filter(c => c != class_name);
  element.class = classes.join(" ").trim();
} 

export function killFigure(fig, player_owner) {
  player_owner.removeFigure(fig); 
  fig.element.style.display = "none";
}