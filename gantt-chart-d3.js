/**
 * @author Gustavo Río Briones
 * Based on work of Dimitry Kudrayvtsev
 * @version 2.1
 */

 /*
 CSS class selectors:
	svg.chart
		g.gantt-chart
			g.gantt-bars
				g.g_task
					rect.task-bar
					text.task-label
				g.g_mileStone
					circle.milestone-mark
					text.milestone-label
				g.g_dateline
					line.dateline-line
					text.dateline-label
			g.xaxis-group
				path.domain
				line.tickX minor
				g.tickX major
					line
					text
			g.yaxis-group
				line.axisY
				line.tickY
				g
					text.tickY-label 
			g.grid-group
				line.gridX
				line.gridY

 */

d3.gantt = function() {
    // Chart rendering properties
    var FIT_TIME_DOMAIN_MODE = "fit";
    var FIXED_TIME_DOMAIN_MODE = "fixed";

    var id = Math.floor((Math.random()*1000000)+1);
    
    var margin = {
		top : 20,
		right:  40,
		bottom : 20,
		left : 150
    };

    var height = null; // if no height provided, chart height will be calculated with task bar height
    var width = null;  // if no width provided, the chart will expand to screen width
    var mileStoneRadius = 2;

    var timeDomainStart =null;
    var timeDomainEnd = null;
    var timeDomainMode = FIT_TIME_DOMAIN_MODE;// fixed or fit
    var tickFormat = "%H:%M"; // default tick format

    // model arrays
    var categories = [];
    var tasks = [];
    var mileStones = [];
    var dateLines = [];

    // helper to provide task overlapping treatement
    var overlappingResolver = d3.overlappingResolver();
    // axis renderers
    var categoryAxisRenderer = d3.categoryAxisRenderer();
    var timeAxisRenderer = d3.timeAxisRenderer();

    var eventHandlers = {
    	"task": {},
    	"milestone":{},
    	"dateline":{}
    };

    var getChartHeight = function(){
    	var chartHeigth = null;
    	if(height != null && height > 0){
    		chartHeigth = height;
    	} else {
    		chartHeigth = categoryAxisRenderer.calculatedLength();
    	}
    	return chartHeigth;
    }

    var getChartWidth = function(){
    	var chartWidth = null;
    	if(width != null && width > 0){
    		chartWidth = width;
    	} else {
    		chartWidth = document.body.clientWidth - margin.right - margin.left-5
    	}
    	return chartWidth;
    }

    var keyFunction = function(d) {
		return "t_" + d.id;
    };
    var mskeyFunction = function(d){
    	return "ms_" + d.id;
    }

    var taskBarTransform = function(d) {
    	var xpos = timeAxisRenderer.position(d.startDate)
		var ypos = categoryAxisRenderer.position(d);
    	return "translate(" + xpos + "," + ypos + ")";
    };

    var mileStoneTransform = function(d) {
    	var xpos = timeAxisRenderer.position(d.date)
    	var ypos = categoryAxisRenderer.position(d);
    	return "translate(" + xpos + "," + ypos + ")";
    };

    var dateLineTransform = function(d) {
    	var xpos = timeAxisRenderer.position(d.date)
    	var ypos = 0;
    	return "translate(" + xpos + "," + ypos + ")";
    };

	/**
		Selects root chart "g" node for current gantt chart.
	*/
    var getChartGroup = function() {
		var chartGroup = d3.select("body").selectAll("svg").data([id], function(d){ return d;}).selectAll(".gantt-chart");
		return chartGroup;
    }

    var assignEvent = function (objectType, selection){
    	handlers = eventHandlers[objectType];
    	for(h in handlers){
    		selection.on(h,function(d){ 
    			handlers[h](d)
    		})
    	}
    }


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

		    timeAxisRenderer.domain([timeDomainStart, timeDomainEnd]).init();
		}
    };

    var configureAxisDomain = function() {
		timeAxisRenderer.domain([ timeDomainStart, timeDomainEnd ]).tickFormat(tickFormat).configValue("axisLength",getChartWidth())
		timeAxisRenderer.init();

		categoryAxisRenderer.overlappingResolver(overlappingResolver).categories(categories);
		if(height != null){
			categoryAxisRenderer.configValue("axisLength", height);
		}
		categoryAxisRenderer.init();
    };

    var drawAxis = function(){
    	configureAxisDomain();
    	renderAxis();
    	drawGrid();
    }

    var renderAxis = function() {
		var chartGroup = getChartGroup();

		// create y axis group if it not exists
		var yAxisGroup = chartGroup.select("g.yaxis-group");
		if (yAxisGroup.empty()){
			yAxisGroup = chartGroup.append("g").attr("class", "yaxis-group");
		}

		categoryAxisRenderer.draw(yAxisGroup);

    	// build x axis
		var xAxisGroup = chartGroup.select("g.xaxis-group");
		if (xAxisGroup.empty()){
			xAxisGroup = chartGroup.append("g").attr("class", "xaxis-group")
		}
		xAxisGroup.attr("transform", "translate(0, " + getChartHeight() + ")")

		timeAxisRenderer.draw(xAxisGroup)
		// xAxisGroup.transition().call(xAxis);
    }

    var drawGrid = function(){
		var gridGroup = getChartGroup().select("g.grid-group")
		if(gridGroup.empty()){
			// create grid group
			gridGroup = getChartGroup().append("g").attr("class","grid-group")
		}

		// draw x axis grid lines
		gridGroup.selectAll("line.gridX").remove();
		gridGroup.selectAll("line.gridX")
		  .data(timeAxisRenderer.ticks(),function(d){ return d;})
		  .enter().append("line")
		  .attr("class", "gridX")
		  .attr("x1", function(d){ return d;})
		  .attr("x2", function(d){ return d;})
		  .attr("y1", 0)
		  .attr("y2", getChartHeight() )
		  .style("stroke", "#ccc");		

		// draw y axis grid lines
		var gridWidth = getChartWidth() + margin.left + margin.right;

		gridGroup.selectAll("line.gridY").remove();
		gridGroup.selectAll("line.gridY").data(categoryAxisRenderer.ticks(), function(d){ return d;}).enter()
		  .append("line")
		  .attr("class", "gridY")
		  .attr("x1", 0)
		  .attr("x2", gridWidth)
		  .attr("y1", function(d){ return d;})
		  .attr("y2", function(d){ return d;})
		  .style("stroke", "#ccc");		
    }

    var initChartCanvas = function (){
		var chartGroup = d3.select("body").selectAll("svg").data([id], function(d){ return d;})
			.enter()
			.append("svg")
			.attr("class", "chart")
			.append("g")
			.attr("class", "gantt-chart")
			.attr("transform", "translate(" + margin.left + ", " + margin.top + ")");
		
		var barGroup = chartGroup.append("g").attr("class", "gantt-bars");
    }

	var init = function (){
		// configure axis and canvas		
		initTimeDomain(tasks);
		initChartCanvas();
	}

	/**
	Checks if chart componentes are already configured
	*/
	var isInitialized = function(){
		// check if svg element exists, if it exists, chart has been initialized
		var svgSelection = d3.select("body").selectAll("svg").data([id], function(d){ return d;})
		return !svgSelection.empty();
	}


    /*   CHART RENDERING METHODS */

    /**
     * draws datelines on svg canvas
     */
    var drawDateLines = function (dateLines){
		var visibleDL = dateLines.filter(isDLVisible);
		var barGroup = getChartGroup().select(".gantt-bars");

		// remove previous objecs
		barGroup.selectAll("g.g_dateline").remove();

		// create new graphic objects
		var taskGSelection = barGroup.selectAll("g").data(visibleDL,function(d) { return d.date; });

		var group = taskGSelection.enter().append("g")
		 	.attr("class", "g_dateline") 
		 	.attr("y", 0)
			 .attr("height", getChartHeight())
			 .attr("width", 10)
		 	 .attr("transform", dateLineTransform)
		 	 .call(function(d){ assignEvent("dateline", d);});

    	group.append("line")
    		.attr("x1","0")
    		.attr("y1","0")
    		.attr("x2","0")
    		.attr("y2",getChartHeight())
			.attr("class", function(d) {if(hasOwnProperty(d,"class")) return d.class + "-line"; else return "dateline-line";})
    		.attr("style",function (d) { return d.style;});

    	group.append("text")
    		.attr("x","7")
    		.attr("y",getChartHeight() + 5)
			.attr("class", function(d) {if(hasOwnProperty(d,"class")) return d.class + "-label"; else return "dateline-label";})
    		.attr("style","writing-mode:tb")
    		.text(function (d) { var format = d3.time.format('%d/%m/%Y'); return format(d.date);})
    }
    
    var drawMilestones = function (mileStones){

		var visibleMs = mileStones.filter(isMsVisible);

		var chartGroup = getChartGroup();
		var barGroup =  chartGroup.select(".gantt-bars");

		// delete previous svg objects
		barGroup.selectAll("g.g_mileStone").remove();

		// create new graphic objects
		var taskGSelection = barGroup.selectAll("g.g_milestone").data(visibleMs,mskeyFunction);

		var group = taskGSelection.enter().append("g")
		 	.attr("class", "g_milestone") 
		 	.attr("y", 0)
		 	.attr("transform", mileStoneTransform)
		 	.call(function(d){ assignEvent("milestone", d);});


		// add milestone mark
    	group.append("circle")
    		.attr("cx",0)
    		.attr("cy","0")
			.attr("class", function(d) {if(hasOwnProperty(d,"class")) return d.class+ "-mark"; else return "milestone-mark";})
			.attr("style",function (d) { return d.style;})
    		.attr("r",mileStoneRadius);

		// add labels
		group.append("text")
			.attr("x",  mileStoneRadius*2 +6)
			.attr("y",  mileStoneRadius)
			.attr("class", function(d) {if(hasOwnProperty(d,"class")) return d.class+ "-label"; else return "milestone-label";})
			.text(function(d){ return d.label;})
    }

    /* checks if a task is visible */
    var isTaskVisible = function(d){
    	return  (d.endDate > timeDomainStart) && (d.startDate < timeDomainEnd);
    }

    var isMsVisible = function(d){
    	return (d.date >= timeDomainStart) && (d.date <= timeDomainEnd);
    }

    var isDLVisible = function(d){
    	return (d.date >= timeDomainStart) && (d.date <= timeDomainEnd);
    }

    var calculateBarWidth = function (d){
    	var startDate = Math.max(timeDomainStart, d.startDate);
    	var endDate = Math.min(timeDomainEnd, d.endDate);
		var width =  (timeAxisRenderer.position(endDate) - timeAxisRenderer.position(startDate)); 
		return width;
    }
    
	var drawTasks = function (tasks){
		var visibleTasks = tasks.filter(isTaskVisible);

		var chartGroup = getChartGroup();
		var barGroup =  chartGroup.select(".gantt-bars");

		// remove all previous svg objects
		barGroup.selectAll("g").remove();

		// append new graphics
		var taskGSelection = barGroup.selectAll("g.g_task").data(visibleTasks,keyFunction);
		var group = taskGSelection.enter().append("g")
		 .attr("class","g_task") 
		 .attr("y", 0)
		 .attr("transform", taskBarTransform)
		 .attr("height", function(d) { return categoryAxisRenderer.config().barHeight; })
		 .attr("width", calculateBarWidth);

		// add bar's rect
		group.append("rect")
		 .attr("rx", 5)
	     .attr("ry", 5)
		 .attr("y", 0)
		 .attr("height", function(d) { return categoryAxisRenderer.config().barHeight; })
		 .attr("width", calculateBarWidth)
	     .attr("class", function(d) {if(hasOwnProperty(d,"class")) return d.class + "-bar"; else return "task-bar";})
	     .attr("style",function (d) { return d.style;})
	     .call(function(d){ assignEvent("task", d);});

		// add labels
		group.append("text")
			.attr("y", function(d) { return 3 + categoryAxisRenderer.config().barHeight /2; })
			.attr("x", function(d) { return 5; })
			.attr("class", function(d) {if(hasOwnProperty(d,"class")) return d.class + "-label"; else return "task-label";})
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

	/* GETTER / SETTER METHODS */

    gantt.draw = function() {
    	if(!isInitialized()){
    		// initialize chart graphic components
			init();
    	}

		var visibleTasks = tasks.filter(isTaskVisible);

    	// calculate task overlapping
    	overlappingResolver.tasks(visibleTasks).calculateOverlapping();

		// render axis
		drawAxis();

		// render data visualization
		drawTasks(tasks);
		drawDateLines(dateLines);
		drawMilestones(mileStones);

		return gantt;
    };

    /*********************/
    /** GETTER/SETTERS	**/
    /*********************/

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

    gantt.timeDomainMode = function(value) {
	if (!arguments.length)
	    return timeDomainMode;
        timeDomainMode = value;
        return gantt;

    };

    gantt.id = function(value) {
	if (!arguments.length)
	    return id;
	id = value;
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

    gantt.taskEventHandler = function(event, handler){
    	eventHandlers["task"][event] = handler;
		return gantt;
	};
    gantt.milestoneEventHandler = function(event, handler){
    	eventHandlers["milestone"][event] = handler;
		return gantt;
	};
    gantt.datelineEventHandler = function(event, handler){
    	eventHandlers["dateline"][event] = handler;
		return gantt;
	};
	
	function gantt() {
		return gantt;
    };


    return gantt;
};

d3.timeAxisRenderer = function(){

	var scale = 1;
	var timeDomain = []
	var config = {
		"axisLength": 600
	};
	var x = null;
	var xAxis = null;
    var formatPattern = "%d/%b";

	/* PUBLIC METHODS */

	/* Calculates categories ranges */
	timeAxisRenderer.init  = function(){	
		x = d3.time.scale().domain([ timeDomain[0], timeDomain[1] ]).range([ 0, config.axisLength ]).clamp(true);
		var formatter = d3.time.format(new String(formatPattern));
		xAxis = d3.svg.axis().scale(x).orient("bottom").tickSubdivide(true).tickSize(8).tickPadding(8).tickFormat(formatter);
	}

	timeAxisRenderer.ticks = function(){
		domainValues = x.ticks(10)
		var tickPositions = domainValues.map(function(d){ return x(d);})
		return tickPositions;
	}
	/* Calculates object rendering position in axis */
	timeAxisRenderer.position = function(d){
		return x(d)
	}
	/* Draws axis hanging on the svg node passed as parameter */
	timeAxisRenderer.draw  = function(node){
		node.transition().call(xAxis);
	}

	/* PRIVATE METHODS */

	/* GETTER / SETTER METHODS */

	timeAxisRenderer.domain = function(value){
		if (!arguments.length)
		    return timeDomain;
		timeDomain = value;
		return timeAxisRenderer;
	}

	timeAxisRenderer.config = function(value) {
		if (!arguments.length)
		    return config;
		// copy values in config object
		for(var k in config) config[k]=value[k];
		return timeAxisRenderer;
    };

	timeAxisRenderer.configValue = function(property, value) {
		config[property]=value;
		return timeAxisRenderer;
    };

    timeAxisRenderer.tickFormat = function(value) {
		if (!arguments.length)
	    	return formatPattern;
		formatPattern = value;
		return timeAxisRenderer;
    };

	function timeAxisRenderer(){
	};
	
	return timeAxisRenderer;
}



d3.categoryAxisRenderer = function(){
	var overlappingResolver;
	var scale = 1;
	var categories = [];
	/* Each position stores an array with two items, tasksBand_height and milestonesBand_height*/
	var categoriesRanges = {};
	var calculatedLength = 0;

	var config = {
		"axisLength": null,
		"barHeight" : 15,
		"barPadding" : 5,
		"barMargin" : 5,
		"minTaskBandHeight": 30,
		"mileStoneHeight" : 15
	};

	/* PUBLIC METHODS */

	/* Calculates categories ranges */
	categoryAxisRenderer.init  = function(){
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
		calculatedLength = end;
		return categoryAxisRenderer;
	};

	categoryAxisRenderer.ticks = function(){
		var category, range;
		var ticks = [];
		for (var c= 0; c < categories.length; c++){
			category = categories[c];
			range = getCategoryRange(category);
			ticks.push(scaleValue(range[0]));
		}
		if(range != null){
			// last tick
			ticks.push(scaleValue(range[1]));
		}
		return ticks;
	}

	/* Calculates object rendering position in category axis */
	categoryAxisRenderer.position = function(d){
		// check if object is a task or a milestone
		if (hasOwnProperty(d, "startDate")){
			// task
	    	var numParallelTask = overlappingResolver.taskTotalOverlaps(d).length;
	    	var categoryTaskRange = getCategoryTasksRange(d.category)
	    	var ypos = categoryTaskRange[0] + config.barMargin + numParallelTask*(config.barHeight + config.barPadding);
		} else {
			if (hasOwnProperty(d, "date")){
				// milestone
		    	var categoryMsRange = getCategoryMileStonesRange(d.category)
		    	var ypos = categoryMsRange[0] + config.mileStoneHeight/2;
			} else{
				// invalid object type
				return null;
			}
		}
		return scaleValue(ypos);
	}

	/* Draws axis hanging on the svg node passed as parameter */
	categoryAxisRenderer.draw  = function(node){
		// remove axis if exists

		// draw axis line
		node.selectAll("line.axisY").remove();
		node.append("line")
    		.attr("x1","0")
    		.attr("y1","0")
    		.attr("x2","0")
    		.attr("y2",scaleValue(calculatedLength))
    		.attr("class", "axisY")
    		.attr("style","stroke:black");

		// draw category labels
		node.selectAll("g").remove();
		node.selectAll("g").data(categories, function(d){return d;}).enter()
			.append("g")
			.attr("transform", catGroupTranslation)
			.append("text")
			.attr("x", "-5")
			.attr("style", "text-anchor: end")
			.attr("class", "tickY-label")
			.text(function(d){ return d;});

		// remove previous tips and draw a line for each tip
		node.selectAll("line.tickY").remove();
		node.selectAll("line.tickY").data(categoryAxisRenderer.ticks()).enter()
			.append("line")
			.attr("class", "tickY")
    		.attr("x1","0")
    		.attr("y1",function(d){ return d;})
    		.attr("x2","-5")
    		.attr("y2",function(d){ return d;})
    		;

		return categoryAxisRenderer;
	};

	/* PRIVATE METHODS */

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

	var catGroupTranslation = function(d){
		var range = getCategoryRange(d);
		var ypos = range[0] + (range[1]-range[0])/2;

		return "translate(0," + scaleValue(ypos)+ ')'

	}

	var scaleValue = function(value){
		var proportion = 1;
		if (config.axisLength != null && calculatedLength >0){
			proportion = config.axisLength  /calculatedLength;
		}
		return value * proportion;
	}

	var getCategoryRange  = function(category){
		var init = categoriesRanges[category].taskIni;
		var end = categoriesRanges[category].mStoneEnd;
		return [init,end];
	};

	var getCategoryTasksRange  = function(category){
		var init = categoriesRanges[category].taskIni;
		var end = categoriesRanges[category].taskEnd;
		return [init,end];
	};

	var getCategoryMileStonesRange  = function(category){
		var init = categoriesRanges[category].mStoneIni;
		var end = categoriesRanges[category].mStoneEnd;
		return [init,end];
	};

	/* GETTERS / SETTERS */

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

	categoryAxisRenderer.calculatedLength = function() {
		return calculatedLength;
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
		overlaps = {};
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


