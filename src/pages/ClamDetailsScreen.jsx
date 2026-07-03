import React, { useMemo, useState } from "react";
import styled from "styled-components";
import { FaCalendarAlt, FaMapMarkerAlt, FaUserTie, FaUser, FaPlus, FaFileInvoiceDollar, FaFileAlt, FaChevronDown, FaChevronUp, FaArrowLeft } from "react-icons/fa";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Badge from "../components/Badge";
import Button from "../components/Button";
import AddOPEModal from "../components/modal/AddOPEModal";
import { useLocation, useNavigate } from "react-router-dom";

/* ---------------------------------- */
/* Dummy Data                          */
/* ---------------------------------- */

const DUMMY_ACTIVITY = {
  customer_name: "Blue Ocean Exports Pvt Ltd",
  order_item_key: "ORD-2026-00417 / ITEM-03",
  location: "Kochi, Kerala",
  start_date: "2026-07-01",
  end_date: "2026-07-05",
  required_tl: 2,
  required_ex: 5,
};

const DUMMY_DATE_ROWS = [
  {
    date: "2026-07-01",
    tl_count: 2,
    tl_rate: 1500,
    ex_count: 5,
    ex_rate: 800,
    claim_amount: 650,
  },
  {
    date: "2026-07-02",
    tl_count: 2,
    tl_rate: 1500,
    ex_count: 4,
    ex_rate: 800,
    claim_amount: 420,
  },
  {
    date: "2026-07-03",
    tl_count: 1,
    tl_rate: 1500,
    ex_count: 5,
    ex_rate: 800,
    claim_amount: 900,
  },
  {
    date: "2026-07-04",
    tl_count: 2,
    tl_rate: 1500,
    ex_count: 5,
    ex_rate: 800,
    claim_amount: 0,
  },
  {
    date: "2026-07-05",
    tl_count: 2,
    tl_rate: 1500,
    ex_count: 3,
    ex_rate: 800,
    claim_amount: 300,
  },
];

const DUMMY_CLAIMS = [
  { id: "CLM-0091", date: "2026-07-01", category: "Travel", amount: 450, remarks: "Local transport for TL team", file: "#" },
  { id: "CLM-0092", date: "2026-07-01", category: "Food", amount: 200, remarks: "Lunch allowance", file: "#" },
  { id: "CLM-0093", date: "2026-07-02", category: "Travel", amount: 420, remarks: "Auto fare - site visit", file: "#" },
  { id: "CLM-0094", date: "2026-07-03", category: "Miscellaneous", amount: 900, remarks: "Equipment rental", file: "#" },
  { id: "CLM-0095", date: "2026-07-05", category: "Food", amount: 300, remarks: "Team dinner", file: "#" },
];

/* ---------------------------------- */
/* Helpers                             */
/* ---------------------------------- */

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
};

const formatDayLabel = (dateStr) => {
  return new Date(dateStr).toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" });
};

const currency = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const Tagline = styled.p`
 color: ${({ theme }) => theme.colors.textLight};
`

const ClaimsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.5rem;
  }
`;

const InfoStrip = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-bottom: 1rem;
`;

const InfoPill = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.75rem;
  background: ${({ theme }) => theme.colors?.backgroundAlt || "#f4f4f6"};
  border-radius: 20px;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors?.text || "#333"};

  span {
    font-weight: 600;
    color: ${({ theme }) => theme.colors?.textLight || "#777"};
  }
`;

const SectionTitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: ${({ theme }) => theme.spacing?.sm || "1rem"} ${({ theme }) => theme.spacing?.md || "1rem"};
`;

const SectionTitle = styled.h4`
  font-size: 0.85rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors?.text || "#222"};
  margin: 0;
`;

const DateBlock = styled.div`
  border: 1px solid ${({ theme }) => theme.colors?.border || "#e5e7eb"};
  border-radius: 8px;
  margin-bottom: 0.75rem;
  overflow: hidden;
`;

const DateHeader = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.65rem 0.9rem;
  background: ${({ theme }) => theme.colors?.backgroundAlt || "#fafafa"};
  border: none;
  cursor: pointer;
  text-align: left;
`;

const HeaderDate = styled.span`
  font-size: 0.78rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors?.text || "#222"};
`;

const HeaderSummary = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.72rem;
  color: ${({ theme }) => theme.colors?.textLight || "#777"};
`;

const DateBody = styled.div`
  padding: 0.85rem 0.9rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
`;

const StatBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
`;

const StatLabel = styled.span`
  font-size: 0.62rem;
  text-transform: uppercase;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.textLight || "#999"};
`;

const StatValue = styled.span`
  font-size: 0.85rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors?.text || "#222"};
`;

const TotalsFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1.5rem;
  padding: 0.6rem 0.9rem;
  background: ${({ theme }) => theme.colors?.backgroundAlt || "#fafafa"};
  border-top: 1px dashed ${({ theme }) => theme.colors?.border || "#e5e7eb"};
  font-size: 0.75rem;
  font-weight: 600;
`;

