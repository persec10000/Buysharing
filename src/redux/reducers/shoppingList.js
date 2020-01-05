const initialState = {};

const shoppingList = (state = initialState, action) => {
  switch (action.type) {
    case 'updateShoppingList':
      return {
        ...state,
        itemList: action.itemList,
      };
    default: {
      return state;
    }
  }
};

export default shoppingList;
