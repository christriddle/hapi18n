// Load modules

var Chai = require('chai');
var Hapi = require('hapi');
var path = require('path');


// Declare internals

var internals = {};


// Test shortcuts

var expect = Chai.expect;

var testString = 'Be water my friend';


describe('hapi18n', function () {
  var server = new Hapi.Server();
  server.route([
    {
      method: 'GET',
      path: '/url',
      config: { plugins: { crumb: false } },
      handler: function () {

        expect(this.i18n).to.exist;
        expect(this.i18n.locale).to.exist;
        expect(this.i18n.__).to.exist;
        expect(this.i18n.__n).to.exist;

        this.reply({
          msg: this.i18n.__(testString),
          locale: this.i18n.locale,
          prefLocale: this.i18n.prefLocale
        });
      }
    }
  ]);

  it('can be added as a plugin to hapi', function (done) {
      server.pack.allow({ ext: true }).require(
        '../', {
          locales: ['cn', 'en', 'fr'],
          directory: __dirname + '/locales'
        },
        function (err) {
          expect(err).to.not.exist;
          done();
        }
      );
  });

  it('can get default locale from settings', function (done) {

    server.inject(
      {
        method: 'GET',
        url: '/url'
      },
      function (res) {
        expect(res.result.locale).to.equal('cn');
        expect(res.result.prefLocale).to.equal('cn');
        expect(res.result.msg).to.equal('我 是水 我的朋友');
        done();
      }
    );
  });

  it('can get locale from request headers', function (done) {

    server.inject(
      {
        method: 'GET',
        url: '/url',
        headers: {
          'accept-language': 'fr-FR,fr;q=0.8,en-US;q=0.6,en;q=0.4'
        }
      },
      function (res) {
        expect(res.result.locale).to.equal('cn');
        expect(res.result.prefLocale).to.equal('fr');
        done();
      }
    );
  });

  it('can get locale from query params', function (done) {

    server.inject(
      {
        method: 'GET',
        url: '/url?lang=en'
      },
      function (res) {
        expect(res.result.locale).to.equal('en');
        expect(res.result.prefLocale).to.equal('cn');
        expect(res.result.msg).to.equal('Be water my friend');
        done();
      }
    );
  });

  it('can get correct translations', function (done) {

    server.inject(
      {
        method: 'GET',
        url: '/url?lang=fr'
      },
      function (res) {
        expect(res.result.locale).to.equal('fr');
        expect(res.result.prefLocale).to.equal('cn');
        expect(res.result.msg).to.equal('Sois eau mon ami');
        done();
      }
    );
  });

});