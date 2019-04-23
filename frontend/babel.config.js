const presets = [
    [
        "@babel/preset-env",
        {
            targets: ['last 10 versions', 'ie >= 9'],
            // Only include those polyfills for things that we use in our code
            useBuiltIns: "usage"
        },
    ],
];

module.exports = { presets };
