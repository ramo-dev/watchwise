import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bookmark, Calendar, Film, Info, User } from "lucide-react";
import { Link } from "react-router-dom";
import noPhoto from "../assets/nophoto.webp";
import ErrorBoundary from "./Error";
import Loader from "./Loading";
import { useMovieStore, useThemeStore } from "../store/store";
import useAuthState from "../hooks/useAuth";
import { fetchTrending, getMovieTrailer } from "./Movies/FetchFunctions";



export default function MovieList() {
  const [randomMovie, setRandomMovie] = useState(null);
  const [randomMovieTrailer, setRandomMovieTrailer] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const { isDark } = useThemeStore();

  //Get current users movies and actions to perform crud operations
  const { movies, removeMovie, addMovie } = useMovieStore();

  //fetch the user object containing the current users info
  const { user } = useAuthState();


  //Function to check if movie is in the users list, returns an object converted to boolean
  function checkIsAdded(id) {
    if (movies) {
      setIsAdded(!isAdded);
      const find = movies.find(itm => itm.id === id);
      setIsAdded(!!find);
    }
  }


  //Extract data, loading state or any errors from the fetchMovies function
  const { data, isError, isLoading } = useQuery({
    queryKey: ["movies"],
    queryFn: fetchTrending,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });



  //Function to fetch and display a random movie in the hero section
  useEffect(() => {
    if (data && data.length > 0) {
      const random = Math.floor(Math.random() * data.length);
      setRandomMovie(data[random]);

      const fetchTrailer = async () => {
        const trailer = await getMovieTrailer(data[random].id);
        setRandomMovieTrailer(trailer);
      };
      fetchTrailer();
    }
  }, [data]);


  //side effect with a function to check where the preview movie id is on the users list
  useEffect(() => {
    if (randomMovie && randomMovie.id) {
      const result = checkIsAdded(randomMovie.id);
      if (result) {
        setIsAdded(!!result)
      }

    }
  }, [randomMovie?.id, movies]);



  //side effect to show/hide controls while scrolling
  useEffect(() => {
    function detectScreenScroll() {
      if (window.scrollY > 15) {
        setScrolled(true);
      }
      else {
        setScrolled(false);
      }
    }
    window.addEventListener("scroll", detectScreenScroll);

    return () => window.removeEventListener("scroll", detectScreenScroll)
  }, [])




  //A timeout in a side effect to show the trailer of the random movie trailer after some seconds
  useEffect(() => {
    let timer;
    if (randomMovie) {
      timer = setTimeout(() => {
        setShowTrailer(true);
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [randomMovie]);


  //Action to add movie to current userList
  const handleAddMovie = () => {
    if (user && randomMovie) {
      addMovie(user.uid, randomMovie);
      setIsAdded(true);
    }
  };


  //Action to delete a movie from the current userList
  const handleRemoveMovie = () => {
    if (user && randomMovie) {
      removeMovie(user.uid, randomMovie.id);
      setIsAdded(false);
    }
  };



  //render a Loader if the data fetching state is pending
  if (isLoading) {
    return <Loader />;
  }

  //render an Error Image if the data fetching state returns an Error
  if (isError) {
    return <ErrorBoundary />;
  }

  return (
    <div>
      {randomMovie && (
        <div className="w-full">
          {/* Hero Section */}
          <div className="relative h-screen">
            {showTrailer && randomMovieTrailer ? (
              <iframe
                src={`https://www.youtube.com/embed/${randomMovieTrailer.key}`}
                frameBorder="0"
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                aria-controls="hidden"
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={
                  randomMovie.backdrop_path
                    ? `${import.meta.env.VITE_MOVIEDB_BACKDROP}${randomMovie.backdrop_path}`
                    : noPhoto
                }
                alt={randomMovie.title || "No Title Available"}
                className="w-full h-full object-cover"
              />
            )}
            <div className={`absolute md:bottom-14 bottom-32 left-0 md:p-8 px-3 w-full w-full rounded-lg bg-gradient-to-t from-black to-transparent transition-all duration-500 ease-in-out  ${scrolled ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}`}>
              <h1 className="text-5xl font-bold mb-4 text-white">{randomMovie.title}</h1>
              <p className="text-xl mb-6 text-white text-ellipse">{randomMovie.overview}</p>
              <div className="flex space-x-4 mb-6">
                {user ?
                  isAdded ?
                    <button
                      onClick={handleRemoveMovie}
                      className="bg-white text-black py-2 px-6 rounded flex items-center hover:bg-opacity-80 transition">
                      <Film className="mr-2" /> Remove from List
                    </button>
                    : <button
                      onClick={handleAddMovie}
                      className="bg-white text-black py-2 px-6 rounded flex items-center hover:bg-opacity-80 transition">
                      <Bookmark className="mr-2" /> Save
                    </button>


                  : <Link to="/login">
                    <button
                      className="bg-white text-black py-2 px-6 rounded flex items-center hover:bg-opacity-80 transition">
                      Login to save
                    </button>

                  </Link>}
                <Link to={`/movie/${randomMovie.id}`}>
                  <button className="bg-gray-500 bg-opacity-50 text-white py-2 px-6 rounded flex items-center hover:bg-opacity-70 transition">
                    <Info className="mr-2" /> More Info
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className={`${isDark ? "bg-black py-10 text-white" : "bg-white py-10"} transition-all duration-200 ease-in-out`} >
        <h1 className="text-4xl my-8 md:ms-10 ms-2 font-bold">People are also watching</h1>
        <div className="md:px-10 px-2 mx-auto flex flex-wrap gap-6 w-full">

          {data ? data.map((item) => (
            <Link to={`/movie/${item.id}`} key={item.id} className=" flex-1  md:min-w-[380px] min-w-[280px]  w-full">
              <div className={`${isDark ? "bg-black border-neutral-800" : "bg-white border-gray-300"} border p-4 hover:shadow-md md:max-w-[400px] h-full transition-all duration-200 ease-in-out`}>
                <img
                  loading="lazy"
                  src={`${import.meta.env.VITE_MOVIEDB_IMAGES}${item.poster_path}`}
                  alt={item.title}
                  className="rounded-lg object-cover h-60 w-full mb-4"
                />
                <h2 className={`text-lg font-semibold mb-1 ${isDark ? "text-gray-200" : "text-gray-800"}`}>{item.title}</h2>
                <p className={`${isDark ? "text-gray-400" : "text-gray-600"} mb-2`}>{item.overview}</p>
                <div className={`flex items-center text-sm ${isDark ? "text-gray-400" : "text-gray-600"} mb-2`}>
                  <User className="mr-1" />
                  <span>{item.original_language}</span>
                  <span className="mx-2">|</span>
                  <Calendar className="mr-1" />
                  <span>{item.release_date}</span>
                </div>
              </div>
            </Link>
          )) : "No movies available"}
        </div>
      </div>
    </div>
  );
}
