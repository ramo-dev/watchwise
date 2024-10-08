import { Button, Dialog, IconButton, Skeleton } from "@radix-ui/themes";
import { FilmIcon, SearchIcon, XIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useThemeStore } from "../store/store";
import { fetchQuery } from "./Movies/FetchFunctions";


export default function Search() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const { isDark } = useThemeStore();//Get current theme state

  //Function to show articles in realtime while user is typing
  const { data, isLoading } = useQuery({
    queryKey: ['articles', debouncedSearch],
    queryFn: () => fetchQuery(debouncedSearch),
    enabled: !!debouncedSearch
  });


  //function to delay when to show results per keystroke to prevent too many request per second
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 200);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);


  //set search term from input
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };




  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <IconButton variant="solid" size="3" radius="full"
          className="cursor-pointer">
          <SearchIcon />
        </IconButton>
      </Dialog.Trigger>
      <Dialog.Content
        maxWidth="750px"
        className={`${isDark ? "!bg-black/80 !border-0" : "bg-white"} max-h-screen no-scroll`}>
        <input
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search..."
          className={`sticky top-0 border p-2 rounded-full flex-1 focus:ring-gray-300 px-4 w-full ${isDark ? "!bg-black/80 text-white" : "bg-white"}`}
        />
        {!search.length ? (
          <div className="flex text-center gap-2 items-center justify-center my-4 text-gray-500">
            <SearchIcon />
            <h2>Search titles from your favourite movies</h2>
          </div>
        ) : (
          <div>
            {isLoading ? (
              <>
                <Skeleton className={`w-full h-[50px] my-4  ${isDark ? "!bg-gray-800 text-white" : ""}`} />

                <Skeleton className={`w-full h-[50px] my-4  ${isDark ? "!bg-gray-800 text-white" : ""}`} />
                <Skeleton className={`w-full h-[50px] my-4  ${isDark ? "!bg-gray-800 text-white" : ""}`} />
                <Skeleton className={`w-full h-[50px] my-4  ${isDark ? "!bg-gray-800 text-white" : ""}`} />
              </>
            ) : (
              data && data.length > 0 ? (
                data.map((item) => (
                  <Dialog.Close key={item.id}>
                    <Link to={`/movie/${item.id}`} className="block">
                      <div className="flex items-center gap-4 p-4 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg my-4 transition">
                        {item.poster_path ? (
                          <img
                            src={`${import.meta.env.VITE_MOVIEDB_IMAGES}${item.poster_path}`}
                            alt={item.name || item.title}
                            className="w-[120px] h-[120px] object-cover rounded"
                          />
                        ) : (
                          <div className="bg-gray-200 dark:bg-gray-700 w-[80px] h-[120px] flex items-center justify-center rounded">
                            <FilmIcon className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-800 dark:text-gray-200">{item.name || item.title}</h3>
                          <p className="text-gray-600 dark:text-gray-400 line-clamp-2">{item.overview}</p>
                        </div>
                      </div>
                    </Link>
                  </Dialog.Close>
                ))
              ) : (
                <div className="flex items-center text-center gap-2 items-center justify-center my-4 text-gray-500 dark:text-gray-400">
                  <FilmIcon />
                  <h1>No results found, try searching for something else.</h1>
                </div>
              )
            )}
          </div>
        )}
      </Dialog.Content>
    </Dialog.Root>
  );
}
