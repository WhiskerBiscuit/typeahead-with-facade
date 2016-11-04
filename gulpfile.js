var gulp = require('gulp-help')(require('gulp'));
var requireDir = require('require-dir');

// Pull in all tasks from the following directories:
requireDir('./gulp/tasks', {recurse: true});
