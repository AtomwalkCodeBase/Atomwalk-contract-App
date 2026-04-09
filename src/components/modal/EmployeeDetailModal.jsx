import React from "react";
import styled, { keyframes } from "styled-components";
import {
  FiX,
  FiUser,
  FiBriefcase,
  FiMail,
  FiPhone,
  FiCalendar,
  FiShield,
  FiMapPin,
  FiFileText,
  FiCheckCircle,
  FiAlertCircle,
  FiImage,
  FiEye,
    FiExternalLink,
} from "react-icons/fi";
import { theme } from "../../styles/Theme";

// ─── Animations ───────────────────────────────────────────────────────────────
const fadeIn = keyframes`from { opacity: 0; } to { opacity: 1; }`;
const slideUp = keyframes`from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); }`;

// ─── Overlay ──────────────────────────────────────────────────────────────────
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(20, 18, 50, 0.5);
  backdrop-filter: blur(3px);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.md};
  animation: ${fadeIn} 0.2s ease;
`;

const Modal = styled.div`
  background: ${theme.colors.card};
  border-radius: ${theme.borderRadius.xl};
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: ${theme.shadows.xl};
  animation: ${slideUp} 0.25s ease;
  font-family: ${theme.fonts.body};

  @media (max-width: ${theme.breakpoints.sm}) {
    max-height: 95vh;
    border-radius: ${theme.borderRadius.lg};
  }
`;

// ─── Header ───────────────────────────────────────────────────────────────────
const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing.lg} ${theme.spacing.xl};
  border-bottom: 1px solid ${theme.colors.border};
  position: sticky;
  top: 0;
  background: ${theme.colors.card};
  z-index: 1;
  border-radius: ${theme.borderRadius.xl} ${theme.borderRadius.xl} 0 0;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const HeaderAvatar = styled.div`
  width: 42px;
  height: 42px;
  border-radius: ${theme.borderRadius.lg};
  background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary});
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: ${theme.fontSizes.md};
  font-weight: 700;
  flex-shrink: 0;
`;

const HeaderText = styled.div``;

const HeaderTitle = styled.h2`
  margin: 0;
  font-size: ${theme.fontSizes.lg};
  font-weight: 700;
  color: ${theme.colors.text};
  line-height: 1.2;
`;

const HeaderSub = styled.p`
  margin: 0;
  font-size: ${theme.fontSizes.xs};
  color: ${theme.colors.textLight};
`;

const CloseBtn = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  border-radius: ${theme.borderRadius.lg};
  background: ${theme.colors.backgroundAlt};
  color: ${theme.colors.textLight};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  flex-shrink: 0;
  transition: all ${theme.transitions.fast};

  &:hover {
    background: ${theme.colors.border};
    color: ${theme.colors.text};
  }
`;

// ─── Body ─────────────────────────────────────────────────────────────────────
const ModalBody = styled.div`
  padding: ${theme.spacing.xl};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

// ─── Section ─────────────────────────────────────────────────────────────────
const Section = styled.div``;

const SectionLabel = styled.div`
  font-size: ${theme.fontSizes.xs};
  font-weight: 600;
  color: ${theme.colors.textLight};
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin-bottom: ${theme.spacing.sm};
  padding-bottom: ${theme.spacing.xs};
  border-bottom: 1px solid ${theme.colors.border};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.sm};

  @media (max-width: ${theme.breakpoints.xs}) {
    grid-template-columns: 1fr;
  }
`;

// ─── Field ────────────────────────────────────────────────────────────────────
const Field = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${theme.colors.background};
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid ${theme.colors.border};

  ${({ $full }) => $full && `grid-column: 1 / -1;`}
`;

const FieldIcon = styled.div`
  width: 28px;
  height: 28px;
  border-radius: ${theme.borderRadius.md};
  background: ${theme.colors.primaryLight};
  color: ${theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  flex-shrink: 0;
  margin-top: 1px;
`;

const FieldContent = styled.div`
  min-width: 0;
  flex: 1;
`;

const FieldLabel = styled.div`
  font-size: ${theme.fontSizes.xs};
  color: ${theme.colors.textLight};
  font-weight: 500;
  margin-bottom: 2px;
`;

const FieldValue = styled.div`
  font-size: ${theme.fontSizes.sm};
  color: ${({ $empty }) => $empty ? theme.colors.border : theme.colors.text};
  font-weight: 600;
  word-break: break-word;
`;

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: ${theme.borderRadius.xl};
  font-size: ${theme.fontSizes.xs};
  font-weight: 600;
  background: ${({ $verified }) => $verified ? "#E6F9F0" : "#FFF4E5"};
  color: ${({ $verified }) => $verified ? theme.colors.success : "#E67E00"};
