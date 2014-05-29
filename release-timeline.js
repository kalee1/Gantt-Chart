
/**
	Timeline showing infor about

var releases = [
  { "id": "string"
  	"project": "string",
  	"version": "string", 
  	"state": "in progress",
  	"planed": [new Date(), new Date()],
  	"executed": [new Date(), new Date()],
  	"estimated": [new Date(), new Date()],
  	"PV": float,
  	"EV": float,
  	"AC": float
  }
];

var deployment ={
	"project": "string",
	"version": "string",
	"environment": "string" (production, staging),
	"date": date
}

*/

d3.releaseTimeline = function(){

	var releases = [];
	var deployments = [];
	var datelines = [];
	var gantt = null;
	var labelDateFormat = d3.time.format("%d/%b")

	/**************************/
	/*	  PUBLIC API          */
	/**************************/

	var extractCategories = function( lst ){
		var uniqueCategories = [];
		lst.forEach(function(element){
			if(element.hasOwnProperty("category")){
				if (uniqueCategories.indexOf(element.category)==-1){
					uniqueCategories.push(element.category);
				}
			}
		})
		return uniqueCategories;
	}

	/**
	 Order releases by their planned starting day
	*/
	var sortReleases = function( releases ){
		var sorted = releases.sort(function(a,b){
			return a.planned[0] > b.planned[0];
		})
		return sorted;
	}

	var arrayUnique = function(array) {
	    var a = array.concat();
	    for(var i=0; i<a.length; ++i) {
	        for(var j=i+1; j<a.length; ++j) {
	            if(a[i] === a[j])
	                a.splice(j--, 1);
	        }
	    }
	    return a;
	};

	releaseTimeline.releases = function( value /* release [] */){
		if (!arguments.length)
		    return releases;

		releases = sortReleases(value);

		var tasks = createTasksFromRelease(releases)
		gantt.tasks(tasks);

		var actualCategories = gantt.categories();
		var categories = arrayUnique(actualCategories.concat(extractCategories(tasks)));
		gantt.categories(categories)

		return releaseTimeline;
	};

	releaseTimeline.deployments = function(value /* deployment[] */){
		if (!arguments.length)
		    return deployments;
		deployments = value;

		var deps = createMSsFromDeployment(deployments)
		gantt.mileStones(deps);

		var actualCategories = gantt.categories();
		var categories = arrayUnique(actualCategories.concat(extractCategories(deps)));
		gantt.categories(categories)

		return releaseTimeline;
	};

	releaseTimeline.gantt = function(value /* d3.gantt */){
		if (!arguments.length)
		    return gantt;
		gantt = value;
		return releaseTimeline;
	}; 

	/**************************/
	/*	  PRIVATE METHODS     */
	/**************************/
	/** 
		Creates gantt chart tasks from relases
	*/
	var createTasksFromRelease = function( releases ){
		var tasks = [];
		releases.forEach(function( r ){
			tasks.push( createMainTaskFromRelease(r) );
			tasks.push( createEstimatedTaskFromRelease(r) );
			tasks.push( createExecutedTaskFromRelease(r) );
		});
		return tasks;
	}

	var createMainTaskFromRelease = function( release ){
		var task = {};
		task.id = (!hasOwnProperty(release,"id"))? release.id : Math.random() * 100000000;
		task.label = release.version  + " ("+labelDateFormat(release.executed[0])+"-"+labelDateFormat(release.executed[1])+")"
		task.category = release.project;
		task.startDate = release.planned[0];
		task.endDate = release.planned[1];
		task.class = "planned";
		return task;
	}
	var createEstimatedTaskFromRelease = function( release ){
		var task = {};
		task.id = (!hasOwnProperty(release,"id"))? (20000+release.id) : Math.random() * 100000000;
		task.label = release.version  + " " + labelDateFormat(release.estimated[1]) + " -est";
		task.category = release.project;
		task.startDate = release.estimated[0];
		task.endDate = release.estimated[1];
		if(hasOwnProperty(release,"EV") &&  hasOwnProperty(release,"PV") && release.PV >0){
			task.progress = release.EV / release.PV;
		}
		task.class = "estimated";
		return task;
	}
	var createExecutedTaskFromRelease = function( release ){
		var task = {};
		task.id = (hasOwnProperty(release,"id"))? (10000+release.id) : Math.random() * 100000000;
		task.label = release.version  + " "+labelDateFormat(release.executed[1]) + " -exe";
		task.category = release.project;
		task.startDate = release.executed[0];
		task.endDate = release.executed[1];
		task.class = "executed";
		return task;
	}

	var createMSsFromDeployment = function( deployments ){
		var milestones = [];
		deployments.forEach(function( d ){
			milestones.push( createMSFromDep( d ) );
		});

		return milestones;
	}

	var createMSFromDep = function( deployment ){
		var milestone = {};
		milestone.id = (hasOwnProperty(deployment,"id"))? deployment.id : Math.random() * 100000000;
		milestone.category = deployment.project;
		milestone.label = deployment.version;
		milestone.date = deployment.date;
		milestone.class = "deployment-"+deployment.environment;

		return milestone;
	}

	var init = function(){
		gantt = d3.gantt();
		// add today as dateline
		var todayDateline = {"date": new Date()};
		datelines.push(todayDateline);
		gantt.msRenderer(d3.deployRenderer())
		gantt.categoryAxisRenderer().configValue("mileStoneHeight",45)
		gantt.dateLines(datelines);
	}


	/**************************/
	/*	RENDERING METHODS	  */
	/**************************/

	releaseTimeline.draw = function(){
		gantt.draw();
	}


    function releaseTimeline() {
		return releaseTimeline;
    };

	init();
    return releaseTimeline;
};


/*
	Overrides default milestone renderer
 	to draw milestone labels vertically oriented
*/

d3.deployRenderer = function(){

	var config = {
		"mileStoneRadius":2
	};

    var assignEvent = function (selection){
    	for(h in eventHandlers){
    		selection.on(h,eventHandlers[h]);
    	}
    }

	/* Draws taks bars hanging on the svg node passed as parameter */
	msRenderer.draw  = function( node ){
 		// add milestone mark
    	node.append("circle")
    		.attr("cx",0)
    		.attr("cy","0")
			.attr("class", function(d) {if(hasOwnProperty(d,"class")) return d.class+ "-mark"; else return "milestone-mark";})
			.attr("style",function (d) { return d.style;})
    		.attr("r",config.mileStoneRadius)
    		.call(assignEvent);

		// add labels
		node.append("rect")
 		 .attr("x",  -1*(config.mileStoneRadius+2))
		 .attr("y", -38)
		 .attr("height", 34)
		 .attr("width", 12)
	     .attr("style","fill:white;");

		node.append("text")
			.attr("x",  config.mileStoneRadius)
			.attr("y",  -38)
			.attr("style","writing-mode: tb; glyph-orientation-vertical: 90;")
			// .attr("class", function(d) {if(hasOwnProperty(d,"class")) return d.class+ "-label"; else return "milestone-label";})
			.text(function(d){ return d.label;})
	}

	/* PRIVATE METHODS */

	/* GETTER / SETTER METHODS */

	msRenderer.eventHandlers = function(value){
		if (!arguments.length)
		    return eventHandlers;
		eventHandlers = value;
		return msRenderer;
	}

	msRenderer.config = function(value) {
		if (!arguments.length)
		    return config;
		// copy values in config object
		for(var k in config) config[k]=value[k];
		return msRenderer;
    };

	msRenderer.configValue = function(property, value) {
		config[property]=value;
		return msRenderer;
    };

	function msRenderer(){
	};
	
	return msRenderer;
}