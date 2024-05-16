import { useEffect, useState, type FC } from "react";
import { useMetamask } from "../hooks/useMetamask";
import Link from "next/link";
import { Button } from "@mui/material";
import dynamic from "next/dynamic";
const GaugeComponent = dynamic(() => import('react-gauge-component'), { ssr: false });

export const CTA: FC = () => {
  const { state } = useMetamask();
  const [creditScoreHistory, setCreditScoreHistory] = useState(0);

  useEffect(() => {
    if (!state.wallet) return
    console.log("state.wallet", state.wallet);
    fetch("/api/getCreditScoresByUser", {
      method: "POST",
      body: JSON.stringify({ userAddress: state.wallet }),
    }).then((res) => res.json()).then((res) => {
      console.log("res", res);
      if(res.userLoanRequests.length > 0){
        setCreditScoreHistory(parseInt(res.userLoanRequests[0][2]["hex"]));
      }
    })
  }, [state]);

  return (
    <div className="flex justify-center flex-col pt-20 w-full">
      <p className="font-bold text-3xl text-center  break-words lg:px-32 pt-7">
        Vision: Our vision is to make unsecured credit lending possible in the blockchain realm.
      </p>
      
      {state.wallet ? (
        <p className="font-bold text-3xl text-center  break-words lg:px-32 pt-7">
          Credit Score: {creditScoreHistory}
          <GaugeComponent
            id="gauge-component4"
            arc={{
              gradient: true,
              width: 0.2,
              padding: 0,
              subArcs: [
                {
                  limit: 0,
                  color: '#ffffff',
                  showTick: true
                },
                {
                  limit: 300,
                  color: '#dddddd',
                  showTick: true
                },
                {
                  limit: 600,
                  color: '#5BE12C',
                  showTick: true
                },
                {
                  limit: 1000,
                  color: '#ffffff',
                  showTick: true
                },
                { color: '#EA4228' }
              ]
            }}
            labels={{
              valueLabel: { formatTextValue: value => value + '' },
              tickLabels: {
                type: 'outer',
                ticks: [
                ],
              }
            }}
            value={creditScoreHistory}
            minValue={0}
            maxValue={1000}
            pointer={{type: "arrow", elastic: true}}
          />
        </p>) : (<p></p>)}
      
      {state.wallet ? (
        <div className="flex justify-center py-10 flex-row space-x-3">
          
          <Button
            className="hover:opacity-50  underline text-xl"
            href="/loan"
          >
            Request a credit score
          </Button>
          <Button
            className="hover:opacity-50  underline text-xl"
            href="/score"
          >
            View my score history
          </Button>
        </div>
      ) : (
        <div className="flex flex-col justify-center py-10  space-x-3 black">
          <p className="font-bold text-xl text-center  break-words lg:px-32 pt-7">
            First, connect your polygon wallet (SCROLL TESTNET).
          </p>
          <p className="font-bold text-xl text-center  break-words lg:px-32 pt-2">
            Its important that you have balance and used your wallet in the last
            few weeks.
          </p>
        </div>
      )}
    </div>
  );
};
