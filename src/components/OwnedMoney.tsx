"use client";

import axios from "axios";
import { useQuery } from "react-query";

export default function OwnedMoney() {
  const { data: ownedMoney } = useQuery({
    queryKey: ["sub"],
    queryFn: async () => {
      const res = await axios.get("/api/nav_data/owned_money");

      return res.data.owned_money;
    },
  });

  return (
    <div className="flex items-center md:text-white pr-4 rounded-full border-2 border-blue-400 overflow-hidden">
      <span className="text-black">{ownedMoney || "0"}</span>

      <div className="bg-blue-400 text-white rounded-r-full h-7 py-1 px-2 mr-1.5 leading-4 text-sm">
        جنيها
      </div>
    </div>
  );
}
