import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CommunityFeed } from './screens/CommunityFeed';
import { PostDetail } from './screens/PostDetail';
import { ExpertColumn } from './screens/ExpertColumn';
import { CreatePost } from './screens/CreatePost';
import { BottomNav } from './components/BottomNav';
import { MOCK_POSTS } from './constants';
import { PostCard } from './components/PostCard';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FeedWithPosts = () => {
  const navigate = useNavigate();
  return (
    <div className="pb-20">
      <CommunityFeed />
      <div className="px-6 -mt-4 space-y-4">
        {MOCK_POSTS.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      <button 
        onClick={() => navigate('/create')}
        className="fixed bottom-24 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center z-40 active:scale-95 transition-transform"
      >
        <Plus size={28} />
      </button>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 font-sans">
        <Routes>
          <Route path="/" element={<FeedWithPosts />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="/expert" element={<ExpertColumn />} />
          <Route path="/create" element={<CreatePost />} />
          <Route path="/identify" element={<div className="p-10 text-center">识别页面 (开发中)</div>} />
          <Route path="/records" element={<div className="p-10 text-center">档案页面 (开发中)</div>} />
          <Route path="/mine" element={<div className="p-10 text-center">个人中心 (开发中)</div>} />
        </Routes>
        <BottomNav />
      </div>
    </Router>
  );
}