`;

// ─── Footer ───────────────────────────────────────────────────────────────────
const ModalFooter = styled.div`
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  border-top: 1px solid ${theme.colors.border};
  display: flex;
  justify-content: flex-end;
`;

const CloseFullBtn = styled.button`
  padding: 9px ${theme.spacing.xl};
  border-radius: ${theme.borderRadius.lg};
  border: 1.5px solid ${theme.colors.border};
  background: transparent;
  color: ${theme.colors.textLight};
  font-family: ${theme.fonts.body};
  font-size: ${theme.fontSizes.sm};
  font-weight: 600;
  cursor: pointer;
  transition: all ${theme.transitions.fast};

  &:hover {
    border-color: ${theme.colors.text};
    color: ${theme.colors.text};
  }
`;
const FilePreviewBox = styled.div`
  margin-top: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.lg};
  overflow: hidden;
  border: 1px solid ${theme.colors.border};
`;

const FileImage = styled.img`
  width: 100%;
  max-height: 160px;
  object-fit: contain;
  aspect-ration: 1:1;
  display: block;
`;

const FileDocRow = styled.a`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px ${theme.spacing.md};
  background: ${theme.colors.primaryLight};
  color: ${theme.colors.primary};
  font-size: ${theme.fontSizes.sm};
  font-weight: 600;
  text-decoration: none;
  border-radius: ${theme.borderRadius.lg};
  transition: background ${theme.transitions.fast};

  &:hover {
    background: ${theme.colors.primary};
    color: white;
  }

  svg { flex-shrink: 0; }
  span { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
`;

const NoFile = styled.div`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.border};
  font-weight: 600;
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getInitials = (name = "") =>
  name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

const display = (val) => (val === null || val === undefined || val === "") ? "—" : String(val);
const isEmpty = (val) => val === null || val === undefined || val === "";

