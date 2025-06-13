
import { Spinner } from "@/spinner/Spinner";
import { lazy, Suspense } from "react";

const LocationTracker = lazy(() =>
  Promise.all([
    import("./../../locationTracker/LocationTracker"),
    new Promise(resolve => setTimeout(resolve, 1000))
  ]).then(([module]) => module)
);

export default function Index() {
  return (
     <Suspense fallback={<Spinner />}>
       <LocationTracker />
      </Suspense>
  );
}
