import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import Panel from '@/components/dashboard/Panel';
import { TextField } from '@/components/common/FormField';
import { useScopedData } from '@/hooks/useScopedData';
import { useToast } from '@/context/ToastContext';
import { profileSchema } from '@/utils/schemas';
import { ROLES } from '@/utils/constants';
import { formatDate, initials } from '@/utils/format';

export default function Profile() {
  const { user, role, institute, actions } = useScopedData();
  const toast = useToast();
  const { register, handleSubmit, formState: { errors, isDirty } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user.name, email: user.email, phone: user.phone || '', designation: user.designation || '' },
  });

  const save = handleSubmit((v) => {
    actions.updateUser(user.id, { name: v.name, email: v.email, phone: v.phone, designation: v.designation, role: user.role });
    toast.success('Profile updated', 'Saved locally in this browser (demo).');
  });

  return (
    <>
      <PageHeader title="Profile" description="Your demo account details. Stored only in this browser." />
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Account">
          <div className="flex flex-col items-center text-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-navy text-2xl font-bold text-white">{initials(user.name)}</span>
            <p className="mt-3 text-base font-semibold text-ink">{user.name}</p>
            <p className="text-sm text-muted">{ROLES[role].label} (demo)</p>
          </div>
          <dl className="mt-5 space-y-3 border-t border-line pt-4 text-sm">
            <div><dt className="text-xs font-semibold text-muted">Organisation</dt><dd className="text-ink">{institute?.name || user.organization}</dd></div>
            <div><dt className="text-xs font-semibold text-muted">User ID</dt><dd className="text-ink">{user.id}</dd></div>
            <div><dt className="text-xs font-semibold text-muted">Created</dt><dd className="text-ink">{formatDate(user.createdAt)}</dd></div>
          </dl>
        </Panel>
        <Panel title="Contact information" className="lg:col-span-2">
          <form onSubmit={save} noValidate className="grid gap-5 sm:grid-cols-2">
            <TextField label="Name" required error={errors.name?.message} {...register('name')} />
            <TextField label="Email" type="email" required error={errors.email?.message} {...register('email')} />
            <TextField label="Phone" type="tel" {...register('phone')} />
            <TextField label="Designation" {...register('designation')} />
            <TextField label="Role" value={ROLES[role].label} readOnly disabled hint="Change role with the demo role switcher in the top bar." />
            <TextField label="Organisation" value={institute?.name || user.organization} readOnly disabled />
            <div className="sm:col-span-2"><button type="submit" className="btn btn-primary" disabled={!isDirty}><Save size={16} /> Save changes</button></div>
          </form>
        </Panel>
      </div>
    </>
  );
}