const FooterText = styled.span`
  color: ${({ theme }) => theme.colors?.textLight || "#e5e7eb"};
`;


const GrandTotalBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding: 0.85rem 1rem;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors?.primary ? `${theme.colors.primary}12` : "#6C5CE712"};
  font-size: 0.85rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors?.primary || "#6C5CE7"};
`;

const ClaimsTable = styled.div`
  display: grid;
  grid-template-columns: 1.1fr 1fr 1fr 1fr 1.4fr 0.7fr;
  border: 1px solid ${({ theme }) => theme.colors?.border || "#e5e7eb"};
  border-radius: 8px;
  overflow: hidden;
`;

const ClaimsHeaderRow = styled.div`
  display: contents;
  > span {
    background: ${({ theme }) => theme.colors?.backgroundAlt || "#f4f4f6"};
    font-size: 0.65rem;
    text-transform: uppercase;
    font-weight: 700;
    color: ${({ theme }) => theme.colors?.textLight || "#777"};
    padding: 0.55rem 0.75rem;
  }
`;

const ClaimsRow = styled.div`
  display: contents;
  > span, > a {
    padding: 0.6rem 0.75rem;
    font-size: 0.75rem;
    border-top: 1px solid ${({ theme }) => theme.colors?.border || "#eee"};
    display: flex;
    align-items: center;
  }
`;

const FileLink = styled.a`
  color: ${({ theme }) => theme.colors?.primary || "#6C5CE7"};
  font-weight: 600;
  text-decoration: none;
  gap: 0.3rem;
  &:hover { text-decoration: underline; }
`;

const EmptyRow = styled.div`
  padding: 1rem;
  text-align: center;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors?.textLight || "#999"};
