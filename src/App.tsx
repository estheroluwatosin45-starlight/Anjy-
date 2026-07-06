/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Poems } from './pages/Poems';
import { Diary } from './pages/Diary';
import { BibleVerses } from './pages/BibleVerses';
import { Affirmations } from './pages/Affirmations';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Admin } from './pages/Admin';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="poems" element={<Poems />} />
          <Route path="diary" element={<Diary />} />
          <Route path="verses" element={<BibleVerses />} />
          <Route path="affirmations" element={<Affirmations />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="admin" element={<Admin passcodeOnly={false} />} />
          <Route path="owner-login" element={<Admin passcodeOnly={true} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
