import { useDispatch, useSelector } from 'react-redux';
import { IUserInfo } from '@/interfaces';
import { userSelector } from './selector';
import { resetUserInfoFromRedux, setUserInfoToRedux } from './slice';

export const useReduxUser = () => {
  const dispatch = useDispatch();
  const user = useSelector(userSelector);
  return {
    user,
    setUserInfo: (payload: IUserInfo) => dispatch(setUserInfoToRedux(payload)),
    resetUserInfo: () => dispatch(resetUserInfoFromRedux()),
  };
};
