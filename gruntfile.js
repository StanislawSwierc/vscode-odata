module.exports = function (grunt) {
    grunt.initConfig({
        exec: {
            pegjs: {
                command: "node node_modules/pegjs/bin/pegjs --format umd -o ./src/odataParser.js ./src/odataParser.pegjs"
            }
        },
        copy: {
            pegjs: {
                files: [
                    {
                        src: "./src/odataParser.js",
                        dest: "./out/src/odataParser.js",
                    }
                ]
            }
        },
    });

    grunt.loadNpmTasks("grunt-exec");
    grunt.loadNpmTasks("grunt-contrib-copy");

    grunt.registerTask("build", ["exec:pegjs", "copy:pegjs"]);
    grunt.registerTask("default", ["build"]);
};
