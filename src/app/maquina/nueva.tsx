import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import { MachineForm } from '@/components/machine-form';
import { addMachine } from '@/db/machines';

export default function NewMachineScreen() {
  const db = useSQLiteContext();

  return (
    <MachineForm
      submitLabel="Guardar"
      onSubmit={async (machine) => {
        await addMachine(db, machine);
        router.back();
      }}
    />
  );
}
