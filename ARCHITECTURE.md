# ARCforge: IoT Aquaculture Architecture

## 1. System Architecture
The system follows a tiered IoT architecture:
- **Edge Layer:** Sensor arrays (pH, Temp, DO, Turbidity, Water Level), Solar MPPT/Inverter, ESP32-CAM, and automated feeders/pumps connected to a local Raspberry Pi.
- **Fog/Local Control Layer:** The Raspberry Pi acts as the central hub, aggregating sensor data, performing local threshold-based automation (running Node.js/Python), and communicating with the cloud.
- **Cloud Layer (Firebase & Next.js):**
  - **Next.js App:** Hosts the professional web dashboard and the ingestion REST API (`/api/ingest`).
  - **Firebase Firestore:** Stores real-time sensor streams, automation logs, alert history, and system configurations.
  - **Firebase Auth:** Secures access to the dashboard.

## 2. Database Schema Additions (Firestore)
- **`cameras` (Collection):**
  - Document ID: Auto-generated
  - Fields: `name` (String), `location` (String), `streamUrl` (String), `status` (String - e.g. 'online', 'offline'), `enabled` (Boolean)
- **`telemetry` (Collection):**
  - Document ID: Auto-generated
  - Fields: `timestamp` (Date), `temperature` (Number), `pH` (Number), `turbidity` (Number), `waterLevel` (Number), `dissolvedOxygen` (Number), `batteryVoltage` (Number), `batterySoc` (Number), `solarGeneration` (Number)
- **`automation_logs` (Collection):**
  - Document ID: Auto-generated
  - Fields: `timestamp` (Date), `action` (String - e.g., 'PUMP_ON', 'FEEDER_ACTIVATE'), `trigger` (String - e.g., 'MANUAL', 'RULE_TEMP_HIGH'), `status` (String)
- **`feeding_schedules` (Collection):**
  - Document ID: Auto-generated
  - Fields: `time` (String - e.g., '08:00'), `quantityGrams` (Number), `enabled` (Boolean)
- **`alerts` (Collection):**
  - Document ID: Auto-generated
  - Fields: `timestamp` (Date), `type` (String), `message` (String), `resolved` (Boolean)

## 3. Hardware Integration Workflow
1. **Sensor Node (ESP32/Arduinos):** Reads analog/digital sensors and sends via I2C/Serial to the Raspberry Pi.
2. **Raspberry Pi Service:** A local Node.js or Python daemon reads the data every minute.
3. **Local Logic Check:** The Pi compares readings against safe ranges (e.g. Temp 20-28°C). If out of bounds, locally triggers the pump/aerator relay to ensure fail-safe operation (even if internet goes down).
4. **Cloud Sync:** The Pi makes a POST request to `https://[YOUR_APP_URL]/api/ingest` with the telemetry payload.
5. **Camera Node:** ESP32-CAM streams MJPEG directly to the local network. The dashboard embeds the IP stream or requests snapshots.

## 4. Automation Logic
**Water Quality Regulation:**
- **IF** `temperature > 28°C` OR `pH < 6.5` OR `pH > 8.5` OR `turbidity > 50` NTU:
  - **THEN** Activate Aerator, log to `automation_logs`, send SMS alert.
**Feeding System:**
- Runs on a cron schedule configured in the dashboard. Activates a servo attached to the Pi GPIO for n seconds based on `quantityGrams`.
**Power Management:**
- **IF** `batterySoc < 20%`:
  - **THEN** Disable secondary pumps/aerators to conserve power for main monitoring loop. Send low battery SMS.

## 5. Security & Deployment Best Practices
- **Security:** Ingestion endpoint guarded by an API key (`INGEST_API_KEY`). Firebase rules lock down read/write access to authenticated admins only. Role-based (Admin/Viewer) controls in the UI.
- **Deployment:** The Next.js app is deployed to Cloud Run or Vercel. Continuous deployment linked to the main branch.
- **Offline-First:** The Pi must retain logic locally. If the cloud is unreachable, Pi queues telemetry in a local SQLite DB and sends it later when connectivity is restored.

## 6. Future AI Expansion
- **Predictive Yield & Disease Detection:** Use historical telemetry in an ML model to predict optimal harvest conditions or detect water parameter trends that indicate impending disease outbreaks.
- **Computer Vision Analysis:** Route camera snapshots through Vertex AI / Gemini Vision to estimate crayfish size, detect abnormal behavior, or calculate remaining feed.
