// Copyright (c) 2009 Chris Moyer http://kopertop.blogspot.com
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish, dis-
// tribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the fol-
// lowing conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABIL-
// ITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
// SHALL THE AUTHOR BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, 
// WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
// IN THE SOFTWARE.

//
// Javascript API for boto_web searching
//
var boto_web = {

	//
	// Get all items at this url
	// 
	all: function(url, fnc){
		return boto_web.find(url, fnc, null);
	},
	
	//
	// Find items at this URL using optional filters
	// @param url: The URL to search at
	// @param fnc: The function to call back to
	// @param filters: The Filters to apply (or null for none)
	//
	find: function(url, fnc, filters){
		// TODO: Apply the filters
		return $.get(url, function(xml){
			var data = [];
			$(xml).find("object").each(function(){
				var obj = {};
                obj.length = 0;
				$(this).find("property").each(function(){
					// TODO: Support references
					// TODO: Support Lists
					obj[$(this).attr('name')] = $(this).text();
                    obj.length++;
				});
                if(obj.length > 0){
                    data.push(obj);
                }
			});
			fnc(data);
		});
	}

};
