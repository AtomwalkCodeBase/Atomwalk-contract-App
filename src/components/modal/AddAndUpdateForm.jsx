import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import Button from '../Button';
import { theme } from '../../styles/Theme';
import { HiOutlinePencilAlt } from 'react-icons/hi';
import { FaFileAlt, FaPlus, FaTimes, FaUpload } from 'react-icons/fa';
import { RiUploadCloud2Line } from 'react-icons/ri';
import Tabs from '../Tabs';

const ModalOverlay = styled.div`
  position: fixed; inset: 0; background: rgba(0,0,0,0.6);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 1rem; backdrop-filter: blur(4px);
`;

const ModalContainer = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border-radius: 16px; width: 100%; max-width: 750px;
  max-height: 95vh; display: flex; flex-direction: column;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
`;

const ModalHeader = styled.div`
  padding: 1.25rem 1.5rem; background: ${({ theme }) => theme.colors.primaryLight};
  display: flex; justify-content: space-between; align-items: center;
  border-radius: 16px 16px 0 0;
`;

const ModalTitle = styled.h2`
  margin: 0; font-size: 1.35rem; color: ${({ theme }) => theme.colors.primary}; font-weight: 600;
`;

const CloseButton = styled.button`
  background: white; border: none; width: 32px; height: 32px; border-radius: 50%;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: all 0.2s;

  &:hover { color: ${({ theme }) => theme.colors.error}; transform: rotate(90deg); }
`;

const ModalBody = styled.div`
  padding: 1.25rem 1.5rem; overflow-y: auto; flex: 1;
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: ${({ theme }) => theme.colors.backgroundAlt}; border-radius: 10px; }
  &::-webkit-scrollbar-thumb { background: ${({ theme }) => theme.colors.primary}; border-radius: 10px; }
`;

const ModalFooter = styled.div`
  padding: 1rem 1.5rem; border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex; justify-content: flex-end; gap: 0.75rem; flex-shrink: 0;
  background: ${({ theme }) => theme.colors.background}; border-radius: 0 0 16px 16px;

  @media (max-width: 480px) {
    flex-direction: column; button { width: 100%; }
  }
`;

const FormGroup = styled.div` margin-bottom: 1rem; `;

const Label = styled.label`
  display: flex; align-items: center; gap: 6px;
  font-weight: 600; font-size: 0.85rem; margin-bottom: 0.4rem;
  color: ${({ theme }) => theme.colors.text};
`;

const Required = styled.span` color: ${({ theme }) => theme.colors.error}; `;

const Input = styled.input`
  width: 100%; padding: 10px 12px; border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px; font-size: 0.95rem; transition: all 0.3s;

  &:focus {
    outline: none; border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primaryLight};
  }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const FormSelect = styled.select`
  width: 100%; padding: 0.75rem; border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px; background: white;

  &:focus {
    outline: none; border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primaryLight};
  }
`;

const CompactRow = styled.div`
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem;
  @media (max-width: 640px) { grid-template-columns: 1fr; }
`;

const FileUploadContainer = styled.div`
  border: 2px dashed ${({ theme }) => theme.colors.border}; border-radius: 8px;
  padding: 0.75rem; cursor: pointer; transition: all 0.2s;
  background: ${({ theme }) => theme.colors.background};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.primaryLight}22;
  }
`;

const FileUploadContent = styled.div` display: flex; align-items: center; gap: 0.75rem; `;

const FileUploadIcon = styled.div`
  font-size: 1.25rem; color: ${({ theme }) => theme.colors.primary};
  display: flex; align-items: center; justify-content: center;
  width: 36px; height: 36px; background: ${({ theme }) => theme.colors.primaryLight};
  border-radius: 8px; flex-shrink: 0;
`;

const FileUploadText = styled.div`
  color: ${({ theme }) => theme.colors.text}; font-size: 0.85rem; font-weight: 500;
`;

const FileUploadHint = styled.div`
  font-size: 0.72rem; color: ${({ theme }) => theme.colors.textLight};
`;

const UploadedFile = styled.div`
  display: flex; align-items: center; gap: 0.5rem;
  background: ${({ theme }) => theme.colors.backgroundAlt}; padding: 0.5rem 0.75rem;
  border-radius: 8px; margin-top: 0.5rem; border: 1px solid ${({ theme }) => theme.colors.border};
  span { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
`;

