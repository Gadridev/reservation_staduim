import { useState } from "react";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { Button } from "../../../components/ui/Button";

export function SearchBar() {
  const [location, setLocation] = useState("Beni Mellal");
  const [date, setDate] = useState("Sat, 25 Jul");
  const [format, setFormat] = useState("5-a-side");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();


  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid max-w-[820px] grid-cols-1 gap-0.5 rounded-2xl bg-chalk p-2.5 shadow-2xl sm:grid-cols-[1.3fr_1fr_1fr_auto]"
    >
      <div className="border-b border-line px-4 py-2.5 sm:border-b-0 sm:border-r">
        <Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
      </div>
      <div className="border-b border-line px-4 py-2.5 sm:border-b-0 sm:border-r">
        <Input label="Date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div className="px-4 py-2.5">
        <Select
          label="Format"
          value={format}
          onChange={(e) => setFormat(e.target.value)}
          options={["5-a-side", "7-a-side", "11-a-side"]}
        />
      </div>
      <Button type="submit" className="m-1">
        🔍 Find
      </Button>
    </form>
  );
}
