/**
 * @author Dimitry Kudrayvtsev
 * @version 2.1
 */

d3.gantt = function() {
    // Chart rendering properties
    var FIT_TIME_DOMAIN_MODE = "fit";
    var FIXED_TIME_DOMAIN_MODE = "fixed";
    
    var margin = {
		top : 20,
		right : 40,
		bottom : 20,
		left : 150
    };
    var height = document.body.clientHeight - margin.top - margin.bottom-5;
    var width = document.body.clientWidth - margin.right - margin.left-5;
    var mileStoneRadius = 2;

    var timeDomainStart = d3.time.day.offset(new Date(),-3);
    var timeDomainEnd = d3.time.hour.offset(new Date(),+3);
    var timeDomainMode = FIT_TIME_DOMAIN_MODE;// fixed or fit
    var categories = [];
    var taskStatus = [];
    var tasks = [];
    var mileStones = [];
    var dateLines = [];
    //
    var overlappingResolver = d3.overlappingResolver();
    var categoryAxisRenderer = d3.categoryAxisRenderer();


    var tickFormat = "%H:%M";

    var keyFunction = function(d) {
		return d.id;
    };
    var mskeyFunction = function(d){
    	return d.id;
    }

    var rectTransform = function(d) {
    	var xpos = x(d.startDate)
		var ypos = categoryAxisRenderer.position(d);
    	return "translate(" + xpos + "," + ypos + ")";
    };

    var mileStoneTransform = function(d) {
    	var xpos = x(d.date)
    	var ypos = categoryAxisRenderer.position(d);
    	return "translate(" + xpos + "," + ypos + ")";
    };

    var x = d3.time.scale().domain([ timeDomainStart, timeDomainEnd ]).range([ 0, width ]).clamp(true);
    var xAxis = d3.svg.axis().scale(x).orient("bottom").tickFormat(d3.time.format(tickFormat)).tickSubdivide(true)
	    .tickSize(8).tickPadding(8);

    var initTimeDomain = function(tasks) {
		if (timeDomainMode === FIT_TIME_DOMAIN_MODE) {
		    if (tasks === undefined || tasks.length < 1) {
			timeDomainStart = d3.time.day.offset(new Date(), -3);
			timeDomainEnd = d3.time.hour.offset(new Date(), +3);
			return;
		    }
		    tasks.sort(function(a, b) {
			return a.endDate - b.endDate;
		    });
		    timeDomainEnd = tasks[tasks.length - 1].endDate;
		    tasks.sort(function(a, b) {
			return a.startDate - b.startDate;
		    });
		    timeDomainStart = tasks[0].startDate;
		}
    };

    var initAxis = function() {
		x = d3.time.scale().domain([ timeDomainStart, timeDomainEnd ]).range([ 0, width ]).clamp(true);
		xAxis = d3.svg.axis().scale(x).orient("bottom").tickFormat(d3.time.format(tickFormat)).tickSubdivide(true)
			.tickSize(8).tickPadding(8);

		var yAxisHeight = height - margin.top - margin.bottom;
		categoryAxisRenderer.overlappingResolver(overlappingResolver).categories(categories).configValue("axisHeight", yAxisHeight) .initAxis();
    };

    var axisTransition = function(){
    	// build x and y axis using d3 scales
		var chartGroup = d3.select(".gantt-chart");
		chartGroup.append("g")
		 .attr("class", "x axis")
		 .attr("transform", "translate(0, " + (height - margin.top - margin.bottom) + ")")
		 .transition()
		 .call(xAxis);
		
		yAxisGroup = chartGroup.append("g").attr("class", "y axis");
		categoryAxisRenderer.draw(yAxisGroup);

    }

    var initChartCanvas = function (){
		var chartGroup = d3.select("body")
			.append("svg")
			.attr("class", "chart")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("class", "gantt-chart")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.attr("transform", "translate(" + margin.left + ", " + margin.top + ")");
		
		// draw x axis grid lines
		chartGroup.selectAll("line.tickX")
		  .data(x.ticks(10))
		  .enter().append("line")
		  .attr("class", "tickX")
		  .attr("x1", x)
		  .attr("x2", x)
		  .attr("y1", 0)
		  .attr("y2", (height - margin.top - margin.bottom) )
		  .style("stroke", "#ccc");		

		// draw y axis grid lines
		var gridWidth = width + margin.left + margin.right;
		chartGroup.selectAll("line.tick")
		  .data(categoryAxisRenderer.ticks())
		  .enter().append("line")
		  .attr("class", "tickY")
		  .attr("x1", 0)
		  .attr("x2", gridWidth)
		  .attr("y1", function(d){ return d;})
		  .attr("y2", function(d){ return d;})
		  .style("stroke", "#ccc");		

		var barGroup = chartGroup.append("g").attr("class", "gantt-bars");
    }

    /*   CHART RENDERING METHODS */

    /**
     * draws datelines on svg canvas
     */
    var drawDateLines = function (dateLines){
		var chartGroup = d3.select(".gantt-bars");
		
    	chartGroup.selectAll("line").data(dateLines,function(d) { return d.date; })
    		.enter()
    		.append("line")
    		.attr("x1",function (d) { return x(d.date);})
    		.attr("y1","0")
    		.attr("x2",function (d) { return x(d.date);})
    		.attr("y2",height)
    		.attr("style",function (d) { return d.style;});
    }
    
    var drawMilestones = function (mileStones){

		var svg = d3.select("svg");
		var chartGroup = svg.select(".gantt-chart");
		var barGroup =  chartGroup.select(".gantt-bars");

		var taskGSelection = barGroup.selectAll("g.mileStone").data(mileStones,keyFunction);
		
		var group = taskGSelection.enter().append("g")
			.attr("rx", 5)
	    	.attr("ry", 5)
		 	.attr("class", "mileStone") 
		 	.attr("y", 0)
		 	.attr("transform", mileStoneTransform);

		// add milestone mark
    	group.append("circle")
    		.attr("cx",0)
    		.attr("cy","0")
    		.attr("r",mileStoneRadius)
    		.attr("stroke","black")
    		.attr("stroke-width","3");

		// add labels
		group.append("text")
			.attr("x",  mileStoneRadius*2 +6)
			.attr("y",  mileStoneRadius)
			.attr("fill","black")
			.text(function(d){ return d.label;})
		 
		
    }
    
	var drawTasks = function (tasks){

		var svg = d3.select("svg");
		var chartGroup = svg.select(".gantt-chart");
		var barGroup =  chartGroup.select(".gantt-bars");
		var taskGSelection = barGroup.selectAll("g").data(tasks,keyFunction);

		var group = taskGSelection.enter().append("g")
		 .attr("rx", 5)
		 .attr("ry", 5)
		 .attr("class", function(d){ 
		     if(taskStatus[d.status] == null){ return "bar";}
		     return taskStatus[d.status];
		     }) 
		 .attr("y", 0)
		 .attr("transform", rectTransform)
		 .attr("height", function(d) { return categoryAxisRenderer.config().barHeight; })
		 .attr("width", function(d) { 
		     return (x(d.endDate) - x(d.startDate)); 
		     });

		// add bar's rect
		group.append("rect")
		 .attr("rx", 5)
	     .attr("ry", 5)
		 .attr("class", function(d){ 
		     if(taskStatus[d.status] == null){ return "bar";}
		     return taskStatus[d.status];
		     }) 
		 .attr("y", 0)
		 .attr("height", function(d) { return categoryAxisRenderer.config().barHeight; })
		 .attr("width", function(d) { 
		     return (x(d.endDate) - x(d.startDate)); 
		     });

		// add labels
		group.append("text")
			.attr("y", function(d) { return 3 + categoryAxisRenderer.config().barHeight /2; })
			.attr("x", function(d) { return 5; })
			.attr("fill","black")
			.text(function(d){ return d.label;})
		 
		
    }

    var getGroupPosition = function(groupNode){
    	var tfrm = groupNode.attr("transform");

		var pos_init = tfrm.indexOf("(");
		var pos_comma = tfrm.indexOf(",");
		var pos_end = tfrm.indexOf(")");
		var posX = tfrm.substring(pos_init+1, pos_comma);
		var posY = tfrm.substring(pos_comma+1, pos_end);

		return {"x":parseInt(posX), "y": parseInt(posY)}
    } 

    gantt.draw = function() {
    	overlappingResolver.tasks(tasks).calculateOverlapping();
		
		initTimeDomain(tasks);
		initAxis();
		
		initChartCanvas();

		// render data visualization
		drawTasks(tasks);
		drawDateLines(dateLines);
		drawMilestones(mileStones);

		axisTransition();

		return gantt;
    };

    /**
     * rerenders data
     */
    gantt.redraw = function() {
    	overlappingResolver.tasks(tasks).calculateOverlapping();
		
		initTimeDomain(tasks);
		initAxis();
		
		// initChartCanvas();

		// render data visualization
		drawTasks(tasks);
		drawDateLines(dateLines);
		drawMilestones(mileStones);

		axisTransition();

		return gantt;
    };

    gantt.margin = function(value) {
	if (!arguments.length)
	    return margin;
	margin = value;
	return gantt;
    };

    gantt.timeDomain = function(value) {
	if (!arguments.length)
	    return [ timeDomainStart, timeDomainEnd ];
	timeDomainStart = +value[0], timeDomainEnd = +value[1];
	return gantt;
    };

    /**
     * @param {string}
     *                vale The value can be "fit" - the domain fits the data or
     *                "fixed" - fixed domain.
     */
    gantt.timeDomainMode = function(value) {
	if (!arguments.length)
	    return timeDomainMode;
        timeDomainMode = value;
        return gantt;

    };
    
    gantt.taskStatus = function(value) {
	if (!arguments.length)
	    return taskStatus;
	taskStatus = value;
	return gantt;
    };

    gantt.width = function(value) {
	if (!arguments.length)
	    return width;
	width = +value;
	return gantt;
    };

    gantt.height = function(value) {
	if (!arguments.length)
	    return height;
	height = +value;
	return gantt;
    };

    gantt.tickFormat = function(value) {
	if (!arguments.length)
	    return tickFormat;
	tickFormat = value;
	return gantt;
    };

    gantt.categories = function(value) {
	if (!arguments.length)
	    return categories;
	categories = value;
	overlappingResolver.categories(categories);
	return gantt;
    };

    gantt.tasks = function(value){
		if (!arguments.length)
		    return tasks;
		tasks = value;
		overlappingResolver.tasks(value).calculateOverlapping();
		return gantt;
	};

    gantt.mileStones = function(value){
		if (!arguments.length)
		    return mileStones;
		mileStones = value;
		return gantt;
	};

    gantt.dateLines = function(value){
		if (!arguments.length)
		    return dateLines;
		dateLines = value;
		return gantt;
	};

	gantt.overlappingResolver = function(value){
		if (!arguments.length)
		    return overlappingResolver;
		overlappingResolver = value;
		return gantt;
	}

	gantt.categoryAxisRenderer = function(value){
		if (!arguments.length)
		    return categoryAxisRenderer;
		categoryAxisRenderer = value;
		return gantt;
	};
	
	function gantt() {
		return gantt;
    };


    return gantt;
};


