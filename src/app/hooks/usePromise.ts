import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Nullable<T> = T | null;

type Data<T, I = T | undefined> = {
  isLoading: boolean;
  error: unknown;
  data: undefined extends I ? Nullable<T> : T;
};

const usePromise = <T, I = T | undefined>(promise: Promise<T>, initValue?: I) => {
  let _initValueRef = useRef(initValue);
  const [state, setState] = useState<Data<T, I>>({
    isLoading: true,
    error: null,
    data: (initValue || null) as undefined extends I ? Nullable<T> : T,
  });

  const run = useCallback(async () => {
    try {
      console.log("usePromise: run", promise);
      const data = await promise;
      console.log("usePromise: run: data", data);
      setState({ isLoading: false, error: null, data });
    } catch (error) {
      setState({
        isLoading: false,
        error,
        data: (_initValueRef.current || null) as undefined extends I ? Nullable<T> : T,
      });
    }
  }, [promise]);

  useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(() => {
    return {
      ...state,
      run,
    };
  }, [state, run]);

  return value;
};

export default usePromise;
