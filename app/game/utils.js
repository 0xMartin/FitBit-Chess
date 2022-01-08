// x="8%" y="8%" width="84%" height="84%"
const board_size = 84 * 336 / 100;

export function setFigurePosition(element, x, y) {
  if(element == null) return;
  
  if(x < 0 || y < 0 || x > 8 || y > 8) {
    return;
  }  
  
  element.x = (2 + x * 12) * board_size / 100;
  element.y = (2 + y * 12) * board_size / 100;
}

export function addClass(element, class_name) {
  if(element == null) return;
  
  if(element.class.length == 0) {
    element.class = class_name;
  } else {
    element.class += (" " + class_name);
  }
} 

export function removeClass(element, class_name) {
  if(element == null) return;
  
  const classes = element.class.split(" ").filter(c => c != class_name);
  element.class = classes.join(" ").trim();
} 
