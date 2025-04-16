import SchedulingScreen from "../SchedulingScreen";

export default function SchedulingScreenStoryboard() {
  return (
    <div className="bg-white min-h-screen">
      <SchedulingScreen
        campaignName="Test Campaign"
        recipientCount={120}
        onScheduleComplete={(date) => console.log("Scheduled for:", date)}
      />
    </div>
  );
}
