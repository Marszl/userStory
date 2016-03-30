// routering, anders komen we steeds op index.html uit
// https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.5.3/angular-route.min.js laden in de index.html

angular.module('appRoutes', ['ngRoute'])

.config(function($routeProvider, $locationProvider) {

	$routeProvider

		.when('/', {

			templateUrl: 'app/views/pages/home.html',
			controller: 'MainController',
			controllerAs: 'main'
		})
		.when('/login', {

			templateUrl: 'app/views/pages/login.html'
		})
		.when('/signup', {

			templateUrl: 'app/views/pages/signup.html'
		})
		.when('/allStories', {

			templateUrl: 'app/views/pages/allStories.html',
			controller: 'AllStoriesController',
			controllerAs: 'story',
			resolve: {						// Kennelijk om te zorgen dat er direct gerenderd of geladen wordt
				stories: function(Story) {
					return Story.allStories();
				}
			}
		})

	// $locationProvider.html5Mode(true);	
	$locationProvider.html5Mode({
  		enabled: true,
  		requireBase: false
	});
})