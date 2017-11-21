(function($) {

// jQuery on an empty object, we are going to use this as our Queue
var ajaxQueues = [$({})];

$.ajaxQueue = function( ajaxOpts, queueIndex ) {
    var jqXHR,
        dfd = $.Deferred(),
        promise = dfd.promise(),
        ajaxQueue;

    // allow multiple queues that run independently of each other
    // specify the queue to be used like this (index can be ommited!):
    // $.ajaxQueue({<ajaxOpts>}, <int|queueIndex>)
    queueIndex = queueIndex || 0; // get queue index if specified
    ajaxQueue = ajaxQueues[queueIndex];

    if ( ajaxQueue == undefined || !(ajaxQueue instanceof $) ) {
        ajaxQueue = ajaxQueues[queueIndex] = $({});
    }

    //  if there is no ajax request return an empty 200 code
    if ( typeof ajaxOpts == "undefined" ) {
        return $.Deferred(function() {
            this.resolve( [ '', '200', jqXHR ] );
        }).promise();
    }

    // run the actual query
    function doRequest( next ) {
        setTimeout(function() {
            jqXHR = $.ajax( ajaxOpts );
            jqXHR.done( dfd.resolve )
                .fail( dfd.reject )
                .then( next );
        }, ajaxOpts.delay||0);
    }

    // queue our ajax request
    ajaxQueue.queue( doRequest );

    // add the abort method
    promise.abort = function( statusText ) {

        // proxy abort to the jqXHR if it is active
        if ( jqXHR ) {
            return jqXHR.abort( statusText );
        }

        // if there wasn't already a jqXHR we need to remove from queue
        var queue = ajaxQueue.queue(),
            index = $.inArray( doRequest, queue );

        if ( index > -1 ) {
            queue.splice( index, 1 );
        }

        // and then reject the deferred
        dfd.rejectWith( ajaxOpts.context || ajaxOpts, [ promise, statusText, "" ] );
        return promise;
    };

    return promise;
};

})(jQuery);
