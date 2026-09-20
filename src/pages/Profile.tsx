import { useReduxUser } from '@/redux';

export const Profile = () => {
  const { user } = useReduxUser();
  return <pre>{JSON.stringify(user, null, 2)}</pre>;
};
