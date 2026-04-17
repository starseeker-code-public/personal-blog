import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Post from './pages/Post'
import Category from './pages/Category'
import About from './pages/About'
import Search from './pages/Search'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import AdminNewPost from './pages/AdminNewPost'
import AdminUpdatePost from './pages/AdminUpdatePost'
import AdminDreams from './pages/AdminDreams'
import AdminInfo from './pages/AdminInfo'
import {
  PATH_LOGIN,
  PATH_ADMIN_NEW,
  PATH_ADMIN_UPDATE,
  PATH_ADMIN_DREAMS,
  PATH_ADMIN_INFO,
} from './data'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/posts/:slug" element={<Post />} />
      <Route path="/categories/:slug" element={<Category />} />
      <Route path="/about" element={<About />} />
      <Route path="/search" element={<Search />} />
      {PATH_LOGIN        && <Route path={PATH_LOGIN}        element={<Login />} />}
      {PATH_ADMIN_NEW    && <Route path={PATH_ADMIN_NEW}    element={<AdminNewPost />} />}
      {PATH_ADMIN_UPDATE && <Route path={PATH_ADMIN_UPDATE} element={<AdminUpdatePost />} />}
      {PATH_ADMIN_DREAMS && <Route path={PATH_ADMIN_DREAMS} element={<AdminDreams />} />}
      {PATH_ADMIN_INFO   && <Route path={PATH_ADMIN_INFO}   element={<AdminInfo />} />}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