`;

/* ---------------------------------- */
/* Main Component                      */
/* ---------------------------------- */

const ClamDetailsScreen = () => {
    const navigate = useNavigate();
const location = useLocation();
  const [openOpeModal, setOpenOpeModal] = useState(false);
  const [expandedDate, setExpandedDate] = useState(DUMMY_DATE_ROWS[0]?.date || null);
  const [claims] = useState(DUMMY_CLAIMS);
  const dateRows = DUMMY_DATE_ROWS;
  const activityData = location.state?.data || DUMMY_ACTIVITY;
  const activity = activityData;

  const claimsByDate = useMemo(() => {
    const map = {};
    claims.forEach((c) => {
      if (!map[c.date]) map[c.date] = [];
      map[c.date].push(c);
    });
    return map;
  }, [claims]);

  const grandTlTotal = dateRows.reduce((sum, r) => sum + r.tl_count * r.tl_rate, 0);
  const grandExTotal = dateRows.reduce((sum, r) => sum + r.ex_count * r.ex_rate, 0);
  const grandClaimTotal = claims.reduce((sum, c) => sum + c.amount, 0);
  const grandTotal = grandTlTotal + grandExTotal + grandClaimTotal;

  const toggleDate = (date) => {
    setExpandedDate((prev) => (prev === date ? null : date));
  };


  const handleAddClaim = () => {
    setOpenOpeModal(true);
  };

  return (
    <Layout title="Clam Details ">
      <ClaimsHeader>
        <Tagline>Claim Detailed view</Tagline>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button size="md" onClick={() => window.history.back()}>
            <FaArrowLeft />Back
          </Button>
        </div>
      </ClaimsHeader>
      <Card title="Activity Details" hoverable={false}>
        <InfoStrip>
          <InfoPill>
            <FaCalendarAlt size={11} />
            <span>Duration:</span>
            {formatDate(activity.start_date)} – {formatDate(activity.end_date)}
          </InfoPill>
          <InfoPill>
            <FaFileAlt size={11} />
            <span>Customer:</span>
            {activity.customer_name}
          </InfoPill>
          <InfoPill>
            <FaFileAlt size={11} />
            <span>Order Item:</span>
            {activity.order_item_key}
          </InfoPill>
          <InfoPill>
            <FaUserTie size={11} />
            <span>Required TL:</span>
            {activity.required_tl}
          </InfoPill>
          <InfoPill>
            <FaUser size={11} />
            <span>Required EX:</span>
            {activity.required_ex}
          </InfoPill>
        </InfoStrip>
        <InfoPill>
          <FaMapMarkerAlt size={11} />
          <span>Location:</span>
          {activity.location}
        </InfoPill>
      </Card>

      <Card hoverable={false} style={{ marginTop: "1rem" }} title="Resource & Claim Summary (Date-wise)">
        {/* <SectionTitleRow>
          <SectionTitle>Resource & Claim Summary (Date-wise)</SectionTitle>
        </SectionTitleRow> */}

        {dateRows.length === 0 ? (
          <EmptyRow>No data available</EmptyRow>
        ) : (
          dateRows.map((row) => {
            const tlTotal = row.tl_count * row.tl_rate;
            const exTotal = row.ex_count * row.ex_rate;
            const dayTotal = tlTotal + exTotal + row.claim_amount;
            const isOpen = expandedDate === row.date;
            const dayClaims = claimsByDate[row.date] || [];

            return (
              <DateBlock key={row.date}>
                {/* <DateHeader onClick={() => toggleDate(row.date)}> */}
                <DateHeader  onClick={() =>
            navigate("/resource-list", {
                state: { data: activityData },
            })
        }>
                  <HeaderDate>{formatDayLabel(row.date)}</HeaderDate>
                  <HeaderSummary onClick={() => toggleDate(row.date)}>
                    <Badge variant="forward" style={{ fontSize: "0.62rem" }}>TL {row.tl_count}</Badge>
                    <Badge variant="info" style={{ fontSize: "0.62rem" }}>EX {row.ex_count}</Badge>
                    <span>Total: <strong>{currency(dayTotal)}</strong></span>
                    {isOpen ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
                  </HeaderSummary>
                </DateHeader>

                {isOpen && (
                  <>
                    <DateBody>
                      <StatBox>
                        <StatLabel>Total TL</StatLabel>
                        <StatValue>{row.tl_count} × {currency(row.tl_rate)}</StatValue>
                      </StatBox>
                      <StatBox>
                        <StatLabel>TL Total Amount</StatLabel>
                        <StatValue>{currency(tlTotal)}</StatValue>
                      </StatBox>
                      <StatBox>
                        <StatLabel>Total EX</StatLabel>
                        <StatValue>{row.ex_count} × {currency(row.ex_rate)}</StatValue>
                      </StatBox>
                      <StatBox>
                        <StatLabel>EX Total Amount</StatLabel>
                        <StatValue>{currency(exTotal)}</StatValue>
                      </StatBox>
                      <StatBox>
                        <StatLabel>Claims ({dayClaims.length})</StatLabel>
                        <StatValue>{currency(row.claim_amount)}</StatValue>
                      </StatBox>
                    </DateBody>
                    <TotalsFooter>
                      <FooterText>Resource Cost: {currency(tlTotal + exTotal)}</FooterText>
                      <FooterText>Claim Amount: {currency(row.claim_amount)}</FooterText>
                      <FooterText>Day Total: {currency(dayTotal)}</FooterText>
                    </TotalsFooter>
                  </>
                )}
              </DateBlock>
            );
          })
        )}

        <GrandTotalBar>
          <span>Resource Cost (TL + EX): {currency(grandTlTotal + grandExTotal)}</span>
          <span>Grand Total (incl. Claims): {currency(grandTotal)}</span>
        </GrandTotalBar>
      </Card>

      <Card hoverable={false} style={{ marginTop: "1rem" }} title={
        <>
          <FaFileInvoiceDollar size={12} style={{ marginRight: "0.4rem" }} />
          Claims ({claims.length})
        </>
      }

        headerAction={<Button variant="primary" onClick={handleAddClaim}>
          <FaPlus size={11} style={{ marginRight: "0.35rem" }} />
          Add Claim
        </Button>}
      >
        {/* <SectionTitleRow>
          <SectionTitle>
            <FaFileInvoiceDollar size={12} style={{ marginRight: "0.4rem" }} />
            Claims ({claims.length})
          </SectionTitle>
          <Button variant="primary" onClick={handleAddClaim}>
            <FaPlus size={11} style={{ marginRight: "0.35rem" }} />
            Add Claim
          </Button>
        </SectionTitleRow> */}

        {claims.length === 0 ? (
          <EmptyRow>No claims submitted yet</EmptyRow>
        ) : (
          <ClaimsTable>
            <ClaimsHeaderRow>
              <span>Claim ID</span>
              <span>Date</span>
              <span>Category</span>
              <span>Amount</span>
              <span>Remarks</span>
              <span>File</span>
            </ClaimsHeaderRow>
            {claims.map((c) => (
              <ClaimsRow key={c.id}>
                <FooterText>{c.id}</FooterText>
                <FooterText>{formatDate(c.date)}</FooterText>
                <span><Badge variant="info" style={{ fontSize: "0.62rem" }}>{c.category}</Badge></span>
                <FooterText>{currency(c.amount)}</FooterText>
                <FooterText>{c.remarks}</FooterText>
                <FileLink href={c.file} target="_blank" rel="noreferrer">View</FileLink>
              </ClaimsRow>
            ))}
          </ClaimsTable>
        )}
      </Card>

      <AddOPEModal
        isOpen={openOpeModal}
        onClose={() => setOpenOpeModal(false)}
      />
    </Layout>
  );
};

export default ClamDetailsScreen;