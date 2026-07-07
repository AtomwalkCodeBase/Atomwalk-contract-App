import React, { useCallback, useEffect, useState } from 'react'
import Modal from '../Modal'
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { FaCalendarAlt, FaFileAlt, FaListUl, FaRupeeSign, FaTimes, FaUpload } from 'react-icons/fa';
import { FiFileText } from 'react-icons/fi';
import { getExpenseItem, postClaim } from '../../services/productServices';
import { DateForApiFormate } from '../../utils/utils';

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

const FormSelect = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primaryLight};
  }
`

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


const AddOPEModal = ({ isOpen, onClose, claimData = null , onSaved}) => {
  const loggedEmpId = localStorage.getItem("cust_emp_id");

  const [ isLoading, setIsLoading ] = useState(false);
  const [ isFileError, setIsFileError ] = useState(false);
  const [expenseItemList, setExpenseItemList] = useState([]);

  const initialFormData = {
    type: "",
    amount: "",
    date: "",
    claim_remarks: "",
    file: null,
    emp_id: loggedEmpId,
    o_item_id: claimData?.o_item_id
  };

  const [formData, setFormData] = useState(initialFormData);

  const selectedItem = expenseItemList.find(item => item.id === formData.type);
  const isReceiptRequired = Boolean(selectedItem?.is_exp_bill_required);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setIsFileError(false);
  }, []);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const fetchClaimItemList = async () => {
    try {
      const response = await getExpenseItem();
      setExpenseItemList(response?.data || []);
    } catch (error) {
      console.error("Error fetching expense items:", error);
      toast.error("Failed to load expense items");
    }
  }

  const populateEditForm = useCallback((data) => {
    if (!data?.item_id) return;
    setFormData({
      type: data.item_id || "",
      amount: data.expense_amt || "",
      date: DateForApiFormate(data.expense_date, true),
      claim_remarks: data.remarks || "",
      file: data.submitted_file_1 
        ? { uri: data.submitted_file_1, name: data.submitted_file_1.split("/").pop().split("?")[0] }
        : null,
      emp_id: loggedEmpId,
      o_item_id: claimData?.o_item_id
    });
  }, [loggedEmpId]);

  useEffect(() => {
    fetchClaimItemList();
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (claimData?.item_id) {
        populateEditForm(claimData);
      } else {
        resetForm();
      }
    }
  }, [isOpen, claimData, populateEditForm, resetForm]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
    
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      e.target.value = "";
      return;
    }

    setIsFileError(false);
    handleChange("file", file);
  };
    
  const removeFile = () => {handleChange("file", null)};

    const handleSubmit = async () => {
    if (!formData.type) return toast.error("Please select an expense item");
    if (!formData.date) return toast.error("Please select expense date");
    if (!formData.amount || Number(formData.amount) <= 0) {
      return toast.error("Please enter a valid OPE amount");
    }
    if (isReceiptRequired && !formData.file) {
      setIsFileError(true);
      return;
    }

    setIsLoading(true);
    setIsFileError(false);

  try {
      const masterClaimId = claimData?.master_data?.master_claim_id;
      const dateObj = new Date(formData.date)
      const expense_date = `${dateObj.getDate().toString().padStart(2, '0')}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}-${dateObj.getFullYear()}`
      const formDatas = new FormData() 

      if (formData.file) {
        formDatas.append("file_1", formData.file);
      }
      formDatas.append("remarks", formData.claim_remarks || "")
      formDatas.append("item", formData.type)
      formDatas.append("quantity", "1")
      formDatas.append("expense_amt", formData.amount)
      formDatas.append("expense_date", expense_date)
      formDatas.append("emp_id", formData.emp_id)
      formDatas.append("quantity", 1)
      formDatas.append("o_item_id", formData.o_item_id)
      // if (value === "save") {
      //   if (claimupdate?.substatusText === "Back To Claimant") {
      //     formDatas.append("call_mode", "CLAIM_RESUBMIT");
      //   } else {
      //     formDatas.append("call_mode", claimupdate?.item_id ? "CLAIM_UPDATE" : "CLAIM_SAVE");
      //   }
      // }
      formDatas.append("call_mode", claimData?.item_id ? "CLAIM_UPDATE" : "CLAIM_SAVE");
      
      if(masterClaimId) {
          formDatas.append('m_claim_id', masterClaimId);
      }
      if( claimData?.item_id) {
        formDatas.append("claim_id", claimData.id)
      }
      for (let [key, value] of formDatas.entries()) {
        console.log(key, value);
      }
      const res = await postClaim(formDatas)

      // const res = {status: 200}
      if (res.status === 200) {
        setIsLoading(false)
        handleClose();
        toast.success(claimData?.item_id ? "Update claim successfully" : "Add claim successfully")
        setIsFileError(false)
        await onSaved();
      } else {
        toast.error("Claim Submission Error", "Failed to claim. Unexpected response.")
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Submission failed")
    } finally {
      setIsLoading(false)
    }
  }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={claimData?.item_id ? `Edit OPE (${claimData?.master_data?.master_claim_id})` : "Add OPE"} saveButtonText={claimData?.item_id ? "Update OPE" : "Add OPE"} onSave={handleSubmit} saveDisabled={isLoading}>
            <div style={{ padding: "0.2rem" }}>
              <FormGroup>
              <Label htmlFor="type"><FaListUl />Expense Item</Label>
              <FormSelect id="type" name="type" value={formData.type} onChange={(e) => handleChange("type", e.target.value)} required>
                <option value="">Select Expense Item</option>
                {expenseItemList.map((value, index) => (
                  <option key={index} value={value.id}>
                    {value.name}
                  </option>
                ))}
              </FormSelect>
              </FormGroup>

              <FormGroup>
              <Label htmlFor="date"><FaCalendarAlt /> Date of Expense</Label>
              <div style={{ position: "relative" }}>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                  required
                  // style={{ paddingLeft: "2rem" }}
                />
                {/* <FaCalendarAlt style={{ position: "absolute", left: "0.75rem", top: "0.75rem", color: "#666" }} /> */}
              </div>
            </FormGroup>

                <FormGroup>
                    <Label> <FaRupeeSign />OPE Amount <Required>*</Required></Label>
                    <Input type="number" min={0} value={formData.amount} onChange={(e) => handleChange("amount", e.target.value)} placeholder="Enter OPE Amount" />
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
                        Receipts/Attachments {isReceiptRequired && <Required>*</Required>}
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
                    {isFileError && (
                        <span style={{ color: "red", fontSize: "0.75rem", marginTop: "0.3rem", display: "block",}}>
                          Please upload a receipt/attachment
                        </span>
                      )}

                    {formData.file && (
                        <UploadedFile>
                            {formData.file?.type?.startsWith("image/") ? (
                                <img
                                    src={URL.createObjectURL(formData.file)}
                                    alt="preview"
                                    style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 6 }}
                                />
                            ) : (
                                <FaFileAlt color={(theme) => theme.colors.text} />
                            )}
                            <span title={formData?.file?.name}>{formData?.file?.name}</span>
                            <button type="button" onClick={(e) => {e.stopPropagation(); removeFile()}}>
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