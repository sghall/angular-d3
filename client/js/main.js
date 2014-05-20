var myApp = angular.module('myApp', ['ngAnimate', 'fx.animations', 'ngSanitize']);

myApp.controller('MainCtrl', function($scope, $http){

  $scope.updateSeason = function () {
    $scope.season = this.s;
    $http.get('episodes/' + $scope.season).success(function(data){
      $scope.dateFormat = function (str) {
        var year = str.slice(0,4);
        var mnth = str.slice(5,7);
        var days = str.slice(8,10);
        return mnth + "-" + days + "-" + year;
      };

      console.log(data[0][0].data);
      $scope.episodes = data.sort(function (a, b) {
        return a[0].data.sequence - b[0].data.sequence;
      });
    }).error(function(err){
      throw err;
    });
  };

  $scope.updateEpisode = function () {
    $scope.plot = '<strong>PLOT: </strong>' + this.ep[0].data.plot;
    $scope.title = this.ep[0].data.title;
    $scope.snumber = this.ep[0].data.season;
    $scope.enumber = this.ep[0].data.sequence;
      var ul = this.ep[0].self;
      var id = +ul.substr(ul.lastIndexOf('/') + 1);
      $http.get('characters/' + id).success(function(data){
        $scope.episodeCast = data;
        $scope.episodeID = id;
      }).error(function(err){
        throw err;
      });
  };

  $scope.season = 1;
  $scope.seasons = d3.range(1, 26);
  $http.get('episodes/1').success(function(data){
    $scope.dateFormat = function (str) {
      var year = str.slice(0,4);
      var mnth = str.slice(5,7);
      var days = str.slice(8,10);
      return mnth + "-" + days + "-" + year;
    };

    $scope.episodes = data.sort(function (a, b) {
      return a[0].data.sequence - b[0].data.sequence;
    });
  }).error(function(err){
    throw err;
  });

});

myApp.directive('forceChart', ['$http', function($http){
  function link(scope, el, attr){

    var width = 700, height = 375;

    var svg = d3.select(el[0]).append("svg")
    svg.attr({id: 'graph-svg', width: width, height: height});

    var link = svg.selectAll(".link");
    var node = svg.selectAll(".node");

    var force = d3.layout.force()
        .size([width, height])

    var createNodesLinks = function (data) {
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

    var onCharClick = function (d) {
      if (d.labels[0] === "Character") {
        d3.select('#character').text(d.properties.description)
        d3.select('#character-name').text(d.properties.name)
        $http.get('/char/episodes/' + d.id).success(function(data){

          var s = {};
          d3.range(1, 26).forEach(function (d) {
            s['Season ' + d] = {num: d, count: 0};
          });

          data.forEach(function (d) {
            s['Season ' + d[0]].count += 1;
          });

          scope.charData = _.toArray(s);
        }).error(function(err){
          throw err;
        });
      }
    };

    var dragstart = function (d) {
      if (d.properties.label === "Recipe"){
        d3.select(this).classed("fixed", d.fixed = true);
      }
    }

    var tick = function() {
      link.attr("x1", function (d) { return d.source.x; })
        .attr("y1", function (d) { return d.source.y; })
        .attr("x2", function (d) { return d.target.x; })
        .attr("y2", function (d) { return d.target.y; });

      node.attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });
    };

    var updateNodes = function (curid, force) {
      d3.selectAll("text").remove();

      node = node.data(force.nodes(), function(d) { return d.id;});
      node.enter().append("g")
        .attr("class", "node")
        .call(force.drag);

      node.append("circle")
        .attr("class", function (d) { return d.properties.label === "Episode" ? "episode": "character"; })
        .attr("r", function (d) { return d.properties.label === "Episode" ? 15: 10; })
        .on("click", onCharClick)

      node.append("text")
        .attr("dx", function (d) { return d.properties.label === "Episode" ? 15: 12; })
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

    scope.$watch('episodeCast', function(data){
      if (data) {
        force
          .charge(-500)
          .linkDistance(150)
          .nodes([])
          .links([])
          .on("tick", tick)
          .drag().on("dragstart", dragstart)

        var graph = createNodesLinks(data[0].data)
        force.nodes(graph.nodes);
        force.links(graph.links);
        updateNodes(null, force);
      }
    }, true);
  }
  return {
    link: link,
    restrict: 'E',
    scope: false
  };
}]);


