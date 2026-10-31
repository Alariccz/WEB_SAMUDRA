import React from "react";
import Weather from "./weather";

export default function WeatherDemo() {
  return (
    <div className="flex items-center justify-center p-10 bg-slate-950 min-h-screen">
      <Weather
        place="Yogyakarta, DIY"
        summary="Cerah Berawan · Pesisir Siaga"
        hour={12}
        sky="partly"
        condition="Cerah Berawan"
        temp={29}
        feels={34}
        rain={10}
        wind="9.4 km/h"
        live
        clock="12:00 WIB"
        hours={[
          { label: "Now", hour: 12, kind: "partly", temp: 29 },
          { label: "14", hour: 14, kind: "cloud", temp: 31 },
          { label: "16", hour: 16, kind: "rain", temp: 28 },
          { label: "18", hour: 18, kind: "cloud", temp: 26 },
          { label: "20", hour: 20, kind: "clear", temp: 25 },
          { label: "22", hour: 22, kind: "clear", temp: 24 },
        ]}
        days={[
          { name: "Hari Ini", kind: "partly", low: 23, high: 32 },
          { name: "Min", kind: "cloud", low: 23, high: 31 },
          { name: "Sen", kind: "rain", low: 22, high: 30 },
          { name: "Sel", kind: "rain", low: 23, high: 29 },
          { name: "Rab", kind: "partly", low: 24, high: 31 },
          { name: "Kam", kind: "clear", low: 23, high: 32 },
          { name: "Jum", kind: "partly", low: 23, high: 31 },
        ]}
      />
    </div>
  );
}
