function getURLParameter(name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
}

var accessKey = getURLParameter("access_key");
var frameId = getURLParameter('frame_id');

var STATES = {
  INIT: 'init',
  LOADING: 'loading',
  LOADED: 'loaded',
  ERROR: 'error'
};

var CONSTS = {
  SHOW_PHOTO_DURATION_IN_SECONDS: 2,
  REFRESH_MEDIA_INTERVAL_IN_MINUTES: 5
};

var dataSource;
var mediaToShow;
var currMediaIndex = -1;
var imgElement;
var ribbonElement;
var holidayRibbonElement;
var lastUpdateAt;
var state = STATES.INIT;
var errorCount = 0;

// Map a date in format YYYY-MM-DD to a holiday name
var holidaysMapByDate = {};

var imgContainerElement;
var loadingContainerElement;

window.onload = function() {
  imgContainerElement = document.getElementById("imgcontainer");
  imgElement = document.getElementById('mainimg');
  loadingContainerElement = document.getElementById('loadingcontainer');
  ribbonElement = document.getElementById('ribbon');
  holidayRibbonElement = document.getElementById('holiday-ribbon');

  holidayRibbonElement.style.display = 'none';

  loadMedia();
}

function setState(newState) {
  loadingContainerElement.textContent = newState;
  state = newState;
}

function setErrorState() {
  setState(STATES.ERROR);
  // Try to reload media in 2 min
  errorCount++;

  // Wait at most 10 minutes for retry
  var retryDelay = Math.min(10, errorCount) * 60 * 1000;
  setTimeout(loadMedia, retryDelay);
}

function loadMedia() {

  if (state === STATES.LOADING) return;

  var isAlreadyLoaded = (state === STATES.LOADED);
  setState(STATES.LOADING);

  var xhr = new XMLHttpRequest();
  xhr.timeout = 8000; //60 * 1000; // timeout of 1 minute

  var url = '/public/api/frames/' + frameId + '?access_key=' + accessKey;
  xhr.open('GET', url);

  xhr.ontimeout = function () {
    setErrorState();
  };

  xhr.onerror = function() {
    setErrorState();
  }

  xhr.onload = function(e) {
    if (this.status === 401) {
      // unauthorized
      location = 'https://ran-smart-frame.appspot.com/authorize';
      return;
    } else if (this.status !== 200) {
      setErrorState();
      return;
    };

    errorCount = 0;
    lastUpdateAt = new Date();
    dataSource = JSON.parse(this.response);
    mediaToShow = [];

    for (var streamIndex = 0; streamIndex < dataSource.streams.length; streamIndex++) {
      var stream = dataSource.streams[streamIndex];
      for (var photoIndex = 0; photoIndex < stream.photos.length; photoIndex++) {
        var photo = stream.photos[photoIndex];
        mediaToShow.push({
          URL: '/public/api/frames/' + frameId + '/streams/' + stream.id + '/photos/' + photo.id + '?access_key=' + accessKey,
          Timestamp: 0
        })
      }
    }

    prepareAuxData();

    // TODO: we should not suffle if the dataSource is the same as the last one we got to ensure we show all the pictures before suffle again.
    shuffle(mediaToShow);

    setState(STATES.LOADED);

    if (!isAlreadyLoaded) {
      //debug - loadingContainerElement.style.display = 'none';
      imgContainerElement.style.display = 'block';

      showNextPhoto();
    }
  };

  xhr.send();
}

function showNextPhoto() {
  checkMediaFreshness();

  currMediaIndex++;
  if (currMediaIndex > mediaToShow.length - 1) {
    currMediaIndex = 0;
  }

  fetch(mediaToShow[currMediaIndex].URL)
  .then(function(response) {
    return response.blob();
  }).then(function(blob) {

    var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

    loadImage(
        blob,
        function (img, data) {
          while (imgContainerElement.firstChild) {
              imgContainerElement.removeChild(imgContainerElement.firstChild);
          }
          imgContainerElement.appendChild(img);

          // example format 2017:02:21 07:53:53
          // YYYY:MM:DD HH:mm:SS
          var exifDateTime = data.exif.get('DateTime');
          var dateParts = exifDateTime.replace(' ', ':').split(':').map(function(i) { return parseInt(i); });
          var timePicTaken = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], dateParts[3], dateParts[4], dateParts[5]);
          showPictureTimeInfo(timePicTaken);

          setTimeout(showNextPhoto, CONSTS.SHOW_PHOTO_DURATION_IN_SECONDS * 1000);
        },
        {
          maxWidth: w,
          maxHeight: h,
          orientation: true,
          meta: true
        } // Options
    );

  });
}

function showPictureTimeInfo(timePicTaken) {
  showBirthdateDuration(timePicTaken);
  showHolidayInDate(timePicTaken);
}

function showBirthdateDuration(timePicTaken) {
  var pointInTime = new Date("Jan 27 2015 3:00");
  var duration = moment.duration(timePicTaken - pointInTime);

  var durationString = '';
  if (duration.years() > 0) {
    durationString += duration.years() + 'y ';
  }
  if (duration.months() > 0) {
     durationString += duration.months() + 'm ';
  }
  if (duration.days() > 0) {
    durationString += duration.days() + 'd';
  }
  ribbonElement.innerText = durationString;
}

function showHolidayInDate(timePicTaken) {
  var isoDate = timePicTaken.toISOString();
  var dateOfPic = isoDate.substr(0, isoDate.indexOf('T'));

  var holiday = holidaysMapByDate[dateOfPic];
  if (!holiday) {
    holidayRibbonElement.style.display = 'none';
  } else {
    holidayRibbonElement.style.display = 'block';
    holidayRibbonElement.innerText = holiday;
  }
}

function checkMediaFreshness() {
  var now = new Date();
  var diffMs = (now - lastUpdateAt);
  var diffMin = diffMs / 1000 / 60;

  if (diffMin > CONSTS.REFRESH_MEDIA_INTERVAL_IN_MINUTES) {
    loadMedia();
    return true;
  }

  return false;
}

/**
* Prepare data related to the photos like holidays information.
*/
function prepareAuxData() {
  // Find the years photos are in
  var yearsMap = {};
  for(var i in mediaToShow) {
      var yearPicTaken = new Date(parseInt(mediaToShow[i].Timestamp)).getFullYear();
      yearsMap[yearPicTaken] = null;
  }
  var years = Object.keys(yearsMap);
  years.forEach(function(year) {
    loadHolidaysForYear(year);
  });
}

function loadHolidaysForYear(year) {
  var xhr = new XMLHttpRequest();
  xhr.timeout = 8000;

  var url = '//www.hebcal.com/hebcal/?v=1&cfg=json&maj=on&min=on&mod=on&nx=off&year=' + year + '&month=x&ss=off&mf=on&c=off&m=50&s=off';
  xhr.open('GET', url);

  xhr.ontimeout = function () {
    setErrorState();
  };

  xhr.onerror = function() {
    setErrorState();
  }

  xhr.onload = function(e) {
    if (this.status !== 200) {
      // Fail to load holidays, ignore
      return;
    };

    var holidays = JSON.parse(this.response);
    holidays.items.forEach(function(holiday) {
      holidaysMapByDate[holiday.date] = holiday.hebrew;
    });
  };

  xhr.send();
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}