// export const EmployeeModal = ({
export const AddAndUpdateForm = ({
  isOpen,
  onClose,
  modalMode,
  formData,
  formDataFile,
  onChange,
  onChangeUpload,
  onFileChange,
  onSubmit,
  removeFile,
  isLoading = false,
  employeeDetails
}) => {

  const initialFormRef = useRef(null);
  const initialUploadRef = useRef(null);
  const [uploadMode, setUploadMode] = useState("D");
  const [isChanged, setIsChanged] = useState(false);

  const getFileKey = (file) => {
    if (!file) return "";
    if (typeof file === "string") return file;
    return `${file.name}_${file.size}_${file.lastModified}`;
  };

   // Get initial values based on mode
  const getInitialValues = () => {
    if (modalMode === "UPLOAD") {
      return {
        proofType: formDataFile.proofType || "",
        govt_id_number: formDataFile.govt_id_number || "",
        fileKey: getFileKey(formDataFile.file),
        profile_img: formDataFile.profile_img || null
      };
    }
    if (modalMode === "UPDATE") {
      return { ...formData };
    }
    return null;
  };

  // Check if values changed
  const hasValuesChanged = (current, initial, fields) => {
    if (modalMode === "UPDATE") {
      return JSON.stringify(current) !== JSON.stringify(initial);
    }
    
    if (modalMode === "UPLOAD") {
      if (uploadMode === "D") {
        return fields.some(field => current[field] !== initial[field]);
      }
      if (uploadMode === "P") {
        return !!formDataFile.newProfileFile;
      }
    }
    return true;
  };

  // Initialize refs when modal opens
  useEffect(() => {
    if (!isOpen) return;
    
    const initialValues = getInitialValues();
    if (modalMode === "UPLOAD") {
      initialUploadRef.current = initialValues;
    } else {
      initialFormRef.current = initialValues;
    }
    setIsChanged(false);
  }, [isOpen, modalMode]);

  // Check for changes
  useEffect(() => {
    if (!isOpen) {
      setIsChanged(false);
      return;
    }

    let changed = false;
    const documentFields = ["proofType", "govt_id_number", "fileKey"];

   if (modalMode === "UPDATE") {
      if (initialFormRef.current) {
        changed = hasValuesChanged(formData, initialFormRef.current);
      }
    } else if (modalMode === "UPLOAD") {
      if (uploadMode === "D") {
        const current = {
          proofType: formDataFile.proofType || "",
          govt_id_number: formDataFile.govt_id_number || "",
          fileKey: getFileKey(formDataFile.file)
        };
        changed = hasValuesChanged(current, initialUploadRef.current || {}, documentFields);
      }
      if (uploadMode === "P") {
        changed = !!formDataFile.newProfileFile;
      }
    } else if (modalMode === "ADD") {
      // In ADD mode, button should be enabled when any required field has value
      // Or you can keep it always enabled for ADD mode
      changed = true; // Always enable in ADD mode
      
      // Optional: Enable only when required fields are filled
      // const requiredFields = ['emp_id', 'name', 'gender', 'dob', 'email_id', 'grade_level', 'address_line_1'];
      // changed = requiredFields.some(field => formData[field]?.trim());
    }

    setIsChanged(changed);
  }, [formData, formDataFile, uploadMode, modalMode, isOpen, getFileKey]);

  if (!isOpen) return null;

  const isUploadMode = modalMode === "UPLOAD";
    const isAddMode = modalMode === "ADD";

    const isButtonDisabled = () => {
    if (isLoading) return true;
    if (isAddMode) return false; // Always enabled in ADD mode
    return !isChanged;
  };

  const tabs = [
    { key: 'D', label: "Document Upload", },
    { key: 'P', label: "Profile Image", },
  ].filter(Boolean);

  return (
    <ModalOverlay onClick={() => { onClose(); setUploadMode("D")}}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <ModalTitle>
              {isUploadMode ? "Upload Auditor's Document" : modalMode === "UPDATE" ? "Update Auditor's Details" : "Add Auditor's Details"}
            </ModalTitle>

            {employeeDetails && <ModalTitle>
              {employeeDetails.name}({employeeDetails.emp_id})
            </ModalTitle>}
          </div>

          <CloseButton onClick={() => { onClose(); setUploadMode("D")}}><FaTimes /></CloseButton>
        </ModalHeader>

        <ModalBody>
          {!isUploadMode && (
            <>
              <CompactRow>
                <FormGroup>
                  <Label>Auditor ID <Required>*</Required></Label>
                  <Input type="text" value={formData.emp_id} onChange={(e) => onChange("emp_id", e.target.value)} />
                </FormGroup>
                <FormGroup>
                  <Label>Auditor Name <Required>*</Required></Label>
                  <Input type="text" value={formData.name} onChange={(e) => onChange("name", e.target.value)} />
                </FormGroup>
                <FormGroup>
                  <Label>Gender <Required>*</Required></Label>
                  <FormSelect value={formData.gender} onChange={(e) => onChange("gender", e.target.value)}>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </FormSelect>
                </FormGroup>
              </CompactRow>

              <CompactRow>
                <FormGroup>
                  <Label>Dob <Required>*</Required></Label>
                  <Input type="date" value={formData.dob} onChange={(e) => onChange("dob", e.target.value)} />
                </FormGroup>
                <FormGroup>
                  <Label>Email Id <Required>*</Required></Label>
                  <Input type="email" value={formData.email_id} onChange={(e) => onChange("email_id", e.target.value)} />
                </FormGroup>
                <FormGroup>
                  <Label>Mobile Number</Label>
                  <Input type="tel" maxLength="10" value={formData.mobile_number} onChange={(e) => onChange("mobile_number", e.target.value)} />
                </FormGroup>
                <FormGroup>
                  <Label>Grade <Required>*</Required></Label>
                  <FormSelect value={formData.grade_level} onChange={(e) => onChange("grade_level", e.target.value)}>
                    <option value="RET-G1-TL">Team Lead</option>
                    <option value="RET-G1-EX">Executive</option>
                  </FormSelect>
                </FormGroup>
              </CompactRow>

              <FormGroup>
                <Label>Address line 1 <Required>*</Required></Label>
                <Input type="text" value={formData.address_line_1} onChange={(e) => onChange("address_line_1", e.target.value)} />
              </FormGroup>
              <FormGroup>
                <Label>Address line 2</Label>
                <Input type="text" value={formData.address_line_2} onChange={(e) => onChange("address_line_2", e.target.value)} />
              </FormGroup>
            </>
          )}

          {isUploadMode && (
            <>
              <Tabs tabs={tabs} activeTab={uploadMode} setActiveTab={setUploadMode} />

              {uploadMode === "P" ? <>
                <FormGroup>
                  <Label>Upload Profile Image</Label>
                  <FileUploadContainer onClick={() => document.getElementById("file-upload1").click()}>
                    <input
                      id="file-upload1"
                      type="file"
                      onChange={(e) => onFileChange(e, "profile")}
                      accept="image/*"
                      style={{ display: 'none' }}
                    />
                    <FileUploadContent>
                      <FileUploadIcon><FaUpload /></FileUploadIcon>
                      <div>
                        <FileUploadText>Click to upload file</FileUploadText>
                        <FileUploadHint>JPG, PNG • Max 5MB</FileUploadHint>
                      </div>
                    </FileUploadContent>
                  </FileUploadContainer>

                  {(formDataFile.newProfileFile || formDataFile.profile_img) && (
  <UploadedFile>
    <img
      src={
        formDataFile.newProfileFile
          ? URL.createObjectURL(formDataFile.newProfileFile)
          : formDataFile.profile_img
      } alt="preview" style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 6 }} />
                    </UploadedFile>
                  )}
                </FormGroup>
              </>

                :
                <>
                  <CompactRow>
                    <FormGroup>
                      <Label>Select Id Proof Type<Required>*</Required></Label>
                      <FormSelect id="proofType" name="proofType" value={formDataFile.proofType} onChange={(e) => onChangeUpload("proofType", e.target.value)} required>
                        <option value="" disabled>Select Id Proof</option>
                        <option value="A">Aadhar Card</option>
                        <option value="P">Pan Card</option>
                        <option value="D">Driving license</option>
                      </FormSelect>
                    </FormGroup>
                    <FormGroup>
                      <Label>Enter ID Proof Number <Required>*</Required></Label>
                      <Input
                        type="text"
                        value={formDataFile.govt_id_number}
                        onChange={(e) => onChangeUpload("govt_id_number", e.target.value, true)}
                      />
                    </FormGroup>
                  </CompactRow>

                  <FormGroup>
                    <Label>Upload ID Proof <Required>*</Required></Label>
                    <FileUploadContainer onClick={() => document.getElementById("file-upload").click()}>
                      <input
                        id="file-upload"
                        type="file"
                        onChange={onFileChange}
                        accept="image/*,.pdf"
                        style={{ display: 'none' }}
                      />
                      <FileUploadContent>
                        <FileUploadIcon><FaUpload /></FileUploadIcon>
                        <div>
                          <FileUploadText>Click to upload file</FileUploadText>
                          <FileUploadHint>JPG, PNG, PDF • Max 5MB</FileUploadHint>
                        </div>
                      </FileUploadContent>
                    </FileUploadContainer>

                    {formDataFile.file && (
                      <UploadedFile>
                        {formDataFile.file.type && formDataFile.file.type?.startsWith("image/") ? (
                          <img src={URL.createObjectURL(formDataFile.file)} alt="preview" style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 6 }} />
                        ) : (
                          <FaFileAlt color={theme.colors.text} />
                        )}
                        <span title={formDataFile.file.name} style={{ color: theme.colors.text }}>{formDataFile.file.name}</span>
                        <button type="button" onClick={removeFile}><FaTimes /></button>
                      </UploadedFile>
                    )}
                  </FormGroup>
                </>
              }
            </>
          )}


        </ModalBody>

        <ModalFooter>
          <Button variant="outline" onClick={() => { onClose(); setUploadMode("D")}}>Cancel</Button>
          <Button variant="primary" onClick={() => modalMode === "UPLOAD" ? onSubmit(uploadMode) : onSubmit()} disabled={isButtonDisabled()}>
            {modalMode === "ADD" && <FaPlus style={{ marginRight: 6 }} />}
            {modalMode === "UPDATE" && <HiOutlinePencilAlt style={{ marginRight: 6 }} />}
            {modalMode === "UPLOAD" && <RiUploadCloud2Line style={{ marginRight: 6 }} />}
            {isUploadMode ? "Upload" : modalMode === "ADD" ? "Add" : "Update"}
          </Button>
        </ModalFooter>
      </ModalContainer>
    </ModalOverlay>
  );
};