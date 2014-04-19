/**
 * @author Dimitry Kudrayvtsev
 * @version 2.1
 */

d3.gantt = function() {
    var FIT_TIME_DOMAIN_MODE = "fit";
    var FIXED_TIME_DOMAIN_MODE = "fixed";
    
    var margin = {
	top : 20,
	right : 40,
	bottom : 20,
	left : 150
    };
    var timeDomainStart = d3.time.day.offset(new Date(),-3);
    var timeDomainEnd = d3.time.hour.offset(new Date(),+3);
    var timeDomainMode = FIT_TIME_DOMAIN_MODE;// fixed or fit
    var categories = [];
    var taskStatus = [];
    var tasks = [];
    var mileStones = [];
    var dateLines = [];
    var height = document.body.clientHeight - margin.top - margin.bottom-5;
    var width = document.body.clientWidth - margin.right - margin.left-5;
    var barHeight = 15;
    var barPadding = 5

    //
    var overlappingResolver = d3.overlappingResolver();

    var tickFormat = "%H:%M";

    var keyFunction = function(d) {
	return "T" + d.startDate + d.category + d.endDate;
    };
    var mskeyFunction = function(d){
    	return d.id;
    }

    var rectTransform = function(d) {
    	var xpos = x(d.startDate)
    	var ypos = y(d.category);
    	return "translate(" + xpos + "," + ypos + ")";
    };

    var mileStoneTransform = function(d) {
    	var xpos = x(d.date)
    	var ypos = y(d.category);
//    	return "translate(" + xpos + "," + ypos + ")";
    	return "translate(" + xpos + "," + ypos + ")";
    };

    var x = d3.time.scale().domain([ timeDomainStart, timeDomainEnd ]).range([ 0, width ]).clamp(true);

    var y = d3.scale.ordinal().domain(categories).rangeRoundBands([ 0, height - margin.top - margin.bottom ], .1);
    
    var xAxis = d3.svg.axis().scale(x).orient("bottom").tickFormat(d3.time.format(tickFormat)).tickSubdivide(true)
	    .tickSize(8).tickPadding(8);

    var yAxis = d3.svg.axis().scale(y).orient("left").tickSize(0);

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
		y = d3.scale.ordinal().domain(categories).rangeRoundBands([ 0, height - margin.top - margin.bottom ], .1);
		xAxis = d3.svg.axis().scale(x).orient("bottom").tickFormat(d3.time.format(tickFormat)).tickSubdivide(true)
			.tickSize(8).tickPadding(8);

		yAxis = d3.svg.axis().scale(y).orient("left").tickSize(0);
    };

    var axisTransition = function(){
    	// build x and y axis using d3 scales
		var chartGroup = d3.select(".gantt-chart");
		chartGroup.append("g")
		 .attr("class", "x axis")
		 .attr("transform", "translate(0, " + (height - margin.top - margin.bottom) + ")")
		 .transition()
		 .call(xAxis);
		 
		chartGroup.append("g").attr("class", "y axis").transition().call(yAxis);        		    	

		// resize y_axis using group tasks
		var xAxisGroup = chartGroup.selectAll("g")
		// foeach scale, check bar size

		for(t in categories){
			var type = categories[t]
			var searchFunctor = function(d){return (d.category == type);};
			var taskList = tasks.filter(searchFunctor);
			if(taskList != null && taskList.length > 0){
				calculateSize(taskList);
			}
		}



    }
	/* calculates bar sizes */
    var calculateSize = function(taskList){
    	// get related "g" elements to tasks

		var svg = d3.select("svg");
		var chartGroup = svg.select(".gantt-chart");
		var barGroup =  chartGroup.select(".gantt-bars");
		var taskGSelection = barGroup.selectAll("g").data(taskList,keyFunction);
    	alert(taskGSelection)
    	var yposAccessor = function(d) {  var pos = getGroupPosition(d); return pos.y; }

    	
    	var max = d3.max(taskGSelection,yposAccessor)
    	var min = d3.min(taskGSelection,yposAccessor)

    	alert(max +" " + min)
    	return max - min;
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
		
		var barGroup = chartGroup.append("g").attr("class", "gantt-bars");
    }

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
		 	.attr("transform", mileStoneTransform)
			.attr("height", 30)
			.attr("width", 30);

		// add milestone mark
		var radius = 2;
    	group.append("circle")
    		.attr("cx",0)
    		.attr("cy",y.rangeBand())
    		.attr("r",radius)
    		.attr("stroke","black")
    		.attr("stroke-width","3");

		// add labels
		group.append("text")
			.attr("y", function(d) { return y.rangeBand()+radius})
			.attr("x",  radius*2)
			.attr("fill","black")
			.text(function(d){ return d.label;})
		 
		
    }
    
	var drawTasks = function (tasks){

		var svg = d3.select("svg");
		var chartGroup = svg.select(".gantt-chart");
		var barGroup =  chartGroup.select(".gantt-bars");
		var taskGSelection = barGroup.selectAll("g").data(tasks,keyFunction);

		var group = taskGSelection.enter().append("g").attr("rx", 5)
	    .attr("ry", 5)
		 .attr("class", function(d){ 
		     if(taskStatus[d.status] == null){ return "bar";}
		     return taskStatus[d.status];
		     }) 
		 .attr("y", 0)
		 .attr("transform", rectTransform)
		 .attr("height", function(d) { return y.rangeBand(); })
		 .attr("width", function(d) { 
		     return (x(d.endDate) - x(d.startDate)); 
		     });
		// add bar's rect
		group.append("rect").attr("rx", 5)
	    .attr("ry", 5)
		 .attr("class", function(d){ 
		     if(taskStatus[d.status] == null){ return "bar";}
		     return taskStatus[d.status];
		     }) 
		 .attr("y", 0)
		 .attr("height", function(d) { return barHeight; })
		 .attr("width", function(d) { 
		     return (x(d.endDate) - x(d.startDate)); 
		     });
		// add labels
		group.append("text")
			.attr("y", function(d) { return y.rangeBand()/2; })
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

	var checkOverlapping = function(element, index, array) {
		var overlappedTask = [];
		if (index == 0){
			return;
		}

		var barGroup = d3.select(".gantt-bars").selectAll("g")
		// check if any previous elements contains element.startDate
		for (i=index-1; i>=0; i--){
			if(array[i].endDate >= element.startDate ){
				// get overlapped position
				var overlapped = barGroup.data([array[i]], keyFunction);
				var group = barGroup.data([element], keyFunction)

				var overlappedPos = getGroupPosition(overlapped)
				var currentPos = getGroupPosition(group)

				// task are overlapped, find svg element
				var translation = "translate(" + currentPos.x + "," + (overlappedPos.y + barHeight + barPadding) + ")";
				//alert("overlapped task: " + array[i].label + " " + overlappedPos.x + ","+ overlappedPos.y + "\noverlapping task: " + element.label + " " + translation)
				group.attr("transform", translation);
				return
			}

		}
	}


	var treatOverlapping = function (tasks){
		// go through task and resolve overlapping moving task
		//tasks.forEach(checkOverlapping)
		var i = 0;
		for (t in tasks){
			checkOverlapping(tasks[i],i, tasks);
			i++;
		}
	}

	/**
     * initial drawing
     */
    function gantt(tasks, dateLines, mileStones) {
    	overlappingResolver.tasks(tasks);
		
		initTimeDomain(tasks);
		initAxis();
		
		initChartCanvas();

		// render data visualization
		drawTasks(tasks);
		drawDateLines(dateLines);
		drawMilestones(mileStones);
		treatOverlapping(tasks);

		axisTransition();

		return gantt;

    };
    /**
     * rerenders data
     */
    gantt.redraw = function(tasks,datelines) {

		initTimeDomain(tasks);
		initAxis();
		
	    var svg = d3.select("svg");
		var chartGroup = svg.select(".gantt-chart");
		var barGroup =  chartGroup.select(".gantt-bars");
		var taskGSelection = barGroup.selectAll("g").data(tasks,keyFunction);
	
		 var group = taskGSelection.enter()
		 .append("g")
		 .attr("rx", 5)
	     .attr("ry", 5)
		 .attr("class", function(d){ 
		     if(taskStatus[d.status] == null){ return "bar";}
		     return taskStatus[d.status];
		     }) 
		 .attr("y", 0)
		 .attr("height", function(d) { return y.rangeBand(); })
		 .attr("width", function(d) { 
		     return (x(d.endDate) - x(d.startDate)); 
		     });
		
		// add rect
		group.append("rect").attr("rx", 5)
	    .attr("ry", 5)
		 .attr("class", function(d){ 
		     if(taskStatus[d.status] == null){ return "bar";}
		     return taskStatus[d.status];
		     }) 
		 .attr("y", 0)
		 .attr("height", function(d) { return y.rangeBand(); })
		 .attr("width", function(d) { 
		     return (x(d.endDate) - x(d.startDate)); 
		     });
		// add text
		group.append("text").text(function(d){ return d.label;})  
	
		// update all g's position
		taskGSelection.attr("transform", rectTransform)
	
		taskGSelection.exit().remove();
	
		svg.select(".x").transition().call(xAxis);
		svg.select(".y").transition().call(yAxis);
		
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
		alert(tasks);
		overlappingResolver.tasks(value);
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

	gantt.overlappingResolver = function(){
		return overlappingResolver;
	}

    return gantt;
};


d3.categoryAxisRenderer = function(){
	var categoryAxisRenderer = function (){

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

	/* get num of overlaps of current tasks*/
	overlappingResolver.taskOverlaps = function (task){
	    return overlaps[task.id];
	};

	/* get num of overlaps of current tasks joined with overlaps of overlapped tasks. */
	overlappingResolver.inheritOverlaps = function (task){

		var olp = [];
		for (i = 0; i < overlaps[task.id].length; i++){
			olp.push(deepSearch(overlaps[tasks.id][i]));
		}

	    return overlaps[task.id];
	};


	function deepSearch(element){
		if(!hasOwnProperty(overlaps, element)){
			alert(element);
			return element;
		} else {
			for (var i=0; i < overlaps[element].length; i++){
				return search(overlaps[element]);
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
	var hasOwnProperty = function (obj, prop) {
	    var proto = obj.__proto__ || obj.constructor.prototype;
	    return (prop in obj) &&
	        (!(prop in proto) || proto[prop] !== obj[prop]);
	};

	/**
     * initial drawing
     */
    function overlappingResolver() {
		return overlappingResolver;
    };

    return overlappingResolver;
};



