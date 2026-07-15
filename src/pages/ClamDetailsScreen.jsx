import React, { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { FaCalendarAlt, FaMapMarkerAlt, FaUserTie, FaUser, FaPlus, FaFileInvoiceDollar, FaFileAlt, FaChevronDown, FaChevronUp, FaArrowLeft } from "react-icons/fa";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Badge from "../components/Badge";
import Button from "../components/Button";
import AddOPEModal from "../components/modal/AddOPEModal";
import { useLocation, useNavigate } from "react-router-dom";
import { DateForApiFormate, matchClaimsToActivity } from "../utils/utils";
import { getContractAllocationData, getEmpClaim, getemployeeLists, postClaimAction } from "../services/productServices";
import { toast } from "react-toastify";
import DataTable, { Td } from "../components/DataTable";
import ConfirmPopup from "../components/ConfirmPopup";


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
  cursor: ${({ pointer }) => pointer ? "pointer" : "default"};
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
  color: ${({ theme, disabled }) => disabled ? '#999' : (theme.colors?.primary || "#6C5CE7")};
  font-weight: ${({ disabled }) => disabled ? '400' : '600'};
  text-decoration: none;
  gap: 0.3rem;
  cursor: ${({ disabled }) => disabled ? 'default' : 'pointer'};
  pointer-events: ${({ disabled }) => disabled ? 'none' : 'auto'};
  &:hover { 
    text-decoration: ${({ disabled }) => disabled ? 'none' : 'underline'}; 
  }
`;

const EmptyRow = styled.div`
  padding: 1rem;
  text-align: center;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors?.textLight || "#999"};
`;

const RemarkField = styled.div`
  font-size: 0.75rem;
  max-width: 150px; /* Adjust this value as needed */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ClaimGrandTotalBar = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.85rem;
  align-items: center;
  margin-top: 1rem;
  padding: 0.85rem 1rem;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors?.primary ? `${theme.colors.primary}12` : "#6C5CE712"};
  font-size: 0.85rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors?.primary || "#6C5CE7"};
`;

// ADD — styled-components for the grid layout
const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem 1.5rem;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
`;

const DetailIconWrap = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: #f1f0fe;
  color: #6C5CE7;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const DetailText = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const DetailLabel = styled.span`
  font-size: 0.68rem;
  font-weight: 600;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.02em;
`;

const DetailValue = styled.span`
  font-size: 0.85rem;
  font-weight: 600;
  color: #333;
