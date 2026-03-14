/**
 * Entorno Jest que extiende jsdom y reemplaza window.location por un mock mutable.
 * Necesario porque en jsdom 21+ location es read-only y no configurable.
 */
const JestEnvironmentJsdom = require('jest-environment-jsdom').default;

function noop() {}
function createLocationMock() {
  return {
    href: 'http://localhost/',
    search: '',
    hash: '',
    pathname: '/',
    host: 'localhost',
    hostname: 'localhost',
    origin: 'http://localhost',
    port: '',
    protocol: 'http:',
    assign: noop,
    replace: noop,
    reload: noop,
    ancestorOrigins: { length: 0, item: () => null, contains: () => false },
    toString: () => 'http://localhost/',
  };
}

module.exports = class JestEnvironmentJsdomMutableLocation extends JestEnvironmentJsdom {
  constructor(config, context) {
    super(config, context);
    // Sombrear location del prototipo con un objeto mutable (defineProperty crea propiedad propia)
    try {
      Object.defineProperty(this.global, 'location', {
        value: createLocationMock(),
        writable: true,
        configurable: true,
        enumerable: true,
      });
    } catch (_) {}
  }
};
