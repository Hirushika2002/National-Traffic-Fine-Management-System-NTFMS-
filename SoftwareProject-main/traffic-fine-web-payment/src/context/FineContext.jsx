import { createContext, useContext, useMemo, useState } from 'react';

const FineContext = createContext(null);

export function FineProvider({ children }) {
  const [fine, setFine] = useState(null);
  const [payment, setPayment] = useState(null);

  const value = useMemo(
    () => ({
      fine,
      setFine,
      payment,
      setPayment,
      reset: () => {
        setFine(null);
        setPayment(null);
      },
    }),
    [fine, payment],
  );

  return <FineContext.Provider value={value}>{children}</FineContext.Provider>;
}

export function useFineContext() {
  const context = useContext(FineContext);
  if (!context) {
    throw new Error('useFineContext must be used within a FineProvider');
  }
  return context;
}
