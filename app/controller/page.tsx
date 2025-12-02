"use client";
import { useEffect, useEffectEvent, useState } from "react";
import {
  Alignment,
  Fit,
  Layout,
  useRive,
  useViewModel,
  useViewModelInstance,
  useViewModelInstanceBoolean,
  useViewModelInstanceEnum,
  useViewModelInstanceNumber,
  useViewModelInstanceTrigger
} from "@rive-app/react-webgl2";
import { useSyncState } from "@/hooks/use-synced-state";

export default function Controller() {
  const { data, setData } = useSyncState(1);
  const [initialSync, setInitialSync] = useState(false);
  const { rive, RiveComponent } = useRive({
    src: "/rive/controller.riv",
    artboard: "device_scene",
    stateMachines: "State Machine 1",
    autoplay: true,
    autoBind: true,
    layout: new Layout({
      fit: Fit.FitHeight,
      alignment: Alignment.Center,
    }),
  });

  const viewModel = useViewModel(rive);
  const vmi = useViewModelInstance(viewModel, { rive });
  const { value: mode, setValue: setMode } =
    useViewModelInstanceEnum("mode", vmi);
  const { value: slider_1_val, setValue: setSlider1Val } =
    useViewModelInstanceNumber("slider_1/value", vmi);
  const { value: slider_2_val, setValue: setSlider2Val } =
    useViewModelInstanceNumber("slider_2/value", vmi);
  const { value: slider_3_val, setValue: setSlider3Val } =
    useViewModelInstanceNumber("slider_3/value", vmi);
  const { value: slider_4_val, setValue: setSlider4Val } =
    useViewModelInstanceNumber("slider_4/value", vmi);
  const { value: slider_5_val, setValue: setSlider5Val } =
    useViewModelInstanceNumber("slider_5/value", vmi);
  const { value: slider_6_val, setValue: setSlider6Val } =
    useViewModelInstanceNumber("slider_6/value", vmi);
  const { value: slider_7_val, setValue: setSlider7Val } =
    useViewModelInstanceNumber("slider_7/value", vmi);
  const { value: slider_8_val, setValue: setSlider8Val } =
    useViewModelInstanceNumber("slider_8/value", vmi);
  const { value: slider_9_val, setValue: setSlider9Val } =
    useViewModelInstanceNumber("slider_9/value", vmi);
  const { value: slider_10_val, setValue: setSlider10Val } =
    useViewModelInstanceNumber("slider_10/value", vmi);
  const { value: slider_11_val, setValue: setSlider11Val } =
    useViewModelInstanceNumber("slider_11/value", vmi);
  const { value: slider_12_val, setValue: setSlider12Val } =
    useViewModelInstanceNumber("slider_12/value", vmi);
  const { value: slider_13_val, setValue: setSlider13Val } =
    useViewModelInstanceNumber("slider_13/value", vmi);
  const { value: slider_14_val, setValue: setSlider14Val } =
    useViewModelInstanceNumber("slider_14/value", vmi);
  const { value: slider_15_val, setValue: setSlider15Val } =
    useViewModelInstanceNumber("slider_15/value", vmi);
  const { value: slider_16_val, setValue: setSlider16Val } =
    useViewModelInstanceNumber("slider_16/value", vmi);
  const { value: isTransitioning } = useViewModelInstanceBoolean(
    "transitioning",
    vmi
  );

  const triggerMode1 = useEffectEvent(() => {
    console.log("Trigger mode 1", initialSync);
    if(initialSync){ setData({mode:1}); }
  });
  const triggerMode2 = useEffectEvent(() => {
    console.log("Trigger mode 2", initialSync);
    if(initialSync){ setData({mode:2}); }
  });
  const triggerMode3 = useEffectEvent(() => {
    console.log("Trigger mode 3", initialSync);
    if(initialSync){ setData({mode:3}); }
  });
  const triggerMode4 = useEffectEvent(() => {
    console.log("Trigger mode 4", initialSync);
    if(initialSync){ setData({mode:4}); }
  });

  useViewModelInstanceTrigger( 'click_mode_1', vmi, { onTrigger: triggerMode1 } );
  useViewModelInstanceTrigger( 'click_mode_2', vmi, { onTrigger: triggerMode2 } );
  useViewModelInstanceTrigger( 'click_mode_3', vmi, { onTrigger: triggerMode3 } );
  useViewModelInstanceTrigger( 'click_mode_4', vmi, { onTrigger: triggerMode4 } );

  const sendSliderUpdate = useEffectEvent((sliderNum: number, value: number | null) => {
    if(initialSync && value !== null && data){
      const key = `slider_${sliderNum}` as keyof typeof data;
      if(data[key] !== value)
        setData({ [key]: value });
    }
  });

  useEffect(() => { sendSliderUpdate(1, slider_1_val); }, [slider_1_val]);
  useEffect(() => { sendSliderUpdate(2, slider_2_val); }, [slider_2_val]);
  useEffect(() => { sendSliderUpdate(3, slider_3_val); }, [slider_3_val]);
  useEffect(() => { sendSliderUpdate(4, slider_4_val); }, [slider_4_val]);
  useEffect(() => { sendSliderUpdate(5, slider_5_val); }, [slider_5_val]);
  useEffect(() => { sendSliderUpdate(6, slider_6_val); }, [slider_6_val]);
  useEffect(() => { sendSliderUpdate(7, slider_7_val); }, [slider_7_val]);
  useEffect(() => { sendSliderUpdate(8, slider_8_val); }, [slider_8_val]);
  useEffect(() => { sendSliderUpdate(9, slider_9_val); }, [slider_9_val]);
  useEffect(() => { sendSliderUpdate(10, slider_10_val); }, [slider_10_val]);
  useEffect(() => { sendSliderUpdate(11, slider_11_val); }, [slider_11_val]);
  useEffect(() => { sendSliderUpdate(12, slider_12_val); }, [slider_12_val]);
  useEffect(() => { sendSliderUpdate(13, slider_13_val); }, [slider_13_val]);
  useEffect(() => { sendSliderUpdate(14, slider_14_val); }, [slider_14_val]);
  useEffect(() => { sendSliderUpdate(15, slider_15_val); }, [slider_15_val]);
  useEffect(() => { sendSliderUpdate(16, slider_16_val); }, [slider_16_val]);

  // useEffect(() => {
  //   if(slider_2_val !== null && !isTransitioning){
  //     console.log("slider_2_val:", slider_2_val);
  //   }
  // }, [slider_2_val, isTransitioning]);
  const syncToData = useEffectEvent(() => {
    // if (!initialSync && data && rive && data.slider_1) {
    if (data && rive && rive.isPlaying && data.mode) {
      if (!initialSync) {
        console.log("Initial sync from remote data:", data);
      }
      console.log("mode sync:", data.mode);
      setMode(`mode_${data.mode}`);
      if(data.slider_1 !== slider_1_val) setSlider1Val(data.slider_1);
      if(data.slider_2 !== slider_2_val) setSlider2Val(data.slider_2);
      if(data.slider_3 !== slider_3_val) setSlider3Val(data.slider_3);
      if(data.slider_4 !== slider_4_val) setSlider4Val(data.slider_4);
      if(data.slider_5 !== slider_5_val) setSlider5Val(data.slider_5);
      if(data.slider_6 !== slider_6_val) setSlider6Val(data.slider_6);
      if(data.slider_7 !== slider_7_val) setSlider7Val(data.slider_7);
      if(data.slider_8 !== slider_8_val) setSlider8Val(data.slider_8);
      if(data.slider_9 !== slider_9_val) setSlider9Val(data.slider_9);
      if(data.slider_10 !== slider_10_val) setSlider10Val(data.slider_10);
      if(data.slider_11 !== slider_11_val) setSlider11Val(data.slider_11);
      if(data.slider_12 !== slider_12_val) setSlider12Val(data.slider_12);
      if(data.slider_13 !== slider_13_val) setSlider13Val(data.slider_13);
      if(data.slider_14 !== slider_14_val) setSlider14Val(data.slider_14);
      if(data.slider_15 !== slider_15_val) setSlider15Val(data.slider_15);
      if(data.slider_16 !== slider_16_val) setSlider16Val(data.slider_16);
      setInitialSync(true);
    }
  });
  useEffect(() => {
    syncToData()
  }, [data]);

  return (
    <div className="w-screen h-screen relative">
      <RiveComponent />
    </div>
  );
}
