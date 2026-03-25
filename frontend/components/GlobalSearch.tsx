import React, { useState, useEffect, useRef } from 'react';
import { Search, X, PawPrint, User, Calendar, ArrowRight, Stethoscope } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import db from '@/lib/db';
import { useRouter } from 'next/router';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: animais = [] } = useQuery({
    queryKey: ['animais-search'],
    queryFn: () => db.entities.Animal.list(),
    enabled: isOpen,
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes-search'],
    queryFn: () => db.entities.Cliente.list(),
    enabled: isOpen,
  });

  const { data: agendamentos = [] } = useQuery({
    queryKey: ['agendamentos-search'],
    queryFn: () => db.entities.Agendamento.list(),
    enabled: isOpen,
  });

  const { data: anamneses = [] } = useQuery({
    queryKey: ['anamneses-search'],
    queryFn: () => db.entities.Anamnese.list(),
    enabled: isOpen,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const results = React.useMemo(() => {
    if (!query) return { animais: [], clientes: [], agendamentos: [], anamneses: [] };
    const q = query.toLowerCase();

    return {
      animais: animais.filter((a: any) => 
        a.nome?.toLowerCase().includes(q) || 
        a.raca?.toLowerCase().includes(q)
      ).slice(0, 5),
      clientes: clientes.filter((c: any) => 
        c.nome?.toLowerCase().includes(q) || 
        c.telefone?.includes(q) ||
        c.email?.toLowerCase().includes(q)
      ).slice(0, 5),
      agendamentos: agendamentos.filter((a: any) => {
        const animal = animais.find((an: any) => an.id === a.animal_id);
        return animal?.nome?.toLowerCase().includes(q) || a.tipo?.toLowerCase().includes(q);
      }).slice(0, 5),
      anamneses: anamneses.filter((a: any) => {
        const animal = animais.find((an: any) => an.id === a.animal_id);
        return animal?.nome?.toLowerCase().includes(q) || 
               a.queixa_principal?.toLowerCase().includes(q) ||
               a.diagnostico_presuntivo?.toLowerCase().includes(q);
      }).slice(0, 5),
    };
  }, [query, animais, clientes, agendamentos, anamneses]);

  const handleSelect = (type: string, id: string, animalId?: string) => {
    setIsOpen(false);
    setQuery('');
    if (type === 'animal') router.push(`/animais?id=${id}`);
    if (type === 'cliente') router.push(`/clientes?id=${id}`);
    if (type === 'agendamento') router.push(`/agendamentos?id=${id}`);
    if (type === 'anamnese') router.push(`/animais?id=${animalId}&tab=prontuario`);
  };

  if (!isOpen) return (
    <div 
      onClick={() => setIsOpen(true)}
      className="hidden md:flex items-center max-w-md w-full relative group cursor-pointer"
    >
      <Search className="absolute left-3 w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
      <div className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 text-slate-400 text-sm rounded-full w-full flex justify-between items-center hover:bg-white hover:border-blue-200 transition-all">
        <span>Pesquisar animais, clientes...</span>
        <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-white px-1.5 font-mono text-[10px] font-medium text-slate-400 opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center p-4 border-b border-slate-100">
          <Search className="w-5 h-5 text-blue-500 mr-3" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="O que você está procurando?"
            className="flex-1 bg-transparent border-none outline-none text-slate-900 text-lg placeholder:text-slate-400"
          />
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2 scrollbar-hide">
          {!query ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-blue-500" />
              </div>
              <p className="text-slate-900 font-bold text-lg">Pesquisa Global</p>
              <p className="text-slate-500 mt-1">Digite para buscar animais, clientes ou agendamentos.</p>
            </div>
          ) : (
            <div className="space-y-4 p-2">
              {results.animais.length > 0 && (
                <div>
                  <h3 className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Pacientes</h3>
                  <div className="space-y-1">
                    {results.animais.map((a: any) => (
                      <button
                        key={a.id}
                        onClick={() => handleSelect('animal', a.id)}
                        className="w-full flex items-center p-3 hover:bg-blue-50 rounded-xl transition-colors group"
                      >
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                          <PawPrint className="w-5 h-5" />
                        </div>
                        <div className="text-left flex-1">
                          <p className="font-bold text-slate-900 group-hover:text-blue-700">{a.nome}</p>
                          <p className="text-xs text-slate-500">{a.especie} • {a.raca}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.clientes.length > 0 && (
                <div>
                  <h3 className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Clientes (Tutores)</h3>
                  <div className="space-y-1">
                    {results.clientes.map((c: any) => (
                      <button
                        key={c.id}
                        onClick={() => handleSelect('cliente', c.id)}
                        className="w-full flex items-center p-3 hover:bg-emerald-50 rounded-xl transition-colors group"
                      >
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mr-3">
                          <User className="w-5 h-5" />
                        </div>
                        <div className="text-left flex-1">
                          <p className="font-bold text-slate-900 group-hover:text-emerald-700">{c.nome}</p>
                          <p className="text-xs text-slate-500">{c.telefone || c.email}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.agendamentos.length > 0 && (
                <div>
                  <h3 className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Agendamentos</h3>
                  <div className="space-y-1">
                    {results.agendamentos.map((a: any) => {
                      const animal = animais.find((an: any) => an.id === a.animal_id);
                      return (
                        <button
                          key={a.id}
                          onClick={() => handleSelect('agendamento', a.id)}
                          className="w-full flex items-center p-3 hover:bg-indigo-50 rounded-xl transition-colors group"
                        >
                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                            <Calendar className="w-5 h-5" />
                          </div>
                          <div className="text-left flex-1">
                            <p className="font-bold text-slate-900 group-hover:text-indigo-700">{animal?.nome || 'Paciente'}</p>
                            <p className="text-xs text-slate-500">{a.tipo} • {format(new Date(a.data), 'dd/MM/yyyy HH:mm')}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {results.anamneses.length > 0 && (
                <div>
                  <h3 className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Prontuários / Consultas</h3>
                  <div className="space-y-1">
                    {results.anamneses.map((a: any) => {
                      const animal = animais.find((an: any) => an.id === a.animal_id);
                      return (
                        <button
                          key={a.id}
                          onClick={() => handleSelect('anamnese', a.id, a.animal_id)}
                          className="w-full flex items-center p-3 hover:bg-blue-50 rounded-xl transition-colors group"
                        >
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                            <Stethoscope className="w-5 h-5" />
                          </div>
                          <div className="text-left flex-1">
                            <p className="font-bold text-slate-900 group-hover:text-blue-700">{animal?.nome || 'Paciente'}</p>
                            <p className="text-xs text-slate-500 truncate max-w-[400px]">{a.queixa_principal}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {results.animais.length === 0 && results.clientes.length === 0 && results.agendamentos.length === 0 && results.anamneses.length === 0 && (
                <div className="p-8 text-center">
                  <p className="text-slate-500">Nenhum resultado encontrado para "{query}"</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><kbd className="bg-white border px-1 rounded">↵</kbd> selecionar</span>
            <span className="flex items-center gap-1"><kbd className="bg-white border px-1 rounded">↑↓</kbd> navegar</span>
          </div>
          <span>VetERP Pro Search</span>
        </div>
      </div>
    </div>
  );
}
