module.exports = {
  transform: { '^.+\\.ts?$': 'ts-jest' },
  testEnvironment: 'node',
  testRegex: '/src/.*\\.(test|spec)?\\.(ts|tsx)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  // moduleNameMapper: {
  //   '@config(.*)': '<rootDir>/src/config$1',
  //   '@loaders(.*)': '<rootDir>/src/loaders$1',
  //   '@routes(.*)': '<rootDir>/src/routes$1',
  //   '@services(.*)': '<rootDir>/src/services$1',
  //   '@models(.*)': '<rootDir>/src/models$1',
  //   '@middleware(.*)': '<rootDir>/src/middleware$1',
  //   '@helpers(.*)': '<rootDir>/src/helpers$1',
  //   '@listeners(.*)': '<rootDir>/src/listeners$1',
  //   '@publishers(.*)': '<rootDir>/src/publishers$1',
  //   '@docs(.*)': '<rootDir>/src/docs$1',
  // },
}
