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


			module("ajaxQueue", {
				setup: function() {

					for(var i=0; i<10;i++){
						$.mockjax({
							url: '/test/inline'+i,
							dataType: 'json',
							responseTime: Math.random()*500+1,
				//	responseTime: 100,
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
					equal(result.data, 1, 'response data is 1');
					start();
				});

			});

			asyncTest("$.ajaxQueue request in pipe", function() {
				var url;
				var resultCache=[];
				for (var i=0; i < 10; i++) {
					url= '/test/inline'+i;
					$.ajaxQueue({
						url: url,
						dataType: 'json'
					}).done(function(result) {
						resultCache.push(result.data);
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

			asyncTest("$.ajaxQueue request in different pipe", function() {
				var url;
				var resultCache1=[];
				var resultCache2=[];
				for (var i=0; i < 10; i++) {
					$.ajaxQueue({
						url: '/test/inline'+i,
						dataType: 'json'
					}).done(function(result) {
						resultCache1.push(result.data);
						
					});
				}

				for(var j =9;j>=0;j--){
					$.ajaxQueue({
						url: '/test/inline'+j,
						dataType: 'json'
					},1).done(function(result) {
						resultCache2.push(result.data);
						
					});
				}

				$.ajaxQueue({
					url: '/test/inline1',
					dataType: 'json'
				}).done(function(result) {
					deepEqual(resultCache1,[0,1,2,3,4,5,6,7,8,9]);
					deepEqual(resultCache2,[9,8,7,6,5,4,3,2,1,0]);
					start();
				});
			});

			asyncTest("$.ajaxQueue request in many pipes", function() {
				var url;
				var resultCache=[];
				for (var i=0; i < 10; i++) {

					if(resultCache[i]===undefined)resultCache[i]=[];

					var handler=function(index){
						return	function(result) {
							resultCache[index].push(result.data);
						}
					}
					for(var j=0; j< 10; j++){
						$.ajaxQueue({
							url: '/test/inline'+j,
							dataType: 'json'
						},i).done(handler(i));
					}
				}

				for (var i=0; i < 10; i++) {
					var handler =function(index){
						return function(result) {
							deepEqual(resultCache[index],[0,1,2,3,4,5,6,7,8,9]);
						}
					}
					$.ajaxQueue({
						url: '/test/inline1',
						dataType: 'json'
					}).done(handler(i));//only use the default pipe but run the asserts.
				}
				$.ajaxQueue({
						url: '/test/inline1',
						dataType: 'json'
					}).done(function(){
						start ();
					});

			});


		}(jQuery));