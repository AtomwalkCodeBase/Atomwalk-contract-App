import React, { useEffect, useState } from 'react'
import { FaFileAlt, FaPlus, FaTimes, FaUpload, FaUserAltSlash, FaUserCheck, FaUsers, FaUserTimes } from 'react-icons/fa'
import { HiOutlinePencilAlt } from "react-icons/hi";
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { RiUploadCloud2Line } from 'react-icons/ri';
import { IoEyeOutline } from 'react-icons/io5';
import { FaRegPenToSquare } from 'react-icons/fa6';
import { theme } from '../styles/Theme';
import { useAuth } from '../context/AuthContext';
import { getemployeeLists, postAppointee } from '../services/productServices';
import Layout from '../components/Layout';
import Button from '../components/Button';
import StatsCard from '../components/StatsCard';
import Card from '../components/Card';
import Badge from '../components/Badge';

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};

  @media (max-width: ${theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const BUttonGroup = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
`;

const Subtitle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
  p{
    color: ${({ theme }) => theme.colors.textLight};
    font-size: 0.9rem;
  }
`
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th {
    text-align: left;
    padding: 12px;
    background: #f3f4f6;
  }

  td {
    padding: 12px;
    border-bottom: 1px solid #eee;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  backdrop-filter: blur(4px);
`

const ModalContainer = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border-radius: 16px;
  width: 100%;
  max-width: 750px;
  max-height: 95vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`

const ModalHeader = styled.div`
  padding: 1.25rem 1.5rem;
  background: ${({ theme }) => theme.colors.primaryLight};
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 16px 16px 0 0;
  flex-shrink: 0;
`

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.35rem;
  color: ${props => props.theme.colors.primary};
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: white;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: all 0.2s;

  &:hover {
    color: ${props => props.theme.colors.error || '#ff3d00'};
    transform: rotate(90deg);
  }
`;

const ModalBody = styled.div`
  padding: 1.25rem 1.5rem;
  overflow-y: auto;
  flex: 1;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.backgroundAlt};
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.primary};
    border-radius: 10px;
  }
`

const ModalFooter = styled.div`
  padding: 1rem 1.5rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  flex-shrink: 0;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 0 0 16px 16px;

  @media (max-width: 480px) {
    flex-direction: column;
    button { width: 100%; }
  }
`;



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
const CompactRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;
const Required = styled.span`
  color: ${props => props.theme.colors.error};
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


