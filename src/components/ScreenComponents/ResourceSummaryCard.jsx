import styled from "styled-components";
import Card from "../Card";
import Badge from "../Badge";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { currency, DateForApiFormate } from "../../utils/utils";

const EmptyRow = styled.div`
  padding: 1rem;
  text-align: center;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors?.textLight || "#999"};
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
  justify-content: flex-end;
  align-items: center;
  margin-top: 1rem;
  padding: 0.85rem 1rem;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors?.primary ? `${theme.colors.primary}12` : "#6C5CE712"};
  font-size: 0.85rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors?.primary || "#6C5CE7"};
`;


const formatDayLabel = (dateStr) => {
  return new Date(dateStr).toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" });
};

export const ResourceSummaryCard = ({
  loading,
  dateRows,
  expandedDate,
  toggleDate,
  totals,
  // totalClaim,
  // grandTotal,
  navigate,
  activityData,
}) => {
  // console.log("activityData", activityData)

const handleResourceClick = (date) => {
  const groupedData = activityData.grouped_data.filter((item) => {
    const start = DateForApiFormate(item.planned_start_date, true);
    const end = DateForApiFormate(item.planned_end_date, true);

    return date >= start && date <= end;
  });

  navigate("/resource-list", { state: { data: groupedData[0]}});
};
  return (
    <Card
      hoverable={false}
      style={{ marginTop: "1rem" }}
      title="Resource Summary (Date-wise)"
      headerAction={<h3 style={{marginRight: "1.7rem"}}>Total</h3>}
    >
      { loading ? (
        <EmptyRow>Loading</EmptyRow>
      ) : dateRows.length === 0 ? (
        <EmptyRow>No data available</EmptyRow>
      ) : (
        dateRows.map((row) => {
          const { tl_amount: tlTotal, ex_amount: exTotal, claim_amount: claimTotal } = row;
          const dayTotal = tlTotal + exTotal + claimTotal;
          const isOpen = expandedDate === row.date;

          return (
            <DateBlock key={row.date}>
              <DateHeader
                onClick={(e) => {
                  e.stopPropagation();
                  toggleDate(row.date);
                }}
              >
                <HeaderDate>{formatDayLabel(row.date)}</HeaderDate>
                <HeaderSummary>
                  <Badge variant="forward" style={{ fontSize: "0.72rem", fontWeight: "600" }}>
                    TL {row.tl_count}
                  </Badge>
                  <Badge variant="info" style={{ fontSize: "0.72rem", fontWeight: "600" }}>
                    EX {row.ex_count}
                  </Badge>
                  <span>
                   <strong>{currency(dayTotal)}</strong>
                  </span>
                  {isOpen ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
                </HeaderSummary>
              </DateHeader>

              {isOpen && (
                <>
                  <DateBody>
                    <StatBox
                      pointer={true}
                      onClick={() => handleResourceClick(row.date)}
                    >
                      <StatLabel>Total TL</StatLabel>
                      <StatValue>{row.tl_count} Resources</StatValue>
                    </StatBox>
                    <StatBox>
                      <StatLabel>TL Total Amount</StatLabel>
                      <StatValue>{currency(tlTotal)}</StatValue>
                    </StatBox>
                    <StatBox
                      pointer={true}
                      onClick={() => handleResourceClick(row.date)}
                    >
                      <StatLabel>Total EX</StatLabel>
                      <StatValue>{row.ex_count} Resources</StatValue>
                    </StatBox>
                    <StatBox>
                      <StatLabel>EX Total Amount</StatLabel>
                      <StatValue>{currency(exTotal)}</StatValue>
                    </StatBox>
                  </DateBody>
                  <TotalsFooter>
                    <FooterText>Resource Cost: {currency(tlTotal + exTotal)}</FooterText>
                  </TotalsFooter>
                </>
              )}
            </DateBlock>
          );
        })
      )}

      <GrandTotalBar>
        {/* <span>Resource Cost (TL + EX): {currency(totals.resource)}</span>
        <span>Claims: {currency(totalClaim.totalOPE)}</span> */}
        <span>Grand Total Resource Cost: {currency(totals.resource)}</span>
      </GrandTotalBar>
    </Card>
  );
};