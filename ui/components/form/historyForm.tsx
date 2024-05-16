import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { useLoan } from "../../hooks/useLoan";
import { Box, Checkbox, FormControlLabel } from "@mui/material";
import { useMetamask } from "../../hooks/useMetamask";

const validationSchema = yup.object({
});

export default function HistoryForm(props: any) {
  const { dispatch, state } = useLoan();
  const { nextPage, prevPage, activeStep, steps } = props;
  const [ creditScoreInput, setCreditScoreInput ] = useState();
  const {
    state: { status, isMetamaskInstalled, wallet, balance },
  } = useMetamask();
  
  const getCreditScoreInputRequest = async (wallet: string) => {
    const creditScoreInputRes = await fetch("/api/getCreditScoreInput", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userAddress: wallet,
      }),
    });
    return await creditScoreInputRes.json();
  };

  useEffect(() => {
    async function fetchAndSetUser(wallet: string) {
      const creditScoreInputRes = await getCreditScoreInputRequest(wallet);
      setCreditScoreInput(creditScoreInputRes);
      const input1 = parseInt(creditScoreInputRes["creditScoreInput"][0]["hex"]) / Math.pow(10, 18);
      // state.mortdue = input1;
      formik.values.mortgage = input1;
      console.log("input1", input1);

      const input2 = parseInt(creditScoreInputRes["creditScoreInput"][1]["hex"]) / Math.pow(10, 18+8);
      // state.mortdue = input1;
      formik.values.patrimony = input2;
      console.log("input2", input2);

      const input3 = parseInt(creditScoreInputRes["creditScoreInput"][2]["hex"]) / Math.pow(10, 18) / Math.pow(10, 18);
      // state.mortdue = input1;
      formik.values.age = input3;
      console.log("input3", input3);

      const input4 = parseInt(creditScoreInputRes["creditScoreInput"][3]["hex"]) / Math.pow(10, 18) / Math.pow(10, 18+8);
      // state.mortdue = input1;
      formik.values.family = input4;
      console.log("input4", input4);

      const input5 = parseInt(creditScoreInputRes["creditScoreInput"][4]["hex"]) / Math.pow(10, 18);
      // state.mortdue = input1;
      formik.values.income = input5;
      console.log("input5", input5);

      const input6 = parseInt(creditScoreInputRes["creditScoreInput"][5]["hex"]) / Math.pow(10, 18+8);
      // state.mortdue = input1;
      formik.values.zip = input6;
      console.log("input6", input6);
    }
    if(creditScoreInput == undefined){
      if (wallet) {
        fetchAndSetUser(wallet);
      }
    }
    
  }, []);

  const formik = useFormik({
    initialValues: {
      mortgage: state.mortdue ? state.mortdue : 0,
      patrimony: state.value ? state.value : 0.0,
      age: state.age ? state.age : 0,
      zip: state.zip ? state.zip : undefined,
      family: state.family ? state.family : 0,
      income: state.income ? state.income : 0,
      securities: state.securities ? state.securities : false,
      creditCard: state.creditCard ? state.creditCard : false,
      online: state.online ? state.online : false,
      cdAccount: state.cdAccount ? state.cdAccount : false,
      creditScore: state.creditScore ? state.creditScore : 0,
      creditScoreProof: state.creditScoreProof ? state.creditScoreProof : "",
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      const {
        mortgage,
        patrimony,
        age,
        zip,
        family,
        income,
        securities,
        creditCard,
        online,
        cdAccount,
      } = values;
      dispatch({
        type: "history",
        mortdue: mortgage,
        value: patrimony,
        age,
        zip,
        family,
        income,
        securities,
        creditCard,
        online,
        cdAccount,
      });
      nextPage();
    },
  });


  return (
    <form className="h-full" onSubmit={formik.handleSubmit}>
      <div className="flex flex-col space-y-10 justify-between  max-w-[600px] pt-10 h-full">
        <div className="flex flex-col space-y-5 min-h-[650px] w-full">
          <p className="text-left pt-6 bold" id="reason-label">
          ETH Balance(ETH)
          </p>
          <TextField
            fullWidth
            id="mortgage"
            name="mortgage"
            label="ETH Balance (ETH)"
            type="number"
            value={formik.values.mortgage}
            onChange={formik.handleChange}
            error={formik.touched.mortgage && Boolean(formik.errors.mortgage)}
            helperText={formik.touched.mortgage && formik.errors.mortgage}
            disabled={true}
          />
          <p className="text-left pt-6 bold" id="reason-label">
          ETH Balance(USD)
          </p>
          <TextField
            fullWidth
            id="patrimony"
            name="patrimony"
            label="ETH Balance (USD)"
            type="number"
            value={formik.values.patrimony}
            onChange={formik.handleChange}
            error={formik.touched.patrimony && Boolean(formik.errors.patrimony)}
            helperText={formik.touched.patrimony && formik.errors.patrimony}
            disabled={true}
          />
          <p className="text-left pt-6 bold" id="reason-label">
          ERC20 Balance (ETH)
          </p>
          <TextField
            fullWidth
            id="age"
            name="age"
            label="ERC20 Balance (ETH)"
            type="number"
            value={formik.values.age}
            onChange={formik.handleChange}
            error={formik.touched.age && Boolean(formik.errors.age)}
            helperText={formik.touched.age && formik.errors.age}
            disabled={true}
          />
          <p className="text-left pt-6 bold" id="reason-label">
          ERC20 Balance (USD)
          </p>
          <TextField
            fullWidth
            id="family"
            name="family"
            label="ERC20 Balance (USD)"
            type="number"
            value={formik.values.family}
            onChange={formik.handleChange}
            error={formik.touched.family && Boolean(formik.errors.family)}
            helperText={formik.touched.family && formik.errors.family}
            disabled={true}
          />
          <p className="text-left pt-6 bold" id="reason-label">
          Yearly Income (ETH)
          </p>
          <TextField
            fullWidth
            id="income"
            name="income"
            type="number"
            value={formik.values.income}
            onChange={formik.handleChange}
            error={formik.touched.income && Boolean(formik.errors.income)}
            helperText={formik.touched.income && formik.errors.income}
            disabled={true}
          />
          <p className="text-left  bold" id="reason-label">
          Yearly Income (USD)
          </p>
          <TextField
            fullWidth
            id="zip"
            name="zip"
            type="number"
            value={formik.values.zip}
            onChange={formik.handleChange}
            error={formik.touched.zip && Boolean(formik.errors.zip)}
            helperText={formik.touched.zip && formik.errors.zip}
            disabled={true}
          />
          
        </div>

        <div className="flex flex-col justify-between pb-5">
          {/* <Button onClick={predictScore}>Predict</Button> */}
          <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
            {activeStep !== 0 && (
              <Button color="inherit" onClick={prevPage} sx={{ mr: 1 }}>
                Back
              </Button>
            )}
            <Box sx={{ flex: "1 1 auto" }} />
            <Button type="submit">
              {activeStep === steps.length - 1 ? "Finish" : "Next"}
            </Button>
          </Box>
        </div>
      </div>
    </form>
  );
}
