// Load modules
var _ = require('lodash')
    i18n = require('i18n-2');


// Declare internals
var internals = {};
    internals.defaults = {
      locales: ['en'],
      directory: './locales',
      subdomain: true,
      cookie: 'lang',
      readQuery: true,
      extension: '.json'
    };

exports.register = function (pack, options, next) {
  var settings = _.extend(
    internals.defaults,
    options || {}
  );

  /**
   * Add request.i18n, to use in handlers
   */
  pack.ext('onPreHandler', function (request, next) {
    var req = {};
    if (!request.route.plugins.hasOwnProperty('hapi18n')
      || request.route.plugins.hapi18n !== false) {
      // Synthetic tweaked request passed to i18n-2
      req.host = request.info.host;
      req.headers = {
        host: request.info.host
      };
      if (settings.readQuery) {
        req.query = request.query;
      }
      req.cookies = (request.cookies) ? request.cookies : {};
      if (request.raw.req.headers['accept-language']) {
        req.headers['accept-language'] = request.raw.req.headers['accept-language'];
      }
      // Reading lang from session too if set
      if (request.session && request.session.get) {
        var locale = request.session.get(settings.name);
        if (locale) {
          req.cookies[settings.name] = locale;
        }
      }
      var i18nSettings = _.clone(settings);
      i18nSettings.request = req;
      // Override defaultLocale from domain configuration
      if (settings.domains) {
        var host = req.host;
        if (host.indexOf('www.') === 0) {
          host = host.substr(4);
        }
        if (settings.domains[host]) {
          i18nSettings.locales = [ settings.domains[host] ];
          for (var i = 0, l = settings.locales.length; i < l; i++) {
            if (settings.locales[i] !== settings.domains[host]) {
              i18nSettings.locales.push(settings.locales[i]);
            }
          }
        }
      }
      request.i18n = new i18n(i18nSettings);
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