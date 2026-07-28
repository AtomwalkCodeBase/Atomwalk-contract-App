import { useEffect, useState } from "react"
import styled, { keyframes } from "styled-components"
import { FaUser, FaLock, FaShieldAlt, FaEye, FaEyeSlash } from "react-icons/fa"
import { useAuth } from "../context/AuthContext"
import { toast } from "react-toastify"
import { getCompanyName } from "../services/productServices"
import { useNavigate } from "react-router-dom"
import logo from '../assets/logo2.png';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`

const PageWrap = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primaryLight}, ${({ theme }) => theme.colors.background});
  padding: 2rem 1rem;
`

const LoginCard = styled.form`
  width: 100%;
  max-width: 420px;
  background: ${({ theme }) => theme.colors.card};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  box-shadow: ${({ theme }) => theme.shadows.xl};
  padding: 2.5rem 2rem 2rem;
  animation: ${fadeIn} 0.6s ease;
`

const IconBadge = styled.div`
  width: 56px;
  height: 56px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary});
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.4rem;
  margin: 0 auto 1rem;
  box-shadow: 0 6px 16px ${({ theme }) => theme.colors.shadow};
`

const PortalName = styled.div`
  text-align: center;
  font-weight: 700;
  letter-spacing: 0.06em;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 0.4rem;
`

const FormTitle = styled.h2`
  text-align: center;
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 0.4rem;
`

const FormSubtitle = styled.p`
  text-align: center;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textLight};
  margin-bottom: 2rem;
  line-height: 1.4;
`

const FormGroup = styled.div`
  margin-bottom: 1.25rem;
`

const FormLabel = styled.label`
  display: block;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  letter-spacing: 0.05em;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textLight};
  margin-bottom: 0.4rem;
  text-transform: uppercase;
`

const InputGroup = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  overflow: hidden;
  transition: ${({ theme }) => theme.transitions.normal};

  &:focus-within {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primaryLight};
    background: ${({ theme }) => theme.colors.card};
  }
`

const InputIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.9rem;
  color: ${({ theme }) => theme.colors.textLight};
`

const Input = styled.input`
  flex: 1;
  padding: 0.75rem 0.5rem 0.75rem 0;
  border: none;
  outline: none;
  background: transparent;
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-family: ${({ theme }) => theme.fonts.body};
  color: ${({ theme }) => theme.colors.text};

  &::placeholder {
    color: ${({ theme }) => theme.colors.border};
  }
`

const EyeToggle = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0 0.9rem;
  color: ${({ theme }) => theme.colors.textLight};
  display: flex;
  align-items: center;
`

const LoginButton = styled.button`
  width: 100%;
  padding: 0.85rem;
  margin-top: 0.5rem;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary});
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: 600;
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.normal};

  &:hover {
    opacity: 0.92;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 1.5rem 0 1rem;
  color: ${({ theme }) => theme.colors.textLight};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  letter-spacing: 0.05em;

  &::before, &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: ${({ theme }) => theme.colors.border};
  }
`

const FormFooterLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  font-size: ${({ theme }) => theme.fontSizes.sm};

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    cursor: pointer;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
`

const BrandHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  margin-bottom: 1.5rem;
`

const CompanyLogo = styled.img`
  height: 36px;
  width: auto;
  object-fit: contain;
`

const CompanyName = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};

  span {
    color: ${({ theme }) => theme.colors.primary};
  }
`

const PageFooter = styled.div`
  margin-top: 1.5rem;
  text-align: center;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.textLight};
  letter-spacing: 0.04em;
`

const Logins = () => {
  const [formData, setFormData] = useState({ mobile: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [showPin, setShowPin] = useState(false)
  const [companies, setCompanies] = useState([])
  const { customerlogin } = useAuth()
  const path = window.location.pathname
  const navigation = useNavigate()

  useEffect(() => {
    const fetchCompanyName = async () => {
      const company = await getCompanyName()
      if (company.status === 200) {
        if (path === "/retainer/login") {
          const filter = company.data?.filter(
            (data) => data.ref_cust_name === "DEMO Allocation Project Management (Atomwalk)"
          )
          setCompanies(filter)
          if (filter.length > 0) {
            setFormData((prev) => ({ ...prev, company: filter[0].name }))
            localStorage.setItem("dbName", filter[0].name.split("_").slice(1).join("_"))
          }
        } else {
          setCompanies(company.data)
        }
      }
    }
    fetchCompanyName()
    if (localStorage.getItem("customerToken")) {
      navigation("/dashboard")
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
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
    <PageWrap>
      <LoginCard onSubmit={handleSubmit}>
      <BrandHeader>
        <CompanyLogo src={logo} alt="Atomwalk logo" />
        {/* <CompanyName>Atom<span>walk</span></CompanyName> */}
      </BrandHeader>
        <FormTitle>Retainer & Associate Portal</FormTitle>
        <FormSubtitle>
          Manage assigned audits and update resource allocations securely.
        </FormSubtitle>

        <FormGroup>
          <FormLabel htmlFor="mobile">Mobile Number</FormLabel>
          <InputGroup>
            <InputIcon><FaUser /></InputIcon>
            <Input
              type="text"
              id="mobile"
              name="mobile"
              placeholder="Enter your mobile number"
              value={formData.mobile}
              onChange={handleChange}
              required
            />
          </InputGroup>
        </FormGroup>

        <FormGroup>
          <FormLabel htmlFor="password">Security Pin</FormLabel>
          <InputGroup>
            <InputIcon><FaLock /></InputIcon>
            <Input
              type={showPin ? "text" : "password"}
              id="password"
              name="password"
              placeholder="Enter your pin"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <EyeToggle type="button" onClick={() => setShowPin((v) => !v)}>
              {showPin ? <FaEyeSlash /> : <FaEye />}
            </EyeToggle>
          </InputGroup>
        </FormGroup>

        <LoginButton type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login to Portal"}
        </LoginButton>

        <Divider></Divider>

        <FormFooterLinks>
          <a>Forgot Pin?</a>
          <a>Need Help?</a>
        </FormFooterLinks>
      </LoginCard>

      {/* <PageFooter>© 2024 ATOMWALK MANAGEMENT SOLUTIONS</PageFooter> */}
    </PageWrap>
  )
}

export default Logins