d3.categoryAxisRenderer = function(){
	var overlappingResolver;
	var scale = 1;
	var categories = [];
	/* Each position stores an array with two items, tasksBand_height and milestonesBand_height*/
	var categoriesRanges = {};

	var config = {
		"axisHeight": 200,
		"barHeight" : 15,
		"barPadding" : 5,
		"barMargin" : 5,
		"minTaskBandHeight": 30,
		"mileStoneHeight" : 15
	};


	var calculateTaskBandHeight = function(category){
		var numPararellTasks = overlappingResolver.categoryMaxOverlaps(category);
		var height = config["minTaskBandHeight"];
		if (numPararellTasks > 0){
			height = config.barMargin + (numPararellTasks-1)*(config.barHeight + config.barPadding) + config.barHeight + config.barMargin;
		}
		return height;
	};

	var calculateMilestoneBandHeight = function(category){
		return config.mileStoneHeight;
	};


	/* Calculates categories ranges */
	categoryAxisRenderer.initAxis  = function(){
		var ini = 0;
		var end = 0;

		var category;
		for (var c=0; c < categories.length; c++){
			category = categories[c];
			var taskBandH = calculateTaskBandHeight(category);
			var msBandH = calculateMilestoneBandHeight(category);
			end = ini + taskBandH + msBandH;

			categoriesRanges[category] = { "taskIni": ini, "taskEnd": (ini +taskBandH), "mStoneIni": (ini + taskBandH),  "mStoneEnd": end } ;
			ini = end;
		}
		return categoryAxisRenderer;
	};

	var catGroupTranslation = function(d){
		var range = categoryAxisRenderer.getCategoryRange(d);
		var ypos = range[0] + (range[1]-range[0])/2;
		return "translate(0," + ypos+ ')'

	}

	categoryAxisRenderer.ticks = function(){
		var category, range;
		var ticks = [];
		for (var c= 0; c < categories.length; c++){
			category = categories[c];
			range = categoryAxisRenderer.getCategoryRange(category);
			ticks.push(range[0]);
		}
		if(range != null){
			// last tick
			ticks.push(range[1]);
		}
		return ticks;
	}

	/* Calculates object rendering position in category axis */
	categoryAxisRenderer.position = function(d){
		// check if object is a task or a milestone
		if (hasOwnProperty(d, "startDate")){
			// task
	    	var numParallelTask = overlappingResolver.taskTotalOverlaps(d).length;
	    	var categoryTaskRange = categoryAxisRenderer.getCategoryTasksRange(d.category)
	    	var ypos = categoryTaskRange[0] + config.barMargin + numParallelTask*(config.barHeight + config.barPadding);
		} else {
			if (hasOwnProperty(d, "date")){
				// milestone
		    	var categoryMsRange = categoryAxisRenderer.getCategoryMileStonesRange(d.category)
		    	var ypos = categoryMsRange[0] + config.mileStoneHeight/2;
			} else{
				// invalid object type
				return null;
			}
		}
		return ypos;
	}

	/* Draws axis hanging on the svg node passed as parameter */
	categoryAxisRenderer.draw  = function(node){
		// draw axis line
		node.append("line")
    		.attr("x1","0")
    		.attr("y1","0")
    		.attr("x2","0")
    		.attr("y2",config.axisHeight)
    		.attr("style","stroke:black");

		// draw category labels
		node.selectAll("g").data(categories, function(d){return d;})
			.enter().append("g")
			.attr("transform", catGroupTranslation)
			.append("text")
			.attr("x", "-5")
			.attr("style", "text-anchor: end")
			.text(function(d){ return d;});

		// draw a line for each tip
		node.selectAll("line.axisTip").data(categoryAxisRenderer.ticks()).enter()
			.append("line")
			.attr("class", "axisTip")
    		.attr("x1","0")
    		.attr("y1",function(d){ return d;})
    		.attr("x2","-5")
    		.attr("y2",function(d){ return d;})
    		.attr("style","stroke:black");

		return categoryAxisRenderer;
	};

	/* Getters / Setters */
	categoryAxisRenderer.getCategoryRange  = function(category){
		var init = categoriesRanges[category].taskIni;
		var end = categoriesRanges[category].mStoneEnd;
		return [init,end];
	};

	categoryAxisRenderer.getCategoryTasksRange  = function(category){
		var init = categoriesRanges[category].taskIni;
		var end = categoriesRanges[category].taskEnd;
		return [init,end];
	};

	categoryAxisRenderer.getCategoryMileStonesRange  = function(category){
		var init = categoriesRanges[category].mStoneIni;
		var end = categoriesRanges[category].mStoneEnd;
		return [init,end];
	};

	categoryAxisRenderer.overlappingResolver = function(value) {
		if (!arguments.length)
		    return overlappingResolver;
		overlappingResolver = value;
		return categoryAxisRenderer;
    };

	categoryAxisRenderer.categories = function(value) {
		if (!arguments.length)
		    return categories;
		categories = value;
		return categoryAxisRenderer;
    };

	categoryAxisRenderer.scale = function(value) {
		if (!arguments.length)
		    return scale;
		scale = value;
		return categoryAxisRenderer;
    };
	categoryAxisRenderer.config = function(value) {
		if (!arguments.length)
		    return config;
		// copy values in config object
		for(var k in config) config[k]=value[k];
		return categoryAxisRenderer;
    };

	categoryAxisRenderer.configValue = function(property, value) {
		config[property]=value;
		return categoryAxisRenderer;
    };


	function categoryAxisRenderer(){

	};
	
	return categoryAxisRenderer;
}



