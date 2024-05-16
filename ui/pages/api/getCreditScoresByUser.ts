import type { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";
import XoraCreditScoreHistory from "../../public/XoraCreditScoreHistory.json";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("req.body")
  console.log(req.body)

  const { userAddress } = JSON.parse(req.body);

  const alchemyApiKey = process.env.ALCHEMY_API_KEY;
  const zkCreditScoreContractAddress = process.env
    .NEXT_PUBLIC_ZK_CREDIT_SCORE_CONTRACT_ADDRESS as string;
  const provider = new ethers.providers.JsonRpcProvider(
    `https://sepolia-rpc.scroll.io/`
  );

  const zkCreditScoreContract = new ethers.Contract(
    zkCreditScoreContractAddress,
    XoraCreditScoreHistory.abi,
    provider
  );

  const allLoanRequests = await zkCreditScoreContract.getCreditScoreRequests();

  const userLoanRequests = allLoanRequests.filter((loanRequest: any) => {
    if (loanRequest[0].toLowerCase() === userAddress.toLowerCase()) return true;
    return false;
  })
  userLoanRequests.sort((a:any, b:any) => (a.timestamp > b.timestamp ? -1 : 1));

  
  console.log(userLoanRequests.length)

  res.status(200).json({ userLoanRequests });
}
