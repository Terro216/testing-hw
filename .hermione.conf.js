module.exports = {
  sets: {
    desktop: {
      files: 'test/hermione',
    },
  },

  browsers: {
    chrome: {
      automationProtocol: 'devtools',
      desiredCapabilities: {
        browserName: 'chrome',
      },
      sessionEnvFlags: {
        isW3C: true,
        isChrome: true,
      },
      windowSize: {
        width: 1920,
        height: 1080,
      },
    },
  },
  plugins: {
    'html-reporter/hermione': {
      enabled: true,
    },
  },
}
