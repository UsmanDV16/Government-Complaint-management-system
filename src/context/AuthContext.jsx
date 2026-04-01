import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getSeedData } from "../data/mockApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await getSeedData();
      setUsers(data.users);
      setComplaints(data.complaints);
      setDepartments(data.departments);
      setCurrentUser(data.users[0]);
      setIsReady(true);
    }
    load();
  }, []);

  const login = ({ email, password, role }) => {
    const user = users.find(
      (u) => u.email === email && u.password === password && u.role === role
    );
    if (!user) return { success: false, message: "Invalid credentials or role." };
    setCurrentUser(user);
    return { success: true };
  };

  const registerCitizen = ({ name, email, password }) => {
    if (users.some((u) => u.email === email)) {
      return { success: false, message: "Email already exists." };
    }
    const newUser = {
      id: `u${Date.now()}`,
      name,
      email,
      password,
      role: "citizen"
    };
    setUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);
    return { success: true };
  };

  const logout = () => setCurrentUser(null);

  const submitComplaint = ({ title, description, category }) => {
    if (!currentUser) return;
    const departmentMap = {
      Water: "d1",
      Roads: "d2",
      Sanitation: "d3",
      Electricity: "d4"
    };
    const complaint = {
      id: `c${Date.now()}`,
      citizenId: currentUser.id,
      title,
      description,
      category,
      departmentId: departmentMap[category] || "d3",
      status: "Pending",
      remarks: "",
      createdAt: new Date().toISOString().slice(0, 10)
    };
    setComplaints((prev) => [complaint, ...prev]);
  };

  const updateComplaint = (id, payload) => {
    setComplaints((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...payload } : item))
    );
  };

  const addDepartment = (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setDepartments((prev) => [{ id: `d${Date.now()}`, name: trimmed }, ...prev]);
  };

  const deleteDepartment = (id) => {
    setDepartments((prev) => prev.filter((d) => d.id !== id));
  };

  const value = useMemo(
    () => ({
      currentUser,
      users,
      complaints,
      departments,
      isReady,
      login,
      registerCitizen,
      logout,
      submitComplaint,
      updateComplaint,
      addDepartment,
      deleteDepartment
    }),
    [currentUser, users, complaints, departments, isReady]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
