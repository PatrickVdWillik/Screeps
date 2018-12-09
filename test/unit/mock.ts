interface Index {
  [index: string]: any
};

export const Game = {
  creeps: [],
  rooms: [],
  spawns: {},
  time: 12345,
  objects: <Index>{
  },
  getObjectById(id: string): any {
    console.log(`Getting ${id}`);
    return this.objects[id];
  }
};

export const Memory = {
  creeps: []
};
