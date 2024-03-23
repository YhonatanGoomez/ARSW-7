apimock=(function(){

	var mockdata=[];

	mockdata["johnconnor"]=	[{author:"johnconnor","points":[{"x":150,"y":120},{"x":215,"y":115}],"name":"house"},
		{author:"johnconnor","points":[{"x":150,"y":120},{"x":215,"y":115}],"name":"backend"},
		{author:"johnconnor","points":[{"x":10,"y":10},{"x":100,"y":10}],"name":"fronted"},
		{author:"johnconnor","points":[{"x":10,"y":10},{"x":100,"y":10},{"x":100,"y":100}],"name":"frontedd"},
		{author:"johnconnor","points":[{"x":10,"y":40},{"x":10,"y":100},{"x":120,"y":100},{"x":120,"y":40},{"x":10,"y":40},{"x":60,"y":10},{"x":120,"y":40}],"name":"casita"},
		{author:"johnconnor","points":[{"x":347,"y":242},{"x":157,"y":15}],"name":"gear"}];
	mockdata["maryweyland"]=[{author:"maryweyland","points":[{"x":140,"y":140},{"x":115,"y":115}],"name":"house2"},
		{author:"maryweyland","points":[{"x":120,"y":120},{"x":15,"y":15}],"name":"backend2"},
		{author:"maryweyland","points":[{"x":10,"y":10},{"x":145,"y":145}],"name":"fronted2"},
		{author:"maryweyland","points":[{"x":140,"y":140},{"x":115,"y":115}],"name":"gear2"}];


	return {
		getBlueprintsByAuthor:function(authname,callback){
			callback(
				mockdata[authname]
			);
		},

		getBlueprintsByNameAndAuthor:function(authname,bpname,callback){

			callback(
				mockdata[authname].find(function(e){return e.name===bpname})
			);
		}
	}

})();