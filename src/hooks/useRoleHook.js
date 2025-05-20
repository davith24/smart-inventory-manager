import { useEffect, useState } from "react";
import socket from "../api/socketConfig";
import { useSelector } from "react-redux";
import api from "../api/axiosConfig";

export const useRoleHook = () => {
  const { currentUser } = useSelector((state) => state.user);
  const token = currentUser?.data?.token;
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  useEffect(() => {
    getRoles();
  }, []);

  // Fetch all roles
  const getRoles = async (params = {}) => {
    setLoading(true);
    try {
      const response = await api.get("/v1/roles", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      const data = response.data.data;
      setRoles(data);
      return { data };
    } catch (errors) {
      const data = errors?.response?.data || "An unexpected error occurred.";
      return { data };
    } finally {
      setLoading(false);
    }
  };

  // Fetch a single role
  const getRole = async (roleId) => {
    setLoading(true);
    try {
      const response = await api.get(`/v1/roles/${roleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data;
      return { data };
    } catch (errors) {
      const error = errors?.response?.data || "An unexpected error occurred.";
      return { error };
    } finally {
      setLoading(false);
    }
  };

  // Create a new role
  const createRole = async (roleData) => {
    setLoading(true);
    try {
      const response = await api.post("/v1/roles", roleData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data;
      return { data };
    } catch (error) {
      const data = error?.response?.data || "An unexpected error occurred.";
      return { data };
    } finally {
      setLoading(false);
    }
  };

  // Update an existing role
  const updateRole = async (roleId, updatedData) => {
    setLoading(true);
    try {
      const response = await api.patch(`/v1/roles/${roleId}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data;
      return { data };
    } catch (error) {
      const data = error?.response?.data || "An unexpected error occurred.";
      return { data };
    } finally {
      setLoading(false);
    }
  };

  // Delete a role
  const deleteRole = async (roleId) => {
    setLoading(true);
    try {
      const response = await api.delete(`/v1/roles/${roleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data;
      return { data };
    } catch (error) {
      const data = error?.response?.data || "An unexpected error occurred.";
      return { data };
    } finally {
      setLoading(false);
    }
  };

  const handleRoleCreated = (newRole) => {
    setRoles((prevRoles) => ({
      ...prevRoles,
      data: [...prevRoles.data, newRole],
      total: prevRoles.total + 1,
    }));
  };

  const handleRoleUpdated = (updatedRole) => {
    setRoles((prevRoles) => ({
      ...prevRoles,
      data: prevRoles.data.map((role) =>
        role._id === updatedRole._id ? updatedRole : role
      ),
    }));
  };

  const handleRoleDeleted = (deletedRoleId) => {
    setRoles((prevRoles) => ({
      ...prevRoles,
      data: prevRoles.data.filter((role) => role._id !== deletedRoleId),
      total: prevRoles.total > 0 ? prevRoles.total - 1 : 0,
    }));
  };

  useEffect(() => {
    socket.on("roleCreated", handleRoleCreated);
    socket.on("roleUpdated", handleRoleUpdated);
    socket.on("roleDeleted", handleRoleDeleted);

    return () => {
      socket.off("roleCreated", handleRoleCreated);
      socket.off("roleUpdated", handleRoleUpdated);
      socket.off("roleDeleted", handleRoleDeleted);
    };
  }, []);

  return {
    roles,
    loading,
    getRoles,
    getRole,
    createRole,
    updateRole,
    deleteRole,
  };
};
