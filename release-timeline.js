
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

	releaseTimeline.releases = function( value /* release [] */){
		if (!arguments.length)
		    return releases;
		releases = value;
		var tasks = createTasksFromRelease(releases)
		gantt.tasks(tasks);
		var categories = ["GRETEL"]
		gantt.categories(categories)

		return releaseTimeline;
	};

	releaseTimeline.deployments = function(value /* deployment[] */){
		if (!arguments.length)
		    return deployments;
		deployments = value;
		var deps = createMSsFromDeployment(deployments)
		gantt.mileStones(deps);

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
		return task;
	}
	var createEstimatedTaskFromRelease = function( release ){
		var task = {};
		task.id = (!hasOwnProperty(release,"id"))? (20000+release.id) : Math.random() * 100000000;
		task.label = release.version  + " " + labelDateFormat(release.estimated[1]);
		task.category = release.project;
		task.startDate = release.estimated[0];
		task.endDate = release.estimated[1];
		if(hasOwnProperty(release,"EV") &&  hasOwnProperty(release,"PV") && release.PV >0){
			task.progress = release.EV / release.PV;
		}
		return task;
	}
	var createExecutedTaskFromRelease = function( release ){
		var task = {};
		task.id = (hasOwnProperty(release,"id"))? (10000+release.id) : Math.random() * 100000000;
		task.label = release.version  + " "+labelDateFormat(release.executed[1]);
		task.category = release.project;
		task.startDate = release.executed[0];
		task.endDate = release.executed[1];
		return task;
	}

	var createMSsFromDeployment = function( deployments ){
		var milestones = [];
		deployments.forEach(function( d ){
			milestones.push( createMSFromDep( d ) );
		});


    milestones.push({"id": 1,"category":"GRETEL", "label":"deployment 1","date":new Date(2014,4,12)});
    milestones.push({"id": 2,"category":"GRETEL", "label":"deployment 2","date":new Date(2014,4,15)});

    console.log(milestones)


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

