import React, { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { FaCalendarAlt, FaMapMarkerAlt, FaUserTie, FaUser, FaPlus, FaFileInvoiceDollar, FaFileAlt, FaChevronDown, FaChevronUp, FaArrowLeft } from "react-icons/fa";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Badge from "../components/Badge";
import Button from "../components/Button";
import AddOPEModal from "../components/modal/AddOPEModal";
import { useLocation, useNavigate } from "react-router-dom";
import { DateForApiFormate } from "../utils/utils";
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

const ClamDetailsScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const loggedEmpId = localStorage.getItem("cust_emp_id");
  const activityData = location.state?.data;

  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [openOpeModal, setOpenOpeModal] = useState(false);
  const [openSubmitAllModal, setOpenSubmitAllModal] = useState(false);

  const [profileInfo, setProfileInfo] = useState({});
  const [claimList, setClaimList] = useState([]);
  const [resourceList, setResourceList] = useState([]);
  const [expandedDate, setExpandedDate] = useState(null);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [selectedMasterClaimId, setSelectedMasterClaimId] = useState(null);

  console.log("claimList", claimList)
  

  const claimsByDate = useMemo(() => {
    const map = {};
    claimList.forEach((c) => {
      const dateKey = c.date || c.submitted_date?.split("T")[0]; // Flexible date key
      if (!dateKey) return;
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(c);
    });
    return map;
  }, [claimList]);

  const dateRows = useMemo(() => groupResourcesByDate(resourceList),[resourceList]);

  // console.log("resourceList", resourceList)
  // console.log("dateRows", dateRows)

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

        const mergedData = Array.isArray(responses?.data) ? responses.data : []

        setResourceList(mergedData);
      } catch (error) {
        console.error("Failed to fetch resource data:", error);
        toast.error("Failed to load resource data");
        setResourceList([]);
      } finally {
        setLoading(false);
      }
    }, [activityData, loggedEmpId]);

  const fetchProfileAndClaims = useCallback(async () => {
    if (!loggedEmpId) return;

    try {
      const profileRes = await getemployeeLists({ emp_id: loggedEmpId });
      const profile = profileRes?.data?.[0] || {};
      setProfileInfo(profile);

      if (profile.id) {
        const claimRes = await getEmpClaim("GET", profile.id, "CY");
        setClaimList(claimRes?.data || []);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load profile or claims");
      setProfileInfo({});
      setClaimList([]);
    }
  }, [loggedEmpId]);

  useEffect(() => {
    fetchResourceData();
  }, [fetchResourceData]);

  useEffect(() => {
    fetchProfileAndClaims();
  }, [fetchProfileAndClaims]);

  const matchedOrderClaim = useMemo(() => {
  const orderItemId = activityData?.order_item_id;
  if (!orderItemId || !Array.isArray(claimList)) {
    return null;
  }

  return (
    claimList.find((claim) => String(claim.order_item_id) === String(orderItemId)) || null
  );
}, [claimList, activityData?.order_item_id]);

  const toggleDate = (date) => {
    setExpandedDate((prev) => (prev === date ? null : date));
  };

  const handleOpenClaimModal = (data) => {
    setSelectedClaim(data)
    setOpenOpeModal(true);
  };

  const handleAddClaim = () => {
  if (matchedOrderClaim) {
    handleOpenClaimModal({...matchedOrderClaim, master_data: matchedOrderClaim});
  } else {
    handleOpenClaimModal(null);
  }
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
      setSelectedMasterClaimId(null);
      setOpenSubmitAllModal(false);
      await fetchProfileAndClaims();
    }
  } catch (error) {
    toast.error(error.data.message || error.data || "Failed to submit the claims. Please try again later !!!");
    setSelectedMasterClaimId(null);
    setOpenSubmitAllModal(false);
  }finally{
    setSelectedMasterClaimId(null);
    setOpenSubmitAllModal(false);
  }
}

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
            {formatDate(activityData.planned_start_date)} – {formatDate(activityData.planned_end_date)}
          </InfoPill>
          <InfoPill>
            <FaFileAlt size={11} />
            <span>Customer:</span>
            {activityData.customer_name}
          </InfoPill>
          <InfoPill>
            <FaFileAlt size={11} />
            <span>Order Item:</span>
            {activityData.order_item_key}
          </InfoPill>
          <InfoPill>
            <FaUserTie size={11} />
            <span>Required TL:</span>
            {activityData.required_tl}
          </InfoPill>
          <InfoPill>
            <FaUser size={11} />
            <span>Required EX:</span>
            {activityData.required_ex}
          </InfoPill>
        </InfoStrip>
        <InfoPill>
          <FaMapMarkerAlt size={11} />
          <span>Location:</span>
          {activityData.location}
        </InfoPill>
      </Card>

      <Card hoverable={false} style={{ marginTop: "1rem" }} title={
        <>
          <FaFileInvoiceDollar size={12} style={{ marginRight: "0.4rem" }} />
          Claims ({claimList.length})
        </>
      }
        headerAction={<Button variant="primary" onClick={handleAddClaim}>
          <FaPlus size={11} style={{ marginRight: "0.35rem" }} />
          Add Claim
        </Button>}
      >
        {claimList.length > 0 && (
        <InfoPill style={{marginBottom: "0.8rem"}}>
          <FaFileInvoiceDollar size={12} style={{ marginRight: "0.4rem" }} />
          <span>Master Clam Id:</span>
          {claimList[0].master_claim_id}
        </InfoPill>
        )}

        {claimList.length === 0 ? (
          <EmptyRow>No claims submitted yet</EmptyRow>
        ) : (
          <DataTable
          emptyMessage="No claims submitted yet"
          isLoading={isLoading}
          columns={["Claim ID", "Date", "Category", "Amount", "Remarks", "File", "Action"]}
          data={claimList}
          renderRow={(claim) => 
              (claim.claim_items || []).map((item) => (
              <>
                <Td>{item.claim_id}</Td>
                <Td>{item.submitted_date}</Td>
                <Td><Badge variant="info" style={{ fontSize: "0.62rem" }}>{item.item_name}</Badge></Td>
                <Td>{currency(item.expense_amt)}</Td>
                <Td>
                  <RemarkField title={item.remarks || "--"}>
                    {item.remarks || "--"}
                  </RemarkField>
                </Td>
                <Td><FileLink href={item.submitted_file_1} target="_blank" rel="noreferrer">View</FileLink></Td>
                <Td><Button size="sm" onClick={() => handleOpenClaimModal({...item, master_data: claim})}>Update</Button></Td>
              </>
        ))}
          
          />
        )}

         <ClaimGrandTotalBar>
            <span>Total settled Amount: {currency(totalClaim.totalSettlement)}</span>
            <span>Total Claim Amount: {currency(totalClaim.totalOPE)}</span>
        </ClaimGrandTotalBar>



        <div style={{display: "flex", justifyContent: "flex-end"}}>
          <Button  onClick={() => {
              setSelectedMasterClaimId(claimList?.[0]?.master_claim_id || null);
              setOpenSubmitAllModal(true);
            }}>Submit All Claims</Button>
        </div>
      </Card>

          <Card hoverable={false} style={{ marginTop: "1rem" }} title="Resource & Claim Summary (Date-wise)">

        {dateRows.length === 0 ? (
          <EmptyRow>No data available</EmptyRow>
        ) : (
          dateRows.map((row) => {
            const { tl_amount: tlTotal, ex_amount: exTotal, claim_amount: claimTotal} = row;
            const dayTotal = tlTotal + exTotal + claimTotal;
            
            const isOpen = expandedDate === row.date;
            const dayClaims = claimsByDate[row.date] || [];

            return (
              <DateBlock key={row.date}>
                {/* <DateHeader onClick={() => toggleDate(row.date)}> */}
                <DateHeader  onClick={() => navigate("/resource-list", {state: { data: activityData },}) }>
                  <HeaderDate>{formatDayLabel(row.date)}</HeaderDate>
                  <HeaderSummary onClick={(e) => {e.stopPropagation();  toggleDate(row.date)}}>
                    <Badge variant="forward" style={{ fontSize: "0.72rem", fontWeight: "600" }}>TL {row.tl_count}</Badge>
                    <Badge variant="info" style={{ fontSize: "0.72rem", fontWeight: "600" }}>EX {row.ex_count}</Badge>
                    <span>Total: <strong>{currency(dayTotal)}</strong></span>
                    {isOpen ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
                  </HeaderSummary>
                </DateHeader>

                {isOpen && (
                  <>
                    <DateBody>
                      <StatBox>
                        <StatLabel>Total TL</StatLabel>
                        {/* <StatValue>{row.tl_count} × {currency(row.tl_rate)}</StatValue> */}
                        <StatValue>{row.tl_count} Resources</StatValue>
                      </StatBox>
                      <StatBox>
                        <StatLabel>TL Total Amount</StatLabel>
                        <StatValue>{currency(tlTotal)}</StatValue>
                      </StatBox>
                      <StatBox>
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

      <AddOPEModal
        isOpen={openOpeModal}
        onClose={() => setOpenOpeModal(false)}
        claimData={selectedClaim}
        fetchProfileAndClaims={fetchProfileAndClaims}
      />

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
      />
    </Layout>
  );
};

export default ClamDetailsScreen;

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