import * as React from "react";
import { useEffect } from "react";
import Wallet from "../../components/Wallet";
import { useListen } from "../../hooks/useListen";
import { useMetamask } from "../../hooks/useMetamask";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import HistoryForm from "../../components/form/historyForm";
import { initialState, stateManagement, useLoan } from "../../hooks/useLoan";
import IncomeForm from "../../components/form/incomeForm";
import ctaStyle from "../../components/cta.module.css";
import Script from "next/script";
import ZK from "../../components/zk";
import { readFile } from "fs/promises";
import { NextPage } from "next";

const steps = ["Predict Credit Score"];

const LoanForm: NextPage = (props) => {
  const { predict } = ZK(props);
  const { dispatch } = useMetamask();
  const { dispatch: dispatchLoan } = useLoan();
  const listen = useListen();

  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set<number>());
  useEffect(() => {
    stateManagement(dispatchLoan, listen, dispatch);
  }, []);
  const isStepOptional = (step: number) => {
    return step === 5;
  };

  const isStepSkipped = (step: number) => {
    return skipped.has(step);
  };

  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
      // You probably want to guard against something like this,
      // it should never occur unless someone's actively trying to break something.
      throw new Error("You can't skip a step that isn't optional.");
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped((prevSkipped) => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const StepForm = (props: any) => {
    const { activeStep } = props;
    switch (activeStep) {
      case 0:
        return (
          <HistoryForm
            nextPage={predict}
            prevPage={handleBack}
            activeStep={activeStep}
            steps={steps}
          ></HistoryForm>
        );
      case 1:
        return (
          <IncomeForm
            nextPage={predict}
            prevPage={handleBack}
            activeStep={activeStep}
            steps={steps}
          ></IncomeForm>
        );
      default:
        return (
          <Typography sx={{ mt: 2, mb: 1 }}>Step {activeStep + 1}</Typography>
        );
    }
  };
  const FormSteps = (props: any) => {
    const { activeStep } = props;
    return (
      <div className="min-h-[700px]">
        <StepForm activeStep={activeStep}></StepForm>
      </div>
    );
  };
  return (
    <>
      <Script src="/snarkjs.min.js" strategy="beforeInteractive" />
      <Wallet />
      <div
        className={
          "flex justify-center pt-10 pb-10 container mx-auto " + ctaStyle.form
        }
      >
        <div className="relative z-10 bg-white px-5 flex justify-center shadow-lg pt-5 rounded-lg">
          <Box sx={{ width: "400px" }}>
            <Stepper activeStep={activeStep}>
              {steps.map((label, index) => {
                const stepProps: { completed?: boolean } = {};
                const labelProps: {
                  optional?: React.ReactNode;
                } = {};
                if (isStepOptional(index)) {
                  labelProps.optional = (
                    <Typography variant="caption">Optional</Typography>
                  );
                }
                if (isStepSkipped(index)) {
                  stepProps.completed = false;
                }
                return (
                  <Step key={label} {...stepProps}>
                    <StepLabel {...labelProps}>{label}</StepLabel>
                  </Step>
                );
              })}
            </Stepper>
            <FormSteps activeStep={activeStep}></FormSteps>
          </Box>
        </div>
      </div>
    </>
  );
};

export default LoanForm;
