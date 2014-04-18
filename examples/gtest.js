var tasks = [
{"id": 1,"startDate":new Date(2014,1,2),"endDate":new Date(2014,1,5),"taskName":"E Job","status":"RUNNING", "label":"task1","pos":20},
{"id": 2,"startDate":new Date(2014,1,3),"endDate":new Date(2014,1,5),"taskName":"E Job","status":"RUNNING", "label":"task1.1","pos":30},
{"id": 3,"startDate":new Date(2014,1,4),"endDate":new Date(2014,1,8),"taskName":"E Job","status":"RUNNING", "label":"task2","pos":40},
{"id": 4,"startDate":new Date(2014,1,7),"endDate":new Date(2014,1,8),"taskName":"E Job","status":"RUNNING", "label":"task2.1","pos":80},
{"id": 5,"startDate":new Date(2014,1,10),"endDate":new Date(2014,1,12),"taskName":"E Job","status":"RUNNING", "label":"task3","pos":100}
];

var dateLines = [
	{"date":new Date(2014,1,8),"style":"stroke:rgb(255,0,0);stroke-width:2"},                
	{"date":new Date(2014,1,12),"style":"stroke:rgb(120,120,0);stroke-width:2"}                
]

var mileStones = [
{"id": 1, "date":new Date(2014,1,7),"taskName":"E Job", "label":"deployment 1"},
{"id": 2,"date":new Date(2014,1,3),"taskName":"N Job", "label":"deployment 2"}
];


var taskStatus = {
    "SUCCEEDED" : "bar",
    "FAILED" : "bar-failed",
    "RUNNING" : "bar-running",
    "KILLED" : "bar-killed"
};

var taskNames = [ "D Job", "P Job", "E Job", "A Job", "N Job" ];

tasks.sort(function(a, b) {
    return a.startDate - b.startDate;
});
var maxDate = tasks[tasks.length - 1].endDate;
tasks.sort(function(a, b) {
    return a.startDate - b.startDate;
});
var minDate = tasks[0].startDate;

var format = "%B" //"%H:%M";
var timeDomainString = "1month";

var gantt = d3.gantt().taskTypes(taskNames).taskStatus(taskStatus).tickFormat(format);

var overlappingResolver = d3.overlappingResolver();
var overlaps = overlappingResolver.tasks(tasks);
alert(overlaps)



var margin = {
     top : 20,
     right : 40,
     bottom : 20,
     left : 80
};
gantt.margin(margin);

gantt.timeDomainMode("fixed");
changeTimeDomain(timeDomainString);

gantt(tasks,dateLines, mileStones);

function changeTimeDomain(timeDomainString) {
    this.timeDomainString = timeDomainString;
    switch (timeDomainString) {
    case "1hr":
	format = "%H:%M:%S";
	gantt.timeDomain([ d3.time.hour.offset(getEndDate(), -1), getEndDate() ]);
	break;
	
    case "3hr":
	format = "%H:%M";
	gantt.timeDomain([ d3.time.hour.offset(getEndDate(), -3), getEndDate() ]);
	break;

    case "6hr":
	format = "%H:%M";
	gantt.timeDomain([ d3.time.hour.offset(getEndDate(), -6), getEndDate() ]);
	break;

    case "1day":
	format = "%H:%M";
	gantt.timeDomain([ d3.time.day.offset(getEndDate(), -1), getEndDate() ]);
	break;

    case "1week":
	format = "%a %H:%M";
	gantt.timeDomain([ d3.time.day.offset(getEndDate(), -7), getEndDate() ]);
	break;

    case "1month":
    	format = "%d/%B";
    	gantt.timeDomain([ d3.time.day.offset(getEndDate(), -30), getEndDate() ]);
    	break;

    default:
	format = "%H:%M"

    }
    gantt.tickFormat(format);
    gantt.redraw(tasks);
}

function getEndDate() {
    var lastEndDate = Date.now();
    if (tasks.length > 0) {
	lastEndDate = tasks[tasks.length - 1].endDate;
    }

    return lastEndDate;
}

function addTask() {

    var lastEndDate = getEndDate();
    var taskStatusKeys = Object.keys(taskStatus);
    var taskStatusName = taskStatusKeys[Math.floor(Math.random() * taskStatusKeys.length)];
    var taskName = taskNames[Math.floor(Math.random() * taskNames.length)];
    var label = taskNames[Math.floor(Math.random() * taskNames.length)] + lastEndDate;

    tasks.push({
	"startDate" : d3.time.hour.offset(lastEndDate, Math.ceil(1 * Math.random())),
	"endDate" : d3.time.hour.offset(lastEndDate, (Math.ceil(Math.random() * 3)) + 1),
	"taskName" : taskName,
	"status" : taskStatusName,
	"label": label
    });

    changeTimeDomain(timeDomainString);
    gantt.redraw(tasks);
};

function removeTask() {
    tasks.pop();
    changeTimeDomain(timeDomainString);
    gantt.redraw(tasks);
};



var svg = d3.select("svg");
svg.selectAll("circle").data(tasks, function (d) { return d.label + "ssss";}).enter().append("circle")
            .attr("cx",function(d){ return 30 + d.pos;})
            .attr("cy",130)
            .attr("r",10)
            .attr("stroke","black")
            .attr("stroke-width","3");
svg.selectAll("circle").data(tasks, function (d) { return d.label+ "ssss";})
            .transition()
            .attr("stroke","red");


svg.selectAll("circle").data([ tasks[2] ], function (d) { return d.label+ "ssss";})
            .transition()
            .attr("stroke","blue");