myApp.directive('barChart', function(){
  function link(scope, el, attr){
    var margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = 1000 - margin.left - margin.right,
        height = 200 - margin.top - margin.bottom;

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(25)

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var svg = d3.select(el[0]).append("svg")
        .attr("width",  width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



    var bars = svg.selectAll(".bar")
      
    scope.$watch('charData', function(data){
      if (data) {
        data.sort(function (a,b) { return a.num - b.num; })
        x.domain(data.map(function(d) { return d.num; }));
        y.domain([0, 20]);

        d3.selectAll(".axis").remove();

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (height) + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
          .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Appearances");

        bars = bars.data(data, function (d) { return d.num });
        bars.enter().append("rect")
          .attr("class", "bar")
          .attr("x", function(d) { return x(d.num); })
          .attr("width", x.rangeBand())
          .attr("y", function(d) { return y(d.count); })
          .attr("height", function(d) { return height - y(d.count); });

        bars.transition().duration(1000)
          .attr("y", function(d) { return y(d.count); })
          .attr("height", function(d) { return height - y(d.count); });
      }
    }, true);
  }
  return {
    link: link,
    restrict: 'E',
    scope: false
  };
});

// $(document).ready(function() {
//   resize();
// });

// $(window).on("resize", function() {
//   resize();
// });

// var resize = function () {
//   var chart = $("#graph-svg");
//   chart.attr("width", chart.parent().width());
//   chart.attr("height", chart.parent().height());
//   this.force.size([chart.parent().width(), chart.parent().height()]);
//   this.force.start(); 
// }



// myApp.directive('episodeList', function(){
//   function link(scope, el, attr){
//     var color = d3.scale.category10();
//     var width = 200;
//     var height = 200;
//     var min = Math.min(width, height);
//     var svg = d3.select(el[0]).append('svg');
//     var pie = d3.layout.pie().sort(null);
//     var arc = d3.svg.arc()
//       .outerRadius(min / 2 * 0.9)
//       .innerRadius(min / 2 * 0.5);

//     svg.attr({width: width, height: height});

//     // center the donut chart
//     var g = svg.append('g')
//       .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');
    
//     // add the <path>s for each arc slice
//     var arcs = g.selectAll('path');

//     scope.$watch('data', function(data){
//       if(!data){ return; }
//       arcs = arcs.data(pie(data));
//       arcs.exit().remove();
//       arcs.enter().append('path')
//         .style('stroke', 'white')
//         .attr('fill', function(d, i){ return color(i) });
//       // update all the arcs (not just the ones that might have been added)
//       arcs.attr('d', arc);
//     }, true);
//   }
//   return {
//     link: link,
//     restrict: 'E',
//     scope: { data: '=' }
//   };
// });


// myApp.controller('MainCtrl',function($scope,$http){ // using success/error callback style 
//   $http.get('episodes/1')
//   .success(function(data){
//     $scope.episodeData = data; })
//   .error(function(err){
//     throw err; 
//   });
// }





// d3.json("ing/7", function (error, response) {

//   APP.force
//     .charge(-500)
//     .linkDistance(150)
//     .nodes([])
//     .links([])
//     .on("tick", APP.tick)
//     .drag().on("dragstart", APP.dragstart)

//   var graph = APP.createNodesLinks(response[0].data)
//   APP.force.nodes(graph.nodes);
//   APP.force.links(graph.links);

//   APP.updateNodes("10", APP.force);

//   $(document).ready(function() {
//     APP.resize();
//   });

//   $(window).on("resize", function() {
//     APP.resize();
//   });
// });

