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
          <div className="flex flex-col gap-4">
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
    return (
      <div className="mt-8 flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <MonitorPlay className="text-muted-foreground opacity-50" size={24} />
        </div>
        <h4 className="text-sm font-semibold text-foreground mb-1">No video sources needed</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">
          The AI determined that this specific response is straightforward and does not require supplementary video tutorials.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-col gap-3 w-full">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
        <MonitorPlay className="text-red-500" size={18} />
        <span>Recommended Videos</span>
      </div>
      
      <div className="flex flex-col gap-4">
        {videos.map((video, i) => (
          <motion.a
            key={video.id}
            href={`https://www.youtube.com/watch?v=${video.id}`}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group flex gap-3.5 bg-card/40 hover:bg-card border border-transparent hover:border-border/80 rounded-xl p-2 transition-all hover:shadow-lg cursor-pointer items-start focus-ring"
          >
            <div className="relative w-44 shrink-0 aspect-video rounded-lg overflow-hidden bg-muted shadow-sm">
              <img 
                src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`}
                alt={video.title} 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-white/90 text-red-600 flex items-center justify-center opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 shadow-xl backdrop-blur-md">
                  <Play size={18} fill="currentColor" className="ml-1" />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 py-0.5 pr-1 w-full min-w-0">
              <h4 className="font-semibold text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors" dangerouslySetInnerHTML={{ __html: video.title }} />
              <p className="text-[13px] font-medium text-muted-foreground flex items-center gap-1.5 mt-auto pt-1">
                <span className="truncate">{video.channel}</span>
                <ExternalLink size={12} className="shrink-0 opacity-40" />
              </p>
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  );
}
