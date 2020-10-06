const moviesApp = {};

moviesApp.firebaseConfig = {
    apiKey: "AIzaSyDvPY5vsRfe3s3pkKi0JP286J_GH2pS3uI",
    authDomain: "findamovie-a778c.firebaseapp.com",
    databaseURL: "https://findamovie-a778c.firebaseio.com",
    projectId: "findamovie-a778c",
    storageBucket: "findamovie-a778c.appspot.com",
    messagingSenderId: "546076329719",
    appId: "1:546076329719:web:84f3c522c684a65b75b5f2"
};

// Initialize Firebase
firebase.initializeApp(moviesApp.firebaseConfig);

moviesApp.dbRef = firebase.database().ref("users/seenMovies");

// getting all genres names and their IDs
moviesApp.getGenresId = () => {
    $.ajax({
    url: `https://api.themoviedb.org/3/genre/movie/list`,
    method: 'GET',
    data: {
        api_key: `4b0a04de3275456e960df5811ac4bafd`,
        }
    }).then((results) => {
        moviesApp.genresWithId = results.genres;
        moviesApp.displayGenresList(moviesApp.genresWithId); // 2nd call
        moviesApp.genresID(moviesApp.genresWithId);
    })
}

// Append the genres on DOM 
moviesApp.displayGenresList = function(genresNames) {
    genresNames.forEach(function(genres) {
        const genresAll =
        `
        <div class="everyGenre" aria-label="${genres.name} genre">
            <input type="checkbox" id="${genres.name}" name="${genres.name}" value="${genres.id}">
            <label for="${genres.name}">${genres.name}</label>
        </div>
        `
        $('.genres').append(genresAll);
        })
}

// Putting all IDs of the movie types into array for later use
moviesApp.IDs = [];
moviesApp.genresID = (ids) => {

        moviesApp.IDs = ids.map((id) => {
            return id.id;
        });
}

// Selecting one or multiple genres(specifying year is optional) and passing them to find movies besed on the selected genres and(or) year
moviesApp.selectGenre = function() {

    $('input[type="submit"]').on('click', function(event) {
        event.preventDefault();

        $('footer').css({'display': 'flex'});
        $('section').empty();
        const selected = $('.genres .everyGenre input[type="checkbox"]');
        
        // getting only the checkboxes that are CHECKED and storing them in array
        const ids = [];
        $(selected).each(function() {
            if ($(this).prop('checked')) {   
                ids.push($(this).val());
                };
            });

        const year = $('input[type="text"]').val();
        const currentYear = new Date().getFullYear();

        
        // checking if any genres selected and that the year has a valid input
        // 1. " " = no choice for year; 
        // 2. 1873 = the first ever movie; 
        // 3. Is a number;
        // 4. Making sure that user's year isn't greater than currentYear;
        if ( (ids.length !== 0 || year == '' || year >= 1873) && (!isNaN(year) && year <= currentYear) ) {
                moviesApp.getMovies(ids, year);
                moviesApp.scroll('.results');

                $('.restart').css("display", "initial");
                $('.restart').empty();
                $('.search-bar input[type="text"]').attr('placeholder', 'Enter a year (optional)'); 
                $('.search-bar input[type="text"]').removeClass('warning');

                const startOver = 
                `
                <button type="button" class="startOver">Restart</button>
                `;
            
                $('.restart').append(startOver);

        } else if (isNaN(year) || year<=1873 || year > currentYear) {
                $('.search-bar input[type="text"]').attr('placeholder', 'Invalid input'); 
                $('.search-bar input[type="text"]').val('');
                $('.search-bar input[type="text"]').toggleClass('warning');
                $('.restart').empty();
        }
    });
}

//getting movies based on selected genre(s) and(or) year
moviesApp.getMovies = function(type, year) { 

    $.ajax({
        url: `https://api.themoviedb.org/3/discover/movie`,
        method: 'GET',
        data: {
            api_key: `4b0a04de3275456e960df5811ac4bafd`,
            with_genres: `${type}`,
            primary_release_year: `${year}`,
        }
    }).then(function(receivedResults) {
        moviesApp.data = receivedResults.results;
        moviesApp.displayNames(receivedResults.results);
    })
}

//appending movie names on DOM
moviesApp.displayNames = function(name) {
    name.forEach( function(movieName) {
        moviesApp.foundResults(movieName);
        $('section').append(foundResults);
    });
}

//using the method below to append found movies
moviesApp.foundResults = (movie) => {
    foundResults = `
    <div class="single-movie">
        <div class="movie-container">
            <div class="poster">
                <img src=https://image.tmdb.org/t/p/w300/${movie.poster_path} alt= '${movie.title} ${movie.original_title}'/>
            </div>

            <h3 class="title">${movie.title}</h3>
            <p class="year">Released: ${movie.release_date.substring(0,4)}</p>
            <p class="rating">Rating: ${movie.vote_average} out of 10</p>

            <button type="button" class="seeDescription">See Description</button>

            <button type="button" class="addToSeenBtn">Add to watched</button>
        </div>

        <div class="movie-container-back">
            <p class="description">${movie.overview}</p>
            <button type="button" class="seeMovieInfo">Go back</button>
        </div>
    </div>
    `; 
};

