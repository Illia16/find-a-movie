const moviesApp = {};

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
        
        // checking if any genres selected and that the year has a valid input
        // 1. " " = no choice for year; 
        // 2. 1873 = the first ever movie; 
        // 3. Is a number);

        if ( (ids.length !== 0 || year == '' || year >= 1873) && (!isNaN(year)) ) {
                console.log(ids);
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

        } else if (isNaN(year) || year<=1873) {
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
    <div class="movie-container">

        <div class="poster">
            <img src=https://image.tmdb.org/t/p/w300/${movie.poster_path} alt= '${movie.title} ${movie.original_title}'/>
        </div>

        <h3 class="title">${movie.title}</h3>
        <p class="year">Released: ${movie.release_date.substring(0,4)}</p>
        <p class="rating">Rating: ${movie.vote_average} out of 10</p>
    
        <details class="description">
            <summary>
                    <i class="fas fa-plus" aria-hidden="true" ></i> Description
            </summary>
            <p>${movie.overview}</p>
        </details>

        <button type="button">Add to watched</button>
    </div>
    `; 
};

//start the search over
moviesApp.startOver = function() {
    $('.restart').on('click', function(event){
        event.preventDefault();
        
        // clearing input field
        $('input[type="text"]').val('');

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

let prevSibl = '';

//adding a movie to seen
moviesApp.addToWatched = () => {

    $('.results').on('click', 'button[type="button"]', function(event){
        event.preventDefault();

        prevSibl = $(this).parent();
        console.log(this);
        console.log(prevSibl);

        // appending the saved movie on the side bar
        $(prevSibl).clone().prependTo("div.watched-movies");

        // removing the button "Add to watched" as it's already gonna be there
        $('div.watched-movies .movie-container button').remove();

        // filling the space with a random movie
        moviesApp.getRandomMovie();
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
        $(prevSibl).replaceWith(foundResults);        
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

moviesApp.init = function() {
    moviesApp.getGenresId();
    moviesApp.selectGenre();
    moviesApp.startOver();
    moviesApp.showWatched();
    moviesApp.addToWatched();
}

//Document ready
$(function() {
    moviesApp.init();
})

// Further work
// 1. I wanted to populate an empty spot of the movie that went to "seen" section NOT with a random movie, BUT with the one
// with the genre(s) and year specified. So, sending every movie to "seen" section, I wanted to populate new empty spots with new movies one by one from 1 to 20 taking them from the NEXT page (2). When the last movie(2) form page 2 got moved, then use page 3 and so on. API is structured in a way so that there's only 20 movies max per page. Also, while getting data, it seems that milpiple pages can't be specified. Could you suggest the best way on how to do that?