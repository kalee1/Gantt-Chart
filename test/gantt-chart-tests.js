
module("Basic Unit Test");

test( "a basic test example", function() {
  var value = "hello";
  equal( value, "hello", "We expect value to be hello" );
});


test( "Calculate categories from task list", function() {

	var tasks = [
		{"id": "1","startDate":new Date(2014,1,2),"endDate":new Date(2014,1,5),"category":"E Job", "label":"task1","style":"fill:red"},
		{"id": "11","startDate":new Date(2014,1,3),"endDate":new Date(2014,1,5),"category":"C Job","label":"task1.1"},
		{"id": "2","startDate":new Date(2014,1,4),"endDate":new Date(2014,1,8),"category":"E Job","label":"task2","class":"bluetask"},
		{"id": "21","startDate":new Date(2014,1,7),"endDate":new Date(2014,1,8),"category":"E Job","label":"task2.1"},
		{"id": "22","startDate":new Date(2014,1,8),"endDate":new Date(2014,1,10),"category":"N Job","label":"task2.2"},
		{"id": "23","startDate":new Date(2014,1,9),"endDate":new Date(2014,1,12),"category":"A Job","label":"task2.3"},
	}

	


  var value = "hello";
  equal( value, "hello", "We expect value to be hello" );
});


calculateCategories