import React from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { Job, Reason, useLoan } from "../../hooks/useLoan";
import { Box, InputLabel, MenuItem, Select } from "@mui/material";
import { useMetamask } from "../../hooks/useMetamask";

const validationSchema = yup.object({
});

export default function IncomeForm(props: any) {
  const { dispatch, state } = useLoan();
  const { nextPage, prevPage, activeStep, steps } = props;

  const {
    state: { status, isMetamaskInstalled, wallet, balance },
  } = useMetamask();
  
  let balanceInt = 0;
  if (typeof(balance) == 'string'){
    balanceInt = parseInt(balance);
  }
  state.mortdue = Math.round((balanceInt / 100000000000000))/10000;

  const formik = useFormik({
    initialValues: {
      mortgage: state.mortdue ? state.mortdue : 0,
      patrimony: state.value ? state.value : 1000.0,
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
          <InputLabel className="text-left pt-6 text-xs" id="reason-label">
            Reason for loan request
          </InputLabel>
          
          <TextField
            fullWidth
            id="mortgage"
            name="mortgage"
            label="ETH Balance"
            type="number"
            value={formik.values.mortgage}
            onChange={formik.handleChange}
            error={formik.touched.mortgage && Boolean(formik.errors.mortgage)}
            helperText={formik.touched.mortgage && formik.errors.mortgage}
            disabled={true}
          />
          <TextField
            fullWidth
            id="patrimony"
            name="patrimony"
            label="Wallet Age"
            type="number"
            value={formik.values.patrimony}
            onChange={formik.handleChange}
            error={formik.touched.patrimony && Boolean(formik.errors.patrimony)}
            helperText={formik.touched.patrimony && formik.errors.patrimony}
            disabled={true}
          />
          <TextField
            fullWidth
            id="age"
            name="age"
            label="Age"
            type="number"
            value={formik.values.age}
            onChange={formik.handleChange}
            error={formik.touched.age && Boolean(formik.errors.age)}
            helperText={formik.touched.age && formik.errors.age}
            disabled={true}
          />
          <TextField
            fullWidth
            id="family"
            name="family"
            label="# of family members"
            type="number"
            value={formik.values.family}
            onChange={formik.handleChange}
            error={formik.touched.family && Boolean(formik.errors.family)}
            helperText={formik.touched.family && formik.errors.family}
            disabled={true}
          />
          <TextField
            fullWidth
            id="income"
            name="income"
            label="yearly income in USD"
            type="number"
            value={formik.values.income}
            onChange={formik.handleChange}
            error={formik.touched.income && Boolean(formik.errors.income)}
            helperText={formik.touched.income && formik.errors.income}
            disabled={true}
          />
          <TextField
            fullWidth
            id="zip"
            name="zip"
            label="zip"
            type="number"
            value={formik.values.zip}
            onChange={formik.handleChange}
            error={formik.touched.zip && Boolean(formik.errors.zip)}
            helperText={formik.touched.zip && formik.errors.zip}
            disabled={true}
          />
          
        </div>

        <div className="flex flex-col justify-between pb-5">
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
