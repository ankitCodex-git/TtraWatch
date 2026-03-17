/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { PlaylistDetail } from './pages/PlaylistDetail';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/playlist/:id" element={<PlaylistDetail />} />
      </Routes>
    </Router>
  );
}
