var myApp = angular.module('myApp', ['ngAnimate', 'fx.animations']);

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

  $scope.season = 1;
  $scope.seasons = d3.range(1, 26);
  $http.get('episodes/1').success(function(data){
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

  // $http.get('donut-data-2.json').then(function(response){
  //   $scope.characters = response.data;
  // }, function(err){
  //   throw err;
  // });
});

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

