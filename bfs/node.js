function Node(id, url, parent, type, value, img){
  this.id=id;
  this.url=url;
  this.parent= parent || null;
  this.type=type;
  this.value=value;
}

module.exports = Node;
