
import React, { useState, useEffect } from 'react';

interface BlogPost {
  id: string;
  title: string;
  tag: string;
  vibeColor: string;
  readTime: string;
  excerpt: string;
  image: string;
  content: string[];
}

const PremiumImage: React.FC<{ src: string; alt: string; className?: string }> = ({ src, alt, className }) => {
  const [status, setStatus] = useState<'loading' | 'error' | 'loaded'>('loading');

  useEffect(() => {
    setStatus('loading');
  }, [src]);

  return (
    <div className="relative w-full h-full bg-slate-100 overflow-hidden">
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
          <div className="w-6 h-6 border-2 border-slate-200 border-t-airalo rounded-full animate-spin"></div>
        </div>
      )}
      
      {status !== 'error' ? (
        <img
          src={src}
          alt={alt}
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
          className={`w-full h-full object-cover transition-all duration-1000 ease-out ${
            status === 'loaded' ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
          } ${className}`}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 p-6 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-900/40"></div>
          <div className="relative z-10">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-10 h-10 text-white/20 mx-auto mb-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Story Preview</p>
          </div>
        </div>
      )}
    </div>
  );
};

const Blog: React.FC = () => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const posts: BlogPost[] = [
    {
      id: 'post-1',
      title: 'The Airport Sprint: Landing & Staying Connected',
      tag: 'Real Talk',
      vibeColor: 'from-orange-400 to-pink-500',
      readTime: '2 min read',
      excerpt: "Don't be the person wandering around the baggage claim hunting for Wi-Fi. Here is how to hit the ground running.",
      image: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?auto=format&fit=crop&w=1200&q=80',
      content: [
        "We've all seen it: a group of exhausted students huddled around an airport charging pillar, desperately trying to get the public Wi-Fi to load Google Maps.",
        "Pro tip: Landing in a new country is 100% easier when your data is already active. While everyone else is filling out 'Terms & Conditions' for the airport network, you'll be halfway to your dorm in an Uber.",
        "Setting up your 'I Have Landed' eSIM before your flight means the moment you switch off Airplane Mode, you're back on the grid. No lines, no SIM-card pins, no drama."
      ]
    },
    {
      id: 'post-2',
      title: 'Coffee vs. Connectivity: The Roaming Math',
      tag: 'Money Hack',
      vibeColor: 'from-emerald-400 to-cyan-500',
      readTime: '3 min read',
      excerpt: "Your home carrier's daily 'International Pass' is literally daylight robbery. Let's look at what that $15 actually buys you.",
      image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
      content: [
        "Most big carriers charge about $10-$15 per day for international roaming. If you're on a month-long orientation, that's almost $450. You could buy a new iPhone for that.",
        "For that same $15, a local eSIM gives you enough data for the whole month. It's the difference between buying one fancy latte and buying the whole cafe.",
        "We believe student budgets should be spent on experiences, not data overages. By using local networks directly, you're getting the exact same speed as the locals for a fraction of the cost."
      ]
    },
    {
      id: 'post-3',
      title: "Digital Survival: Don't Kill Your Data Quota",
      tag: 'Pro Tips',
      vibeColor: 'from-violet-400 to-indigo-500',
      readTime: '4 min read',
      excerpt: "Instagram Reels and TikTok will eat your 10GB in an afternoon if you aren't careful. Here's how to stay live all semester.",
      image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
      content: [
        "Social media apps are data vampires. They pre-load high-def video in the background even when you aren't looking at them.",
        "The first thing you should do is head into your settings and toggle 'Background App Refresh' to OFF. You'll still get your notifications, but your phone won't be scrolling TikTok while it's in your pocket.",
        "Lean on your campus Wi-Fi for the heavy lifting (Netflix, YouTube, FaceTime) and save your eSIM data for when you're exploring the city or finding your way home after a late study session."
      ]
    }
  ];

  return (
    <section id="blog" className="py-24 bg-[#fcfcfd]">
      <div className="max-w-7xl mx-auto px-4">
        {/* Masthead */}
        <div className="mb-20 text-center md:text-left flex flex-col md:flex-row items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-block px-4 py-1.5 rounded-full bg-airalo/10 text-airalo text-[10px] font-black uppercase tracking-[0.2em] mb-6">
              The Student Manual
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-[0.95] mb-6">
              Arrive Smart.<br/><span className="text-slate-400">Live Connected.</span>
            </h2>
            <p className="text-slate-500 font-medium text-lg leading-relaxed">
              No boring corporate updates. Just the hacks you need to survive and thrive abroad.
            </p>
          </div>
          <div className="hidden lg:block text-right">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Volume 01 • Issue 04</p>
          </div>
        </div>

        {/* Magazine Grid */}
        <div className="grid md:grid-cols-3 gap-10">
          {posts.map((post) => (
            <div 
              key={post.id} 
              className="group cursor-pointer flex flex-col"
              onClick={() => setSelectedPost(post)}
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-[3rem] shadow-xl group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-700">
                <PremiumImage src={post.image} alt={post.title} className="group-hover:scale-110 transition-transform duration-1000" />
                
                {/* Overlay Content */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                
                <div className="absolute top-6 left-6">
                  <div className={`bg-gradient-to-br ${post.vibeColor} p-px rounded-full shadow-lg`}>
                    <div className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-white text-[9px] font-black uppercase tracking-widest">
                      {post.tag}
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-10 left-8 right-8 text-white">
                  <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-3">{post.readTime}</p>
                  <h4 className="text-2xl font-black leading-tight tracking-tight mb-4 group-hover:text-airalo transition-colors">
                    {post.title}
                  </h4>
                  <div className="w-10 h-1 bg-white/20 rounded-full group-hover:w-20 group-hover:bg-airalo transition-all duration-500"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modern Reader Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl animate-in fade-in duration-500" 
            onClick={() => setSelectedPost(null)}
          ></div>
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-500">
            <div className="relative h-64 md:h-[400px] shrink-0">
              <PremiumImage src={selectedPost.image} alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
              <button 
                onClick={() => setSelectedPost(null)}
                className="absolute top-8 right-8 w-12 h-12 bg-white/20 hover:bg-white backdrop-blur-md rounded-full flex items-center justify-center text-white hover:text-slate-900 transition-all shadow-xl"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-10 md:p-16 -mt-20 relative z-10">
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                  <div className={`h-2 w-2 rounded-full bg-gradient-to-br ${selectedPost.vibeColor}`}></div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{selectedPost.tag} • {selectedPost.readTime}</span>
                </div>
                <h3 className="text-4xl md:text-5xl font-black text-slate-900 leading-[1.05] mb-10 tracking-tight">
                  {selectedPost.title}
                </h3>
                <div className="space-y-8 text-slate-600 font-medium leading-relaxed text-lg italic border-l-4 border-slate-100 pl-8">
                   {selectedPost.excerpt}
                </div>
                <div className="space-y-8 text-slate-600 font-medium leading-[1.8] text-lg mt-12">
                  {selectedPost.content.map((para, pidx) => (
                    <p key={pidx}>{para}</p>
                  ))}
                </div>
                <div className="mt-20 pt-10 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-xs">
                      L
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Landing Insider</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Global Travel Squad</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedPost(null)}
                    className="bg-slate-50 hover:bg-slate-900 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:text-white transition-all"
                  >
                    Close Story
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Blog;
