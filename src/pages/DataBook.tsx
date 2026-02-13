import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Book, FileText, Plus, ArrowLeft, Trash2, X, File as FileIcon, Search, Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './DataBookPremium.css';

interface DataBookFolder {
    id: string;
    name: string;
    cliente?: string;
    os_interna?: string;
    os_externa?: string;
    data_entrega?: string;
    pedido_compra?: string;
    responsavel?: string;
    criado_por?: string;
    empresa_id?: string;
    created_at: string;
}

interface DataBookItem {
    id: string;
    file_data: string;
    description: string;
    file_type: string;
    created_at: string;
}

export const DataBook: React.FC = () => {
    const { role, user } = useAuth();
    const [folders, setFolders] = useState<DataBookFolder[]>([]);
    const [currentFolder, setCurrentFolder] = useState<DataBookFolder | null>(null);
    const [items, setItems] = useState<DataBookItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<DataBookItem | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [pendingFiles, setPendingFiles] = useState<File[]>([]);
    const [empresas, setEmpresas] = useState<{ id: string, nome_fantasia: string }[]>([]);

    const [formData, setFormData] = useState({
        cliente: '',
        os_interna: '',
        os_externa: '',
        data_entrega: '',
        pedido_compra: '',
        responsavel: '',
        empresa_id: ''
    });

    const modalFileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchFolders();
        fetchEmpresas();
    }, []);

    useEffect(() => {
        if (currentFolder) {
            fetchItems(currentFolder.id);
        } else {
            setItems([]);
        }
    }, [currentFolder]);

    const fetchEmpresas = async () => {
        const { data } = await supabase.from('empresas').select('id, nome_fantasia').order('nome_fantasia');
        setEmpresas(data || []);
    };

    const fetchFolders = async () => {
        setLoading(true);
        try {
            let query = supabase.from('databook_folders').select('*').order('created_at', { ascending: false });

            if (role === 'cliente') {
                const { data: profile } = await supabase.from('profiles').select('empresa_id').eq('id', user.id).single();
                if (profile?.empresa_id) {
                    query = query.eq('empresa_id', profile.empresa_id);
                } else {
                    setFolders([]);
                    return;
                }
            }

            const { data, error } = await query;
            if (error) throw error;
            setFolders(data || []);
        } catch (error) {
            console.error('Error fetching databooks:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchItems = async (folderId: string) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('databook_items')
                .select('*')
                .eq('folder_id', folderId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setItems(data || []);
        } catch (error) {
            console.error('Error fetching items:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePendingFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setPendingFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removePendingFile = (index: number) => {
        setPendingFiles(prev => prev.filter((_, i) => i !== index));
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const handleCreateFolder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;

        if (!formData.cliente) {
            alert('O campo Cliente é obrigatório.');
            return;
        }

        try {
            setLoading(true);
            const folderName = `Data Book - ${formData.cliente} - ${formData.os_interna || 'S/OS'}`;

            const { data: folderData, error } = await supabase
                .from('databook_folders')
                .insert([{
                    name: folderName,
                    cliente: formData.cliente,
                    os_interna: formData.os_interna,
                    os_externa: formData.os_externa,
                    data_entrega: formData.data_entrega || null,
                    pedido_compra: formData.pedido_compra,
                    responsavel: formData.responsavel,
                    empresa_id: formData.empresa_id || null,
                    criado_por: user?.id
                }])
                .select()
                .single();

            if (error) throw error;

            if (pendingFiles.length > 0 && folderData) {
                for (const file of pendingFiles) {
                    const base64 = await fileToBase64(file);
                    const fileType = file.type.includes('pdf') ? 'pdf' : (file.type.includes('image') ? 'image' : 'other');

                    const { error: itemError } = await supabase
                        .from('databook_items')
                        .insert([{
                            folder_id: folderData.id,
                            file_data: base64,
                            description: file.name,
                            file_type: fileType
                        }]);

                    if (itemError) console.error('Erro ao salvar item:', file.name, itemError);
                }
            }

            setFolders([folderData, ...folders]);
            setFormData({
                cliente: '',
                os_interna: '',
                os_externa: '',
                data_entrega: '',
                pedido_compra: '',
                responsavel: '',
                empresa_id: ''
            });
            setPendingFiles([]);
            setIsCreateModalOpen(false);
            setCurrentFolder(folderData);

        } catch (error) {
            console.error('Error creating databook:', error);
            alert('Erro ao criar Data Book.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteFolder = async (folderId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (role !== 'gestor') return;
        if (!confirm('Excluir este Data Book e todos os seus arquivos?')) return;

        try {
            setLoading(true);
            const { error } = await supabase.from('databook_folders').delete().eq('id', folderId);
            if (error) throw error;
            setFolders(folders.filter(f => f.id !== folderId));
            if (currentFolder?.id === folderId) setCurrentFolder(null);
        } catch (error) {
            console.error('Error deleting:', error);
        } finally {
            setLoading(false);
        }
    };

    const canManage = role === 'gestor' || role === 'pcp' || role === 'perito';

    const filteredFolders = folders.filter(f =>
        f.os_interna?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.cliente?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="databook-container">
            {!currentFolder ? (
                <>
                    <header className="page-hero">
                        <h1>Data Books</h1>
                        <p className="subtitle">Documentação técnica, certificados e manuais dos seus equipamentos.</p>
                    </header>

                    <div className="reports-section-header">
                        <h2>Sua Biblioteca</h2>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <div className="search-input-wrapper" style={{ width: '300px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                                <Search size={18} color="#94a3b8" />
                                <input
                                    type="text"
                                    placeholder="Buscar por O.S ou Cliente..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ border: 'none', background: 'transparent' }}
                                />
                            </div>
                            {canManage && (
                                <button className="btn-add-databook" onClick={() => setIsCreateModalOpen(true)}>
                                    <Plus size={20} />
                                    <span>Novo</span>
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="folders-grid">
                        {filteredFolders.length === 0 && !loading && (
                            <div className="empty-state" style={{ padding: '80px', background: 'white', borderRadius: '16px', gridColumn: '1/-1', textAlign: 'center' }}>
                                <Book size={64} color="#e2e8f0" style={{ marginBottom: '16px' }} />
                                <p style={{ color: '#64748b' }}>Nenhum Data Book encontrado.</p>
                            </div>
                        )}
                        {filteredFolders.map(folder => (
                            <div key={folder.id} className="folder-card" onClick={() => setCurrentFolder(folder)}>
                                <div className="folder-icon">
                                    <Book size={32} color="#10b981" />
                                </div>
                                <div className="folder-info">
                                    <h3>{folder.os_interna || 'S/OS'}</h3>
                                    <p>{folder.cliente}</p>
                                    <span className="date">Data: {folder.created_at ? new Date(folder.created_at).toLocaleDateString() : '-'}</span>
                                </div>
                                {role === 'gestor' && (
                                    <button className="folder-delete-btn" onClick={(e) => handleDeleteFolder(folder.id, e)} style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}>
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="items-view-container">
                    <header style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
                        <button className="back-btn-pill" onClick={() => setCurrentFolder(null)}>
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{currentFolder.os_interna || 'Documentos'}</h1>
                            <p style={{ color: '#64748b' }}>{currentFolder.cliente} • Data Book</p>
                        </div>
                    </header>

                    <div className="folder-details-hero">
                        <div className="detail-block">
                            <label>Ordem de Serviço</label>
                            <span>{currentFolder.os_interna || '-'}</span>
                        </div>
                        <div className="detail-block">
                            <label>Cliente</label>
                            <span>{currentFolder.cliente}</span>
                        </div>
                        <div className="detail-block">
                            <label>Pedido de Compra</label>
                            <span>{currentFolder.pedido_compra || '-'}</span>
                        </div>
                        <div className="detail-block">
                            <label>Data de Registro</label>
                            <span>{new Date(currentFolder.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div className="items-grid">
                        {items.length === 0 && !loading && (
                            <div className="empty-state" style={{ gridColumn: '1/-1', padding: '60px' }}>
                                <FileText size={48} color="#e2e8f0" />
                                <p>Nenhum documento anexado.</p>
                            </div>
                        )}
                        {items.map(item => (
                            <div key={item.id} className="item-card" onClick={() => setSelectedItem(item)}>
                                <div className="file-preview-icon">
                                    {item.file_type === 'pdf' ? <FileText size={40} color="#ef4444" /> : <Book size={40} color="#3b82f6" />}
                                </div>
                                <span className="file-name-text">{item.description}</span>
                                <span className="file-meta-text">{new Date(item.created_at).toLocaleDateString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {isCreateModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content large-modal">
                        <div className="modal-header">
                            <h3>Novo Data Book</h3>
                            <button className="close-btn" onClick={() => setIsCreateModalOpen(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCreateFolder}>
                            <div className="modal-body form-grid">
                                <div className="form-group full-width">
                                    <label>Cliente / Empresa Vinculada *</label>
                                    <select
                                        value={formData.empresa_id}
                                        onChange={e => {
                                            const emp = empresas.find(em => em.id === e.target.value);
                                            setFormData({ ...formData, empresa_id: e.target.value, cliente: emp?.nome_fantasia || '' });
                                        }}
                                        required
                                    >
                                        <option value="">Selecione uma empresa</option>
                                        {empresas.map(emp => <option key={emp.id} value={emp.id}>{emp.nome_fantasia}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>OS Interna</label>
                                    <input type="text" value={formData.os_interna} onChange={e => setFormData({ ...formData, os_interna: e.target.value })} placeholder="OS-1234" />
                                </div>
                                <div className="form-group">
                                    <label>Data de Entrega</label>
                                    <input type="date" value={formData.data_entrega} onChange={e => setFormData({ ...formData, data_entrega: e.target.value })} />
                                </div>
                                <div className="form-group full-width">
                                    <label>Arquivos (PDF, Imagens)</label>
                                    <input type="file" multiple ref={modalFileInputRef} onChange={handlePendingFilesChange} style={{ display: 'none' }} />
                                    <button type="button" className="btn-secondary" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px dashed #e2e8f0', background: 'white', color: '#64748b', fontWeight: 600 }} onClick={() => modalFileInputRef.current?.click()}>
                                        <Plus size={18} /> Adicionar Arquivos ({pendingFiles.length})
                                    </button>
                                    <div className="pending-files-list" style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {pendingFiles.map((file, idx) => (
                                            <div key={idx} className="pending-file-item" style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.85rem', color: '#1e293b' }}>{file.name}</span>
                                                <button type="button" onClick={() => removePendingFile(idx)} style={{ color: '#ef4444', background: 'none', border: 'none' }}><X size={14} /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer" style={{ borderTop: '1px solid #f1f5f9', padding: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button type="button" className="btn-secondary" onClick={() => setIsCreateModalOpen(false)}>Cancelar</button>
                                <button type="submit" className="btn-primary" disabled={loading} style={{ background: '#10b981' }}>
                                    {loading ? 'Salvando...' : 'Criar Data Book'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {selectedItem && (
                <div className="item-modal-overlay" onClick={() => setSelectedItem(null)}>
                    <div className="item-modal-content" onClick={e => e.stopPropagation()}>
                        <button className="close-modal-btn" onClick={() => setSelectedItem(null)}><X size={24} /></button>
                        {selectedItem.file_type === 'pdf' ? (
                            <iframe src={selectedItem.file_data} title={selectedItem.description} style={{ width: '100%', height: '80vh', border: 'none' }} />
                        ) : (
                            <img src={selectedItem.file_data} alt={selectedItem.description} style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '12px' }} />
                        )}
                        <div className="item-info-bar" style={{ marginTop: '16px', display: 'flex', justifyContent: 'center' }}>
                            <a href={selectedItem.file_data} download={selectedItem.description} className="btn-download" style={{ background: '#2563eb', color: 'white', padding: '12px 24px', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Download size={20} /> Baixar Arquivo
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
