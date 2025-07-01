import damageClient from "@/services/damage-client";
import type { Damage } from "@/types/Damage";
import { CanceledError } from "@/services/api-client";
import { useEffect, useState } from "react";

const useDamages = () => {
  const [damages, setDamages] = useState<Damage[]>([]);

  useEffect(() => {
    const { request, cancel } = damageClient.getAll<Damage>();
    request
      .then((res) => setDamages(res.data))
      .catch((err) => {
        if (err instanceof CanceledError) return;
        console.error("Fetch error:", err);
      });
    return () => cancel();
  }, []);
  return { damages };
};

export default useDamages;
