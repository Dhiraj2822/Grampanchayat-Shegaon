import { useState, useEffect } from 'react';
import { Calendar, Image as ImageIcon, Play } from 'lucide-react';
import { Language } from '../types';
import { supabase } from '../lib/supabase';

interface GalleryPageProps {
  language: Language;
}

interface GalleryItem {
  id: string;
  title: string;
  image_url: string;
  category?: string;
  event_date?: string;
  is_active: boolean;
}

interface VideoItem {
  id: string;
  title: string;
  description?: string;
  video_source: string;
  video_url: string;
  thumbnail_url?: string;
  publish_date?: string;
  is_active: boolean;
}

const GalleryPageOptimized = ({ language }: GalleryPageProps) => {
  const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');
  const [photos, setPhotos] = useState<GalleryItem[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  const t = (en: string, mr: string) => language === 'mr' ? mr : en;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch photos
      const { data: photoData, error: photoError } = await supabase
        .from('cms_gallery')
        .select('*')
        .eq('is_active', true)
        .order('event_date', { ascending: false });
      
      if (!photoError && photoData) {
        setPhotos(photoData);
      }

      // Fetch videos
      const { data: videoData, error: videoError } = await supabase
        .from('cms_video_gallery')
        .select('*')
        .eq('is_active', true)
        .order('publish_date', { ascending: false });
      
      if (!videoError && videoData) {
        setVideos(videoData);
      }
    } catch (error) {
      console.error('Error fetching gallery data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^&\n?#]+)/);
    return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : url;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        {t('Photo Gallery & Videos', 'फोटो गॅलरी आणि व्हिडिओ')}
      </h1>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="bg-white rounded-lg shadow-md p-1">
          <button
            onClick={() => setActiveTab('photos')}
            className={`px-6 py-3 rounded-md font-medium transition-colors ${
              activeTab === 'photos'
                ? 'bg-green-600 text-white'
                : 'text-gray-600 hover:text-green-600'
            }`}
          >
            <ImageIcon className="inline-block w-5 h-5 mr-2" />
            {t('Photos', 'फोटो')}
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`px-6 py-3 rounded-md font-medium transition-colors ${
              activeTab === 'videos'
                ? 'bg-green-600 text-white'
                : 'text-gray-600 hover:text-green-600'
            }`}
          >
            <Play className="inline-block w-5 h-5 mr-2" />
            {t('Videos', 'व्हिडिओ')}
          </button>
        </div>
      </div>

      {/* Photos Tab */}
      {activeTab === 'photos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo) => (
            <div key={photo.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative">
                <img
                  src={photo.image_url || '/api/placeholder/400/300'}
                  alt={photo.title}
                  className="w-full h-48 object-cover"
                />
                {photo.category && (
                  <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded text-sm">
                    {photo.category}
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{photo.title}</h3>
                {photo.event_date && (
                  <div className="flex items-center text-gray-500 text-xs">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(photo.event_date).toLocaleDateString('en-IN')}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Videos Tab */}
      {activeTab === 'videos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div 
              key={video.id} 
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => setSelectedVideo(video)}
            >
              <div className="relative">
                <img
                  src={video.thumbnail_url || '/api/placeholder/400/300'}
                  alt={video.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                  <div className="bg-white bg-opacity-90 rounded-full p-3">
                    <Play className="w-8 h-8 text-green-600" fill="currentColor" />
                  </div>
                </div>
                <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                  {video.video_source}
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{video.title}</h3>
                {video.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{video.description}</p>
                )}
                {video.publish_date && (
                  <div className="flex items-center text-gray-500 text-xs">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(video.publish_date).toLocaleDateString('en-IN')}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setSelectedVideo(null)}>
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">{selectedVideo.title}</h3>
              <button onClick={() => setSelectedVideo(null)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            <div className="aspect-video">
              {selectedVideo.video_source === 'YouTube' ? (
                <iframe
                  src={getYouTubeEmbedUrl(selectedVideo.video_url)}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              ) : (
                <video src={selectedVideo.video_url} controls className="w-full h-full" />
              )}
            </div>
            {selectedVideo.description && (
              <div className="p-4">
                <p className="text-gray-600">{selectedVideo.description}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {((activeTab === 'photos' && photos.length === 0) || (activeTab === 'videos' && videos.length === 0)) && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4 flex justify-center">
            {activeTab === 'photos' ? <ImageIcon size={48} /> : <Play size={48} />}
          </div>
          <p className="text-gray-600">
            {activeTab === 'photos' 
              ? t('No photos found. Add photos from the Content Management System.', 'फोटो सापडले नाहीत. CMS मधून फोटो जोडा.')
              : t('No videos found. Add videos from the Content Management System.', 'व्हिडिओ सापडले नाहीत. CMS मधून व्हिडिओ जोडा.')
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default GalleryPageOptimized;