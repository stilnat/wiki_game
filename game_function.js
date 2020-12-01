/*eslint-env browser*/ //https://stackoverflow.com/questions/46841788/document-is-not-defined-javascript-error
/* exported load_timer */
/* exported supress_useless_article_sections */
/*jslint browser: true, regexp: true*/
/*global $, jQuery, alert, History, console, DOMParser*/


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
        document.getElementById('word-to-find').innerText = "Success !";
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
                sessionStorage.setItem('title', newTitle);
                History.pushState(null, newTitle, "?title=" + encodeURIComponent(newTitle));
                return false; // Don't use normal href handler
            });

            supress_useless_article_sections();
        });
    }
}

function fetchFirstPage() { //fetch the random start page
    "use strict";
    return $.ajax('https://en.wikipedia.org/w/api.php?action=query&origin=*&format=json&list=random&continue=-||&rnnamespace=0&rnlimit=1').then(function (data) {
        var title = data.query.random[0].title;
        // Load the start page
        History.replaceState(null, title, '');
        return title;
        // title = 'Science';
    });
}

function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}


function fetchFeaturedArticle() { 
    "use strict";
    // construct the random time from 2010-01-01 to 2019-12-30
    var date = randomDate(new Date("2010-01-25T00:00:00Z"), new Date("2019-12-30T00:00:00Z"));
    var timestamp = date.toISOString();

    return $.ajax('https://en.wikipedia.org/w/api.php?action=query&list=categorymembers&origin=*&cmtitle=Category:Featured_articles&cmlimit=50&cmsort=timestamp&cmstart='+ timestamp +'&format=json').then(function (data) {
        // choose an article randomly from the requested list of articles
        var lastArticleNb = data.query.categorymembers.length;
        var ArticleNb = Math.floor(Math.random() * lastArticleNb);
        var title = data.query.categorymembers[ArticleNb].title;
        History.replaceState(null, title, '');
        return title;
    });


}

function countdown(time_p) {
   
    var saved_countdown = sessionStorage.getItem('saved_countdown');
    var time;

    if(saved_countdown == null) {
        // Set the time we're counting down to using the time allowed
        var new_countdown = new Date().getTime() + (time_p + 2) * 1000;
        time = new_countdown;
        sessionStorage.setItem('saved_countdown', new_countdown);
        
    } else {
        time = saved_countdown;
    }
    
    // Update the count down every 1 second
    var x = setInterval(() => {

        // Get today's date and time
        var now = new Date().getTime();
        
        // Find the distance between now and the allowed time
        var distance = time - now;

        // Time counter
        var counter = Math.floor(distance/ 1000);

        // Output the result in an element with id="demo"
        document.getElementById("timer").innerHTML = "time left : " + counter + " s";

        // If the count down is over, write some text 
        if (counter <= 0) {
            clearInterval(x);
            sessionStorage.removeItem('saved_countdown');
            sessionStorage.removeItem('max_time');
            document.getElementById("timer").innerHTML = "EXPIRED";
        }
    }, 1000);
}
