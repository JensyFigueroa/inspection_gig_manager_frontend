import { useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';

// Prefijos únicos para cada rol
const ROLE_PREFIXES = {
  admin: 'admin_session_',
  qc: 'qc_session_',
  lead: 'lead_session_',
  worker: 'worker_session_'
};

export const useRoleSession = (role) => {
  const prefix = ROLE_PREFIXES[role] || 'default_session_';
  
  const getToken = useCallback(() => {
    return localStorage.getItem(`${prefix}token`);
  }, [prefix]);

  const setToken = useCallback((token) => {
    localStorage.setItem(`${prefix}token`, token);
  }, [prefix]);

  const removeToken = useCallback(() => {
    localStorage.removeItem(`${prefix}token`);
    localStorage.removeItem(`${prefix}user`);
    localStorage.removeItem(`${prefix}lastActivity`);
  }, [prefix]);

  const getUser = useCallback(() => {
    const userData = localStorage.getItem(`${prefix}user`);
    return userData ? JSON.parse(userData) : null;
  }, [prefix]);

  const setUser = useCallback((user) => {
    localStorage.setItem(`${prefix}user`, JSON.stringify(user));
  }, [prefix]);

  const updateLastActivity = useCallback(() => {
    localStorage.setItem(`${prefix}lastActivity`, Date.now().toString());
  }, [prefix]);

  const getLastActivity = useCallback(() => {
    return parseInt(localStorage.getItem(`${prefix}lastActivity`) || '0');
  }, [prefix]);

  const isTokenValid = useCallback(() => {
    const token = getToken();
    if (!token) return false;
    
    try {
      const decoded = jwtDecode(token);
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }, [getToken]);

  return {
    getToken,
    setToken,
    removeToken,
    getUser,
    setUser,
    updateLastActivity,
    getLastActivity,
    isTokenValid,
    prefix
  };
};

// Función para obtener todas las sesiones activas
export const getActiveSessions = () => {
  const sessions = [];
  const roles = ['admin', 'qc', 'lead', 'worker'];
  
  roles.forEach(role => {
    const prefix = ROLE_PREFIXES[role];
    const token = localStorage.getItem(`${prefix}token`);
    const userData = localStorage.getItem(`${prefix}user`);
    
    if (token && userData) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 > Date.now()) {
          sessions.push({
            role,
            user: JSON.parse(userData),
            token
          });
        }
      } catch {
        // Token inválido, lo ignoramos
      }
    }
  });
  
  return sessions;
};

// Función para cerrar sesión de un rol específico
export const logoutRole = (role) => {
  const prefix = ROLE_PREFIXES[role];
  localStorage.removeItem(`${prefix}token`);
  localStorage.removeItem(`${prefix}user`);
  localStorage.removeItem(`${prefix}lastActivity`);
};

// Función para cerrar todas las sesiones
export const logoutAllSessions = () => {
  Object.keys(ROLE_PREFIXES).forEach(role => {
    logoutRole(role);
  });
};

export default useRoleSession;
