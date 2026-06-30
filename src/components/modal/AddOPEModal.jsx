import React, { useState } from 'react'
import Modal from '../Modal'
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { FaFileAlt, FaUpload } from 'react-icons/fa';
import { FiFileText } from 'react-icons/fi';

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  margin-bottom: 0.4rem;
  color: ${props => props.theme.colors.text};
`;

const Required = styled.span`
  color: ${props => props.theme.colors.error};
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: 10px;
  font-size: 0.95rem;
  transition: all 0.3s;

  &:disabled {
     opacity: 0.5;
     cursor: not-allowed;
     transform: none;
   }

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primaryLight};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: 10px;
  min-height: 20px;
  resize: vertical;
  font-family: inherit;
  font-size: 0.95rem;

    &:disabled {
     opacity: 0.5;
     cursor: not-allowed;
     transform: none;
   }

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primaryLight};
  }
`;
const FileUploadContainer = styled.div`
  border: 2px dashed ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  background: ${({ theme }) => theme.colors.background};
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.primaryLight}22;
  }
`;
const FileUploadContent = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const FileUploadIcon = styled.div`
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: ${({ theme }) => theme.colors.primaryLight};
  border-radius: 8px;
  flex-shrink: 0;
`;

const FileUploadTextWrapper = styled.div`
  flex: 1;
`;

const FileUploadText = styled.div`
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 0.15rem;
`;

const FileUploadHint = styled.div`
  font-size: 0.72rem;
  color: ${({ theme }) => theme.colors.textLight};
`;

const FileInput = styled.input`
  display: none;

    &:disabled {
     opacity: 0.5;
     cursor: not-allowed;
     transform: none;
   }
`;

const UploadedFile = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  margin-top: 0.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  
  span {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: ${props => props.theme.colors.text};
    font-size: 0.85rem;
    font-weight: 500;
  }
  
  button {
    background: transparent;
    border: none;
    color: ${({ theme }) => theme.colors.error};
    cursor: pointer;
    padding: 0.25rem;
    display: flex;
    align-items: center;
    font-size: 1rem;
    transition: opacity 0.2s;
    
    &:hover {
      opacity: 0.7;
    }
  }
`;


const AddOPEModal = ({ isOpen, onClose }) => {
       const [formData, setFormData] = useState({
      ope_amount: "",
      claim_remarks: "",
      file: null
    })

       const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
      };
    
      const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
    
        if (file.size > 5 * 1024 * 1024) {
          toast.error("File size must be less than 5MB");
          return;
        }
    
        handleChange("file", file);
      };
    
      const removeFile = () => { setFormData((prev) => ({ ...prev, file: null, })) }


    return (
        <Modal isOpen={isOpen} onClose={onClose} title='Add OPE' >
            <div style={{ padding: "0.2rem" }}>
                {/* <h4 style={{ textAlign: "left", marginBottom: "1rem" }}>ADD OPE </h4> */}
                <FormGroup>
                    <Label>OPE Amount <Required>*</Required></Label>
                    <Input type="number" min={0} value={formData.ope_amount} onChange={(e) => handleChange("ope_amount", e.target.value)} placeholder="Enter OPE Amount" />
                </FormGroup>

                <FormGroup>
                    <Label>
                        <FiFileText /> Remarks(Optional)
                    </Label>
                    <TextArea
                        value={formData.claim_remarks}
                        onChange={e => handleChange('claim_remarks', e.target.value)}
                        placeholder="Add any notes..."
                    // disabled={isRetainerUpdate}
                    />
                </FormGroup>

                <FormGroup>
                    <Label>
                        Receipts/Attachments
                    </Label>
                    <FileUploadContainer onClick={() => document.getElementById("file-upload").click()}>
                        <FileInput
                            id={"file-upload"}
                            name="file"
                            type="file"
                            onChange={handleFileChange}
                            accept="image/*,.pdf,"
                        // required={activity.original_P.is_file_applicable} 
                        // disabled={isRetainerUpdate}
                        />
                        <FileUploadContent>
                            <FileUploadIcon>
                                <FaUpload />
                            </FileUploadIcon>
                            <FileUploadTextWrapper>
                                <FileUploadText>Click to upload file</FileUploadText>
                                <FileUploadHint>JPG, PNG, PDF, EXCEL, WORD • Max 5MB</FileUploadHint>
                            </FileUploadTextWrapper>
                        </FileUploadContent>
                    </FileUploadContainer>

                    {formData.file && (
                        <UploadedFile>
                            {formData.file.type.startsWith("image/") ? (
                                <img
                                    src={URL.createObjectURL(formData.file)}
                                    alt="preview"
                                    style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 6 }}
                                />
                            ) : (
                                <FaFileAlt color={(theme) => theme.color.text} />
                            )}
                            <span title={formData.file.name}>{formData.file.name}</span>
                            <button type="button" onClick={() => removeFile(1)}>
                                <FaTimes />
                            </button>
                        </UploadedFile>
                    )}
                </FormGroup>
            </div>

        </Modal>
    )
}

export default AddOPEModal