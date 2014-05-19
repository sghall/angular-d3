(function () {
  var width = 900, height = 800;

  var svg = d3.select("#svg-container").append("svg")
    .attr("id", "graph-svg")
    .attr("width", width)
    .attr("height", height);

  var link = svg.selectAll(".link");
  var node = svg.selectAll(".node");

  var APP = {};

  APP.force = d3.layout.force()
    .size([width, height])

  APP.createNodesLinks = function (data) {
    var nodes = {}, links = [];

    _.each(data, function (relation) {
      _.each(relation.graph.nodes, function (node) {
        if (!nodes[node.id]) nodes[node.id] = node;
      });
      addLinks(relation)
    });

    function addLinks(d) {
      _.each(d.graph.relationships, function (r) {
        links.push({source: nodes[r.startNode], target: nodes[r.endNode]})
      })
    }
    return {nodes: _.toArray(nodes), links: links};
  };

  APP.updateNodes = function (curid, force) {
    node = node.data(force.nodes(), function(d) { return d.id;});
    node.enter().append("g")
      .attr("class", "node")
      .on("dblclick", dblclick)
      .call(APP.force.drag);

    node.append("circle")
      .attr("class", function (d) { return d.properties.label === "Recipe" ? "recipe": "ingredient"; })
      .attr("r", function (d) { return d.properties.label === "Recipe" ? 15: 10; })

    node.append("text")
      .attr("dx", function (d) { return d.properties.label === "Recipe" ? 15: 12; })
      .attr("dy", ".35em")
      .text(function (d) { return d.properties.name });

    node.classed("selected", function (d) { return d.id == curid })
    node.exit().remove();

    link = link.data(force.links(), function (d) { return d.source.id + "-" + d.target.id; });
    link.enter().append("line")
      .attr("class", "link")
      .style("stroke-width", "2px");
    link.exit().remove();

    force.start();
  };

  function onSucces(response, id) {
    var graph = this.createNodesLinks(response[0].data);
    this.force.nodes(graph.nodes).links(graph.links);
    this.updateNodes(id, this.force);
  }

  function getData(d) {
    var props = d.properties;
    if (props.label==="Ingredient") {
      $.ajax({
        type : "GET",
        url : "ing/" + d.id,
        cache : false,
        success : function(response) {
          onSucces.call(APP, response, d.id);
        }
      });
    }
  };

  function dblclick (d) {
    if (d.properties.label === "Recipe"){
      d3.select(this).classed("fixed", d.fixed = false);
      APP.force.start();
    } else {
      getData(d);
    }
  };

  APP.resize = function () {
    var chart = $("#graph-svg");
    chart.attr("width", chart.parent().width());
    chart.attr("height", chart.parent().height());
    this.force.size([chart.parent().width(), chart.parent().height()]);
    this.force.start(); 
  }

  APP.tick = function() {
    link.attr("x1", function (d) { return d.source.x; })
      .attr("y1", function (d) { return d.source.y; })
      .attr("x2", function (d) { return d.target.x; })
      .attr("y2", function (d) { return d.target.y; });

    node.attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });
  };

  APP.dragstart = function (d) {
    if (d.properties.label === "Recipe"){
      d3.select(this).classed("fixed", d.fixed = true);
    }
  }
  window.APP = APP; 
}())