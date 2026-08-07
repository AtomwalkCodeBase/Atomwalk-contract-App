import { FaEdit, FaFileInvoiceDollar, FaPlus, FaTrash } from "react-icons/fa";
import Card from "../Card";
import Button from "../Button";
import DataTable, { Td } from "../DataTable";
import Badge from "../Badge";
import { currency } from "../../utils/utils";
import styled from "styled-components";

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

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  gap: ${({ theme }) => theme.spacing?.sm || '0.5rem'};
  align-items: center;
  width: 100%;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const ClaimCard = ({
  claimList,
  isLoading,
  ViewMode,
  claimStatus,
  activityData,
  totalClaim,
  handleAddClaim,
  handleOpenClaimModal,
  setSelectedDeleteClaimId,
  setOpenDeleteModal,
  setSelectedMasterClaimId,
  setOpenSubmitAllModal,
}) => {
    const firstItemStatus = claimList[0]?.expense_status;
    const canShowActionButtons =
    ViewMode !== "VIEW" && ViewMode !== "settlement" &&
    (activityData?.activityStatus === "C" ||
      activityData?.activityStatus === "AS" ||
      activityData?.activityStatus === "AP") &&
    (firstItemStatus === "N" || !claimList.length);
    console.log("claimList", claimList)
  return (
    <Card
      hoverable={false}
      style={{ marginTop: "1rem" }}
      title={
        <>
          <FaFileInvoiceDollar size={12} style={{ marginRight: "0.4rem" }} />
          Claims {claimList[0]?.claim_items?.length ? `(${claimList[0]?.claim_items?.length})` : ""}
        </>
      }
      headerAction={ canShowActionButtons && (
          <Button variant="primary" onClick={handleAddClaim}>
            <FaPlus size={11} style={{ marginRight: "0.35rem" }} />
            Add Claim
          </Button>
        )
      }
    >
      {claimList.length > 0 && (
        <InfoPill style={{ marginBottom: "0.8rem", fontSize: "1rem" }}>
          <FaFileInvoiceDollar size={12} style={{ marginRight: "0.4rem" }} />
          <span>Clam Id:</span>
          {claimList[0].master_claim_id}
        </InfoPill>
      )}

      {activityData.activityStatus !== "AP" &&
      activityData.activityStatus !== "AS" &&
      activityData.activityStatus !== "C" ? (
        <EmptyRow style={{ fontWeight: "600", fontSize: "0.8rem" }}>
          Activity not completed yet
        </EmptyRow>
      ) : claimList.length === 0 ? (
        <EmptyRow>No claims submitted yet</EmptyRow>
      ) : (
        <DataTable
          emptyMessage="No claims submitted yet"
          isLoading={isLoading}
          columns={[
            "Sl no.",
            "Category",
            "Date",
            "Amount",
            "Status",
            "Remarks",
            "Reference File",
            `${ViewMode !== "VIEW" && claimStatus !== "Submitted" ? "Action" : ""}`,
          ]}
          data={claimList.flatMap((claim) =>
            (claim?.claim_items || []).map((item) => ({ ...item, master_data: claim }))
          )}
          renderRow={(item) => {
            const { variant, label } = getClaimStatusVariant(item.expense_status);
            const index = item?.master_data?.claim_items?.findIndex(
              (data) => data.claim_id === item.claim_id
            );

            const showRowActions = ViewMode !== "VIEW" && ViewMode !== "settlement" && item.expense_status === "N";

            return (
              <>
                <Td style={{ marginLeft: "1rem" }}>{index >= 0 ? index + 1 : "—"}</Td>
                <Td>
                  <Badge variant="info" style={{ fontSize: "0.62rem" }}>
                    {item.item_name}
                  </Badge>
                </Td>
                <Td>{item.expense_date}</Td>
                <Td>{currency(item.expense_amt)}</Td>
                <Td>
                  <Badge variant={variant}>{label}</Badge>
                </Td>
                <Td>
                  <RemarkField title={item.remarks || "--"}>
                    {item.remarks || "--"}
                  </RemarkField>
                </Td>
                <Td>
                  <FileLink
                    href={item.submitted_file_1}
                    target="_blank"
                    rel="noreferrer"
                    disabled={!item.submitted_file_1}
                  >
                    {item.submitted_file_1 ? "View" : "Not Attached"}
                  </FileLink>
                </Td>
                {/* {ViewMode !== "VIEW" && label !== "Submitted" && label === "Approved" && ( */}
                  <Td>
                    <ButtonGroup>
                {showRowActions &&
                    <Button
                      size="sm"
                      title="Update claim"
                      onClick={() => handleOpenClaimModal(item)}
                      iconOnly={true}
                    >
                      <FaEdit />
                    </Button>}
                {showRowActions && 
                    <Button
                      size="sm"
                      variant="outlines"
                      iconOnly={true}
                      title="Delete claim"
                      onClick={() => {
                        setSelectedDeleteClaimId(item?.claim_id || null);
                        setOpenDeleteModal(true);
                      }}
                    >
                      <FaTrash />
                    </Button>
                    }

                    </ButtonGroup>
                  </Td>
                {/* // )} */}
                {/* {ViewMode !== "VIEW" && label !== "Submitted" && (
                  <Td>
                    <Button
                      size="sm"
                      variant="outlines"
                      iconOnly={true}
                      title="Delete claim"
                      onClick={() => {
                        setSelectedDeleteClaimId(item?.claim_id || null);
                        setOpenDeleteModal(true);
                      }}
                    >
                      <FaTrash />
                    </Button>
                  </Td>
                )} */}
              </>
            );
          }}
        />
      )}

      <ClaimGrandTotalBar>
        <span>Total Claim Amount: {currency(totalClaim.totalOPE)}</span>
      </ClaimGrandTotalBar>

      {canShowActionButtons && claimList.length > 0 && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
            <Button
              onClick={() => {
                setSelectedMasterClaimId(claimList?.[0]?.master_claim_id || null);
                setOpenSubmitAllModal(true);
              }}
            >
              Submit All Claims
            </Button>
          </div>
        )}
    </Card>
  );
};

export const getClaimStatusVariant = (expense_status) => {
  const statusMap = {
    'N': { variant: 'warning', label: 'Not Submitted' },
    'S': { variant: 'success', label: 'Submitted' },
    'A': { variant: 'info', label: 'Approved' },
    'R': { variant: 'error', label: 'Rejected' },
    // 'P': { variant: 'info', label: 'Pending' },
  };

  return statusMap[expense_status] || { variant: 'default', label: 'Unknown' };
};