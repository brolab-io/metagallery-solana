import { Transition } from "@headlessui/react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { updateStakingReward } from "../../services/pool.service";
import BoxFrame from "../__UI/BoxFrame";
import Button from "../__UI/Button";
import LableInput from "../__UI/LableInput";

type Props = {
  show: boolean;
  setShow: (show: boolean) => void;
  poolId: string;
  callback?: () => void;
};

type FormValues = {
  amount: string;
  rewardTokenMint: string;
  payrollIndex?: string;
};

const AddRewardModal = ({ show, setShow, poolId, callback }: Props) => {
  const { handleSubmit, register } = useForm<FormValues>();
  const { connection } = useConnection();
  const wallet = useWallet();
  const [isDepositting, setIsDepositting] = useState(false);

  const onSubmit = handleSubmit(async (values) => {
    setIsDepositting(true);
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
    } catch (error) {
      console.warn(error);
    } finally {
      setIsDepositting(false);
      setShow(false);
      callback?.();
    }
  });

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
          <BoxFrame className="p-8 w-[460px] max-w-[90w]">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-white">Deposit</div>
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
            <div className="mt-6">
              <LableInput label="Reward Token" {...register("rewardTokenMint")} />
              <LableInput label="Amount" {...register("amount")} />
              <LableInput label="Payroll Index" {...register("payrollIndex")} />
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
