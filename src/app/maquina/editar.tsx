import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';

import { MachineForm } from '@/components/machine-form';
import { getMachine, getMachinePhotos, updateMachine, type MachineInput } from '@/db/machines';

export default function EditMachineScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const [initial, setInitial] = useState<MachineInput | null>(null);

  useEffect(() => {
    const machineId = Number(id);
    let active = true;
    Promise.all([getMachine(db, machineId), getMachinePhotos(db, machineId)]).then(
      ([machine, photos]) => {
        if (!active) return;
        if (!machine) {
          router.back();
          return;
        }
        setInitial({
          name: machine.name,
          kind: machine.kind,
          muscles: machine.muscles,
          tips: machine.tips,
          coverUri: machine.cover_uri,
          photoUris: photos.map((p) => p.uri),
        });
      }
    );
    return () => {
      active = false;
    };
  }, [db, id]);

  if (!initial) return null;

  return (
    <MachineForm
      initial={initial}
      submitLabel="Guardar cambios"
      onSubmit={async (machine) => {
        await updateMachine(db, Number(id), machine);
        router.back();
      }}
    />
  );
}
