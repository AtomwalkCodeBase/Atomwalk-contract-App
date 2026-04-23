import React, { useEffect, useMemo, useState } from 'react'
import { FaPlus, FaUserCheck, FaUsers, FaUserTimes } from 'react-icons/fa'
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { RiUploadCloud2Line } from 'react-icons/ri';
import { IoEyeOutline } from 'react-icons/io5';
import { FaRegPenToSquare } from 'react-icons/fa6';
import { theme } from '../styles/Theme';
import { useAuth } from '../context/AuthContext';
import { getemployeeLists, postAppointee, postAppointeeFile } from '../services/productServices';
import Layout from '../components/Layout';
import Button from '../components/Button';
import StatsCard from '../components/StatsCard';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { DateForApiFormate, formatToDDMMYYYY } from '../utils/utils';
import EmployeeDetailModal from '../components/modal/EmployeeDetailModal';
import { AddAndUpdateForm } from '../components/modal/AddAndUpdateForm';
import PaginationComponent from '../components/Pagination';

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
  overflow-x: auto;
  overflow-y: hidden;

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

const FilterRow = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  align-items: center;
  flex-wrap: wrap;
  
  @media (max-width: ${theme.breakpoints.md}) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const FilterSelect = styled.select`
  padding: 0.5rem 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  background: white;
  min-width: 150px;

  @media (max-width: 768px) {
    width: 45%;
    min-width: unset;
  }

  @media (max-width: 480px) {
    width: 100%;
  }
`;

const SearchBox = styled.input`
  flex: 1;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  font-family: ${theme.fonts.body};
  font-size: ${theme.fontSizes.sm};
  min-width: 200px;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }
  
  &::placeholder {
    color: ${theme.colors.textLight};
  }
`;


