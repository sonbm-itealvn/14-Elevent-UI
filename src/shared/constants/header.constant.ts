import type { Header } from "@/core/models/header.model";
import { Film, People, Tv  } from "@vicons/ionicons5";
import { Category } from "@vicons/carbon";
import { Calendar, Globe, Home, Movie } from "@vicons/tabler";


const headerConstants: Header[] = [
  {
    id: "0",
    icon: Home,
    title: "Trang chủ",
    to: "/",
  },
  {
    id: "1",
    icon: Film,
    title: "header.genres",
    to: "/genres",
  },
  {
    id: "2",
    icon: Category,
    title: "header.categories",
    to: "/categories",
    children: [
      {
        id: "2.1",
        title: "Anime",
        to: "/anime",
        children: [
          {
            id: "2.1.1",
            title: "Anime 1",
            to: "/anime-1",
          },
        ],
      },
      {
        id: "2.2",
        title: "Action",
        to: "/action",
      },
      {
        id: "2.3",
        title: "Adventure",
        to: "/adventure",
      },
    ],
  },
  {
    id: "3",
    icon: Movie,
    title: "header.movies",
    to: "/movies",
  },
  {
    id: "4",
    icon: Tv,
    title: "header.tvShows",
    to: "/tv-shows",
  },
  {
    id: "5",
    icon: Globe,
    title: "header.countries",
    to: "/countries",
  },
  {
    id: "6",
    icon: People ,
    title: "header.actors",
    to: "/actors",
  },
  {
    id: "7",
    icon: Calendar,
    title: "header.releasesSchedule",
    to: "/releases-schedule",
  },
];

export default headerConstants;
