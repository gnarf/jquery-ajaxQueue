/*global sinon, window*/
(function($) {
	/*
		======== A Handy Little QUnit Reference ========
		http://docs.jquery.com/QUnit

		Test methods:
			expect(numAssertions)
			stop(increment)
			start(decrement)
		Test assertions:
			ok(value, [message])
			equal(actual, expected, [message])
			notEqual(actual, expected, [message])
			deepEqual(actual, expected, [message])
			notDeepEqual(actual, expected, [message])
			strictEqual(actual, expected, [message])
			notStrictEqual(actual, expected, [message])
			raises(block, [expected], [message])
	*/

	var resultCache;
	module("ajaxQueue", {
		setup: function() {
			resultCache = [];
			for(var i=0; i<10;i++){
				$.mockjax({
					url: '/test/inline'+i,
					dataType: 'json',
					responseTime: Math.random()*150+1,
					responseText: {
						data: i
					}
				});
			}
		},
		teardown: function() {}
	});

	asyncTest("$.ajaxQueue request only one, work like single ajax", function() {
		$.ajaxQueue({
			url: '/test/inline1',
			dataType: 'json'
		}).done(function(result) {
			console.log(result);
			equal(result.data, 1, 'response data is 1');
			start();
		});

	});

	asyncTest("$.ajaxQueue request in pipe", function() {
		var url;
		for (var i=0; i < 10; i++) {
			url= '/test/inline'+i;
			$.ajaxQueue({
				url: url,
				dataType: 'json'
			}).done(function(result) {
				resultCache.push(result.data);
				console.log(result.data);
				
			});
		}

		$.ajaxQueue({
			url: '/test/inline1',
			dataType: 'json'
		}).done(function(result) {
			deepEqual(resultCache,[0,1,2,3,4,5,6,7,8,9]);
			start();
		});

	});


}(jQuery));