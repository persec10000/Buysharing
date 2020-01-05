const initialState = {};

const itemLibrary = (state = initialState, action) => {
  switch (action.type) {
    case 'updateList':
      return {
        ...state,
        itemList: action.itemList,
      };
    default: {
      return state;
    }
  }
};

export default itemLibrary;
