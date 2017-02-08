angular.module('watchit')

    .factory('DOM', function () {
         return (html) => {
             let temp = document.createElement('template');
             temp.innerHTML = html;

             return temp.content;
         };
    });