d3.overlappingResolver = function(){
	var categories = [];
	var tasks = [];
	var range = [0,200];
	/* registers overlaps between tasks. Each item relates task's 
		id with an array containg overlapped tasks id*/
	var overlaps = {};

	overlappingResolver.categories = function(value){
		if (!arguments.length)
		    return categories;
		categories = value;
		return overlappingResolver;
	};

	overlappingResolver.tasks = function(value){
		if (!arguments.length)
		    return tasks;
		tasks = value;
		return overlappingResolver;
	};

	/* Calculates de máx num of parallel task in a category */
	overlappingResolver.categoryMaxOverlaps = function (category){
		var maxParallel = 0;
		// get category tasks
		var searchFunctor = function(d){return (d.category == category);};
		var taskList = tasks.filter(searchFunctor);

		var numParallel = 0;
		for (var t=0; t< taskList.length; t++){
			numParallel = overlappingResolver.taskTotalOverlaps(taskList[t]).length + 1;
			if(numParallel > maxParallel){
				maxParallel = numParallel;
			}
		}
	    return maxParallel;
	};

	/* get num of overlaps of current tasks*/
	overlappingResolver.taskOverlaps = function (task){
	    return overlaps[task.id];
	};

	/* get num of overlaps of current tasks joined with overlaps of overlapped tasks. */
	overlappingResolver.taskTotalOverlaps = function (task){
		var olp = [];
		deepSearch(task.id, olp);

		var uniqueValues = olp.filter(function(elem, pos) {
		    return olp.indexOf(elem) == pos;
		});
	    return uniqueValues;
	};


	function deepSearch(element, stack){
		if(!hasOwnProperty(overlaps, element)){
			return;
		} else {
			for (var i=0; i < overlaps[element].length; i++){
				deepSearch(overlaps[element][i], stack);
				stack.push(overlaps[element][i]);
			}
		}

	}

	var addOverlap = function (overlappingTask, overlappedTask){
		if(!hasOwnProperty(overlaps, overlappingTask.id)){
			overlaps[overlappingTask.id] = [];
		}
		overlaps[overlappingTask.id].push(overlappedTask.id);
	};


	overlappingResolver.calculateOverlapping = function (){
		// for each category go trought tasks and populate overlaps array
		for (var i = 0; i < categories.length; i++) {
			calculateCategoryOverlapping(categories[i]);
		}
		return overlappingResolver;
	};

	/* Go through category task and check which ones are overlapped and 
	populate overlaps hash with this info */
	var calculateCategoryOverlapping = function(category){
		var searchFunctor = function(d){return (d.category == category);};
		var taskList = tasks.filter(searchFunctor);
		if(taskList != null && taskList.length > 0){
			for (var t = 0; t < taskList.length; t++){
				checkOverlapping(taskList[t],t, taskList);
			}
		}
	};
	
	/* Checks overlapping between current task and all preceding ones */
	var checkOverlapping = function(element, index, array) {
		if (index == 0){
			return;
		}
		for (i=index-1; i>=0; i--){
			if(element.startDate < array[i].endDate){
				// current task overlaps in array[i] task
				addOverlap(element, array[i])
			}
		}
	};

    function overlappingResolver() {
		return overlappingResolver;
    };

    return overlappingResolver;
};


function hasOwnProperty (obj, prop) {
    var proto = obj.__proto__ || obj.constructor.prototype;
    return (prop in obj) &&
        (!(prop in proto) || proto[prop] !== obj[prop]);
};


