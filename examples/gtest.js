var tasks = [
{"id": "1","startDate":new Date(2014,1,2),"endDate":new Date(2014,1,5),"category":"E Job","status":"RUNNING", "label":"task1"},
{"id": "11","startDate":new Date(2014,1,3),"endDate":new Date(2014,1,5),"category":"E Job","status":"RUNNING", "label":"task1.1"},
{"id": "2","startDate":new Date(2014,1,4),"endDate":new Date(2014,1,8),"category":"E Job","status":"RUNNING", "label":"task2"},
{"id": "21","startDate":new Date(2014,1,7),"endDate":new Date(2014,1,8),"category":"E Job","status":"RUNNING", "label":"task2.1"},
{"id": "3","startDate":new Date(2014,1,10),"endDate":new Date(2014,1,12),"category":"E Job","status":"RUNNING", "label":"task3"}
];

var dateLines = [
	{"date":new Date(2014,1,8),"style":"stroke:rgb(255,0,0);stroke-width:2"},                
	{"date":new Date(2014,1,12),"style":"stroke:rgb(120,120,0);stroke-width:2"}                
]

var mileStones = [
{"id": 1,"date":new Date(2014,1,7),"category":"E Job", "label":"deployment 1"},
{"id": 2,"date":new Date(2014,1,3),"category":"N Job", "label":"deployment 2"}
];


var taskStatus = {
    "SUCCEEDED" : "bar",
    "FAILED" : "bar-failed",
    "RUNNING" : "bar-running",
    "KILLED" : "bar-killed"
};

var categories = [ "D Job", "P Job", "E Job", "A Job", "N Job" ];

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

var gantt = d3.gantt().categories(categories).taskStatus(taskStatus).tickFormat(format);
var margin = {
     top : 20,
     right : 40,
     bottom : 20,
     left : 80
};
gantt.margin(margin).timeDomainMode("fixed");

changeTimeDomain(timeDomainString);

gantt.tasks(tasks).mileStones(mileStones).dateLines(dateLines).draw();

gantt();

aRenderer = gantt.categoryAxisRenderer();

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
    gantt.draw(tasks);
}

function getEndDate() {
    var lastEndDate = Date.now();
    if (tasks.length > 0) {
	   lastEndDate = tasks[tasks.length - 1].endDate;
    }

    return lastEndDate;
}

function addTask() {

    // {"id": "1","startDate":new Date(2014,1,2),"endDate":new Date(2014,1,5),"category":"E Job","status":"RUNNING", "label":"task1","pos":20},

    var lastEndDate = getEndDate();
    var taskStatusKeys = Object.keys(taskStatus);
    var taskStatusName = taskStatusKeys[Math.floor(Math.random() * taskStatusKeys.length)];
    var category = categories[Math.floor(Math.random() * categories.length)];
    var label = categories[Math.floor(Math.random() * categories.length)] + lastEndDate;

// {"id": "3","startDate":new Date(2014,1,10),"endDate":new Date(2014,1,12),"category":"E Job","status":"RUNNING", "label":"task3"}

    tasks.push({
    "id" :  Math.floor((Math.random()*1000000)+1),
	"startDate" : d3.time.day.offset(lastEndDate, Math.ceil(1 * Math.random())),
	"endDate" : d3.time.day.offset(lastEndDate, (Math.ceil(Math.random() * 3)) + 1),
	"category" : category,
	"status" : taskStatusName,
	"label": label
    });

    changeTimeDomain(timeDomainString);
    gantt.draw(tasks);
};

function removeTask() {
    tasks.pop();
    changeTimeDomain(timeDomainString);
    gantt.draw(tasks);
};

