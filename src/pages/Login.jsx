import { useEffect, useState } from "react"
import styled, { keyframes } from "styled-components"
import { FaUser, FaLock, FaBuilding } from "react-icons/fa"
import { useAuth } from "../context/AuthContext"
import { toast } from "react-toastify"
import { getCompanyName } from "../services/productServices"
import { useNavigate } from "react-router-dom"

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const LoginContainer = styled.div`
  display: flex;
  min-height: 100vh;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`

const LoginBanner = styled.div`
  flex: 1;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary});
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  color: white;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`

const BannerContent = styled.div`
  max-width: 500px;
  animation: ${fadeIn} 1s ease;
     @media (max-width: 768px) {
    margin-top: 100px;
  }
`

const BannerTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`

const BannerText = styled.p`
  font-size: 1.1rem;
  margin-bottom: 2rem;
  opacity: 0.9;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`

const LoginFormContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background: ${({ theme }) => theme.colors.background};
  animation: ${fadeIn} 1s ease 0.3s backwards;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`

const LoginForm = styled.form`
  width: 100%;
  max-width: 400px;
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  margin-top: 80px;
`

const FormTitle = styled.h2`
  text-align: center;
  margin-bottom: 2rem;
  color: ${({ theme }) => theme.colors.primary};
`

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`

const FormLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`

const InputGroup = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:focus-within {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primaryLight};
  }
`

const InputIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 1rem;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  color: ${({ theme }) => theme.colors.textLight};
`

const Input = styled.input`
  flex: 1;
  padding: 0.75rem;
  border: none;
  outline: none;
  font-size: 1rem;
`

const LoginButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary}dd;
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`

const FormFooter = styled.div`
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textLight};
  
  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`

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
const Link = styled.a`
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }`

const Logins = () => {
  const [formData, setFormData] = useState({
    mobile: "",
    password: "",
    company: "",
  })
  // const [company, setCompany] = useState("")
  const [loading, setLoading] = useState(false)
  const [companies, setCompanies] = useState([])
  const [placeholderdatas, setPlaceholderdatas] = useState("Mobile Number");
  const { customerlogin } = useAuth()
  const path = window.location.pathname;
  const navigation = useNavigate()

  useEffect(() => {
    const fetchCompanyName = async () => {
      const company = await getCompanyName()
      if (company.status === 200) {
        if (path === "/retainer/login") {

          const filter = company.data?.filter(
            (data) => data.ref_cust_name === "DEMO Allocation Project Management (Atomwalk)"
            // (data) => data.ref_cust_name === "Allocation Project Management (Matrix)"
          );

          setCompanies(filter);

          // auto select demo area
          if (filter.length > 0) {
            setFormData((prev) => ({
              ...prev,
              company: filter[0].name,
            }));

            localStorage.setItem(
              "dbName",
              filter[0].name.split("_").slice(1).join("_")
            );
          }
        } else {
          setCompanies(company.data)
          // console.log(company.data)
        }
      }
    }
    fetchCompanyName()
    if(localStorage.getItem("customerToken")){
        navigation("/dashboard")
      }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCompanyChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      company: e.target.value,
    }))
    localStorage.setItem("dbName", e.target.value.split("_").slice(1).join("_"))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // Simulate API call
    setTimeout(async () => {
      if (formData.mobile && formData.password) {
        const userData = {
          mobile: formData.mobile,
          password: formData.password,
          company: formData?.company?.split("_").slice(1).join("_") || "Acme Inc.",
        }
        await customerlogin(userData)
      } else {
        toast.error("Invalid credentials. Please try again.")
      }
      setLoading(false)
    }, 500)
  }

  return (
    <LoginContainer>
      <LoginBanner>
        <BannerContent>
          <BannerTitle>Welcome to Atomwalk</BannerTitle>
          <BannerText>
            A comprehensive retainer and associate auditors management portal.
          </BannerText>
        </BannerContent>
      </LoginBanner>

      <LoginFormContainer>
        <LoginForm onSubmit={handleSubmit}>
          <FormTitle>Login to your account</FormTitle>
          {/* <FormGroup>
            <FormLabel htmlFor="company">Company</FormLabel>
            <InputGroup>
              <InputIcon>
                <FaBuilding />
              </InputIcon>
              <FormSelect
                id="company"
                name="company"
                value={formData.company}
                onChange={handleCompanyChange}
                required
              >
                <option value="" disabled>
                  Select your company
                </option>
                {companies.map((company) => (
                  <option key={company.id} value={company.name}>
                    {company.ref_cust_name}
                  </option>
                ))}
              </FormSelect>
            </InputGroup>
          </FormGroup> */}
          <FormGroup>
            <FormLabel htmlFor="mobile">{placeholderdatas}</FormLabel>
            <InputGroup>
              <InputIcon>
                <FaUser />
              </InputIcon>
              <Input
                type="text"
                id="mobile"
                name="mobile"
                placeholder={"Enter your " + placeholderdatas}
                value={formData.mobile}
                onChange={handleChange}
                required
              />
            </InputGroup>
          </FormGroup>

          <FormGroup>
            <FormLabel htmlFor="password">Pin</FormLabel>
            <InputGroup>
              <InputIcon>
                <FaLock />
              </InputIcon>
              <Input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your pin"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </InputGroup>
          </FormGroup>

          <LoginButton type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </LoginButton>
          {/* { placeholderdatas==="Employee ID" ?

          <FormFooter onClick={() => setPlaceholderdatas("Mobile Number")}>
            <Link>Login With Mobile Number</Link>
          </FormFooter>
          :
          <FormFooter onClick={() => setPlaceholderdatas("Employee ID")}>
            <Link>Login With Employee ID</Link>
          </FormFooter>
          } */}
        </LoginForm>
      </LoginFormContainer>
    </LoginContainer>
  )
}

export default Logins

