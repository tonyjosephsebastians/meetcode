
import { Outlet, Link } from 'react-router-dom'

export default function App() {
  return (
    <div>
      <nav className="nav">
        <Link to="/" className="brand">AI LeetCode Practice</Link>
        <div style={{flex:1}} />
        <Link to="/generate">Generate</Link>
        <Link to="/report">Report</Link>
      </nav>
      <div className="container"><Outlet /></div>
    </div>
  )
}
