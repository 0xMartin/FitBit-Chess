//COLOR OF PLAYER
export const COLOR_WHITE = 0;
export const COLOR_BLACK = 1;

export class Player {
  constructor(name, color) {
    this.name = name;
    this.color = color;
    this.figure_list = [];
  }
  
  get figures() {
    return this.figure_list;
  }
  
  addFigure(fig) {
    this.figure_list.push(fig); 
  }
  
  removeFigure(fig) {
    var index = this.figure_list.indexOf(fig);
    if (index > -1) {
      this.figure_list.splice(index, 1);
    }
  }
};
