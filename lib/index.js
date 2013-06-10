// Load modules
var Hoek = require('hoek'),
    i18n = require('i18n');


// Declare internals
var internals = {};
    internals.defaults = {
      locales:['en', 'fr'],
      defaultLocale: 'en',
      directory: './locales',
      updateFiles: false,
      cookie: 'lang',
      cookieOptions: {
        path: '/',
        isSecure: false
      },
      viewKey: '__',
      pluralViewKey: '__n'
    };

exports.register = function (pack, options, next) {
  //Hoek.assert(typeof pack.state === 'function', 'Plugin permissions must allow state');
  //Hoek.assert(typeof pack.helper === 'function', 'Plugin permissions must allow helper');

  var settings = Hoek.applyToDefaults(internals.defaults, options || {});
  i18n.configure(settings);
  pack.state(settings.cookie, settings.cookieOptions);

  //pack.helper(settings.viewKey, function () {});
  //pack.helper(settings.pluralViewKey, function () {});

  /**
   * Add request.i18n, to use in handlers
   */
  pack.ext('onPreHandler', function (request, next) {

    if (!request.route.plugins.hasOwnProperty('hapi18n')
      || request.route.plugins.hapi18n !== false) {
      var req = {
        headers: {},
        cookies: request.session._store || {}
      };
      if (request.raw.req.headers['accept-language']) {
        req.headers['accept-language'] = request.raw.req.headers['accept-language'];
      }

      var i18nexport = {};
      i18n.init(req, i18nexport, function() {
        request.i18n = i18nexport;
        next();
      });

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
          response.view.context[settings.viewKey] = function () {
            return i18n.__.apply(request.i18n, arguments);
          };
          response.view.context[settings.pluralViewKey] = function () {
            return i18n.__n.apply(request.i18n, arguments);
          };

      }
      return next();
  });

  next();
};