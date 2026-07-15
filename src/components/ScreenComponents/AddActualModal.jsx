import { useState } from "react";
import styled from "styled-components";
import Modal from "../Modal";
import { toast } from "react-toastify";

const AddActualModal = ({
  isOpen,
  onClose,
  employees,
  minActualDate,
  maxActualDate,
  isUpdateMode,
  onSave, // (rows: [{ emp_id, employee_name, emp_type, remarks }], startDate, endDate) => void
}) => {
  const [startDate, setStartDate] = useState(minActualDate);
  const [endDate, setEndDate] = useState(maxActualDate);
  const [selectedEmpIds, setSelectedEmpIds] = useState([]);
  const [empTypeOverrides, setEmpTypeOverrides] = useState({}); // { emp_id: 'T' | 'E' }
  const [remarks, setRemarks] = useState("");
  const [remarkMode, setRemarkMode] = useState("same"); // "same" | "individual"
const [sameRemark, setSameRemark] = useState("");
const [individualRemarks, setIndividualRemarks] = useState({}); // { emp_id: remark }


  if (!isOpen) return null;

  const defaultEmpType = (emp) => (Number(emp?.grade_level) > 1 ? "T" : "E");

  const toggleEmp = (emp) => {
    setSelectedEmpIds((prev) => {
      const exists = prev.includes(emp.emp_id);
      if (exists) return prev.filter((id) => id !== emp.emp_id);
      return [...prev, emp.emp_id];
    });
    setEmpTypeOverrides((prev) =>
      prev[emp.emp_id] ? prev : { ...prev, [emp.emp_id]: defaultEmpType(emp) }
    );
  };

  const handleEmpTypeChange = (empId, value) => {
    setEmpTypeOverrides((prev) => ({ ...prev, [empId]: value }));
  };

    const handleSave = () => {
    if (!startDate || !endDate) {
        toast.error("Please select start date and end date");
        return;
    }
    if (startDate > endDate) {
        toast.error("Start date cannot be after end date");
        return;
    }
    if (selectedEmpIds.length === 0) {
        toast.error("Please select at least one resource");
        return;
    }

    const rows = selectedEmpIds.map((empId) => {
        const emp = employees.find((e) => e.emp_id === empId);
        return {
        emp_id: empId,
        employee_name: emp?.name || "",
        emp_type: empTypeOverrides[empId] || defaultEmpType(emp),
        remarks: remarkMode === "same" ? sameRemark : (individualRemarks[empId] || ""),
        };
    });

    onSave(rows, startDate, endDate);

    setSelectedEmpIds([]);
    setEmpTypeOverrides({});
    setSameRemark("");
    setIndividualRemarks({});
    setRemarkMode("same");
    };

  const handleIndividualRemarkChange = (empId, value) => {
  setIndividualRemarks((prev) => ({ ...prev, [empId]: value }));
};

  return (
            <Modal width={"1200px"} isOpen={isOpen} onClose={onClose} title={isUpdateMode ? "Update Actual" : "Add Actual"}
        onSave={handleSave} saveButtonText="Continue" cancelButtonText="Cancel"
        >

        <div style={{ display: "flex", gap: "1rem" }}>
        <ActualFormGroup style={{ flex: 1 }}>
            <ActualLabel>Start Date</ActualLabel>
            <ActualInput
            type="date"
            value={startDate}
            min={minActualDate}
            max={maxActualDate}
            onChange={(e) => {
                const value = e.target.value;
                setStartDate(value);
                if (endDate && value > endDate) setEndDate(value);
            }}
            />
        </ActualFormGroup>

        <ActualFormGroup style={{ flex: 1 }}>
            <ActualLabel>End Date</ActualLabel>
            <ActualInput
            type="date"
            value={endDate}
            min={startDate || minActualDate}
            max={maxActualDate}
            onChange={(e) => setEndDate(e.target.value)}
            />
        </ActualFormGroup>
        </div>

        <ActualFormGroup>
  <ActualLabel>Remarks Mode</ActualLabel>
  <div style={{ display: "flex", gap: "1rem" }}>
    <ActualLabel style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontWeight: 400 }}>
      <input
        type="radio"
        name="remarkMode"
        checked={remarkMode === "same"}
        onChange={() => setRemarkMode("same")}
      />
      Same remark for all
    </ActualLabel>
    <ActualLabel style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontWeight: 400 }}>
      <input
        type="radio"
        name="remarkMode"
        checked={remarkMode === "individual"}
        onChange={() => setRemarkMode("individual")}
      />
      Individual remark per resource
    </ActualLabel>
  </div>
</ActualFormGroup>

        <ActualFormGroup>
          <ActualLabel>Select Resources</ActualLabel>
          <div style={{ maxHeight: 220, overflowY: "auto", border: "1px solid #eee", borderRadius: 6, padding: "0.5rem" }}>
            {employees.map((emp) => {
              const checked = selectedEmpIds.includes(emp.emp_id);
              return (
                <div
                  key={emp.emp_id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "0.5rem",
                    padding: "0.35rem 0",
                    borderBottom: "1px solid #f5f5f5",
                  }}
                >
                  <ActualLabel style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: 1 }}>
                    <input type="checkbox" checked={checked} onChange={() => toggleEmp(emp)} />
                    {emp.name} ({emp.emp_id})
                  </ActualLabel>

                  {checked && (
                    <ActualSelect
                      value={empTypeOverrides[emp.emp_id] || defaultEmpType(emp)}
                      onChange={(e) => handleEmpTypeChange(emp.emp_id, e.target.value)}
                      style={{ width: 140 }}
                    >
                      <option value="E">Executive (EX)</option>
                      <option value="T">Team Lead (TL)</option>
                    </ActualSelect>
                  )}

                   {remarkMode === "individual" && (
            <ActualInput
              type="text"
              placeholder="Remarks"
              value={individualRemarks[emp.emp_id] || ""}
              onChange={(e) => handleIndividualRemarkChange(emp.emp_id, e.target.value)}
              style={{ width: 180 }}
            />
          )}
                </div>
              );
            })}
          </div>
        </ActualFormGroup>

        {remarkMode === "same" && (
  <ActualFormGroup>
    <ActualLabel>Remarks</ActualLabel>
    <ActualInput type="text" value={sameRemark} onChange={(e) => setSameRemark(e.target.value)} placeholder="Remarks" />
  </ActualFormGroup>
)}

        {/* <ActualButtonGroup>
          <Button variant="outlines" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}>Continue</Button>
        </ActualButtonGroup>
      </ActualModalContent>
    </ActualModalOverlay> */}
    </Modal>
  );
};

export default AddActualModal;

const ActualFormGroup = styled.div`
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const ActualLabel = styled.label`
  font-size: 0.85rem;
  font-weight: 600;
  color: #555;
`;

const ActualInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.9rem;
`;

const ActualSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.9rem;
`;

const ActualButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
`;