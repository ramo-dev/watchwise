import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bookmark, Calendar, Info, Trash, User } from "lucide-react";
import { Link } from "react-router-dom";
import ErrorBoundary from "../components/Error";
import { useMovieStore, useThemeStore } from "../store/store";
import Loader from "../components/Loading";
import useAuthState from "../hooks/useAuth";
import GoBackBtn from "../components/GoBackBtn";
import noPhoto from "../assets/nophoto.webp"
import { fetchTrending } from "../components/Movies/FetchFunctions";


export default function MyList() {
  const { isDark } = useThemeStore();
  const { loading, movies, removeMovie, addMovie, isAdded } = useMovieStore();
  const { user } = useAuthState();

  //Fetch data, loading and error state from all movies
  const { data, isError, isLoading } = useQuery({
    queryKey: ["movies"],
    queryFn: fetchTrending,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  //side effect to redirect the screen to top incase of a change in the movies array
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [movies])


  //side effect to get all movies in the current users list
  useEffect(() => {
    if (user && user.uid) {
      useMovieStore.getState().fetchMovies(user?.uid);
    }
  }, [user]);


  //Render Loading if movies are fetchin
  if (isLoading) {
    return <Loader />;
  }

  //render Error suppose movies fail to fetch
  if (isError && !isLoading) {
    return <ErrorBoundary />;
  }

  return (
    <div>
      {/* Saved Movies Section */}
      <GoBackBtn />
      <div className={`${isDark ? "bg-black py-1 text-white" : "bg-white py-1"} transition-all duration-200 ease-in-out`}>
        <h1 className="text-4xl my-8 md:ms-10 ms-2 font-bold">My List</h1>
        <div className="md:px-10 px-2 mx-auto flex flex-wrap gap-6 w-full">
          {loading ?
            <div className="flex justify-center mx-auto">
              <Loader />
            </div>
            :
            movies.length > 0 ? (
              movies.map((item) => (
                <div key={item.id} className={`${isDark ? "bg-black border-neutral-800 " : "bg-white border-gray-300"} border p-4 hover:shadow-md md:max-w-[400px] h-max transition-all duration-200 ease-in-out flex-1 md:min-w-[380px] min-w-[280px] w-full`}>
                  <Link to={`/movie/${item.id}`} key={item.id}>
                    <div className="h-full">
                      <img
                        loading="lazy"
                        src={`${import.meta.env.VITE_MOVIEDB_IMAGES}${item.poster_path}` || noPhoto}
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
                  <div className="flex gap-2">

                    <button
                      onClick={() => removeMovie(user.uid, item.id)}
                      className="mt-4 bg-red-500 w-full text-black py-2 px-6 rounded flex items-center hover:bg-opacity-80 transition">
                      <Trash className="mr-2" /> Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No movies saved to your list.</p>
            )}
        </div>
      </div>

      {/* Trending Movies Section */}
      <div className={`${isDark ? "bg-black py-10 text-white" : "bg-white py-10"} transition-all duration-200 ease-in-out`}>
        <h1 className="text-4xl my-24 md:ms-10 ms-2 font-bold">Recommended Movies </h1>
        <div className="md:px-10 px-2 mx-auto flex flex-wrap gap-6 w-full">
          {data ? (

            data.map((item) => (
              <div key={item.id} className={`${isDark ? "bg-black border-neutral-800" : "bg-white border-gray-300"} border p-4 hover:shadow-md md:max-w-[400px] h-full transition-all duration-200 ease-in-out flex-1 md:min-w-[380px] min-w-[280px] w-full`}>
                <Link to={`/movie/${item.id}`} key={item.id}>
                  <div className="h-full" >
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
                {isAdded}
                <button
                  onClick={() => addMovie(user.uid, item)}
                  className="mt-4 bg-gray-200 w-full text-black py-2 px-6 rounded flex items-center hover:bg-opacity-80 transition">
                  <Bookmark className="mr-2" /> Save
                </button>

              </div>
            ))
          ) : (
            <p>No trending movies available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