// ─── Component ────────────────────────────────────────────────────────────────
const EmployeeDetailModal = ({ employee, onClose }) => {
  if (!employee) return null;

  const isImageUrl = (url) => /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(url);

  const proofType = (gNumber) => {
  if (!gNumber) return { typeName: "--", number: "--" };
  
  if (gNumber.includes("^")) {
    const parts = gNumber.split("^");
    const pType = parts[0];
    const number = parts[1] || "--";
    
    const typeMap = { "A": "Aadhar Card", "P": "Pan Card", "D": "Driving License"};
    const typeName = typeMap[pType] || "--";
    
    return { typeName, number };
  }
  return { typeName: "--", number: gNumber };
}

const GovtIDProof = proofType(employee.ref_govt_id_number)

  return (
    <Overlay onClick={(e) => e.target === e.currentTarget && onClose()}>
      <Modal>
        {/* Header */}
        <ModalHeader>
          <HeaderLeft>
            <HeaderAvatar>{getInitials(employee.name)}</HeaderAvatar>
            <HeaderText>
              <HeaderTitle>{employee.name}</HeaderTitle>
              <HeaderSub>{employee.emp_id} · {employee.department_name}</HeaderSub>
            </HeaderText>
          </HeaderLeft>
          <CloseBtn onClick={onClose}><FiX /></CloseBtn>
        </ModalHeader>

        {/* Body */}
        <ModalBody>

          {/* Personal Info */}
          <Section>
            <SectionLabel>Personal Information</SectionLabel>
            <Grid>
              <Field>
                <FieldIcon><FiUser /></FieldIcon>
                <FieldContent>
                  <FieldLabel>Full Name</FieldLabel>
                  <FieldValue>{display(employee.name)}</FieldValue>
                </FieldContent>
              </Field>

              <Field>
                <FieldIcon><FiBriefcase /></FieldIcon>
                <FieldContent>
                  <FieldLabel>Employee ID</FieldLabel>
                  <FieldValue>{display(employee.additional_ref_number)}</FieldValue>
                </FieldContent>
              </Field>

              <Field>
                <FieldIcon><FiUser /></FieldIcon>
                <FieldContent>
                  <FieldLabel>Gender</FieldLabel>
                  <FieldValue $empty={isEmpty(employee.gender)}>
                    {employee.gender === "M" ? "Male" : employee.gender === "F" ? "Female" : display(employee.gender)}
                  </FieldValue>
                </FieldContent>
              </Field>

              <Field>
                <FieldIcon><FiCalendar /></FieldIcon>
                <FieldContent>
                  <FieldLabel>Date of Birth</FieldLabel>
                  <FieldValue $empty={isEmpty(employee.dob)}>{display(employee.dob)}</FieldValue>
                </FieldContent>
              </Field>

              <Field>
                <FieldIcon><FiBriefcase /></FieldIcon>
                <FieldContent>
                  <FieldLabel>Grade Level</FieldLabel>
                  <FieldValue $empty={isEmpty(employee.grade_level)}>{employee.grade_level <=1 ? "Executive" : "Team Lead"}</FieldValue>
                </FieldContent>
              </Field>

              <Field>
                <FieldIcon><FiShield /></FieldIcon>
                <FieldContent>
                  <FieldLabel>Verification Status</FieldLabel>
                  <StatusBadge $verified={employee.is_verified}>
                    {employee.is_verified
                      ? <><FiCheckCircle /> Verified</>
                      : <><FiAlertCircle /> Pending</>}
                  </StatusBadge>
                </FieldContent>
              </Field>
            </Grid>
          </Section>

          {/* Contact */}
          <Section>
            <SectionLabel>Contact Details</SectionLabel>
            <Grid>
              <Field>
                <FieldIcon><FiPhone /></FieldIcon>
                <FieldContent>
                  <FieldLabel>Mobile Number</FieldLabel>
                  <FieldValue $empty={isEmpty(employee.mobile_number)}>{display(employee.mobile_number)}</FieldValue>
                </FieldContent>
              </Field>

              <Field>
                <FieldIcon><FiMail /></FieldIcon>
                <FieldContent>
                  <FieldLabel>Email ID</FieldLabel>
                  <FieldValue $empty={isEmpty(employee.email_id)}>{display(employee.email_id)}</FieldValue>
                </FieldContent>
              </Field>
            </Grid>
          </Section>

          {/* Identity */}
          {/* Identity */}
<Section>
  <SectionLabel>Identity</SectionLabel>
  <Grid>
    <Field>
      <FieldIcon><FiFileText /></FieldIcon>
      <FieldContent>
        <FieldLabel>Govt. ID Type</FieldLabel>
        <FieldValue>
          {GovtIDProof.typeName}
        </FieldValue>
      </FieldContent>
    </Field>
    <Field>
      <FieldIcon><FiFileText /></FieldIcon>
      <FieldContent>
        <FieldLabel>Govt. ID Number</FieldLabel>
        <FieldValue>
          {GovtIDProof.number}
        </FieldValue>
      </FieldContent>
    </Field>

    <Field $full>
      <FieldIcon><FiImage /></FieldIcon>
      <FieldContent>
        <FieldLabel>Uploaded Document</FieldLabel>
        {isEmpty(employee.emp_file_1) ? (
          <NoFile>—</NoFile>
        ) : isImageUrl(employee.emp_file_1) ? (
          <FilePreviewBox>
            <FileImage src={employee.emp_file_1} alt="ID Document" />
          </FilePreviewBox>
        ) : (
          <FileDocRow href={employee.emp_file_1} target="_blank" rel="noopener noreferrer">
            <FiEye />
            <span>View Document</span>
            <FiExternalLink />
          </FileDocRow>
        )}
      </FieldContent>
    </Field>
  </Grid>
</Section>

          {/* Address */}
          <Section>
            <SectionLabel>Address</SectionLabel>
            <Grid>
              <Field $full>
                <FieldIcon><FiMapPin /></FieldIcon>
                <FieldContent>
                  <FieldLabel>Address Line 1</FieldLabel>
                  <FieldValue $empty={isEmpty(employee.address_line_1)}>{display(employee.address_line_1)}</FieldValue>
                </FieldContent>
              </Field>
              <Field $full>
                <FieldIcon><FiMapPin /></FieldIcon>
                <FieldContent>
                  <FieldLabel>Address Line 2</FieldLabel>
                  <FieldValue $empty={isEmpty(employee.address_line_2)}>{display(employee.address_line_2)}</FieldValue>
                </FieldContent>
              </Field>
            </Grid>
          </Section>

        </ModalBody>

        <ModalFooter>
          <CloseFullBtn onClick={onClose}>Close</CloseFullBtn>
        </ModalFooter>
      </Modal>
    </Overlay>
  );
};

export default EmployeeDetailModal;