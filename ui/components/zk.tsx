import { useEffect, useState } from "react";
import { initialize, ZoKratesProvider } from "zokrates-js";
import { useMetamask } from "../hooks/useMetamask";
import getTransactions, { getAggregatedWeb2Data } from "../utils/transactions";
import { useLoan } from "../hooks/useLoan";
import LoanApproovalModel from "../utils/model";
const snarkjs = require("snarkjs");
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import axios from "axios";

const ZK = (props: any) => {
  const { push } = useRouter();
  const { state } = useMetamask();
  const { state: loanState, dispatch } = useLoan();
  const [zokratesProvider, setZokratesProvider] = useState<ZoKratesProvider>();
  const makeLoanRequest = async (proofs: string[], score: number) => {
    const { wallet } = state;
    const loanRequest = await fetch("/api/addCreditScoreRequest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requesterAddress: wallet,
        proofs,
        score,
      }),
    });
    return await loanRequest.json();
  };
  useEffect(() => {
    const load = async () => {
      let provider = await initialize();
      setZokratesProvider(provider);
    };
    load();
  }, []);
  const success = async (msg: any, timeout: number = 3000) => {
    toast.success(msg, {
      position: "top-right",
      autoClose: timeout,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
    await sleep(timeout);
  };
  const info = async (msg: string) => {
    toast.info(msg, {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
    await sleep(3000);
  };
  const error = async (msg: any) => {
    toast.error(msg, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
    await sleep(3000);
  };
  const sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  const predict = async () => {
    console.log(loanState);
    dispatch({ type: "analysis", isAnalyzing: true });
    try {
      await info("Predict Credit Score using ZKML...");

      console.log("Start prediction");
      // Make sure to provide your actual API key here.
      const SINDRI_API_KEY = process.env.SINDRI_API_KEY || "sindri_LIGfsK27MJRV4ngpqQkj3rgpNLlRTA4d_0CdU";
      const circuitId = "4ac3da9b-ef5c-423e-9ed6-e505e2eb19a3";
      
      // Use v1 of the Sindri API.
      axios.defaults.baseURL = "https://sindri.app/api/v1";
      // Authorize all future requests with an `Authorization` header.
      axios.defaults.headers.common["Authorization"] = `Bearer ${SINDRI_API_KEY}`;
  
      const { income, age, mortdue, patrimony, family, zip } = loanState;
      const ethBalance = Math.round(mortdue * 10000);
      // Generate a new proof and poll for completion.
      const proofInput = `inputs = [${ethBalance}, ${patrimony}, ${age}, ${family}, ${income}, ${zip}]`;
      console.log("proofInput: ", proofInput);
      const proveResponse = await axios.post(`/circuit/${circuitId}/prove`, {
        proof_input: proofInput,
      });
      const proofId = proveResponse.data.proof_id;
      console.log("Proof ID:", proofId);
      const startTime = Date.now();
      let proofDetailResponse;
      while (true) {
        proofDetailResponse = await axios.get(`/proof/${proofId}/detail`);
        const { status } = proofDetailResponse.data;
        const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(1);
        if (status === "Ready") {
          console.log(`Polling succeeded after ${elapsedSeconds} seconds.`);
          break;
        } else if (status === "Failed") {
          throw new Error(
            `Polling failed after ${elapsedSeconds} seconds: ${proofDetailResponse.data.error}.`,
          );
        } else if (Date.now() - startTime > 30 * 60 * 1000) {
          throw new Error("Timed out after 30 minutes.");
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      console.log("Proof Output:");
      console.log(proofDetailResponse.data.proof);
      console.log("Public Output:");
      console.log(proofDetailResponse.data.public);
      const returnString = proofDetailResponse.data.public["Verifier.toml"];
      const hexRegex = /0x[0-9a-fA-F]+/;
      const match = returnString.match(hexRegex);
      let score = 0;
      let creditScoreProof = "";
      if (match) {
        const hexString = match[0];
        console.log("hexString: ", hexString);
  
        score = parseInt(hexString, 16);
        console.log(score);
        creditScoreProof = proofDetailResponse.data.proof["proof"];
        console.log("creditScoreProof", creditScoreProof);
      }
      await info(
        "Computing proof of elegibility based on the financial data you provided..."
      );
      // const flowAggregations = getAggregatedWeb2Data(ccavg, income, loan);
      // const { snarkjsProof: web2BalanceProof } = await computeProofOfBalance(
      //   flowAggregations
      // );
      // await info("Computing loan approval...");
      // const loanApprovalModel = new LoanApproovalModel();
      // await loanApprovalModel.loadModel();
      // const input = { ...loanState };
      // const data = await loanApprovalModel.predict(input);
      // if (data?.prediction == 0) {
      //   throw new Error("Not approved");
      // }
      const proofs = [
        JSON.stringify(creditScoreProof),
      ];
      console.log(proofs);
      dispatch({ type: "loanResult", proofs, score: score });
      await info("Persisting your score data in our contract...");
      await makeLoanRequest(proofs, score);
      await success(
        <div className="flex flex-col">
          <p className="text-sm">Your credit score is predicted!</p>
        </div>,
        5000
      );
    } catch (err: any) {
      console.log(err);
      await error(
        <div className="flex flex-col">
          <p className="text-sm">You are not elegible for a loan this time.</p>
          <p className="text-xs">Try again in a few weeks</p>
        </div>
      );
    } finally {
      await sleep(5000);
      push("/");
      dispatch({ type: "analysis", isAnalyzing: false });
    }
  };
  const getAggregations = async (): Promise<
    [[string, string, string, string], string]
  > => {
    const { wallet, balance } = state;
    const { loan } = loanState;
    const parsedBalance = ((+balance! + 1) / 10 ** 12).toFixed(0);
    const { expenses, earnings, balanceRatio, averageEarning, averageExpense } =
      await getTransactions(wallet!);
    return [
      [
        parsedBalance,
        earnings.toFixed(0),
        expenses.toFixed(0),
        balanceRatio.toFixed(0),
      ],
      loan.toFixed(0),
    ];
  };
  const computeProofOfBalance = async (
    inputs: [[string, string, string, string], string]
  ) => {
    try {
      const program = zokratesProvider!.compile(props.source);
      //const inputs = await getAggregations();
      const output = zokratesProvider!.computeWitness(program, inputs, {
        snarkjs: true,
      });
      const provingKey = Uint8Array.from(Buffer.from(props.provingKey, "hex"));
      const zokratesProof = zokratesProvider!.generateProof(
        program.program,
        output.witness,
        provingKey
      );

      // optionally we can use snarkjs to prove :)
      const zkey = Uint8Array.from(Buffer.from(props.snarkjs.zkey, "hex"));
      const snarkjsProof = await snarkjs.groth16.prove(
        zkey,
        output!.snarkjs!.witness
      );
      console.log(zokratesProof);
      await success("Your proof of balance was computed with success!");
      return { zokratesProof, snarkjsProof };
    } catch (e) {
      console.log(inputs);
      console.log(e);
      throw new Error(
        "You are not elegible for a loan this time. Try again in a few weeks!"
      );
    }
  };

  return { predict };
};

export default ZK;
