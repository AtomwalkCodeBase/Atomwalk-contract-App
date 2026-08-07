import React, { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { FaCalendarAlt, FaMapMarkerAlt, FaUserTie, FaUser, FaPlus, FaFileInvoiceDollar, FaFileAlt, FaChevronDown, FaChevronUp, FaArrowLeft, FaTrash, FaEdit } from "react-icons/fa";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Badge from "../components/Badge";
import Button from "../components/Button";
import AddOPEModal from "../components/modal/AddOPEModal";
import { useLocation, useNavigate } from "react-router-dom";
import { DateForApiFormate, formatDate, getStatusVariant, matchClaimsToActivity } from "../utils/utils";
import { getContractAllocationData, getEmpClaim, getemployeeLists, postClaimAction } from "../services/productServices";
import { toast } from "react-toastify";
import DataTable, { Td } from "../components/DataTable";
import ConfirmPopup from "../components/ConfirmPopup";
import { FaPenToSquare } from "react-icons/fa6";
import Tabs from "../components/Tabs";
import { ResourceSummaryCard } from "../components/ScreenComponents/ResourceSummaryCard";
import { ClaimCard, getClaimStatusVariant } from "../components/ScreenComponents/ClaimCard";

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

const GrandTotalBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding: 0.85rem 1rem;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors?.accent ? `${theme.colors.accent}30` : "#6C5CE712"};
  font-size: 0.85rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors?.primary || "#6C5CE7"};
