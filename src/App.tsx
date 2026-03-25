/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Animais from './pages/Animais';
import Agendamentos from './pages/Agendamentos';
import Produtos from './pages/Produtos';
import Veterinario from './pages/Veterinario';
import Financeiro from './pages/Financeiro';
import Marketing from './pages/Marketing';
import Escala from './pages/Escala';
import AdminUsuarios from './pages/AdminUsuarios';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="agendamentos" element={<Agendamentos />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="animais" element={<Animais />} />
          <Route path="produtos" element={<Produtos />} />
          <Route path="veterinario" element={<Veterinario />} />
          <Route path="financeiro" element={<Financeiro />} />
          <Route path="marketing" element={<Marketing />} />
          <Route path="escala" element={<Escala />} />
          <Route path="admin" element={<AdminUsuarios />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