const RetainerScreen = () => {
  const { profile } = useAuth();
  const cust_emp_id = localStorage.getItem("cust_emp_id")

  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState("");
  const [isLoading, setIsLoading] = useState(false)

  const [employeeList, setEmployeeList] = useState([]);
  const [formData, setFormData] = useState({
    o_emp_id: "",
    emp_id: "",
    name: "",
    gender: "",
    grade_level: "",
    dob: "",
    email_id: "",
    mobile_number: "",
    address_line_1: "",
    address_line_2: "",
    file: null
  })

  const [formDataFile, setFormDataFile] = useState({
    emp_id: "",
    proofType: "",
    govt_id_number: "",
    file: null,
    profile_img: null,
    newProfileFile: null
  })

  const [statusFileter, setStatusFilter] = useState("")
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [showEmployeeDetails, setShowEmployeeDetails] = useState(false);

  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    getEmployeeList();
  }, [])

  const getEmployeeList = async () => {
    setIsLoading(true)
    try {
      const res = await getemployeeLists({ "rm_emp_id": cust_emp_id });
      setEmployeeList(res.data)
    } catch (error) {
      toast.error(error.response.message || error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const getGrade = (grade_level) => {
    if (grade_level <= 1) return "EX";
    if (grade_level === 2) return "TL";
    return "-";
  };

  const getStatus = (is_verified) => {
    return is_verified ? "VERIFIED" : "UNVERIFIED";
  };

  const getCounts = (list) => {
    const counts = {
      total: list.length,
      VERIFIED: { TL: 0, EX: 0 },
      UNVERIFIED: { TL: 0, EX: 0 },
    };

    list.forEach((emp) => {
      const grade = getGrade(emp.grade_level);
      const status = getStatus(emp.is_verified);

      if (counts[status] && counts[status][grade] !== undefined) {
        counts[status][grade]++;
      }
    });

    return counts;
  };

  const counts = getCounts(employeeList);

  const filteredEmployees = employeeList.filter((emp) => {
    const grade = getGrade(emp.grade_level);
    const status = getStatus(emp.is_verified);

    // ✅ Search filter
    const search = searchTerm?.toLowerCase() || "";
    const matchesSearch =
      emp.name?.toLowerCase().includes(search) ||
      emp.emp_id?.toLowerCase().includes(search) || emp.additional_ref_number?.includes(search) || emp.emp_id?.includes(search);;

    // ✅ Dropdown filter (Grade)
    let matchesDropdown = true;

    if (selectedStatus !== "All") {
      if (selectedStatus === "RET-G1-TL") {
        matchesDropdown = grade === "TL";
      } else if (selectedStatus === "RET-G1-EX") {
        matchesDropdown = grade === "EX";
      }
    }

    let matchesStats = true;
    if (statusFileter?.status && status !== statusFileter.status) {
      matchesStats = false;
    }
    if (statusFileter?.grade && grade !== statusFileter.grade) {
      matchesStats = false;
    }

    return matchesSearch && matchesDropdown && matchesStats;
  });

    const paginatedActivities = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredEmployees.slice(startIndex, endIndex);
  }, [filteredEmployees,currentPage, itemsPerPage]);

  const handlePageChange = (page, perPage = itemsPerPage) => {
    setCurrentPage(page);
    if (perPage !== itemsPerPage) {
      setItemsPerPage(perPage);
      setCurrentPage(1); // Reset to first page when changing items per page
    }
  };

  const statsData = [
    {
      icon: <FaUsers />,
      label: "Total Auditors",
      value: counts.total,
      color: "primary",
      sections: [
        {
          items: [
            { label: "Team Lead", value: counts.VERIFIED.TL + counts.UNVERIFIED.TL, status: "info", subStatus: "TL" },
            { label: "Executive", value: counts.VERIFIED.EX + counts.UNVERIFIED.EX, status: "success", subStatus: "EX" }
          ]
        },
      ],
      onClick: () => setStatusFilter({ status: null, grade: null }),
      onItemClick: (item) => setStatusFilter({ status: null, grade: item.subStatus })

    },
    {
      icon: <FaUserCheck />,
      label: "Verified",
      value: counts.VERIFIED.TL + counts.VERIFIED.EX,
      color: "success",
      sections: [
        {
          items: [
            { label: "Team Lead", value: counts.VERIFIED.TL, status: "info", subStatus: "TL" },
            { label: "Executive", value: counts.VERIFIED.EX, status: "success", subStatus: "EX" }
          ]
        },
      ],
      onClick: () => setStatusFilter({ status: "VERIFIED", grade: null }),
      onItemClick: (item) => setStatusFilter({ status: "VERIFIED", grade: item.subStatus })
    },
    {
      icon: <FaUserTimes />,
      label: "Not verified",
      value: counts.UNVERIFIED.TL + counts.UNVERIFIED.EX,
      color: "secondary",
      sections: [
        {
          items: [
            { label: "Team Lead", value: counts.UNVERIFIED.TL, status: "info", subStatus: "TL" },
            { label: "Executive", value: counts.UNVERIFIED.EX, status: "success", subStatus: "EX" }
          ]
        },
      ],
      onClick: () => setStatusFilter({ status: "UNVERIFIED", grade: null }),
      onItemClick: (item) => setStatusFilter({ status: "UNVERIFIED", grade: item.subStatus })
    },
  ]

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleChangeFile = (field, value) => {
    setFormDataFile(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e, type = "doc") => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }
  if (type === "profile") {
    handleChangeFile("newProfileFile", file); // ✅ NEW
  } else {
    handleChangeFile("file", file); // existing
  }
  };

  const removeFile = () => { setFormDataFile((prev) => ({ ...prev, file: null, })) }

  const handleAddEmployee = async () => {
    if (!formData.emp_id || !formData.name || !formData.gender || !formData.dob || !formData.email_id || !formData.address_line_1) {
      toast.error('Please fill all required fields');
      return;
    }
    const today = new Date();
    const dob = new Date(formData.dob);

    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < dob.getDate())
    ) {
      age--;
    }

    if (age < 18) {
      toast.error("Employee must be at least 18 years old");
      return;
    }

    if (formData.mobile_number.length < 10) {
      toast.error("Employee mobile number must be 10 digits");
      return;
    }

    try {
      const appointeePayload = {
        emp_id: formData.o_emp_id || "",
        additional_ref_number: formData.emp_id || "",
        name: formData.name,
        gender: formData.gender,
        grade_id: formData.grade_level,
        dob: formatToDDMMYYYY(formData.dob),
        email_id: formData.email_id,
        mobile_number: formData.mobile_number,
        address_line_1: formData.address_line_1 || "",
        address_line_2: formData.address_line_2 || "",
        call_mode: modalMode === "ADD" ? 'ADD_RETAIN' : 'UPDATE_RETAIN',
        manager_mobile: profile.mobile_number
      };

      // console.log("appointeePayload", appointeePayload)
      // const res = { status: 200 }

      const res = await postAppointee(appointeePayload);
      if (res.status === 200) {
        toast.success(modalMode === "ADD" ? "Employee successfully added" : "Employee successfully updated")
        await getEmployeeList()
        setOpenModal(false);
        setModalMode("");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong. Please try again later!!!")
    }
  }

  const handleUploadFile = async (uploadMode) => {
    try {
      if (uploadMode === "P") {
        let call_mode = employeeDetails?.image ? "UPDATE_IMAGE" : "ADD_IMAGE";

        if (!formDataFile.newProfileFile) {
        toast.error("Please upload profile image");
        return;
      }

        const formdata = new FormData();
        formdata.append("emp_id", formDataFile.emp_id);
        formdata.append("call_mode", call_mode);
        if (formDataFile.newProfileFile && typeof formDataFile.newProfileFile !== 'string') {
          formdata.append("uploaded_file", formDataFile.newProfileFile);
        }
        // for (let [key, value] of formdata.entries()) {
        //   console.log(key, value);
        // }
        const res = await postAppointeeFile(formdata);
        // const res = { status: 200 }

        if (res && res.status === 200) {
          toast.success(call_mode === "ADD_IMAGE" ? "Profile Image successfully added!" : "Profile Image successfully updated!");
          await getEmployeeList();
          setOpenModal(false);
          setModalMode("");
          return;
        }
      } else {
        const hasGovtType = !!formDataFile.proofType;
        const hasGovtId = !!formDataFile.govt_id_number?.trim();
        const hasFile = !!formDataFile.file;
        let call_mode = formDataFile.isExisting ? "UPDATE" : "ADD";

        if (!hasGovtType) {
          toast.error("Govt ID type is required");
          return;
        }
        if (!hasGovtId) {
          toast.error("Govt ID number is required");
          return;
        }

        if (call_mode === "ADD" && !hasFile) {
          toast.error("Please upload a file");
          return;
        }

        if (call_mode === "UPDATE" && !hasFile) {
          toast.error("File cannot be empty in update");
          return;
        }

        const formdata = new FormData();

        formdata.append("emp_id", formDataFile.emp_id);
        formdata.append("govt_id_number", `${formDataFile.proofType}^${formDataFile.govt_id_number}`);
        formdata.append("call_mode", call_mode);
        if (formDataFile.file && typeof formDataFile.file !== 'string') {
          formdata.append("uploaded_file", formDataFile.file);
        }
        // for (let [key, value] of formdata.entries()) {
        //   console.log(key, value);
        // }
        const res = await postAppointeeFile(formdata);
        // const res = { status: 200 }

        if (res && res.status === 200) {
          toast.success(call_mode === "ADD" ? "Document successfully added!" : "Document successfully updated!");
          await getEmployeeList();
          setOpenModal(false);
          setModalMode("");
          return;
        }
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong. Please try again later!");
    }
  };

  return (
    <Layout title="Auditor Management">
      <Subtitle>
        <div>
          <p>View and manage all auditors</p>
        </div>

        <Button variant="primary" onClick={() => {
          setFormData({
            emp_id: "",
            name: "",
            gender: "M",
            email_id: "",
            grade_level: "RET-G1-TL",
            mobile_number: "",
            address_line_1: "",
            address_line_2: "",
            file: null
          });
          setOpenModal(true);
          setModalMode("ADD");
        }}>
          <FaPlus /> Add New Auditor
        </Button>
      </Subtitle>
      <StatsGrid>
        {statsData.map((stats) => <StatsCard icon={stats.icon} label={stats.label} value={stats.value} color={stats.color}
          sections={stats.sections} onClick={() => { stats.onClick(); window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }); }} onItemClick={(item) => { stats.onItemClick(item); window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }) }}
        />)}
      </StatsGrid>

      <Card hoverable={false}>
        <FilterRow>
          <SearchBox type="text" placeholder="Search Auditor's name, ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <FilterSelect
            name="selectedStatus"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="All">All</option>
            <option value="RET-G1-TL">Team Lead</option>
            <option value="RET-G1-EX">Executive</option>
          </FilterSelect>

          <Button variant="outline"
            onClick={() => {
              setSearchTerm("");
              setSelectedStatus("All");
              setStatusFilter(null);
            }}
          >
            Clear Filters
          </Button>
        </FilterRow>
        <Table>
          <thead>
            <tr>
              <th>System Ref ID<br />Auditor ID</th>
              <th>Name</th>
              <th>Mobile</th>
              <th>Grade</th>
              <th>Document?</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "1rem" }}>
                  Loading...
                </td>
              </tr>
            ) : paginatedActivities.length ? (
              paginatedActivities.map((employee) =>
              (<tr key={employee.id}>
                <td>{employee.emp_id}<br /><Badge variant={employee.gender === "M" ? "settle" : "pink"}>{employee.additional_ref_number || "--"}</Badge></td>
                <td>{employee.name}</td>
                <td>{employee.mobile_number || "--"}</td>
                <td><Badge variant={employee.grade_level <= 1 ? "info" : "forward"}>{employee.grade_level <= 1 ? "Executive" : "Team Lead"}</Badge></td>
                <td><Badge variant={employee.ref_govt_id_number && employee.emp_file_1 ? "success" : "error"}>{employee.ref_govt_id_number && employee.emp_file_1 ? "Yes" : "No"}</Badge></td>
                <td>
                  <Badge variant={employee.is_rejected ? "reject" : employee.is_verified ? 'success' : 'error'}>{employee.is_rejected ? "Rejected" : employee.is_verified ? 'Verified' : 'Not verified'}</Badge>
                </td>
                <td>
                  <BUttonGroup>
                    <Button title="View Deatils" iconOnly={true} onClick={() => { setEmployeeDetails(employee); setShowEmployeeDetails(true) }}>
                      <IoEyeOutline />
                    </Button>
                    <Button title="Upload Document" iconOnly={true} onClick={() => {
                      let pType = "";
                      let gNumber = employee.ref_govt_id_number || "";
                      if (gNumber.includes("^")) {
                        const parts = gNumber.split("^");
                        pType = parts[0];
                        gNumber = parts[1];
                      }
                      setFormDataFile({
                        emp_id: employee.emp_id,
                        proofType: pType,
                        govt_id_number: gNumber,
                        file: employee.emp_file_1 || null,
                        isExisting: !!(employee.ref_govt_id_number && employee.emp_file_1),
                        profile_img: employee.image,
                        newProfileFile: null
                      });
                      setModalMode("UPLOAD");
                      setOpenModal(true);
                      setEmployeeDetails(employee)
                    }}>
                      <RiUploadCloud2Line />
                    </Button>
                    <Button title="Update Details" onClick={() => {
                      setFormData({
                        o_emp_id: employee.emp_id,
                        emp_id: employee.additional_ref_number,
                        name: employee.name,
                        gender: employee.gender,
                        grade_level: employee.grade_level <= 1 ? "RET-G1-EX" : "RET-G1-TL",
                        dob: DateForApiFormate(employee.dob, true),
                        email_id: employee.email_id || "",
                        mobile_number: employee.mobile_number || "",
                        address_line_1: employee.address_line_1 || "",
                        address_line_2: employee.address_line_2 || "",
                      });
                      setOpenModal(true);
                      setModalMode("UPDATE");
                      setEmployeeDetails(employee)
                    }}>
                      <FaRegPenToSquare />
                    </Button>
                  </BUttonGroup>
                </td>
              </tr>))) : (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "1rem" }}>
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </Table>
         <PaginationComponent
                                              totalItems={filteredEmployees.length}
                                              itemsPerPage={itemsPerPage}
                                              currentPage={currentPage}
                                              onPageChange={handlePageChange}
                                              siblingCount={2}
                                            />
      </Card>

      {showEmployeeDetails && <EmployeeDetailModal employee={employeeDetails} onClose={() => { setEmployeeDetails(null); setShowEmployeeDetails(false) }} />}

      <AddAndUpdateForm
        isOpen={openModal}
        onClose={() => { setOpenModal(false); setModalMode(""); setEmployeeDetails(""); setFormDataFile({}) }}
        modalMode={modalMode}
        formData={formData}
        formDataFile={formDataFile}
        onChange={handleChange}
        onChangeUpload={handleChangeFile}
        onFileChange={handleFileChange}
        onSubmit={modalMode === "UPLOAD" ? handleUploadFile : handleAddEmployee}
        removeFile={removeFile}
        isLoading={isLoading}
        employeeDetails={employeeDetails}
      />
    </Layout>
  )
}

export default RetainerScreen