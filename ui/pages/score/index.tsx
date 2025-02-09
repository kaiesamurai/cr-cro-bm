import { useEffect, useState } from "react";
import { ethers } from "ethers";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ctaStyle from "../../components/cta.module.css";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { stateManagement, useLoan } from "../../hooks/useLoan";
import { useMetamask } from "../../hooks/useMetamask";
import { useListen } from "../../hooks/useListen";
import Wallet from "../../components/Wallet";
import Tooltip from "@mui/material/Tooltip";

const proofCell = (value: any) => <>
  <Tooltip title="Copy" placement='top-start'>
    <button
      className='hover:text-gray-500'
      onClick={() => navigator.clipboard.writeText(value)}
    >
      Copy Proof
    </button>
  </Tooltip>
</>

const columns: GridColDef[] = [
  { field: "date", headerName: "Date", width: 200 },
  { field: "proof1", headerName: "Proof of Credit Score ZKML", width: 200, renderCell: ({ value }) => proofCell(value) },
  { field: "score", headerName: "Score", width: 100 },
];

const MyScoresPage = () => {
  const [creditScoreHistory, setCreditScoreHistory] = useState([]);
  const { dispatch, state } = useMetamask();
  const { dispatch: dispatchLoan } = useLoan();
  const listen = useListen();

  useEffect(() => {
    if (!state.wallet) return
    fetch("/api/getCreditScoresByUser", {
      method: "POST",
      body: JSON.stringify({ userAddress: state.wallet }),
    }).then((res) => res.json()).then((res) => {
      setCreditScoreHistory(res.userLoanRequests);
    })
  }, [state])

  useEffect(() => {
    stateManagement(dispatchLoan, listen, dispatch);
  }, []);

  const getRows = () => {
    const round = (number: number, precision: number) => {
      var factor = Math.pow(10, precision);
      return Math.round(number * factor) / factor;
    };

    const rows = creditScoreHistory
      .filter(
        (loanRequest: any) =>
          round(ethers.BigNumber.from(loanRequest[2]).toNumber(), 2) > 0
      )
      .map((loanRequest: any, i: number) => {
        const requestDate = new Date(
          ethers.BigNumber.from(loanRequest[3]).toNumber() * 1000
        );
        const requestDateFormatted = requestDate.toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
        return {
          id: i,
          date: requestDateFormatted,
          proof1: loanRequest[1][0],
          proof2: loanRequest[1][1],
          // proof3: JSON.parse(loanRequest[1][2]),
          score: round(ethers.BigNumber.from(loanRequest[2]).toNumber(), 2),
        };
      });

    return rows;
  };

  return (
    <>
      <Wallet />
      <div
        className={`flex justify-center pt-10 pb-10 container mx-auto min-h-screen ${ctaStyle.form}`}
      >
        <div className="relative z-10 bg-white px-5 flex justify-center shadow-lg pt-5 rounded-lg">
          <Box sx={{ width: "100%", paddingBottom: "75px" }}>
            <Typography sx={{ mt: 2, mb: 1 }}>Your Scores</Typography>
            <DataGrid
              rows={getRows()}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 5 },
                },
              }}
            />
          </Box>
        </div>
      </div>
    </>
  );
}

export default MyScoresPage;
