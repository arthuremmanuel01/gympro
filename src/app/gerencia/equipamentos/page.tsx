'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Trash2, Package, CheckCircle2 } from 'lucide-react';
import { useEquipamentos, useAddEquipment, useRemoveEquipment } from '@/lib/queries/use-equipamentos';
import { toast } from 'sonner';

const LISTA_PADRAO = [
  { name: 'Esteira Ergométrica', category: 'Cardio' },
  { name: 'Bike Ergométrica', category: 'Cardio' },
  { name: 'Elíptico', category: 'Cardio' },
  { name: 'Leg Press 45°', category: 'Força' },
  { name: 'Polia Alta / Crossover', category: 'Força' },
  { name: 'Supino Guiado', category: 'Força' },
  { name: 'Cadeira Extensora', category: 'Força' },
  { name: 'Smith Machine', category: 'Força' },
  { name: 'Rack de Halteres', category: 'Livre' },
  { name: 'Barra Olímpica', category: 'Livre' },
];

const LOCAIS_PADRAO = [
  'Área Cardio',
  'Sala de Musculação',
  'Área de Pesos Livres'
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 28 } },
};

export default function EquipamentosPage() {
  const { data: equipamentos, isLoading } = useEquipamentos();
  const addMutation = useAddEquipment();
  const removeMutation = useRemoveEquipment();

  const [modoAdicao, setModoAdicao] = useState(false);
  
  // Estados para Equipamento
  const [equipamentoSelecionado, setEquipamentoSelecionado] = useState('');
  const [novoNome, setNovoNome] = useState('');
  const [novaCategoria, setNovaCategoria] = useState('');
  
  // Estados para Localização
  const [localSelecionado, setLocalSelecionado] = useState('');
  const [novoLocal, setNovoLocal] = useState('');

  const handleComprar = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let nomeFinal = equipamentoSelecionado;
    let categoriaFinal = 'Geral';
    let localFinal = localSelecionado;

    // Resolve Nome e Categoria
    if (equipamentoSelecionado === 'outro' || !equipamentoSelecionado) {
      nomeFinal = novoNome;
      categoriaFinal = novaCategoria;
    } else {
      const itemPadrao = LISTA_PADRAO.find(i => i.name === equipamentoSelecionado);
      if (itemPadrao) categoriaFinal = itemPadrao.category;
    }

    // Resolve Localização
    if (localSelecionado === 'outro' || !localSelecionado) {
      localFinal = novoLocal;
    }

    if (!nomeFinal) { toast.error('Defina um nome para o equipamento.'); return; }
    if (!localFinal) { toast.error('Defina um local para o equipamento.'); return; }

    await addMutation.mutateAsync({
      name: nomeFinal,
      category: categoriaFinal,
      location: localFinal,
    });

    // Reseta form
    setModoAdicao(false);
    setEquipamentoSelecionado('');
    setNovoNome('');
    setNovaCategoria('');
    setLocalSelecionado('');
    setNovoLocal('');  };

  const handleVender = (id: string, nome: string) => {
    if (window.confirm(`Tem certeza que deseja registrar a venda/remoção do equipamento: ${nome}?`)) {
      removeMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64" style={{ color: 'var(--color-text-muted)' }}>
        <p className="animate-pulse">Carregando inventário...</p>
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 w-full max-w-5xl mx-auto"
    >
      {/* Header */}
      <motion.div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
            <Package className="h-6 w-6 text-blue-500" />
            Gestão de Equipamentos
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Gerencie o inventário de máquinas e acessórios da academia.
          </p>
        </div>
        
        <button 
          onClick={() => setModoAdicao(!modoAdicao)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
          style={{ 
            background: modoAdicao ? 'var(--color-bg-surface)' : 'var(--color-primary)', 
            color: modoAdicao ? 'var(--color-text-primary)' : '#fff',
            border: modoAdicao ? '1px solid var(--color-border-default)' : 'none'
          }}
        >
          {modoAdicao ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {modoAdicao ? 'Cancelar Compra' : 'Comprar Equipamento'}
        </button>
      </motion.div>

      {/* Form Container */}
      <AnimatePresence>
        {modoAdicao && (
          <motion.form 
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20, overflow: 'hidden' }}
            transition={{ duration: 0.3 }}
            onSubmit={handleComprar} 
            className="p-6 rounded-2xl space-y-5 shadow-lg"
            style={{ 
              background: 'var(--color-bg-surface)', 
              border: '1px solid var(--color-border-default)' 
            }}
          >
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4" style={{ color: 'var(--color-text-primary)' }}>
              Registro de Nova Compra
            </h2>
            
            {/* Escolha do Equipamento */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                Selecione o Equipamento
              </label>
              <select 
                value={equipamentoSelecionado} 
                onChange={(e) => setEquipamentoSelecionado(e.target.value)}
                className="w-full p-3 rounded-xl appearance-none transition-colors focus:ring-2 focus:ring-blue-500 outline-none"
                style={{ 
                  background: 'var(--color-bg-base)', 
                  border: '1px solid var(--color-border-default)',
                  color: 'var(--color-text-primary)'
                }}
              >
                <option value="">-- Selecione um equipamento --</option>
                {LISTA_PADRAO.map(eq => (
                  <option key={eq.name} value={eq.name}>{eq.name} ({eq.category})</option>
                ))}
                <option value="outro">Outro (Cadastrar Novo)</option>
              </select>
            </div>

            {equipamentoSelecionado === 'outro' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Nome do Equipamento</label>
                  <input 
                    type="text" 
                    value={novoNome} 
                    onChange={(e) => setNovoNome(e.target.value)}
                    className="w-full p-3 rounded-xl transition-colors focus:ring-2 focus:ring-blue-500 outline-none" 
                    style={{ background: 'var(--color-bg-base)', border: '1px solid var(--color-border-default)', color: 'var(--color-text-primary)' }}
                    placeholder="Ex: Hack Squat"
                    required 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Categoria</label>
                  <input 
                    type="text" 
                    value={novaCategoria} 
                    onChange={(e) => setNovaCategoria(e.target.value)}
                    className="w-full p-3 rounded-xl transition-colors focus:ring-2 focus:ring-blue-500 outline-none" 
                    style={{ background: 'var(--color-bg-base)', border: '1px solid var(--color-border-default)', color: 'var(--color-text-primary)' }}
                    placeholder="Ex: Força"
                    required 
                  />
                </div>
              </motion.div>
            )}

            {/* Escolha do Local */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                Localização na Academia
              </label>
              <select 
                value={localSelecionado} 
                onChange={(e) => setLocalSelecionado(e.target.value)}
                className="w-full p-3 rounded-xl appearance-none transition-colors focus:ring-2 focus:ring-blue-500 outline-none"
                style={{ 
                  background: 'var(--color-bg-base)', 
                  border: '1px solid var(--color-border-default)',
                  color: 'var(--color-text-primary)'
                }}
              >
                <option value="">-- Selecione a área --</option>
                {LOCAIS_PADRAO.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
                <option value="outro">Outro (Informar Área)</option>
              </select>
            </div>

            {localSelecionado === 'outro' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1.5">
                <label className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Nova Localização</label>
                <input 
                  type="text" 
                  value={novoLocal} 
                  onChange={(e) => setNovoLocal(e.target.value)}
                  className="w-full p-3 rounded-xl transition-colors focus:ring-2 focus:ring-blue-500 outline-none" 
                  style={{ background: 'var(--color-bg-base)', border: '1px solid var(--color-border-default)', color: 'var(--color-text-primary)' }}
                  placeholder="Ex: Sala de Spinning"
                  required 
                />
              </motion.div>
            )}

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={addMutation.isPending}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-70"
                style={{ background: 'linear-gradient(to right, #10b981, #059669)' }}
              >
                {addMutation.isPending ? 'Registrando...' : (
                  <>
                    <CheckCircle2 className="h-5 w-5" />
                    Confirmar Compra
                  </>
                )}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Table Container */}
      <motion.div 
        className="rounded-2xl overflow-hidden shadow-sm"
        style={{ 
          background: 'var(--color-bg-surface)', 
          border: '1px solid var(--color-border-default)' 
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead style={{ background: 'var(--color-bg-elevated)', borderBottom: '1px solid var(--color-border-default)' }}>
              <tr>
                <th className="p-4 font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Nome do Equipamento</th>
                <th className="p-4 font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Categoria</th>
                <th className="p-4 font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Status</th>
                <th className="p-4 font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Localização</th>
                <th className="p-4 font-semibold text-right" style={{ color: 'var(--color-text-secondary)' }}>Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--color-border-subtle)' }}>
              {equipamentos?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center" style={{ color: 'var(--color-text-muted)' }}>
                    Nenhum equipamento registrado no inventário.
                  </td>
                </tr>
              ) : (
                equipamentos?.map((eq) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={eq.id} 
                    className="group transition-colors duration-200"
                  >
                    <td className="p-4 font-bold" style={{ color: 'var(--color-text-primary)' }}>{eq.name}</td>
                    <td className="p-4" style={{ color: 'var(--color-text-secondary)' }}>{eq.category}</td>
                    <td className="p-4">
                      <span 
                        className="px-3 py-1 rounded-full text-xs font-semibold tracking-wide"
                        style={{ 
                          background: 'rgba(16, 185, 129, 0.1)', 
                          color: '#10b981',
                          border: '1px solid rgba(16, 185, 129, 0.2)' 
                        }}
                      >
                        {eq.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4" style={{ color: 'var(--color-text-secondary)' }}>{eq.location}</td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleVender(eq.id, eq.name)}
                        disabled={removeMutation.isPending}
                        className="inline-flex items-center justify-center p-2 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                        title="Vender / Remover Equipamento"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}