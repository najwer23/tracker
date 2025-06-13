
import { Spinner } from "@/spinner/Spinner";
import { lazy, Suspense } from "react";

const LocationTracker = lazy(() => import("./../../locationTracker/LocationTracker"));

export default function Index() {
  return (
     <Suspense fallback={<Spinner />}>
       <LocationTracker />
      </Suspense>
  );
}
