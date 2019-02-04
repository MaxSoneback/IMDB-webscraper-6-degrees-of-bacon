const axios = require('axios');
const cheerio = require('cheerio');
const Graph = require('./bfs/graph');
const Node = require('./bfs/node');

const url = "https://www.imdb.com";
let graph = new Graph();

async function findPath(startName, endName){
  const [startNode, endNode] = await Promise.all([
    findInitialNode(startName),
    findInitialNode(endName)
  ]);
  graph.setEndNode(endNode);
  graph.setStartNode(startNode);
  graph.enqueue(startNode);
  let path = await TraverseGraph();
  console.log(path.join(" ==> "));
}

//Följande funktion är det första söket genom IMDB, hittar start/slut-nod
function findInitialNode(searchTerm){
  try{
    //Gör en HTTP-request
    return axios.get(`${url}/find?ref_=nv_sr_fn&s=all&q=${searchTerm}`)
    .then(response => {
      const $ = returnCheerio(response);
      let firstHit = $('.findResult').first();
      let name = $(firstHit).find('.result_text').find('>:first-child').text();
      let url = $(firstHit).find('td a').attr('href');
      let img = $(firstHit).find('td a img').attr('src');
      //Extraherar IMDB-ID:t från URL:en
      let id = /nm\d+/.exec(url)[0];

      let actorNode = new Node(id, url, null, 'Actor', name, img );
      return actorNode;
      //console.log(graph);
    })
  }
  catch(err){
    console.log(err);
  }
}

async function TraverseGraph(){
  while(graph.queue.length > 0){
    let currentNode = graph.dequeue();
    console.log('----'+currentNode.value);
    if(currentNode.id===graph.endNode.id){
      return graph.constructPath(currentNode);
    }
    await findEdges(currentNode);
  }
}

async function findEdges(node){
  //TODO banta ner antalet requests
  try{
    if(node.parent){
      console.log('(har parent ' + node.parent.value + ')')
    }
    if (node.type==='Actor'){
      await fetchMovies(node);
    }
    else if(node.type === 'Movie'){
      await fetchActors(node);
    }
  }catch(err){
    console.log(err)
  }
}

function returnCheerio(response){
  //Om status = success
  if(response.status === 200){
    const html = response.data;
    //Ladda in html in i ett cheerio-objekt, vi kan nu använda
    //oss av jQuery-liknande kommandon
    return cheerio.load(html);
  }
}

async function fetchMovies(node){
  let response = await axios.get(`${url}${node.url}`);
  const $ = returnCheerio(response);

  let movie_column = $('div[data-category="actor"]').next();
  if(movie_column.length === 0){
    //om det är en skådespelerska istället för skådespelare
    movie_column = $('div[data-category="actress"]').next();
  }
  $(movie_column).find('.filmo-row').each(function(index,movie_row){

    try{
      //Sållar bort alla TV-serier, TV-spel m.m.
    if($(movie_row).html().split("<br>")[0].match(/\([\w\s]+\)/)[0]){
      return;
    }
  }catch(err){

  }
    let movie_url = $(movie_row).find('b a').attr('href');
    let id = movie_url.match(/\/title\/[\d\w]+\//)[0];
    let title = $(movie_row).find('b a').text();

    let movieNode = graph.getNode(id);
    if(!movieNode && id){
      movieNode = new Node(id, movie_url, node,'Movie', title);
      graph.addNode(movieNode);
      graph.enqueue(movieNode);
    }
  });
}

  async function fetchActors(node){

    //URL:en klipps: /title/tt0328107/?ref_=ttfc_fc_tt -> /title/tt0328107/
    let url_pre = node.url.match(/\/title\/[\d\w]+\//);

    // /title/tt0328107/?ref_=ttfc_fc_tt --> /title/tt0328107/fullcredits?ref_=ttfc_fc_tt#cast
    let url_post = url_pre + 'fullcredits?' + node.url.match(/\?ref_=[\w]+/) + '#cast';

    let cast_response = await axios.get(`${url}${url_post}`); //https://www.imdb.com/title/tt0328107/fullcredits?ref_=tt_cl_sm#cast
    const $ = returnCheerio(cast_response);

    //Bildlänk till filmen själv sparas härifrån för att spara ner på HTTP-requests
    //console.log($('.parent h3 a').attr('href'));


    $('tbody').find('.odd, .even').each(function(index,actor_row){
      try{
        let img = $(actor_row).find('img').attr('src');
        let name = $(actor_row).children('td').eq(1).text();
        //tar bort white-spaces bakom namnet
        name = name.replace(/^\s+|\s+$/g, "");
        let actor_url = $(actor_row).find('td a').attr('href');
        let id = /nm\d+/.exec(actor_url)[0];
        let actor_node = graph.getNode(id);
        if(!actor_node && id && actor_url){
          actor_node = new Node(id, actor_url,node,'Actor', name, img);
          graph.addNode(actor_node);
          if(actor_node.id === graph.endNode.id){
            graph.skipInLine(actor_node);
          }
          else{
            graph.enqueue(actor_node);
          }
        }
      }catch(err){
        console.log(err);
        return;
      }
    });
  }

  module.exports = {
    findPath
  }
