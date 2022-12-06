import { useCallback, useState } from "react";
import Button from "./Button";

type TCreatorShare = {
  creator: string;
  share: number;
};

const CreatorShare = () => {
  const [creators, setCreators] = useState<TCreatorShare[]>([]);

  const addCreator = useCallback(() => {
    setCreators((prev) => {
      if (prev.length >= 5) {
        return prev;
      }
      return [...prev, { creator: "", share: 0 }];
    });
  }, []);

  const removeCreator = useCallback((e: React.MouseEvent<HTMLButtonElement>, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setCreators((prev) => {
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const handleCreatorChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
      const field = e.target.name;
      const value = e.target.value;
      setCreators((prev) => {
        return prev.map((creator, i) => {
          if (i === index) {
            return { ...creator, [field]: value };
          }
          return creator;
        });
      });
    },
    []
  );

  return (
    <div className="space-y-4">
      <div>
        <label className="text-white text-[14px] sm:text-[16px] md:text-[18px] lg:text-[20px] xl:text-[24px] font-bold">
          Creator Share * (Max 5)
        </label>
      </div>
      {creators.map((creator, index) => {
        return (
          <div key={index} className="flex space-x-4">
            <input
              className="w-2/3 border-primary text-[17px] border-2 px-5 py-[18px] text-white uppercase font-bold bg-transparent outline-none"
              type="text"
              name="creator"
              placeholder="Creator address"
              onChange={(e) => handleCreatorChange(e, index)}
              value={creator.creator}
            />
            <input
              className="w-1/3 border-primary text-[17px] border-2 px-5 py-[18px] text-white uppercase font-bold bg-transparent outline-none"
              type="number"
              name="share"
              placeholder="Share percentage"
              onChange={(e) => handleCreatorChange(e, index)}
              value={creator.share}
              max={100}
              min={0}
            />
            <button type="button" className="px-4" onClick={(e) => removeCreator(e, index)}>
              Remove
            </button>
          </div>
        );
      })}
      {creators.length < 5 && (
        <Button type="button" onClick={addCreator}>
          Add Creator
        </Button>
      )}
    </div>
  );
};

export default CreatorShare;