const RetainerScreen = () => {
  const { profile } = useAuth();
  const cust_emp_id = localStorage.getItem("cust_emp_id")

  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState("");
  const [isLoading, setIsLoading] = useState(false)

  const [employeeList, setEmployeeList] = useState([]);
  const [formData, setFormData] = useState({
    emp_id: "",
    name: "",
    gender: "",
    email_id: "",
    mobile_number: "",
    address_line_1: "",
    address_line_2: "",
    file: null
  })
  const [statusFileter,setStatusFilter] = useState("")

  useEffect(() => {
    getEmployeeList();
  }, [])

  console.log("cust_emp_id", cust_emp_id)

  const getEmployeeList = async () =>{
  setIsLoading(true)
  try {
    const res = await getemployeeLists({"rm_emp_id": cust_emp_id});
    setEmployeeList(res.data)

    console.log(res.data)
    
  } catch (error) {
    toast.error(error.response.message || error.message)
  }finally{
  setIsLoading(false)
  } 
} 

  const statsData = [
    {
      icon: <FaUsers />,
      label: "Total Employee",
      value: employeeList.length,
      color: "primary",
      sections: [
        {
          items: [
            { label: "Team Lead", value: 0, status: "info", subStatus: "TL" },
            { label: "Executive", value: 0, status: "success", subStatus: "EX" }
          ]
        },
      ],
      onClick: () => setStatusFilter({ main: "STARTED", sub: null }),
      onItemClick: (item) => setStatusFilter({ main: "STARTED", sub: item.subStatus })
    },
    {
      icon: <FaUserCheck />,
      label: "Verified",
      value: 0,
      color: "success",
      sections: [
        {
          items: [
            { label: "Team Lead", value: 0, status: "info", subStatus: "TL" },
            { label: "Executive", value: 0, status: "success", subStatus: "EX" }
          ]
        },
      ],
      onClick: () => setStatusFilter({ main: "NOT_STARTED", sub: null }),
      onItemClick: (item) => setStatusFilter({ main: "NOT_STARTED", sub: item.subStatus })
    },
    {
      icon: <FaUserTimes />,
      label: "Not verified",
      value: 0,
      color: "secondary",
      sections: [
        {
          items: [
            { label: "Team Lead", value: 0, status: "info", subStatus: "TL" },
            { label: "Executive", value: 0, status: "success", subStatus: "EX" }
          ]
        },
      ],
      onClick: () => setStatusFilter({ main: "CHECK_OUT", sub: null }),
      onItemClick: (item) => setStatusFilter({ main: "CHECK_OUT", sub: item.subStatus })
    },
  ]

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


  const handleAddEmployee = async () => {

    try {
      const appointeePayload = {
        emp_id: formData.emp_id || "",
        name: formData.name,
        gender: formData.gender,
        email_id: formData.email_id,
        mobile_number: formData.mobile_number,
        address_line_1: formData.address_line_1 || "",
        address_line_2: formData.address_line_2 || "",
        call_mode: modalMode === "ADD" ? 'ADD_RETAIN' : 'UPDATE_RETAIN',
        manager_mobile: profile.mobile_number
        // file: formData.file
      };

      // console.log("appointeePayload", appointeePayload)

      const res = await postAppointee(appointeePayload);
      if (res.status === "200") {
        toast.success("Employee successfully Add")
        await getEmployeeList()
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again later!!!")
    }
  } 


  return (
    <Layout title="Employee Management">
      <Subtitle>
        <div>
          <p>All Employee List</p>
        </div>

        <Button variant="primary" onClick={() =>{
          setFormData({
            emp_id: "",
            name: "",
            gender: "M",
            email_id: "",
            mobile_number: "",
            address_line_1: "",
            address_line_2: "",
            file: null
          });
          setOpenModal(true); 
          setModalMode("ADD");
        }}>
          <FaPlus /> Add Employee
        </Button>
      </Subtitle>
      <StatsGrid>
        {statsData.map((stats) => <StatsCard icon={stats.icon} label={stats.label} value={stats.value} color={stats.color} 
        sections={stats.sections} onClick={() => { stats.onClick(); window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }); }} onItemClick={(item) => { stats.onItemClick(item); window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }) }}
        />)}
      </StatsGrid>

      <Card hoverable={false}>
        <Table>
          <thead>
            <tr>
              <th>Emp ID</th>
              <th>Name</th>
              <th>Mobile</th>
              <th>Gender</th>
              <th>Grade</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {employeeList.map((employee) => (<tr>
              <td>{employee.emp_id}</td>
              <td>{employee.name}</td>
              <td>{employee.mobile_number}</td>
              <td>{employee.gender === "M" ? "Male" : "Female"}</td>
              <td>Team Lead</td>
              <td>
                <Badge variant='success'>Verified</Badge>
              </td>
              <td>
               <BUttonGroup> 
                  <Button iconOnly={true}>
                    <IoEyeOutline />
                  </Button>
                  <Button iconOnly={true} onClick={() => {setModalMode("UPLOAD"); setOpenModal(true);}}>
                    <RiUploadCloud2Line />
                  </Button>
                  <Button onClick={() =>{
                    setFormData({
                      emp_id: employee.emp_id,
                      name: employee.name,
                      gender: employee.gender,
                      email_id: employee.email_id || "",
                      mobile_number: employee.mobile_number || "",
                      address_line_1: employee.address || "",
                      // address_line_2: "",
                      // file: null
                    });
                    setOpenModal(true); 
                    setModalMode("UPDATE");
                  }}>
                    <FaRegPenToSquare />
                  </Button>
                </BUttonGroup>  
              </td>
            </tr>))}
          </tbody>
        </Table>
      </Card>

      {openModal &&
        <ModalOverlay onClick={() => setOpenModal(false)}>
          <ModalContainer onClick={e => e.stopPropagation()}>
            {/* <form onSubmit={handleAddEmployee}> */}
            <ModalHeader>
              <ModalTitle>
                {modalMode === "UPLOAD"? "Upload Employee Document" : modalMode === "UPLOAD" ? "Add Employee Details" : "Update Employee Details" }
              </ModalTitle>
              <CloseButton onClick={() => setOpenModal(false)}>
                <FaTimes />
              </CloseButton>
            </ModalHeader>
            <ModalBody>
             {modalMode !== "UPLOAD" && 
              <>
              <CompactRow>
                <FormGroup>
                  <Label>Emp ID <Required>*</Required></Label>
                  <Input type="text" value={formData.emp_id} onChange={(e) => handleChange("emp_id", e.target.value)} required/>
                </FormGroup>
                <FormGroup>
                  <Label>Employee Name <Required>*</Required></Label>
                  <Input type="text" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} required/>
                </FormGroup>
                <FormGroup>
                  <Label>Gender <Required>*</Required></Label>
                  <FormSelect id="type" name="type" value={formData.gender} onChange={(e) => handleChange("gender", e.target.value)} required>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </FormSelect>
                </FormGroup>
              </CompactRow>
              <CompactRow>
                <FormGroup>
                  <Label>Email Id <Required>*</Required></Label>
                  <Input type="email" value={formData.email_id} onChange={(e) => handleChange("email_id", e.target.value)}  required/>
                </FormGroup>
                <FormGroup>
                  <Label>Mobile Number (Optional)</Label>
                  <Input type="number" value={formData.mobile_number} onChange={(e) => handleChange("mobile_number", e.target.value)} />
                </FormGroup>
                <FormGroup>
                  <Label>Grade <Required>*</Required></Label>
                  <FormSelect id="type" name="type" value={formData.gender} onChange={(e) => handleChange("gender", e.target.value)} required>
                    <option value="TL">Team Lead</option>
                    <option value="EX">Executive</option>
                  </FormSelect>
                </FormGroup>
              </CompactRow>
               <FormGroup>
                  <Label>Address line 1 <Required>*</Required></Label>
                  <Input type="text" value={formData.address_line_1} onChange={(e) => handleChange("address_line_1", e.target.value)} />
                </FormGroup>
               <FormGroup>
                  <Label>Address line 2 (Optional)</Label>
                  <Input type="text" value={formData.address_line_2} onChange={(e) => handleChange("address_line_2", e.target.value)} />
                </FormGroup>
                
              </>}
                {modalMode === "UPLOAD" &&<CompactRow>
                <FormGroup>
                  <Label>Select Id Proof <Required>*</Required></Label>
                  <FormSelect id="type" name="type" value={formData.gender} onChange={(e) => handleChange("gender", e.target.value)} required>
                    <option value="A">Adhara Card</option>
                    <option value="P">Pan Card</option>
                    <option value="D">Driving license</option>
                  </FormSelect>
                </FormGroup>
                 <FormGroup>
                  <Label>Enter Selected ID proof Number</Label>
                 <Input type="text" value={formData.Id} onChange={(e) => handleChange("mobile_number", e.target.value)} required/>
                </FormGroup>
                </CompactRow>}
              {modalMode === "UPLOAD" && <FormGroup>
                <Label>
                  Upload ID Proof<Required>*</Required>
                </Label>
                <FileUploadContainer onClick={() => document.getElementById("file-upload").click()}>
                  <FileInput
                    id="file-upload"
                    name="file"
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*,.pdf,"
                    required={true}
                  />
                  <FileUploadContent>
                    <FileUploadIcon>
                      <FaUpload />
                    </FileUploadIcon>
                    <FileUploadTextWrapper>
                      <FileUploadText>Click to upload file</FileUploadText>
                      <FileUploadHint>JPG, PNG, PDF • Max 5MB</FileUploadHint>
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
              </FormGroup>}

            </ModalBody>
            <ModalFooter>
              <Button variant="outline" onClick={() => setOpenModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleAddEmployee}>
                {modalMode === "ADD" ? <FaPlus style={{ marginRight: 6 }} /> : <HiOutlinePencilAlt style={{ marginRight: 6 }} />}
                {modalMode === "ADD" ? "Add" : "Update"}
              </Button>
            </ModalFooter>
            {/* </form> */}
          </ModalContainer>
        </ModalOverlay>}
    </Layout>
  )
}

export default RetainerScreen