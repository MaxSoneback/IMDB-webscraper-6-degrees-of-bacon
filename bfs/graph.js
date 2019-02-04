function Graph(){
  this.queue=[];
  this.nodes=[];
  this.graph={};
  this.path=[];
  this.startNode = null;
  this.endNode = null;
}
Graph.prototype.setStartNode = function(node){
  this.startNode = node;
}

Graph.prototype.setEndNode = function(node){
  this.endNode = node;
}

Graph.prototype.addNode = function(node){
  this.nodes.push(node);
  let hashKey = node.id;
  this.graph[hashKey] = node;
}

Graph.prototype.getNode = function(key){
  return this.graph[key];
}

Graph.prototype.enqueue = function(node){
  this.queue.push(node);
}

Graph.prototype.dequeue = function(node){
  return this.queue.shift();
}

Graph.prototype.constructPath = function(node){
    this.path.unshift(node.value)
    if(node.parent){
    this.constructPath(node.parent)
  }
  return this.path;
}
Graph.prototype.skipInLine = function(node){
  this.queue.unshift(node);
}

module.exports = Graph;
