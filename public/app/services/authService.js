// ANgular service tbv authenticatie
// we noemen m authService

angular.module('authService', [])

// fetch data / api form server
// We neomen de factory Auth, met een http callback functie, een promise object $q en een nieuw factory object
// AUthToken (later te creeeren)
.factory('Auth', function($http, $q, AuthToken) {


	var authFactory = {};

	authFactory.login = function(username, password) {

		return $http.post('api/login', {
			username: username,
			password: password

		})
		.success(function(data) {
			AuthToken.setToken(data.token);
			return data;
		})
	}
// Na uitloggen Token resetten
	authFactory.logout = function() {
		AuthToken.setToken();
	}
// Zijn we nog ingelogges en hebben we dus een Token
	authFactory.isLoggedIn = function() {
		if(AuthToken.getToken())
			return true;
		else
			return false;
	}
	authFactory.getUser = function() {
		if(AuthToken.getToken())
			return $http.get('/api/me');
		else
			return $q.reject({ message: "User has no token"});
	}


	return authFactory;
})


// NIeuwe factory AuthToken
// $window zorgt voor info vanuit de browser
.factory('AuthToken', function($window) {

	var authTokenFactory = {}; 

	authTokenFactory.getToken = function() {
		return $window.localStorage.getItem('token');
	}
	authTokenFactory.setToken = function(token) {
		if(token)
			return $window.localStorage.setItem('token', token);
		else
			return $window.localStorage.removeItem('token');
	}

	return authTokenFactory;

})

// INterceptor factory, om te bepalen is er wel een token
// 
.factory('AuthInterceptor', function($q, $location, AuthToken) {

	var interceptorFactory = {};

	interceptorFactory.request = function(config) {

		var token = AuthToken.getToken();

		if (token) {

			config.headers['x-access-token'] = token;

		}

		return config;
	};

// Als je naar een pagina wilt waarvoor je een token moet hebben en je hebt t niet dan ga je terug naar de login pagina
	interceptorFactory.responseError = function(response) {
		if(response.status == 403)
			$location.path('/login');
		return $q.reject(response);
	}

	return interceptorFactory;
});


