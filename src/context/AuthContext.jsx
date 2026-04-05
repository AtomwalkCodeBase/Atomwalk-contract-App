import { createContext, useState, useEffect, useContext } from "react"
import { publicAxiosRequest } from "../services/HttpMethod"
import { customerslogin } from "../services/ConstantServies"
import { getCompanyInfo, getEmployeeInfo } from "../services/authServices"
// import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { getCustomerDetailList } from "../services/productServices"

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState([])
  const [companyInfo, setCompanyInfo] = useState([])
  const [error, setError] = useState("")
  // const navigate = useNavigate()
  useEffect(() => {
  
    const fetchcustomerProfile = async () => {
      const custId = localStorage.getItem("custId");
      try {
        const res = await getCustomerDetailList(custId);
        setProfile(res?.data[0]);
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };
    if(currentUser){
      fetchcustomerProfile();
    }


  }, [])


  const logout = () => {
      localStorage.removeItem("customerToken")
      localStorage.removeItem("custId")
      localStorage.removeItem("customerUser")
      toast.success("Logout successful!");
      window.location.href = "/retainer/login.html";
    localStorage.removeItem("dbName")
    localStorage.removeItem("userToken")
    localStorage.removeItem("cust_emp_id")
    setCurrentUser(null)
  }
  const customerlogin = async (userData) => {
    try {
      const payload = {
        mobile_number: userData.mobile,
        pin: userData.password,
      }

      const response = await publicAxiosRequest.post(customerslogin + `${userData.company}/`, payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.status === 200) {
        const { token, customer_id, cust_emp_id } = response.data;
        localStorage.setItem('customerToken', token);
        localStorage.setItem('custId', String(customer_id));
        localStorage.setItem('cust_emp_id', String(cust_emp_id));
        localStorage.setItem('customerUser', JSON.stringify(userData));
        // const user = localStorage.getItem("customerUser")
        setCurrentUser(userData)
        toast.success("Login successful!");
        window.location.href = "/retainer/dashboard";
      }
    }
    catch (error) {
      console.log("Login error:", error.response.data.error);
      toast.error(error.response.data.error);
    }
  }


  const value = {
    currentUser,
    logout,
    loading,
    profile,
    companyInfo,
    error,
    customerlogin,
  }

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}

