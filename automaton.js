var Automaton = function(cvs, rule) {
	var ctx = cvs.getContext('2d');
	
	// draw data in a given grid
	var render = function(width, height) {
		return function(row, data) {
			data.forEach(function(point, index) {
				if(point == 1) { 
					ctx.fillStyle = "blue"
					ctx.fillRect(index*500/width, row*500/height, 500/width, 500/height);
				}
			});
		};
	};
	// generate generation based on ruleset
	var generate = function(rules) {
		return function(data) {
			var prev = (""+data).split(',');
			return data.map(function(_, n) {
				return rules[""+n>0?prev.slice().splice(n-1, 3):[0].concat(prev.slice().splice(0, 2))];
			});
		};
	};
	// nth nesting of generation
	var nest = function(fn, n) {
		return n == 0 ? function(x){return x;} : function() {
			return fn(nest(fn, n-1).apply({}, arguments));
		};
	};
	// range generator for convenient initial state construction
	var range = function(n) {
		return Array(n).join(0).split(0).map(function(_, index){return index});
	};
	// constant constructor for convenience in initial state construction
	var constant = function(x) {
		return function(){ return x; };
	};
	// decimal to binary for naming convention				
	var decimalToBin = function(n,i,a){for(a=[i=0];a[i]=n>>i&1,n>>i++;);return a};
	
	// parse rule number to get rule table
	var values = decimalToBin(rule);
	values = values.length < 8 ? values.concat(range(8-values.length).map(constant(0))).reverse() : values.reverse();
	var rules = {
		"1,1,1": values[0],
		"1,1,0": values[1],
		"1,0,1": values[2],
		"1,0,0": values[3],
		"0,1,1": values[4],
		"0,1,0": values[5],
		"0,0,1": values[6],
		"0,0,0": values[7]
	};
	
	// make generator and grid renderer
	var gen = generate(rules);
	var ren = render(50, 50);
	// provide initial condition
	var start = range(50).map(constant(0)).concat(1).concat(range(49).map(constant(0)));							
	// construct range of iteration in drawing
	var set = range(100);
	
	// recurse the drawing function for entire `set`
	this.draw = function draw() {
		var num = set.shift();
		ren(num, nest(gen, num)(start));
		if(set.length) setTimeout(draw, 1e2);
	};		
};
var Automaton2d = function(cvs, rules) {
	var ctx = cvs.getContext('2d');
	
	// render matrix in given grid
	var render = function(width, height) {
		return function(matrix) {
			matrix.forEach(function(row, y) {
				row.forEach(function(point, x) {
					if(point == 1) { 
						ctx.fillStyle = "blue"
						ctx.fillRect(x*500/width, y*500/height, 500/width, 500/height);
					}
				});
			});
		};
	};
	// array access with fallback to 0
	var get = function(xs, index) {
		return xs[index] || 0;
	};
	// sum and nearby functions for neighbor determining
	var sum = function(a,b){return a+b};
	var vicinity = function(y) {
		return function(_,y0) {
			return Math.abs(y0-y) < 2
		};
	};
	// map a matrix to a new generation given a ruleset
	var generate = function(rules) {			
		return function(matrix) {
			return matrix.map(function(row, y) {
				return row.map(function(living, x) {
					var col1 = matrix[y-1]||[], col2 = matrix[y+1]||[];
					var neighbors = matrix.filter(vicinity(y)).map(function(row) {
						return row.filter(vicinity(x));
					}).reduce(function(a,b) {
						return (a.map ? a.reduce(sum) : a)+b.reduce(sum);
					}) - living;
					return rules[living+","+neighbors] || 0;
				});						
			});
		};
	};
	// nth nesting of generation function
	var nest = function(fn, n) {
		return n == 0 ? function(x){return x;} : function() {
			return fn(nest(fn, n-1).apply({}, arguments));
		};
	};
	// range and constant convenience functions for initial condition construction
	var range = function(n) {
		return Array(n).join(0).split(0).map(function(_, index){return index});
	};
	var constant = function(x) {
		return function(){ return x; };
	};
		
	// add `white-space` to a matrix
	var fillGrid = function(subset, x, y) {
		return subset.concat(range(y-subset.length).map(constant([]))).map(function(xs) {
			return xs.concat(range(15-xs.length).map(constant(0)));
		});
	};	
			
	// make generator with conway's ruleset		
	var values = (rules+"").split('').map(function(x){return parseInt(x);});
	var gen = generate({
		"1,1": values[0],
		"1,2": values[1],
		"1,3": values[2],
		"1,4": values[3],
		"0,3": values[4]
	});
	// construct range of iteration in drawing
	var set = range(100);
				
	// make renderer for grid and initial condition				
	var ren = render(30, 30);
	var start = [
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,1,1,1,0,0,0,1,1,1,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,1,0,0,0,0,1,0,1,0,0,0,0,1,0],
		[0,1,0,0,0,0,1,0,1,0,0,0,0,1,0],
		[0,1,0,0,0,0,1,0,1,0,0,0,0,1,0],
		[0,0,0,1,1,1,0,0,0,1,1,1,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,1,1,1,0,0,0,1,1,1,0,0,0],
		[0,1,0,0,0,0,1,0,1,0,0,0,0,1,0],
		[0,1,0,0,0,0,1,0,1,0,0,0,0,1,0],
		[0,1,0,0,0,0,1,0,1,0,0,0,0,1,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,1,1,1,0,0,0,1,1,1,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
	];
	start = fillGrid(start, 30, 30);
				
	// recurse the drawing function for entire `set`				
	this.draw = function draw() {
		cvs.width = cvs.width;
		var num = set.shift();
		ren(nest(gen, num)(start));
		if(set.length) setTimeout(draw, 1e2);
	};		
};