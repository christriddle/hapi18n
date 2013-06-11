// Load modules
var _ = require('lodash')
    i18n = require('i18n-2');


// Declare internals
var internals = {};
    internals.defaults = {
      locales: ['en'],
      directory: './locales',
      updateFiles: false,
      devMode: false,
      cookie: 'lang',
      extension: '.json',
      cookieOptions: {
        path: '/',
        isSecure: false
      },
      viewKey: '__',
      pluralViewKey: '__n'
    };

exports.register = function (pack, options, next) {

  var settings = _.extend(
    internals.defaults,
    options || {}
  );

  //Hoek.assert(typeof pack.state === 'function', 'Plugin permissions must allow state');
  //Hoek.assert(typeof pack.helper === 'function', 'Plugin permissions must allow helper');
  //pack.state(settings.cookie, settings.cookieOptions);
  //pack.helper(settings.viewKey, function () {});
  //pack.helper(settings.pluralViewKey, function () {});

  /**
   * Add request.i18n, to use in handlers
   */
  pack.ext('onPreHandler', function (request, next) {

    if (!request.route.plugins.hasOwnProperty('hapi18n')
      || request.route.plugins.hapi18n !== false) {

      request.host = request.info.host;
      request.headers = {};
      request.cookies = {};

      if (request.raw.req.headers['accept-language']) {
        request.headers['accept-language'] = request.raw.req.headers['accept-language'];
      }
      if (request.session) {
        var locale = request.session.get(settings.name);
        if (locale) {
          request.cookies[settings.name] = locale;
        }
      }

      settings.request = request;
      request.i18n = new i18n(settings);
      next();

    } else {
      return next();
    }



  });

  /**
   * Add view keys to the view context,
   * to use in templates
   */
  pack.ext('onPreResponse', function (request, next) {

      var response = request.response();
      if (request.i18n
      && response.varieties && response.varieties.view) {

        response.view.context = response.view.context || {};
        response.view.context.i18n = {};
        i18n.registerMethods(response.view.context.i18n, request);

      }
      return next();
  });

  next();
};