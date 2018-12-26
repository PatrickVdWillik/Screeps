interface Index {
  [index: string]: any
};

export const Game = {
  creeps: [],
  rooms: [],
  spawns: <Index>{},
  time: 12345,
  objects: <Index>{},

  getObjectById(id: string): any {
    return this.objects[id];
  },

  addObject(obj: { id: string }): void {
    this.objects[obj.id] = obj;
  },

  addObjects(objs: { id: string }[]): void {
    objs.forEach(obj => this.objects[obj.id] = obj);
  }
};

export const Memory = {
  creeps: []
};
