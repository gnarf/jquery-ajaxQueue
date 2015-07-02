/*global sinon, console*/
(function( $ ) {
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

  var requests;

  module( "ajaxQueue", {
    setup: function() {
      requests = [];
      this.xhr = sinon.useFakeXMLHttpRequest();
      this.xhr.onCreate = function (xhr) {
        xhr.customRespond = function() {
          this.respond(200, { "Content-Type": "application/json" },
                              '{ "id": 10, "name": "ajaxQueue" }');
        };
        requests.push(xhr);
      };
    },
    teardown: function() {
      this.xhr.restore();
    }
  });

  asyncTest( "Smoke detection: Normal ajax request", 1, function () {
    $.ajax({
      url: "mock.json",
      dataType: "json",
      success: function(data) {
        start();
        equal(data.name, "ajaxQueue");
      }
    });
    requests[0].customRespond();
  });

  asyncTest( "Single ajaxQueue request", 1, function () {
    $.ajaxQueue({
      url: "mock.json",
      dataType: "json",
      success: function(data) {
        start();
        equal(data.name, "ajaxQueue");
      }
    });
    requests[0].customRespond();
  });

  asyncTest( "Concurrent ajaxQueue requests", 9, function () {
    $.ajaxQueue({
      url: "first_mock.json",
      dataType: "json",
      success: function(data) {
        console.log("\n1st mock received");
        equal(data.name, "ajaxQueue");
      }
    });
    $.ajaxQueue({
      url: "second_mock.json",
      dataType: "json",
      success: function(data) {
        console.log("2nd mock received");
        equal(data.name, "ajaxQueue");
      }
    });
    $.ajaxQueue({
      url: "third_mock.json",
      dataType: "json",
      success: function(data) {
        console.log("3rd mock received");
        start();
        equal(data.name, "ajaxQueue");
      }
    });

    equal(requests.length, 1, "Only one request is called at a time");
    equal(requests[0].url, "first_mock.json", "... and it's the 1st");
  
    setTimeout(function() {
      requests[0].customRespond();
    
      equal(requests.length, 2, "Next request is called after 1st is received");
      equal(requests[1].url, "second_mock.json", "... and it's the 2nd");
    
      setTimeout(function() {
        requests[1].customRespond();
      
        equal(requests.length, 3, "Next request is called after 2nd is received");
        equal(requests[2].url, "third_mock.json", "... and it's the 3rd");
      
        requests[2].customRespond();
      }, 500);
    }, 500);
  });

}(jQuery));
