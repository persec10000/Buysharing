export const updateData = user => {
  return {
    type: 'updateData',
    user,
  };
};

export const signOut = () => {
  return {
    type: 'signOut',
  };
};
