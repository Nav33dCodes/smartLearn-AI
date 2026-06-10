import React from 'react';
import { motion } from 'framer-motion';
import { MonitorPlay, ExternalLink, Play } from 'lucide-react';
import { useYouTubeRecommendations } from '../hooks/useYouTube';

export default function YouTubeRecommendations({ userQuery, shouldFetch }) {
  const { data: videos, isLoading } = useYouTubeRecommendations(userQuery, shouldFetch);

  if (!videos || videos.length === 0) {
    // Only show loading skeletons if we are actively fetching
    if (isLoading && shouldFetch) {
      return (
        <div className="mt-4 flex flex-col gap-3 w-full">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
            <MonitorPlay className="text-red-500" size={16} />
            <span>Finding relevant videos...</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2 animate-pulse">
                <div className="w-full aspect-video bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
                <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
                <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="mt-4 flex flex-col gap-3 w-full">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
        <MonitorPlay className="text-red-500" size={18} />
        <span>Recommended Videos</span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video, i) => (
          <motion.a
            key={video.id}
            href={`https://www.youtube.com/watch?v=${video.id}`}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group flex flex-col gap-2.5 bg-card border border-border hover:border-primary/50 rounded-xl p-2.5 transition-all hover:shadow-md cursor-pointer"
          >
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
              <img 
                src={video.thumbnail} 
                alt={video.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-red-600/90 text-white flex items-center justify-center scale-90 group-hover:scale-100 transition-transform shadow-lg backdrop-blur-sm">
                  <Play size={18} fill="currentColor" className="ml-1" />
                </div>
              </div>
            </div>
            <div className="px-1 pb-1 flex flex-col gap-1">
              <h4 className="font-semibold text-sm line-clamp-2 leading-snug group-hover:text-primary transition-colors" dangerouslySetInnerHTML={{ __html: video.title }} />
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <span className="truncate">{video.channel}</span>
                <ExternalLink size={10} className="shrink-0 opacity-50" />
              </p>
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  );
}
