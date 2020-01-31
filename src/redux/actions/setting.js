import {CREATENEWSHOPLIST, INITSHOPLIST} from '../types'


export const Createnewshoplist = () => dispatch => {
  dispatch({
    type: CREATENEWSHOPLIST
  })
}

export const initShoplist = () => dispatch => {
  dispatch({type: INITSHOPLIST})
}