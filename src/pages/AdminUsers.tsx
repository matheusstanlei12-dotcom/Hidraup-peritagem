
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Trash2, Check } from 'lucide-react';
import './AdminUsers.css';

interface UserProfile {
    id: string;
    email: string; // Nota: profiles precisa ter email, se não tiver, pegar de auth é dificil pelo client. Assumindo que tem ou vamos pegar.
    full_name: string;
    role: string;
    status: string; // 'PENDENTE' | 'APROVADO'
    created_at: string;
}

export const AdminUsers: React.FC = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        console.log('🔍 AdminUsers: Fetching users...');
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*');

            console.log('📊 AdminUsers: Query result:', { data, error });

            if (error) {
                console.error('❌ AdminUsers: Error from Supabase:', error);
                throw error;
            }

            console.log(`✅ AdminUsers: Loaded ${data?.length || 0} users`);
            setUsers(data || []);
        } catch (error: any) {
            console.error('💥 AdminUsers: Exception:', error);
            alert(`Não foi possível carregar os usuários.\n\nErro: ${error.message || 'Desconhecido'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;
            setUsers(users.map(u => u.id === id ? { ...u, status: newStatus } : u));
        } catch (error) {
            alert('Erro ao atualizar status.');
        }
    };

    const handleUpdateRole = async (id: string, newRole: string) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', id);

            if (error) throw error;
            setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
        } catch (error) {
            alert('Erro ao atualizar função.');
        }
    };

    return (
        <div className="admin-users-container">
            <h1 className="page-title">Gestão de Usuários</h1>

            {loading && (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <p>Carregando usuários...</p>
                </div>
            )}

            {!loading && users.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <p>Nenhum usuário encontrado.</p>
                </div>
            )}

            {!loading && users.length > 0 && (
                <div className="users-list">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Email</th>
                                <th>Função</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td>{user.full_name || 'Sem nome'}</td>
                                    <td>{user.email || 'N/A'}</td>
                                    <td>
                                        <select
                                            value={user.role || 'perito'}
                                            onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                                            className="role-select"
                                        >
                                            <option value="perito">Perito</option>
                                            <option value="pcp">PCP</option>
                                            <option value="gestor">Gestor</option>
                                        </select>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${user.status?.toLowerCase()}`}>
                                            {user.status || 'PENDENTE'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            {user.status !== 'APROVADO' && (
                                                <button className="btn-approve-user" onClick={() => handleUpdateStatus(user.id, 'APROVADO')} title="Aprovar">
                                                    <Check size={18} />
                                                </button>
                                            )}
                                            <button className="btn-delete-user" title="Excluir/Bloquear">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
