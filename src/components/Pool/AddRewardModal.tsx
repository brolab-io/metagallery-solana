import { Transition } from "@headlessui/react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { updateStakingReward } from "../../services/pool.service";
import { TReadablePool } from "../../services/serde/states/pool";
import { getCurrentPayrollIndex } from "../../services/util.service";
import BoxFrame from "../__UI/BoxFrame";
import Button from "../__UI/Button";
import LableInput from "../__UI/LableInput";

type Props = {
  show: boolean;
  setShow: (show: boolean) => void;
  poolData?: TReadablePool | null;
  callback?: () => void;
  poolId: string;
};

type FormValues = {
  amount: string;
  rewardTokenMint: string;
  payrollIndex?: string;
};

const AddRewardModal = ({ show, setShow, poolData, callback, poolId }: Props) => {
  const { handleSubmit, register, setValue } = useForm<FormValues>();
  const { connection } = useConnection();
  const wallet = useWallet();
  const [isDepositting, setIsDepositting] = useState(false);
  const [currentPayrollIndex, setCurrentPayrollIndex] = useState(0);

  const onSubmit = handleSubmit(async (values) => {
    setIsDepositting(true);
    let toastId = toast.info("Depositing...", {
      autoClose: false,
      isLoading: true,
    });

    try {
      await updateStakingReward(
        wallet,
        {
          amount: values.amount,
          rewardTokenMint: values.rewardTokenMint,
          poolId,
          payrollIndex: values.payrollIndex,
        },
        connection
      );
      toast.update(toastId, {
        render: "Reward added successfully",
        type: "success",
        autoClose: 3000,
        isLoading: false,
      });
    } catch (error) {
      console.warn(error);
      toast.update(toastId, {
        render: "Error adding reward",
        type: "error",
        autoClose: 3000,
        isLoading: false,
      });
    } finally {
      setIsDepositting(false);
      setShow(false);
      callback?.();
    }
  });

  useEffect(() => {
    if (poolData && poolData.rewardPeriod && poolData.startAt) {
      const currentIndex = getCurrentPayrollIndex(
        Math.floor(Date.now() / 1000),
        poolData.rewardPeriod.toNumber(),
        poolData.startAt.toNumber()
      );
      setValue("payrollIndex", currentIndex.toString());
      setCurrentPayrollIndex(currentIndex);
    }
  }, [poolData, setValue]);

  return (
    <Transition
      show={show}
      enter="transition-opacity duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-300"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
        <form onSubmit={onSubmit} className="bg-[#0C1226]">
          <BoxFrame className="p-8 w-[640px] max-w-[90w]">
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-white">Add Reward</div>
              <button disabled={isDepositting} type="button" onClick={() => setShow(false)}>
                <svg
                  className="w-6 h-6 text-white fill-current"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>
            <div className="mt-6 space-y-6">
              <LableInput label="Reward Token" {...register("rewardTokenMint")} />
              <LableInput label="Amount" {...register("amount")} />
              <LableInput
                label={`Payroll Index (Current is: ${currentPayrollIndex})`}
                {...register("payrollIndex")}
              />
            </div>
            <div className="mt-6">
              <Button type="submit" isLoading={isDepositting} className="w-full">
                {"Deposit"}
              </Button>
            </div>
          </BoxFrame>
        </form>
      </div>
    </Transition>
  );
};

export default AddRewardModal;
