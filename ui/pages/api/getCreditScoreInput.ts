import type { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";
import XoraCreditScore from "../../public/XoraCreditScore.json";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("req.body")
  console.log(req.body)

  const { userAddress } = req.body;

  const alchemyApiKey = process.env.ALCHEMY_API_KEY;
  const zkCreditScoreContractAddress = process.env
    .XORA_CREDIT_SCORE_CONTRACT_ADDRESS as string;
  const provider = new ethers.providers.JsonRpcProvider(
    `https://sepolia-rpc.scroll.io/`
  );

  const zkCreditScoreContract = new ethers.Contract(
    zkCreditScoreContractAddress,
    XoraCreditScore.abi,
    provider
  );

  const creditScoreInput = await zkCreditScoreContract.getCreditScoreInput(userAddress);

  res.status(200).json({ creditScoreInput });
}