//start the search over
moviesApp.startOver = function() {
    $('.restart').on('click', function(event){
        event.preventDefault();
        
        // clearing input field
        $('input[type="text"]').val('');
        $('footer').css({'display': 'none'});

        // unchecking checked checkboxes
        if ($('.genres .everyGenre input[type="checkbox"]').prop("checked", true)) {
            $('.genres .everyGenre input[type="checkbox"]').prop("checked", false)
        }

        // removing restart button (it's only to be shown when we have results)
        $('.restart').empty();
        // going to the top of the page
        moviesApp.scroll('h1');

        // making sure the results disappear with delay(not instantly)
        setTimeout(() => {
            $('section').empty();
        }, 1300);
    });
}

//show a side bar of already seen movie(s)
moviesApp.showWatched = () => {
    $('nav button[type="button"]').on('click', function(event){
        event.preventDefault();
        $('.watched-movies').toggleClass('watched-movies-show');
    });
}

//adding a movie to seen
moviesApp.addToWatched = () => {
    $('.wrapper').on('click', '.addToSeenBtn', function(event){
        event.preventDefault();
        moviesApp.prevSibl = $(this).parent().parent();

        //adding movie to database which also adds it back to the "seen" section
        const seenMovie = $(this).parent().parent().html().replace('Add to watched', 'Remove from watched');
        moviesApp.dbRef.push(seenMovie);
        // filling the space with a movie
        moviesApp.getRandomMovie();
    });
}

// showing & hiding description
$('.wrapper').on('click', '.seeDescription', function(){
    let grandparent = $(this).parent().parent();
    // flipping
    $(grandparent).toggleClass('movie-container-flipped');
    // hiding front side
    $($(this).parent()).hide();
    // showing back
    $(grandparent.children('.movie-container-back')).show();
    $(grandparent.children('.movie-container-back')).css({'position': 'static'});
})

$('.wrapper').on('click', '.seeMovieInfo', function(){
    let grandparent = $(this).parent().parent();
    // flipping back
    $(grandparent).toggleClass('movie-container-flipped');
    // showing front side
    $(grandparent.children('.movie-container')).show();
    // hiding back side
    $(grandparent.children('.movie-container-back')).hide();
    $(grandparent.children('.movie-container-back')).css({'position': 'absolute'});
})


moviesApp.removeFromWatched = () => {
    $('.watched-movies').on('click', '.addToSeenBtn', function(event){
        event.preventDefault();
        const key = $(this).parent().parent().attr('data-key');

        $(this).parent().parent().remove();
        moviesApp.dbRef.child(key).remove();
    });
}

// getting a random movie on the place of the movie that went to "seen" section
moviesApp.getRandomMovie = function() { 

    $.ajax({
        url: `https://api.themoviedb.org/3/discover/movie`,
        method: 'GET',
        data: {
            api_key: `4b0a04de3275456e960df5811ac4bafd`,
            page: `${Math.floor(Math.random()*500)}`, // getting random PAGE from API. One out of 500
        }
    }).then(function(receivedResults) {
        // Each PAGE has 20 movies. Below, getting a random movie out of 20
        moviesApp.data = receivedResults.results[Math.floor(Math.random()*receivedResults.results.length)];
        let movieName = moviesApp.data;

        // passing a new movie to make it appear
        moviesApp.foundResults(movieName);

        // replacing a previous movie(that went to SEEN section with a new RANDOM movie)
        $(moviesApp.prevSibl).fadeOut(300, function(){
            $(moviesApp.prevSibl).replaceWith(foundResults);
        });
    });
}

//smooth scrool to come to a desired part of the page
moviesApp.scroll = function(element) {
	$('html').animate(
		{
            scrollTop: $(element).offset().top
		}, 1000
	);
};

moviesApp.getSeenMovies = function() {
    moviesApp.dbRef.on('value', (data) => {
        const dataObject = data.val();

        // create empty array with seen movies
        const arrOfSeen = [];
    
        //loop through the database object and push an <li> element into seen array
        for (property in dataObject) {
            arrOfSeen.push(`<li class='single-movie' data-key=${property}>${dataObject[property]}</li>`)
        }
        //select the <ul> element and add the list of seen movies from the above array
        $('.watched-movies').html(arrOfSeen);
        
    })
}

moviesApp.init = function() {
    moviesApp.getSeenMovies();
    moviesApp.getGenresId();
    moviesApp.selectGenre();
    moviesApp.startOver();
    moviesApp.showWatched();
    moviesApp.addToWatched();
    moviesApp.removeFromWatched();
}

//Document ready
$(function() {
    moviesApp.init();
})