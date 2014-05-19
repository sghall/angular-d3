d3.json("ing/7", function (error, response) {

  APP.force
    .charge(-500)
    .linkDistance(150)
    .nodes([])
    .links([])
    .on("tick", APP.tick)
    .drag().on("dragstart", APP.dragstart)

  var graph = APP.createNodesLinks(response[0].data)
  APP.force.nodes(graph.nodes);
  APP.force.links(graph.links);

  APP.updateNodes("10", APP.force);

  $(document).ready(function() {
    APP.resize();
  });

  $(window).on("resize", function() {
    APP.resize();
  });
});

