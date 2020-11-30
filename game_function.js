/*eslint-env browser*/ //https://stackoverflow.com/questions/46841788/document-is-not-defined-javascript-error
/* exported load_timer */
/* exported supress_useless_article_sections */
/*jslint browser: true, regexp: true*/
/*global $, jQuery, alert, History, console, DOMParser*/


function load_timer(seconds) {
    "use strict";
    // Set the date we're counting down to
    var x, end, now, distance;
    end = Date.now() + seconds * 1000;

    // Update the count down every 1 second
    x = setInterval(function () {

        now = Date.now(); // Get today's date and time
        distance = end - now; // Find the distance between now and the count down date

        // Output the result in an element with id="timer"
        document.getElementById("timer").innerHTML = "time left : " + Math.floor(distance / 1000) + "s";

        // If the count down is over, write some text 
        if (distance < 0) {
            clearInterval(x);
            document.getElementById("timer").innerHTML = "EXPIRED";
        }
    }, 1000);
}

function supress_useless_article_sections() {
    "use strict";
    //supress some useless article section
    var x = document.getElementById("External_links");
    if (x !== null) {
        x.parentElement.style.display = "none";
    }
    x = document.getElementById("References");
    if (x !== null) {
        x.parentElement.style.display = "none";
    }

    x = document.getElementById("Further_reading");
    if (x !== null) {
        x.parentElement.style.display = "none";
    }
    x = document.getElementById("Notes");
    if (x !== null) {
        x.parentElement.style.display = "none";
    }
    x = document.getElementById("Citation");
    if (x !== null) {
        x.parentElement.style.display = "none";
    }
    x = document.getElementById("References_and_Notes");
    if (x !== null) {
        x.parentElement.style.display = "none";
    }
}

function extractTitle(title) {
    "use strict";
    return title.replace(/(^.\/)|(#.*$)/g, '').replace(/_/g, ' ');
}


function loadPage(title, TargetPageTitle, titleElem, contentElem, stylesheetElem) {
    "use strict";
    var url, doc;

    url = 'https://en.wikipedia.org:443/api/rest_v1/page/html/' + encodeURIComponent(title);

    if (title === TargetPageTitle) {
        console.log("success");
        document.getElementById('word-to-find').innerText = "Sucess !";
    } else {
        document.getElementById('word-to-find').innerText = "Article to find: " + TargetPageTitle;
        // fetch the article data
        return $.ajax(url).then(function (data) {
            doc = (new DOMParser()).parseFromString(data, 'text/html');
            // Use mediawiki content stylesheet
            $(stylesheetElem).remove();
            stylesheetElem = doc.querySelector('head link[rel="stylesheet"]');
            $('head').append(stylesheetElem);
            // Update title and content
            $(titleElem).text(doc.title.replace(/^User:Cscott\//, '').replace(/_/g, ' '));
            var $content = $(contentElem).empty();
            Array.from(doc.body.attributes).forEach(function (attr) {
                $content.attr(attr.name, attr.value);
            });
            $content.append(Array.from(doc.body.children));


            // Handle redirects
            $('link[rel="mw:PageProp/redirect"]').replaceWith(function () {
                return $('<a rel="mw:WikiLink">REDIRECT</a>').attr('href', $(this).attr('href'));
            });
            // Add click handler to wiki links
            $('a[rel="mw:WikiLink"]', $content).click(function (e) {
                var newTitle = extractTitle($(e.currentTarget).attr('href'));
                History.pushState(null, newTitle, "?title=" + encodeURIComponent(newTitle));
                return false; // Don't use normal href handler
            });

            supress_useless_article_sections();
        });
    }
}

function fetchFirstPage() { //fetch the random start page
    "use strict";
    var title;
    $.ajax('https://en.wikipedia.org/w/api.php?action=query&origin=*&format=json&list=random&continue=-||&rnnamespace=0&rnlimit=1').then(function (data) {
        title = data.query.random[0].title;
        // title = 'Science';
        // Load the start page
        History.replaceState(null, title, '');
    });

    return title;
}


function fetchTargetPage() { //fetch the random start page
    var TargetPageTitle;
    $.ajax('https://en.wikipedia.org/w/api.php?action=query&origin=*&format=json&list=random&continue=-||&rnnamespace=0&rnlimit=1').then(function(data){
        TargetPageTitle = data.query.random[0].title;
        // TargetPageTitle = "Jesus"
    });
    return TargetPageTitle;
}


function sleep(milliseconds) {
    "use strict";
    var date = Date.now();
    var currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}