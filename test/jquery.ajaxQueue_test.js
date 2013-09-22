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
  
  var jsonName, sequence;

  module( "ajaxQueue", {
    setup: function() {
      sequence = 0;
      jsonName = "ajaxQueue";
      
      // Setup mockjax to use delay as response time
      $.mockjax(function(settings) {
        return {
          url: "mock",
          proxy: "mock.json",
          responseTime: settings.delay,
          isTimeout: false
        };
      });
    },
    teardown: function() {
      $.mockjaxClear();
    }
  });

  asyncTest( "Normal ajax request", 1, function() {
    $.ajax({
      url: "mock",
      dataType: "json",
      delay: 0,
      success: function(data) {
        equal(data.name, jsonName);
        start();
      }
    });
  });
  
  asyncTest( "Simple ajaxQueue request", 1, function() {
    $.ajaxQueue({
      url: "mock",
      dataType: "json",
      delay: 0,
      success: function(data) {
        equal(data.name, jsonName);
        start();
      }
    });
  });
  
  asyncTest( "Concurrent ajaxQueue requests", 4, function() {
    $.ajaxQueue({
      url: "mock",
      dataType: "json",
      delay: 2000,
      success: function() {
        equal(sequence, 0);
        sequence++;
      }
    });
    $.ajaxQueue({
      url: "mock",
      dataType: "json",
      delay: 1000,
      success: function() {
        equal(sequence, 1);
        sequence++;
      }
    });
    $.ajaxQueue({
      url: "mock",
      dataType: "json",
      delay: 0,
      success: function(data) {
        equal(sequence, 2);
        equal(data.name, jsonName);
        start();
      }
    });
  });

}(jQuery));
