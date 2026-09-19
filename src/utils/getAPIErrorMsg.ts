const getExtractFirstErrorMessage = (data: { [key: string]: unknown }) => {
  if (!data) return;
  const fields = Object.keys(data);
  if (!fields.length) return null;

  const first = fields[0];
  const value = data[first];
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
  return null;
};

export const getAPIErrorMsg = (
  errorInfo: { [key: string]: unknown } | null | undefined
) => {
  if (!errorInfo) return null;
  const errors = (errorInfo.errors ?? errorInfo.data) as
    | string
    | { [key: string]: unknown }
    | undefined;
  if (typeof errors === 'string') return errors;
  if (errors && typeof errors === 'object') {
    const firstMsg = getExtractFirstErrorMessage(errors);
    if (typeof firstMsg === 'string') return firstMsg;
  }
  return typeof errorInfo?.message === 'string' ? errorInfo.message : null;
};
