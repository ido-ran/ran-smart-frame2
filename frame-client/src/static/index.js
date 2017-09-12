// pull in desired CSS/SASS files
require( './styles/main.scss' );
// var $ = jQuery = require( '../../node_modules/jquery/dist/jquery.js' );           // <--- remove if jQuery not needed
// require( '../../node_modules/bootstrap-sass/assets/javascripts/bootstrap.js' );   // <--- remove if Bootstrap's JS not needed

(function() {
  var frameId = localStorage.getItem('frameId'),
      accessKey = localStorage.getItem('accessKey');

  if (!frameId || !accessKey) {
    location.pathname = '/select-frame';
    return;
  }

  // Allow the user few seconds to select a different frame
  setTimeout(function () {

    // Remove the select-frame link after the timeout.
    document.getElementById('select-frame-link').remove();

    // inject bundled Elm app into div#main
    var Elm = require( '../elm/Main' );
    Elm.Main.embed( document.getElementById( 'main' ),
      {
        frameId: localStorage.getItem('frameId'),
        accessKey: localStorage.getItem('accessKey')
      }
    );

  }, 5000);
})();
