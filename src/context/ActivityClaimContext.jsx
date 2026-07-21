import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { getContractAllocationData, getEmpAllocationData, getEmpClaim, getemployeeLists } from "../services/productServices";
import { DateForApiFormate, formatRetainerActivities } from "../utils/utils";

const ActivityContext = createContext(null);

export const ActivityProvider = ({ children }) => {
    const [activityState, setActivityState] = useState({
        data: [],
        loading: false,
        error: null,
    });

    const [claimState, setClaimState] = useState({
        data: [],
        loading: false,
        error: null,
    });

    const [employeeState, setEmployeeState] = useState({
        data: [],
        loading: false,
        error: null,
    });

    // Employee allocation API
    const fetchEmpActivityAllocations = useCallback(async (params = {}) => {
        setActivityState((prev) => ({ ...prev, loading: true, error: null}));

        try {
            const response = await getEmpAllocationData(params);
            const data = formatRetainerActivities(response?.data || []);
            setActivityState({ data, loading: false, error: null });
            return data;
        } catch (error) {
            setActivityState({ data: [], loading: false, error });
            throw error;
        }
    }, []);

    // Contract allocation API
    const fetchContractAllocations = useCallback(async (params = {}) => {
        try {
            const response = await getContractAllocationData(params);
            return (response?.data || []).map((item) => ({
                ...item,
                start_date: item.start_date
                    ? DateForApiFormate(item.start_date, true)
                    : item.s_date
                        ? DateForApiFormate(item.s_date, true)
                        : "",
                end_date: item.end_date
                    ? DateForApiFormate(item.end_date, true)
                    : item.e_date
                        ? DateForApiFormate(item.e_date, true)
                        : "",
            }));
        } catch (error) {
            console.error("Failed to load allocations", error);
            throw error;
        }
    }, []);

    // Employee list API
    const fetchEmployees = useCallback(async (params = {}) => {
        setEmployeeState((prev) => ({ ...prev, loading: true, error: null,}));

        try {
            const response = await getemployeeLists(params);
            const data = response?.data || [];
            setEmployeeState({ data, loading: false, error: null,});
            return data;
        } catch (error) {
            setEmployeeState({ data: [], loading: false, error,});
            throw error;
        }
    }, []);

    const fetchClaims = useCallback(async (method, employeeId, type) => {
        setClaimState((prev) => ({ ...prev, loading: true, error: null,}));

        try {
            const response = await getEmpClaim(method, employeeId, type);
            const data = response?.data || [];

            setClaimState({ data, loading: false, error: null,});
            return data;
        } catch (error) {
            setClaimState({ data: [], loading: false, error,});
            throw error;
        }
    }, []);

    const getStoredActivityListSelection = (STORAGE_KEY) => {
      if (typeof window === 'undefined') return null;
    
      try {
        const storedValue = window.sessionStorage.getItem(STORAGE_KEY);
        return storedValue ? JSON.parse(storedValue) : null;
      } catch {
        return null;
      }
    };

    // ✅ Move contextValue before return statement
    const contextValue = useMemo(() => ({
            activityState,
            fetchEmpActivityAllocations,
            employeeState,
            fetchEmployees,
            claimState,
            fetchClaims,
            fetchContractAllocations,
            getStoredActivityListSelection
        }),
        [ activityState, employeeState, claimState, fetchEmpActivityAllocations, fetchEmployees, fetchClaims, fetchContractAllocations,],
    );

    return (
        <ActivityContext.Provider value={contextValue}>
            {children}
        </ActivityContext.Provider>
    );
};

export const useActivity = () => {
    const context = useContext(ActivityContext);
    if (!context) {
        throw new Error("useActivity must be used inside ActivityProvider");
    }
    return context;
};