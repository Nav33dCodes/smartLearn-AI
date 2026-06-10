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
    <div className="flex flex-col gap-3 w-full bg-card/30 border border-border/60 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-2 text-[13px] font-semibold tracking-wide uppercase text-muted-foreground/80 mb-2">
        <MonitorPlay className="text-red-500/80" size={16} />
        <span>Relevant Videos</span>
      </div>
      
      <div className="flex overflow-x-auto pb-4 -mx-2 px-2 custom-scrollbar gap-4 snap-x">
        {videos.map((video, i) => (
          <motion.a
            key={video.id}
            href={`https://www.youtube.com/watch?v=${video.id}`}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1, duration: 0.3 }}
            className="group shrink-0 w-[280px] sm:w-[320px] flex flex-col gap-3 bg-card hover:bg-muted/50 border border-border hover:border-border/80 rounded-2xl p-2.5 transition-all hover:shadow-lg cursor-pointer focus-ring snap-start"
          >
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-muted shadow-sm">
              <img 
                src={`https://wsrv.nl/?url=i.ytimg.com/vi/${video.id}/hqdefault.jpg`}
                alt={video.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                loading="lazy"
                onError={(e) => {
                  if (!e.target.dataset.retried) {
                    e.target.dataset.retried = "true";
                    e.target.src = video.thumbnail;
                  }
                }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white/90 text-red-600 flex items-center justify-center opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 shadow-xl backdrop-blur-md">
                  <Play size={22} fill="currentColor" className="ml-1" />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1 px-1">
              <h4 className="font-semibold text-[14px] leading-snug line-clamp-2 group-hover:text-primary transition-colors" dangerouslySetInnerHTML={{ __html: video.title }} />
              <p className="text-[12px] font-medium text-muted-foreground flex items-center gap-1.5 mt-1">
                <span className="truncate">{video.channel}</span>
                <ExternalLink size={10} className="shrink-0 opacity-40" />
              </p>
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  );
}
