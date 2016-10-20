'use strict';

var Address      = require('address-rfc2821').Address;
var fixtures     = require('haraka-test-fixtures');

var Connection   = fixtures.connection;

exports.register = {
    setUp : function (done) {
        this.plugin = new fixtures.plugin('queue/smtp_forward');
        done();
    },
    'register': function (test) {
        test.expect(1);
        this.plugin.register();
        test.ok(this.plugin.cfg.main);
        test.done();
    },
};

exports.get_config = {
    setUp : function (done) {
        this.plugin = new fixtures.plugin('queue/smtp_forward');
        this.plugin.register();

        this.connection = Connection.createConnection();
        this.connection.transaction = { rcpt_to: [] };

        done();
    },
    'no recipient': function (test) {
        test.expect(1);
        var cfg = this.plugin.get_config(this.connection);
        test.ok(cfg.enable_tls !== undefined);
        test.done();
    },
    'null recipient': function (test) {
        test.expect(1);
        this.connection.transaction.rcpt_to.push(new Address('<>'));
        var cfg = this.plugin.get_config(this.connection);
        test.ok(cfg.enable_tls !== undefined);
        test.done();
    },
    'valid recipient': function (test) {
        test.expect(1);
        this.connection.transaction.rcpt_to.push(
            new Address('<matt@test.com>')
            );
        var cfg = this.plugin.get_config(this.connection);
        test.ok(cfg.enable_tls !== undefined);
        test.done();
    },
    'valid recipient with route': function (test) {
        test.expect(1);
        this.plugin.cfg['test.com'] = { host: '1.2.3.4' };
        this.connection.transaction.rcpt_to.push(
            new Address('<matt@test.com>')
            );
        var cfg = this.plugin.get_config(this.connection);
        test.equal(cfg.host, '1.2.3.4' );
        test.done();
    },
    'valid 2 recipients with same route': function (test) {
        test.expect(1);
        this.plugin.cfg['test.com'] = { host: '1.2.3.4' };
        this.connection.transaction.rcpt_to.push(
            new Address('<matt@test.com>'),
            new Address('<matt@test.com>')
            );
        var cfg = this.plugin.get_config(this.connection);
        test.equal(cfg.host, '1.2.3.4' );
        test.done();
    },
    'valid 2 recipients with different routes': function (test) {
        test.expect(1);
        this.plugin.cfg['test1.com'] = { host: '1.2.3.4' };
        this.plugin.cfg['test2.com'] = { host: '2.3.4.5' };
        this.connection.transaction.rcpt_to.push(
            new Address('<matt@test1.com>'),
            new Address('<matt@test2.com>')
            );
        var cfg = this.plugin.get_config(this.connection);
        test.equal(cfg.host, 'localhost' );
        test.done();
    },
};
