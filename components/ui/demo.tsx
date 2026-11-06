import { NotchedProjectCard } from "./notched-project-card";

/* Three cards, one per device (desktop, phone, tablet), and three
   confessions from a designer who would rather not build her own cards. */

export default function Demo() {
  return (
    <div className="grid w-full max-w-6xl gap-x-6 gap-y-12 p-6 min-[700px]:grid-cols-3 lg:gap-x-8 lg:p-8">
      {/* Step 1 */}
      <NotchedProjectCard
        href="#simulasi"
        title="BMKG Merilis Informasi"
        description="Data real-time magnitudo, episentrum, kedalaman, dan tingkat peringatan diverifikasi serta diproses dalam hitungan detik."
        image="/img/step-1-bmkg-monitor.jpg"
        badge="TELEMETRI SENSOR"
        tags={["Sensor BMKG", "< 3 Detik", "Verifikasi Otomatis"]}
        step="01"
        accent="#00d2ff"
      />
      {/* Step 2 */}
      <NotchedProjectCard
        href="#simulasi"
        title="Anda Mendapat Notifikasi"
        description="Peringatan darurat langsung dikirim ke gawai warga pesisir dengan instruksi padat, lugas, dan bebas kepanikan."
        image="/img/step-2-emergency-alert.jpg"
        badge="EDGE BROADCAST"
        tags={["Edge Push", "Multi-Platform", "Siaga Cepat"]}
        step="02"
        accent="#00d2ff"
      />
      {/* Step 3 */}
      <NotchedProjectCard
        href="#fitur"
        title="Anda Mengikuti Rute"
        description="Navigasi evakuasi mandiri memandu Anda ke titik aman dan bukit terdekat, menghindari jembatan dan area genangan."
        image="/img/step-3-evacuation-route.jpg"
        badge="NAVIGASI EVAKUASI"
        tags={["Offline GPS", "Peta Lokal", "Elevasi Aman"]}
        step="03"
        accent="#00d2ff"
      />
    </div>
  );
}
