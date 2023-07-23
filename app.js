// app.js
const API_KEY = '1172b46a';
const BASE_URL = 'https://www.omdbapi.com/';
const moviesPerPage = 12;
let currentPage = 1;
let totalResults = 0;
let currentMovies = [];
let selectedMovieId = null;

  function showLoadingSpinner() {
    const movieListDiv = document.getElementById("movieList");
    const spinnerDiv = document.createElement("div");
    spinnerDiv.className = "spinner";
    movieListDiv.innerHTML = ""; // Clear movie list
    movieListDiv.appendChild(spinnerDiv);
  }

  function hideLoadingSpinner() {
    const movieListDiv = document.getElementById("movieList");
    movieListDiv.innerHTML = ""; // Clear movie list
  } 
  
  function displayError(errorMessage) {
    const movieListDiv = document.getElementById("movieList");
    const errorDiv = document.createElement("div");
    errorDiv.textContent = errorMessage;
    errorDiv.style.color = "red";
    movieListDiv.innerHTML = ""; // Clear movie list
    movieListDiv.appendChild(errorDiv);
  } 
  
  function handleMovieData(data) {
    
    if (data.Response === "True") {
      totalResults = parseInt(data.totalResults);
      currentMovies = data.Search;
      displayMovies();
    } else {
      const errorMessage = data.Error || "No movies found!";
      displayError(errorMessage);
    }
  }  

// Fetch movies from the OMDB API
async function fetchMovies(keyword) {
    try {
      showLoadingSpinner();
      const response = await fetch(
        `${BASE_URL}?s=${keyword}&apikey=${API_KEY}&page=${currentPage}`
      );
      const data = await response.json();
      hideLoadingSpinner();
      handleMovieData(data);
    } catch (error) {
      hideLoadingSpinner();
      displayError("Error fetching movie data. Please try again later.");
      console.error("Error fetching movie data:", error);
    }
  }

// Display movies on the front page
function displayMovies() {
    const movieListDiv = document.getElementById("movieList");
    movieListDiv.innerHTML = "";
  
    for (const movie of currentMovies) {
      const movieDiv = document.createElement("div");
      movieDiv.className = "movie";

      // Create the movie poster image element and set width and height attributes
      const posterImg = document.createElement("img");
      posterImg.src = movie.Poster;
      posterImg.alt = movie.Title;
      posterImg.width = 100; // Set the width to your desired fixed size
      posterImg.height = 200; // Set the height to your desired fixed size
      posterImg.style.objectFit = "cover";
  
      const movieTitle = document.createElement("h3");
      movieTitle.textContent = movie.Title;
    //   movieTitle.style.textAlign = "center";
  
      movieDiv.appendChild(posterImg);
      movieDiv.appendChild(movieTitle);
  
      movieDiv.addEventListener("click", () => openMovieDetails(movie));
      movieListDiv.appendChild(movieDiv);
    }
  
    document.getElementById("currentPage").textContent = currentPage;
  }

// Search movies when the search button is clicked
function searchMovies() {
  const keyword = document.getElementById("searchInput").value.trim();
  if (keyword) {
    currentPage = 1;
    fetchMovies(keyword);
  }
}

// Pagination logic - go to previous page
function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    fetchMovies(document.getElementById("searchInput").value);
  }
}

// Pagination logic - go to next page
function nextPage() {
  const maxPage = Math.ceil(totalResults / moviesPerPage);
  if (currentPage < maxPage) {
    currentPage++;
    fetchMovies(document.getElementById("searchInput").value);
  }
}

// Display movie details when a movie is clicked
function openMovieDetails(movie) {
  const modal = document.getElementById("movieDetailsModal");
  modal.innerHTML = `
    <div class="modal-content">
      <h2>${movie.Title}</h2>
      <img src="${movie.Poster}" alt="${movie.Title}">
      <label>Rate this movie:</label>
      <input type="number" min="0" max="5" onchange="rateMovie('${movie.imdbID}', this.value)" value="${getMovieRating(movie.imdbID)}">
      <div>
        <h3>Comments</h3>
        <ul>${getMovieComments(movie.imdbID).map((comment) => `<li>${comment}</li>`).join("")}</ul>
        <input type="text" placeholder="Add a comment..." onkeyup="addComment(event, '${movie.imdbID}')">
      </div>
    </div>
  `;

  modal.style.display = "block";
  selectedMovieId = movie.imdbID;
}

// Close the movie details modal
function closeMovieDetailsModal() {
  const modal = document.getElementById("movieDetailsModal");
  modal.style.display = "none";
  selectedMovieId = null;
}

// Local storage functions to handle ratings and comments
function getMovieRating(movieId) {
  const rating = localStorage.getItem(`movie_rating_${movieId}`);
  return rating ? Number(rating) : 0;
}

function rateMovie(movieId, rating) {
  localStorage.setItem(`movie_rating_${movieId}`, rating);
}

function getMovieComments(movieId) {
  const comments = localStorage.getItem(`movie_comments_${movieId}`);
  return comments ? JSON.parse(comments) : [];
}

function addComment(event, movieId) {
  if (event.key === "Enter") {
    const comment = event.target.value;
    const comments = getMovieComments(movieId);
    comments.push(comment);
    localStorage.setItem(`movie_comments_${movieId}`, JSON.stringify(comments));
    openMovieDetails(currentMovies.find((movie) => movie.imdbID === movieId));
  }
}

// Event listener to close the modal when clicked outside
window.addEventListener("click", (event) => {
  const modal = document.getElementById("movieDetailsModal");
  if (event.target === modal) {
    closeMovieDetailsModal();
  }
});

// Initialize the app
searchMovies();
