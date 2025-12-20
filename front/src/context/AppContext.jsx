import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [groups, setGroups] = useState([]);
  const refreshGroups = async () => {
    try {
      const res = await api.get('/groups');
      setGroups(res.data);
    } catch (err) { console.error("Data fetch error", err); }
  };
  useEffect(() => { refreshGroups(); }, []);
  return (
    <AppContext.Provider value={{ groups, refreshGroups }}>
      {children}
    </AppContext.Provider>
  );
};
export const useApp = () => useContext(AppContext);