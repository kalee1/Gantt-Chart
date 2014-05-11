


var tasks = [
{"id": "1","startDate":new Date(2014,1,2),"endDate":new Date(2014,1,5),"category":"E Job", "label":"task1","style":"fill:red"},
{"id": "11","startDate":new Date(2014,1,3),"endDate":new Date(2014,1,5),"category":"E Job","label":"task1.1"},
{"id": "2","startDate":new Date(2014,1,4),"endDate":new Date(2014,1,8),"category":"E Job","label":"task2","class":"bluetask"},
{"id": "21","startDate":new Date(2014,1,7),"endDate":new Date(2014,1,8),"category":"E Job","label":"task2.1"},
{"id": "22","startDate":new Date(2014,1,8),"endDate":new Date(2014,1,10),"category":"A Job","label":"task2.2"},
{"id": "23","startDate":new Date(2014,1,9),"endDate":new Date(2014,1,12),"category":"A Job","label":"task2.3"},
{"id": "24","startDate":new Date(2014,1,9),"endDate":new Date(2014,1,12),"category":"A Job","label":"task2.3"},
{"id": "25","startDate":new Date(2014,1,9),"endDate":new Date(2014,1,12),"category":"A Job","label":"task2.3"},
{"id": "26","startDate":new Date(2014,1,9),"endDate":new Date(2014,1,12),"category":"A Job","label":"task2.3"},
{"id": "27","startDate":new Date(2014,1,9),"endDate":new Date(2014,1,12),"category":"A Job","label":"task2.3"},
{"id": "28","startDate":new Date(2014,1,9),"endDate":new Date(2014,1,12),"category":"A Job","label":"task2.3"},
{"id": "29","startDate":new Date(2014,1,9),"endDate":new Date(2014,1,12),"category":"A Job","label":"task2.3"},
{"id": "30","startDate":new Date(2014,1,9),"endDate":new Date(2014,1,12),"category":"A Job","label":"task2.3"},
{"id": "3","startDate":new Date(2014,1,10),"endDate":new Date(2014,1,12),"category":"E Job","label":"task3"}
];

var mileStones = [
    {"id": 1,"date":new Date(2014,1,7),"category":"E Job", "label":"deployment 1"},
    {"id": 2,"date":new Date(2014,1,3),"category":"N Job", "label":"deployment 2"}
];

var milestone = {
  "id": 1,                  // unique task identificator
  "label":"deployment 1",   // descriptive text to show next to milestone mark
  "category": "Project B",  // category to which milestone belongs
  "date": new Date(2014,1,7),
  "style": "color:blue",    // (optional)
  "class": "staging_deploy" // (optional)
};


var dateLines = [
	{"date":new Date(2014,1,8),"style":"stroke:rgb(255,0,0);stroke-width:2"},                
	{"date":new Date(2014,1,12),"style":"stroke:rgb(120,120,0);stroke-width:2"}                
]

function taskhandler(d){
    console.log("logging action on task " + d.id + " " + d.label)
}



var taskStatus = {
    "SUCCEEDED" : "bar",
    "FAILED" : "bar-failed",
    "RUNNING" : "bar-running",
    "KILLED" : "bar-killed"
};

var categories = [ "D Job", "P Job", "E Job", "A Job", "N Job" ];


for(j=0; j<20;j++){
    // tasks.push({"id": (100 + i).toString(),"startDate":new Date(2014,1,2),"endDate":new Date(2014,1,5),"category":"Project_" + i, "label":"task" +(100+i),"style":"fill:red"});
    tasks.push({"id": (100 + j).toString(),"startDate":new Date(2014,1,6),"endDate":new Date(2014,1,8+j),"category":"E Job", "label":"task" +(100+j),"style":"fill:red"});
}
    // categories.push("Project_" + i)

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




var gantt = d3.gantt().categories(categories).tickFormat(format);
var margin = {
     top : 20,
     right : 40,
     bottom : 80,
     left : 80
};
gantt.margin(margin).timeDomainMode("fixed");

changeTimeDomain(timeDomainString);

gantt.tasks(tasks).mileStones(mileStones).dateLines(dateLines)
    .taskEventHandler("click", taskhandler)
    .milestoneEventHandler("mouseover", taskhandler)
    .datelineEventHandler("mouseover", taskhandler);


gantt.draw();

gantt();

function changeTimeDomain(timeDomainString) {
/*    this.timeDomainString = timeDomainString;
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
        // gantt.timeDomain([ d3.time.day.offset(getEndDate(), -30), getEndDate() ]);
        gantt.timeDomain([ new Date(2014, 1,4), getEndDate() ]);
    	break;

    default:
	format = "%H:%M"

    }
*/
    // gantt.timeDomain([ new Date(2014, 1,4), getEndDate() ]);
    gantt.timeDomain([ d3.time.day.offset(getEndDate(), -10), getEndDate() ]);

    format = "%d/%B";
    gantt.tickFormat(format);
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
    var category = categories[0];//categories[Math.floor(Math.random() * categories.length)];
    var label = categories[Math.floor(Math.random() * categories.length)] + lastEndDate;

// {"id": "3","startDate":new Date(2014,1,10),"endDate":new Date(2014,1,12),"category":"E Job","status":"RUNNING", "label":"task3"}

    tasks.push({
    "id" :  Math.floor((Math.random()*1000000)+1),
	"startDate" : d3.time.day.offset(lastEndDate, -1),//Math.ceil(1 * Math.random())),
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

