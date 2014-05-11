## Introduction
A basic implementation of a Gantt Chart using D3.js based on the work of [https://github.com/dk8996/Gantt-Chart]. 
Here an example.

**New features:**

* Adds new model elements: milestone and datelines. New attributes added to task element: id, label, style and CSS classname.
* Axis rendering is refactored and extracted to new clases.
* Redraw method has been removed, only draw method is needed to render and re-render data.
* Gantt chart now handles task overlapping and dynamically resizes category axis tick ranges.
* Chart height and width are calculated from X,Y axis domaing lenght.
* Style and CSS class name can be provided on tasks, milestones and datelines.
* When a task bar not totally fits on current time domain, it is drawn partially.
* Adds axis grid lines drawing functionallity.
* Svg element structure refactoring, axis, grid and graph components are now grouped under "g" elements, and  a CSS selector is defined for each group/element, so styling can easily be overrided.
* Includes methods to assign event handlers on tasks, milestones and datelines user actions.

## Getting Started
### Data: Categories, Task, Milestones and Datelines
The Gantt chart handles four elements to represent data:

* **Category**: category elements group tasks and define the vertical axis items. Each tasks must necessarily have a category. Each category is defined using just a string representing its name, ex: *"Project A"*.
Categories can be setted on gantt chart using the `categories( array )` method, but if they aren't provided, the gantt chart will deduce them from categories used in the provided tasks.  
If you call the categories method with a string array, the gantt chart will draw in the category axis one item for each item in the passed array, despite a category could have no related tasks.

* **Task**: is the basic element to assign information to a period of  time. It is drawed using a rectangle bar. A task has this attributes:

```javascript
var task = {
  "id": "1",          // unique task identificator
  "label": "task1",   // descriptive text to show in task bar
  "category": "Project A",
  "startDate": new Date(2014,8,10),
  "endDate": new Date(2014,8,13),
  "style": "fill:red",      // style to apply to task bar (optional)
  "class": "completedTask"  // CSS class to apply to task bar (optional)
};

```
*Note: needless to say, only one of the styling attributes should be used, style or class.*

* **Milestones**: they define events or information related to a specific day.  This element is represented with a circle mark with the corresponding label next to it. Each milestone has this information:
```javascript

var milestone = {
  "id": 1,                  // unique task identificator
  "label":"deployment 1",   // descriptive text to show next to milestone mark
  "category": "Project B",  // category to which milestone belongs
  "date": new Date(2014,1,7),
  "style": "color:blue",    // (optional)
  "class": "staging_deploy" // (optional)
};

```

* **Datelines**: this elements lets the user draw a line in the gantt chart to point a relevant day, for example a project deadline. Each dateline has this information:

``` javascript
var dateline = {
  "date": new Date(2014,1,8),
  "style": "stroke:rgb(255,0,0);stroke-width:2", // (optional)
  "class": "project_deadline" // (optional)
};
```
To assign this information to the gantt chart, you have to call the appropiate setter before the `draw` method is call. 


### Creating a simple gantt chart
```javascript
var categories = [ "Project A", "Project B"]

var tasks = [
  {"id": "1","category":"Project A", "label":"task1","startDate":new Date(2014,1,2),"endDate":new Date(2014,1,5)},
  {"id": "11","category":"Project A","label":"task1.1","startDate":new Date(2014,1,3),"endDate":new Date(2014,1,5)},
  {"id": "2","category":"Project A","label":"task2","startDate":new Date(2014,1,4),"endDate":new Date(2014,1,8)},
  {"id": "21","category":"Project A","label":"task2.1","startDate":new Date(2014,1,7),"endDate":new Date(2014,1,8)},
  {"id": "3","category":"Project B","label":"task3","startDate":new Date(2014,1,10),"endDate":new Date(2014,1,12)}
];

var milestones = [
    {"id": 1,"category":"Project A", "label":"deployment 1","date":new Date(2014,1,7)},
    {"id": 2,"category":"Project B", "label":"deployment 2","date":new Date(2014,1,3)}
];


var datelines = [
  {"date": new Date(2014,1,8)}
];

var gantt = d3.gantt().categories(categories)
  .tasks(tasks)
  .mileStones(milestones)
  .dateLines(datelines)
  .draw();
```
The complete example can be found in 

### Styling

### Height and width

when two tasks are overlapped, the gantt chart will draw the later task under the overlapped task, and the category axis lane will be expanded to fit the with of the two parallel tasks. There's no limit in the number of parallel task to draw.
To change this behaviour (for example to define overlapping based on task relation in addition to time constraints), provide a different implementation of `overlappingResolver` class.

###Event handling


![screenshot](https://raw.github.com/dk8996/Gantt-Chart/master/examples/screenshot1.png)

## Getting Started
### Data
Create a array of all your data.

```javascript
var tasks = [

{
    "startDate": new Date("Sun Dec 09 01:36:45 EST 2012"),
    "endDate": new Date("Sun Dec 09 02:36:45 EST 2012"),
    "taskName": "E Job",
    "status": "FAILED"
},

{
    "startDate": new Date("Sun Dec 09 04:56:32 EST 2012"),
    "endDate": new Date("Sun Dec 09 06:35:47 EST 2012"),
    "taskName": "A Job",
    "status": "RUNNING"
}];

```

### Style
Create a map between task status and css class, this is optional.

```javascript
var taskStatus = {
    "SUCCEEDED": "bar",
    "FAILED": "bar-failed",
    "RUNNING": "bar-running",
    "KILLED": "bar-killed"
};
```

```css
  .bar {
      fill: #33b5e5;
  }
  
  .bar-failed {
    fill: #CC0000;
  }

  .bar-running {
      fill: #669900;
  }
  
  .bar-succeeded {
    fill: #33b5e5;
  }

  .bar-killed {
      fill: #ffbb33;
  }
```
### Task Names
Create a array of task names, they will be display on they y-axis in the order given to the array.

```javascript
var taskNames = [ "D Job", "P Job", "E Job", "A Job", "N Job" ];
```

### Create a Simple Gantt-Chart
Create a simple Gantt-Chart

```javascript
var gantt = d3.gantt().taskTypes(taskNames).taskStatus(taskStatus);
gantt(tasks);
```

## Dependencies & Building
Relies on the fantastic [D3 visualization library](http://mbostock.github.com/d3/) to do lots of the heavy lifting for stacking and rendering to SVG.

## License

   Copyright 2012 Dimitry Kudryavtsev

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
   
   [![githalytics.com alpha](https://cruel-carlota.pagodabox.com/c088458a0319a78b63aaea9c54fba4de "githalytics.com")](http://githalytics.com/dk8996/Gantt-Chart)
