import { useCallback, useState } from "react";

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

  const removeCreator = useCallback((index: number) => {
    setCreators((prev) => {
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  return (
    <div>
      {creators.map((creator, index) => {
        return (
          <div key={index} className="flex">
            <input className="w-2/3" type="text" value={creator.creator} />
            <input className="w-1/3" type="number" value={creator.share} />
            <button type="button" onClick={() => removeCreator(index)}>
              Remove
            </button>
          </div>
        );
      })}
      {creators.length < 5 && <button onClick={addCreator}>Add Creator</button>}
    </div>
  );
};

export default CreatorShare;
