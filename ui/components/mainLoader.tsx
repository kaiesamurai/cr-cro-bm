import { PacmanLoader } from "react-spinners";

export default function MainLoader(props: any) {
  const { isLoading } = props;
  return (
    <>
      {isLoading && (
        <div className="fixed w-full h-full z-50 top-0 bottom-0 bg-slate-50 opacity-90">
          <div className="flex flex-col items-center justify-center h-full opacity-100">
            <PacmanLoader color="#36d7b7" />
            <p></p>
            <p className="text-2xl text-slate-500 font-bold">
              Computing your credit score request...
            </p>
          </div>
        </div>
      )}
    </>
  );
}