`;

const ClamDetailsScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const activityData = location.state?.data;
  const loggedEmpId = localStorage.getItem("cust_emp_id");
  const ViewMode = activityData.mode;

  console.log("activityData", activityData)

  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [openOpeModal, setOpenOpeModal] = useState(false);
  const [openSubmitAllModal, setOpenSubmitAllModal] = useState(false);

  const [claimList, setClaimList] = useState(() => activityData?.claims || []);
  const [resourceList, setResourceList] = useState([]);
  const [expandedDate, setExpandedDate] = useState(null);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [selectedMasterClaimId, setSelectedMasterClaimId] = useState(null);

  const fetchClaimsForActivity = useCallback(async () => {
    if (!loggedEmpId || !activityData) return;

    try {
      setIsLoading(true);
      const profileRes = await getemployeeLists({ emp_id: loggedEmpId });
      const profile = profileRes?.data?.[0] || {};

      if (!profile.id) {
        setClaimList([]);
        return;
      }

      const claimRes = await getEmpClaim("GET", profile.id, "CY");
      setClaimList(matchClaimsToActivity(claimRes?.data || [], activityData));
    } catch (error) {
      console.error(error);
      toast.error("Failed to load claims");
      setClaimList([]);
    } finally {
      setIsLoading(false);
    }
  }, [loggedEmpId, activityData]);

  const dateRows = useMemo(() => groupResourcesByDate(resourceList),[resourceList]);

  const totals = useMemo(() => 
    dateRows.reduce((acc, row) => ({
      resource: acc.resource + row.tl_amount + row.ex_amount,
      claim: acc.claim + row.claim_amount,
    }), { resource: 0, claim: 0 }),
    [dateRows]
  );

    const totalClaim = useMemo(() => {
  return claimList.reduce(
    (acc, claim) => {
      acc.totalOPE += Number(claim?.expense_amt || 0);
      acc.totalSettlement += Number(claim?.settlement_amt || 0);

      return acc;
    },
    { totalOPE: 0, totalSettlement: 0 }
  );
}, [claimList]);

  const grandTotal = totals.resource + totalClaim.totalOPE;

  const fetchResourceData = useCallback(async () => {
      const startDate = activityData?.planned_start_date;
      const endDate = activityData?.planned_end_date;
      const allocationIds = [...new Set((activityData?.allAEntries || []).map(item => item.id).filter(Boolean))];

      if (!startDate || !endDate || !allocationIds.length) {
      // if (!startDate || !endDate) {
        setResourceList([]);
        return;
      }

      try {
        setLoading(true);
        const responses = await Promise.all(allocationIds.map(allocationId => 
        getContractAllocationData({
              emp_id: loggedEmpId,
              allocation_id: allocationId,
              start_date: DateForApiFormate(startDate),
              end_date: DateForApiFormate(endDate),
            })
          )
        );
        const mergedData = responses.flatMap((response) => Array.isArray(response?.data) ? response.data : []);
        setResourceList(mergedData);
      } catch (error) {
        console.error("Failed to fetch resource data:", error);
        toast.error("Failed to load resource data");
        setResourceList([]);
      } finally {
        setLoading(false);
      }
    }, [activityData, loggedEmpId]);

  useEffect(() => {
    fetchResourceData();
  }, [fetchResourceData]);

  useEffect(() => {
    if (activityData?.claims?.length) {
      setClaimList(activityData.claims);
    } else {
      fetchClaimsForActivity();
    }
  }, [activityData, fetchClaimsForActivity]);

  const toggleDate = (date) => {
    setExpandedDate((prev) => (prev === date ? null : date));
  };

  const handleOpenClaimModal = (data) => {
    setSelectedClaim(data)
    setOpenOpeModal(true);
  };

  // const handleAddClaim = () => {
  //   const existingClaim = claimList?.[0] || null || claimList.length === 0;
  //   handleOpenClaimModal(existingClaim ? {...activityData, master_data: existingClaim}: null);
  // };

  console.log("totalClaim.totalOPE", totalClaim.totalOPE)
  console.log("activityData", activityData)

  const handleAddClaim = () => {
  const existingClaim = claimList?.[0] || null;
  handleOpenClaimModal({ activityData, ...(existingClaim && {master_data: existingClaim,}),});
};

const handleSubmitAll = async(masterClaimId) => {
  try {
    const payload = {
      m_claim_id: masterClaimId,
      call_mode: "SUBMIT_ALL"
    }
    const res = await postClaimAction(payload);
    if(res.status === 200){
      toast.success("All claim items submitted successfully");
    }
  } catch (error) {
    toast.error(error.data.message || error.data || "Failed to submit the claims. Please try again later !!!");
  }finally{
    setSelectedMasterClaimId(null);
    setOpenSubmitAllModal(false);
  }
}

  const matchingRetainer = (activityData?.original_P?.retainer_list || []).find((r) => r.a_type === "P" && r.start_date === activityData?.original_P?.start_date && r.end_date === activityData?.original_P?.end_date,);

  const plannedTL = matchingRetainer?.tl_count || 0;
  const plannedEX = matchingRetainer?.ex_count || 0;

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
  <DetailsGrid>
    <DetailItem>
      <DetailIconWrap><FaCalendarAlt size={13} /></DetailIconWrap>
      <DetailText>
        <DetailLabel>Duration</DetailLabel>
        <DetailValue>{formatDate(activityData.planned_start_date)} – {formatDate(activityData.planned_end_date)}</DetailValue>
      </DetailText>
    </DetailItem>

    <DetailItem>
      <DetailIconWrap><FaFileAlt size={13} /></DetailIconWrap>
      <DetailText>
        <DetailLabel>Customer</DetailLabel>
        <DetailValue>{activityData.customer_name}</DetailValue>
      </DetailText>
    </DetailItem>

    <DetailItem>
      <DetailIconWrap><FaFileAlt size={13} /></DetailIconWrap>
      <DetailText>
        <DetailLabel>Order Item</DetailLabel>
        <DetailValue>{activityData.order_item_key}</DetailValue>
      </DetailText>
    </DetailItem>

    <DetailItem>
      <DetailIconWrap><FaUserTie size={13} /></DetailIconWrap>
      <DetailText>
        <DetailLabel>Required TL</DetailLabel>
        <DetailValue>{plannedTL ?? '—'}</DetailValue>
      </DetailText>
    </DetailItem>

    <DetailItem>
      <DetailIconWrap><FaUser size={13} /></DetailIconWrap>
      <DetailText>
        <DetailLabel>Required EX</DetailLabel>
        <DetailValue>{plannedEX?? '—'}</DetailValue>
      </DetailText>
    </DetailItem>

    <DetailItem>
      <DetailIconWrap><FaMapMarkerAlt size={13} /></DetailIconWrap>
      <DetailText>
        <DetailLabel>Location</DetailLabel>
        <DetailValue>{activityData.store_name  || '—'}</DetailValue>
      </DetailText>
    </DetailItem>
  </DetailsGrid>
</Card>

      <Card hoverable={false} style={{ marginTop: "1rem" }} title={
        <>
          <FaFileInvoiceDollar size={12} style={{ marginRight: "0.4rem" }} />
          Claims { claimList[0]?.claim_items?.length && `(${claimList[0]?.claim_items?.length})`}
        </>
      }
        headerAction={ViewMode !== "VIEW" && activityData.activityStatus === "C" && 
        <Button variant="primary" onClick={handleAddClaim}>
          <FaPlus size={11} style={{ marginRight: "0.35rem" }} />
          Add Claim
        </Button>}
      >
        {claimList.length > 0 && (
        <InfoPill style={{marginBottom: "0.8rem", fontSize: "1rem"}}>
          <FaFileInvoiceDollar size={12} style={{ marginRight: "0.4rem" }} />
          <span>Master Clam Id:</span>
          {claimList[0].master_claim_id}
        </InfoPill>
        )}

        {activityData.activityStatus !== "C" ?
          (<EmptyRow style={{fontWeight: "600", fontSize: "0.8rem"}}>Activity not completed yet</EmptyRow>) :
          claimList.length === 0 ? (
            <EmptyRow>No claims submitted yet</EmptyRow>
          ) : (
          <DataTable
          emptyMessage="No claims submitted yet"
          isLoading={isLoading}
          columns={[ "Claim ID", "Category", "Date", "Amount", "Status", "Remarks", "Attachment", `${ViewMode !== "VIEW" ? "Action" : ""}`]}
            data={claimList.flatMap((claim) =>
              (claim?.claim_items || []).map((item) => ({...item,master_data: claim,}))
          )}
          renderRow={((item) => {
                const {variant, label} = getStatusVariant(item.expense_status)
                return(
              <>
                <Td>{item.claim_id}</Td>
                <Td><Badge variant="info" style={{ fontSize: "0.62rem" }}>{item.item_name}</Badge></Td>
                <Td>{item.expense_date}</Td>
                <Td>{currency(item.expense_amt)}</Td>
                <Td><Badge variant={variant}>{label}</Badge></Td>
                <Td>
                  <RemarkField title={item.remarks || "--"}>
                    {item.remarks || "--"}
                  </RemarkField>
                </Td>
                <Td><FileLink href={item.submitted_file_1} target="_blank" rel="noreferrer" disabled={!item.submitted_file_1}>{item.submitted_file_1 ? "View" : "Not Submitted"}</FileLink></Td>
                {ViewMode !== "VIEW" && <Td><Button size="sm" onClick={() => handleOpenClaimModal(item)}>Update</Button></Td>}
              </>
        )})}
          
          />
        )}

         <ClaimGrandTotalBar>
            {/* <span>Total settled Amount: {currency(totalClaim.totalSettlement)}</span> */}
            <span>Total Claim Amount: {currency(totalClaim.totalOPE)}</span>
        </ClaimGrandTotalBar>



       {claimList.length > 0 && ViewMode !== "VIEW" && <div style={{display: "flex", justifyContent: "flex-end", marginTop: "1rem"}}>
          <Button  onClick={() => {
              setSelectedMasterClaimId(claimList?.[0]?.master_claim_id || null);
              setOpenSubmitAllModal(true);
            }}>Submit All Claims</Button>
        </div>}
      </Card>

          <Card hoverable={false} style={{ marginTop: "1rem" }} title="Resource & Claim Summary (Date-wise)">

        {dateRows.length === 0 ? (
          <EmptyRow>No data available</EmptyRow>
        ) : (
          dateRows.map((row) => {
            const { tl_amount: tlTotal, ex_amount: exTotal, claim_amount: claimTotal} = row;
            const dayTotal = tlTotal + exTotal + claimTotal;
            
            const isOpen = expandedDate === row.date;

            return (
              <DateBlock key={row.date}>
                {/* <DateHeader onClick={() => toggleDate(row.date)}> */}
                <DateHeader onClick={(e) => {e.stopPropagation();  toggleDate(row.date)}}>
                  <HeaderDate>{formatDayLabel(row.date)}</HeaderDate>
                  <HeaderSummary>
                    <Badge variant="forward" style={{ fontSize: "0.72rem", fontWeight: "600" }}>TL {row.tl_count}</Badge>
                    <Badge variant="info" style={{ fontSize: "0.72rem", fontWeight: "600" }}>EX {row.ex_count}</Badge>
                    <span>Total: <strong>{currency(dayTotal)}</strong></span>
                    {isOpen ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
                  </HeaderSummary>
                </DateHeader>

                {isOpen && (
                  <>
                    <DateBody>
                      <StatBox pointer={true} onClick={() => navigate("/resource-list", {state: { data: activityData },}) } >
                        <StatLabel>Total TL</StatLabel>
                        {/* <StatValue>{row.tl_count} × {currency(row.tl_rate)}</StatValue> */}
                        <StatValue>{row.tl_count} Resources</StatValue>
                      </StatBox>
                      <StatBox>
                        <StatLabel>TL Total Amount</StatLabel>
                        <StatValue>{currency(tlTotal)}</StatValue>
                      </StatBox>
                      <StatBox pointer={true} onClick={() => navigate("/resource-list", {state: { data: activityData },}) }>
                        <StatLabel>Total EX</StatLabel>
                        <StatValue>{row.ex_count} Resources</StatValue>
                      </StatBox>
                      <StatBox>
                        <StatLabel>EX Total Amount</StatLabel>
                        <StatValue>{currency(exTotal)}</StatValue>
                      </StatBox>
                      {/* <StatBox>
                        <StatLabel>Claims ({dayClaims.length})</StatLabel>
                        <StatValue>{currency(claimTotal)}</StatValue>
                      </StatBox> */}
                    </DateBody>
                    <TotalsFooter>
                      <FooterText>Resource Cost: {currency(tlTotal + exTotal)}</FooterText>
                      {/* <FooterText>Claim Amount: {currency(claimTotal)}</FooterText> */}
                      {/* <FooterText>Day Total: {currency(dayTotal)}</FooterText> */}
                    </TotalsFooter>
                  </>
                )}
              </DateBlock>
            );
          })
        )}

        <GrandTotalBar>
          <span>Resource Cost (TL + EX): {currency(totals.resource)}</span>
            <span>Claims: {currency(totalClaim.totalOPE)}</span>
          <span>Grand Total (incl. Claims): {currency(grandTotal)}</span>
        </GrandTotalBar>
      </Card>

     {openOpeModal &&
      <AddOPEModal
        isOpen={openOpeModal}
        onClose={() => setOpenOpeModal(false)}
        claimData={selectedClaim}
        onSaved={fetchClaimsForActivity}
      />}

     {openSubmitAllModal && 
     <ConfirmPopup
        isOpen={openSubmitAllModal}
        title="Confirmation"
        message="Are you sure you want to submit the claim items?"
        onConfirm={() => handleSubmitAll(selectedMasterClaimId)}
        onClose={() => {
          setOpenSubmitAllModal(false);
          setSelectedMasterClaimId(null);
        }}
        confirmLabel="Yes"
      />}
    </Layout>
  );
};

export default ClamDetailsScreen;

const getStatusVariant = (expense_status) => {
  const statusMap = {
    'N': { variant: 'warning', label: 'Not Submitted' },
    'S': { variant: 'success', label: 'Submitted' },
    'A': { variant: 'info', label: 'Approved' },
    'R': { variant: 'error', label: 'Rejected' },
    // 'P': { variant: 'info', label: 'Pending' },
  };

  return statusMap[expense_status] || { variant: 'default', label: 'Unknown' };
};

const groupResourcesByDate = (list = []) => {
  const grouped = list.reduce((acc, item) => {
    const startDate = DateForApiFormate(item.s_date, true);
    const endDate = DateForApiFormate(item.e_date, true);

    if (!startDate || !endDate) return acc;

    const current = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);

    while (current <= end) {
      const date = [
        current.getFullYear(),
        String(current.getMonth() + 1).padStart(2, "0"),
        String(current.getDate()).padStart(2, "0"),
      ].join("-");

      if (!acc[date]) {
        acc[date] = {
          date,
          tl_count: 0,
          ex_count: 0,
          tl_amount: 0,
          ex_amount: 0,
          claim_amount: 0,
          resources: [],
        };
      }

      const rate = Number(item.contract_rate) || 0;
      const claim = Number(item.ope_amt) || 0;

      if (item.emp_type === "T") {
        acc[date].tl_count += 1;
        acc[date].tl_amount += rate;
      }else if (item.emp_type === "E") {
        acc[date].ex_count += 1;
        acc[date].ex_amount += rate;
      }

      acc[date].claim_amount += claim;
      acc[date].resources.push(item);

      current.setDate(current.getDate() + 1);
    }

    return acc;
  }, {});

  return Object.values(grouped).sort(
    (a, b) =>
      new Date(`${a.date}T00:00:00`) -
      new Date(`${b.date}T00:00:00`)
  );
};