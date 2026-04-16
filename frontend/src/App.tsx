import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Post from './pages/Post'
import Category from './pages/Category'
import About from './pages/About'
import Search from './pages/Search'
import NotFound from './pages/NotFound'
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/posts/:slug" element={<Post />} />
      <Route path="/categories/:slug" element={<Category />} />
      <Route path="/about" element={<About />} />
      <Route path="/search" element={<Search />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
