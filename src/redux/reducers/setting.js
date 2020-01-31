import {CREATENEWSHOPLIST, INITSHOPLIST} from '../types'

const initialState = {
  createshoplist : false
}

const buyer = (state = initialState, action) => {
  switch (action.type) {
    case CREATENEWSHOPLIST: 
      return {
        ...state,
        createshoplist: true
      }
    case INITSHOPLIST: 
      return {
        ...state,
        createshoplist: false
      }
    default: {
      return state;
    }
  }
}

export default buyer