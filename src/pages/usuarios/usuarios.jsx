import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import Navbar from "../../components/navbar/navbar.jsx";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from 'axios';
import "./usuarios.css";
import API_BASE_URL from "../../config/apiConfig"; // URL da API centralizada

function Usuarios() {
    const [usuarios, setUsuarios] = useState([]); // Estado para armazenar os usuários
    const [loading, setLoading] = useState(true); // Estado para indicar carregamento
    const [error, setError] = useState(null); // Estado para exibir erros
    const navigate = useNavigate(); // Hook para navegação

    // Função para buscar usuários
    const fetchUsuarios = async () => {
        const token = localStorage.getItem("token"); // Obter o token do localStorage
        const roles = JSON.parse(localStorage.getItem("roles")); // Obter as roles do localStorage
        if (!token || !roles || !roles.includes("ROLE_ADMIN")) {
            alert("Token não encontrado. Faça login novamente.");
            navigate("/");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`, // Cabeçalho com token
                    "Content-Type": "application/json"
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUsuarios(data);
            } else {
                throw new Error("Erro ao buscar usuários.");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Função para excluir um usuário
    const handleDelete = async (userId) => {
        const token = localStorage.getItem("token"); // Obter o token do localStorage
        if (!token) {
            alert("Token não encontrado. Faça login novamente.");
            navigate("/usuarios");
            return;
        }

        try {
            const response = await axios.delete(`${API_BASE_URL}/api/admin/delete/${userId}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (response.status === 200) {
                // Atualizar a lista de usuários após a exclusão
                setUsuarios((prevUsuarios) => prevUsuarios.filter(usuario => usuario.id !== userId));
                alert("Usuário excluído com sucesso.");
            } else {
                alert("Erro ao excluir usuário.");
            }
        } catch (error) {
            console.error("Erro ao excluir o usuário:", error);
            alert("Erro ao excluir usuário.");
        }
    };

    // useEffect para executar a chamada quando o componente for montado
    useEffect(() => {
        fetchUsuarios();
    }, []);

    return (
        <div className="container-fluid mt-page">
            <Navbar />

            <div className="d-flex justify-content-between align-items-center">
                <div>
                    <h2 className="d-inline">Usuários</h2>
                    <Link to="/usuarios/add" className="btn btn-outline-primary ms-5 mb-2">
                        Novo Usuário
                    </Link>
                </div>
            </div>

            <div>
                {loading ? (
                    <p>Carregando...</p>
                ) : error ? (
                    <p className="text-danger">{error}</p>
                ) : (
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <th scope="col" className="col-sm-2">Nome</th>
                                <th scope="col" className="col-sm-2">E-mail</th>
                                <th scope="col" className="col-sm-2">Igreja</th>
                                <th scope="col" className="col-sm-3">Roles</th>
                                <th scope="col" className="col-sm-2">Telefone</th>
                                <th scope="col" className="col-buttons"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuarios.map((usuario) => (
                                <tr key={usuario.id}>
                                    <td>{usuario.username}</td>
                                    <td>{usuario.email}</td>
                                    <td>{usuario.church}</td>
                                    <td>
                                        {usuario.roles.length > 0 ? (
                                            usuario.roles.map((role) => (
                                                <span
                                                    key={role.id}
                                                    className="badge bg-secondary me-1"
                                                >
                                                    {role.name}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-muted">Sem roles</span>
                                        )}
                                    </td>
                                    <td>{usuario.phone}</td>
                                    <td>
                                        <Link to={`/usuarios/edit/${usuario.id}`} className="btn btn-outline-primary ms-5 mb-2">
                                            Editar
                                        </Link>
                                        <button 
                                            className="btn btn-sm btn-danger" 
                                            onClick={() => handleDelete(usuario.id)}
                                        >
                                            Excluir
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default Usuarios;