`;

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
  color: ${({ theme }) => theme.colors?.textLight || "#999"};;
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
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [openOpeModal, setOpenOpeModal] = useState(false);
  const [openSubmitAllModal, setOpenSubmitAllModal] = useState(false);
  const [activeTab, setActiveTab] = useState("resource");

  const [claimList, setClaimList] = useState(() => activityData?.claims || []);

  const claimStatus = useMemo(() => {
    for (const claim of claimList) {
      for (const item of (claim?.claim_items || [])) {
        const { label } = getClaimStatusVariant(item.expense_status);
        if (label === "Submitted") {
          return "Submitted";
        }
      }
    }
    return "";
  }, [claimList]);

  const [resourceList, setResourceList] = useState([]);
  const [expandedDate, setExpandedDate] = useState(null);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [selectedMasterClaimId, setSelectedMasterClaimId] = useState(null);
  const [selectedDeleteClaimId, setSelectedDeleteClaimId] = useState(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  // console.log("activityData", activityData)

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

  const dateRows = useMemo(() => groupResourcesByDate(resourceList), [resourceList]);

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
    const startDate = activityData?.planned_start_date || activityData.earliestPlannedDate;
    const endDate = activityData?.planned_end_date || activityData.latestPlannedDate;
    const allocationIds = [
      ...new Set(
        (
          activityData?.grouped_data?.length
            ? activityData.grouped_data.flatMap(
              item => item?.allAEntries || []
            )
            : activityData?.allAEntries || []
        )
          .map(item => item?.id)
          .filter(Boolean)
      )
    ];

    if (!startDate || !endDate || !allocationIds.length) {
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
      ));
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
    setSelectedClaim(data);
    setOpenOpeModal(true);
  };

  const handleAddClaim = () => {
    const existingClaim = claimList?.[0] || null;
    handleOpenClaimModal({ ...activityData, ...(existingClaim && { master_data: existingClaim }) });
  };

  const handleSubmitAll = async (masterClaimId) => {
    try {
      const payload = {
        m_claim_id: masterClaimId,
        call_mode: "SUBMIT_ALL"
      };
      const res = await postClaimAction(payload);
      if (res.status === 200) {
        toast.success("All claim items submitted successfully");
      }
      await fetchClaimsForActivity();
    } catch (error) {
      toast.error(error.data.message || error.data || "Failed to submit the claims. Please try again later !!!");
    } finally {
      setSelectedMasterClaimId(null);
      setOpenSubmitAllModal(false);
    }
  };

  const handleDelete = async (claimId) => {
    try {
      const payload = {
        claim_id: claimId,
        call_mode: "DELETE"
      };
      const res = await postClaimAction(payload);
      if (res.status === 200) {
        toast.success("claim item deleted successfully");
      }
      await fetchClaimsForActivity();
    } catch (error) {
      toast.error(error.data.message || error.data || "Failed to delete the claims. Please try again later !!!");
    } finally {
      setSelectedDeleteClaimId(null);
      setOpenDeleteModal(false);
    }
  };

  // const matchingRetainer = (activityData?.original_P?.retainer_list || activityData?.grouped_data[0]?.original_P?.retainer_list || []).find(
  //   (r) =>
  //     r.a_type === "P" &&
  //     r.start_date === activityData?.original_P?.start_date &&
  //     r.end_date === activityData?.original_P?.end_date
  // );

  const allocationResources = useMemo(() => {
    return (activityData?.grouped_data || []).map((allocation) => {
      const matchingRetainer = (
        allocation?.original_P?.retainer_list || []
      ).find(
        (r) =>
          r.a_type === "P" &&
          r.start_date === allocation?.original_P?.start_date &&
          r.end_date === allocation?.original_P?.end_date
      );

      return {
        allocationId: allocation?.allocation_id || allocation?.id || allocation?.allAEntries?.[0]?.id,
        start_date: matchingRetainer?.start_date,
        end_date: matchingRetainer?.end_date,
        tl_count: matchingRetainer?.tl_count || 0,
        tl_rate: matchingRetainer?.tl_rate || 0,
        ex_count: matchingRetainer?.ex_count || 0,
        ex_rate: matchingRetainer?.ex_rate || 0,
        activityStatus: allocation?.activityStatus || "",
        statusDisplay: allocation?.statusDisplay || "",
      };
    });
  }, [activityData]);

  // console.log("allocationResources", allocationResources)

  // const plannedTL = matchingRetainer?.tl_count || 0;
  // const plannedEX = matchingRetainer?.ex_count || 0;

  const tabs = [
    { key: "resource", label: "Resource Summary (Date-wise)" },
    { key: "claim", label: "Claim" },
  ];

   const isSettlementMode = ViewMode === "settlement";

  return (
    <Layout title="Clam Details">
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
              <DetailValue>
                {formatDate(activityData.planned_start_date)} – {formatDate(activityData.planned_end_date)}
              </DetailValue>
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

          {allocationResources.length === 1 && (
            <>
              <DetailItem>
                <DetailIconWrap><FaUserTie size={13} /></DetailIconWrap>
                <DetailText>
                  <DetailLabel>Required TL</DetailLabel>
                  <DetailValue>{allocationResources[0].tl_count ?? "—"}</DetailValue>
                  {allocationResources[0].tl_rate && <DetailValue>{allocationResources[0].tl_rate ?? "—"}/per day</DetailValue>}
                </DetailText>
              </DetailItem>

              <DetailItem>
                <DetailIconWrap><FaUser size={13} /></DetailIconWrap>
                <DetailText>
                  <DetailLabel>Required EX</DetailLabel>
                  <DetailValue>{allocationResources[0].ex_count ?? "—"}</DetailValue>
                  {allocationResources[0].ex_rate && <DetailValue>{allocationResources[0].ex_rate ?? "—"}/per day</DetailValue>}

                </DetailText>
              </DetailItem>
            </>
          )}

          <DetailItem>
            <DetailIconWrap><FaMapMarkerAlt size={13} /></DetailIconWrap>
            <DetailText>
              <DetailLabel>Location</DetailLabel>
              <DetailValue>{activityData.store_name || "—"}</DetailValue>
            </DetailText>
          </DetailItem>
        </DetailsGrid>

        {activityData.store_remarks && (
          <DetailItem style={{ marginTop: "1rem" }}>
            <DetailIconWrap><FaPenToSquare size={13} /></DetailIconWrap>
            <DetailText>
              <DetailLabel>Remark</DetailLabel>
              <DetailValue>{activityData.store_remarks || "—"}</DetailValue>
            </DetailText>
          </DetailItem>
        )}
      </Card>

      {allocationResources.length > 1 && (
        <Card title="Allocation Dates">
          <DetailsGrid style={{ marginTop: "1rem" }}>
            {allocationResources.map((allocation, index) => (
              <DetailItem key={allocation.allocationId || index}>
                <DetailIconWrap>
                  <FaUserTie size={13} />
                </DetailIconWrap>
                <DetailText>
                  <div style={{display: "flex", gap: "1rem", alignItems: "center"}}>
                  <DetailLabel>Allocation {index + 1}</DetailLabel> 
                  <Badge variant={getStatusVariant(allocation.activityStatus)}>
                    {allocation.statusDisplay}
                  </Badge>
                  </div>
                  <DetailValue>
                    {formatDate(allocation.start_date)} – {formatDate(allocation.end_date)}
                  </DetailValue>
                  <DetailValue>
                    TL: {allocation.tl_count} <DetailLabel>({allocation.tl_rate || "--"}/per day)</DetailLabel> &nbsp; | &nbsp; 
                    EX: {allocation.ex_count} <DetailLabel>({allocation.ex_rate || "--"}/per day)</DetailLabel>
                  </DetailValue>
                </DetailText>
              </DetailItem>
            ))}
          </DetailsGrid>
        </Card>
      )}

      {/* Settlement mode → only Resource Summary */}
      {isSettlementMode ? (
        <Card title="Resource & Claim Summary (Date-wise)">

        <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
        {activeTab === "claim" && (
          <ClaimCard
            claimList={claimList}
            isLoading={isLoading}
            ViewMode={ViewMode}
            claimStatus={claimStatus}
            activityData={activityData}
            totalClaim={totalClaim}
            handleAddClaim={handleAddClaim}
            handleOpenClaimModal={handleOpenClaimModal}
            setSelectedDeleteClaimId={setSelectedDeleteClaimId}
            setOpenDeleteModal={setOpenDeleteModal}
            setSelectedMasterClaimId={setSelectedMasterClaimId}
            setOpenSubmitAllModal={setOpenSubmitAllModal}
          />)}

          {activeTab === "resource" && (
          <ResourceSummaryCard
            loading={loading}
            dateRows={dateRows}
            expandedDate={expandedDate}
            toggleDate={toggleDate}
            totals={totals}
            totalClaim={totalClaim}
            grandTotal={grandTotal}
            navigate={navigate}
            activityData={activityData}
          />)}

          <GrandTotalBar>
            <span style={{cursor: "pointer"}} onClick={() => setActiveTab("resource")}>Resource Cost (TL + EX): {currency(totals.resource)}</span>
            <span style={{cursor: "pointer"}} onClick={() => setActiveTab("claim")}>Claims: {currency(totalClaim.totalOPE)}</span>
            <span style={{cursor: "pointer"}} onClick={() => window.history.back()}>Grand Total (incl. Claims): {currency(grandTotal)}</span>
          </GrandTotalBar>
        </Card>
      ) : (
        <ClaimCard
          claimList={claimList}
          isLoading={isLoading}
          ViewMode={ViewMode}
          claimStatus={claimStatus}
          activityData={activityData}
          totalClaim={totalClaim}
          handleAddClaim={handleAddClaim}
          handleOpenClaimModal={handleOpenClaimModal}
          setSelectedDeleteClaimId={setSelectedDeleteClaimId}
          setOpenDeleteModal={setOpenDeleteModal}
          setSelectedMasterClaimId={setSelectedMasterClaimId}
          setOpenSubmitAllModal={setOpenSubmitAllModal}
        />
      )}

      {openOpeModal && (
        <AddOPEModal
          isOpen={openOpeModal}
          onClose={() => setOpenOpeModal(false)}
          claimData={selectedClaim}
          onSaved={fetchClaimsForActivity}
        />
      )}

      {openSubmitAllModal && (
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
      )}

      {openDeleteModal && (
        <ConfirmPopup
          isOpen={openDeleteModal}
          title="Delete Claim"
          message="Are you sure you want to delete this claim item?"
          onConfirm={() => handleDelete(selectedDeleteClaimId)}
          onClose={() => {
            setOpenDeleteModal(false);
            setSelectedDeleteClaimId(null);
          }}
          confirmLabel="Delete"
        />
      )}
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
      } else if (item.emp_type === "E") {
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