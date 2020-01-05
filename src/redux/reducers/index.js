import {combineReducers} from 'redux';
import user from './user';
import itemLibrary from './itemLibrary';
import shoppingList from './shoppingList';

const rootReducer = combineReducers({
  user: user,
  itemLibrary: itemLibrary,
  shoppingList: shoppingList,
});

export default rootReducer;
