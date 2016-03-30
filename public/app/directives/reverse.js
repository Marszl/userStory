angular.module('reverseDirective', [])

.filter('reverse', function() {

	return function(items) {
		return items.slice().reverse();		// .reverse is een javascript functie op een array
	}
});