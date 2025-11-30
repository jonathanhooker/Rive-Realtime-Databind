"use client";
// import { RealtimeCursors } from '@/components/realtime-cursors'
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRive, useViewModel, useViewModelInstance, useViewModelInstanceBoolean, useViewModelInstanceNumber } from "@rive-app/react-webgl2";

export async function RiveStatePage() {
  const supabase = await createClient();
  const { data: riveState } = await supabase
    .from("rive-state")
    .select()
    .limit(1)
    .single();

  return <pre>{JSON.stringify(riveState, null, 2)}</pre>;
}

export default function Controller() {
  const { rive, RiveComponent } = useRive({
    src: "/rive/controller.riv",
    artboard: "device_scene",
    stateMachines: "State Machine 1",
    autoplay: true,
    autoBind: true,
    // onLoad: (rive) => {
    //   console.log("Rive loaded:", rive);
    //   // rive?.play();
    // },
    // onRiveReady: (rive) => {
    //   console.log("Rive ready:", rive);
    //   rive?.play();
    // }
  });

  const viewModel = useViewModel(rive);
  const vmi = useViewModelInstance(viewModel, { rive });

  const { value: slider_1_val, setValue: setSlider1Val } = useViewModelInstanceNumber(
    "slider_1/value",
    vmi
  );
  const { value: isTransitioning } = useViewModelInstanceBoolean(
    "transitioning",
    vmi
  );

  useEffect(() => {
    if(slider_1_val !== null && !isTransitioning){
      console.log("slider_1_val:", slider_1_val);
    }
  }, [rive, slider_1_val, isTransitioning]);

  useEffect(() => {
    
  }, [rive]);

  return (
    <div className="w-screen h-screen">
      <RiveComponent />
    </div>
  );
}
