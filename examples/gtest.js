var tasks = [
{"startDate":new Date(2014,1,2),"endDate":new Date(2014,1,5),"taskName":"E Job","status":"RUNNING", "label":"task1"},
{"startDate":new Date(2014,1,6),"endDate":new Date(2014,1,8),"taskName":"E Job","status":"RUNNING", "label":"task2"},
{"startDate":new Date(2014,1,10),"endDate":new Date(2014,1,12),"taskName":"E Job","status":"RUNNING", "label":"task3"}
];

var dateLines = [
	{"date":new Date(2014,1,8),"style":"stroke:rgb(255,0,0);stroke-width:2"},                
	{"date":new Date(2014,1,10),"style":"stroke:rgb(120,120,0);stroke-width:2"}                
]

var mileStones = [
{"date":new Date(2014,7),"taskName":"E Job", "label":"deployment 1"},
{"date":new Date(2014,13),"taskName":"E Job", "label":"deployment 2"}
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
