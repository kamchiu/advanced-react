import React from 'react'
import { Query, Mutation } from 'react-apollo'
import { adopt } from 'react-adopt'
import gql from 'graphql-tag'
import CartStyles from './styles/CartStyles'
import Supreme from './styles/Supreme'
import CloseButton from './styles/CloseButton'
import SickButton from './styles/SickButton'
import User from './User'
import CartItem from './CartItem'
import calcTotalPrice from '../lib/calcTotalPrice'
import formatMoney from '../lib/formatMoney'

const LOCAL_STATE_QUERY = gql`
  query {
    cartOpen @client
  }
`
const TOGGLE_CART_MUTATION = gql`
  mutation {
    toggleCart @client
  }
`

const Composed = adopt({
  // to avoid failing prop type warning by passing render function
  user: ({ render }) => <User>{render}</User>,
  toggleCart: ({ render }) => (
    <Mutation mutation={TOGGLE_CART_MUTATION}>{render}</Mutation>
  ),
  localState: ({ render }) => <Query query={LOCAL_STATE_QUERY}>{render}</Query>
})
const Cart = () => (
  <Composed>
    {({ user, localState, toggleCart }) => {
      const me = user.data.me
      if (!me) return null

      return (
        <CartStyles open={localState.data.cartOpen}>
          <header>
            <CloseButton title="close" onClick={toggleCart}>
              &times;
            </CloseButton>
            <Supreme>{me.name}'s Cart</Supreme>
            <p>you have {me.cart.length} Items in your cart</p>
          </header>
          <ul>
            {me.cart.map(item => (
              <CartItem cartItem={item} key={item.id} />
            ))}
          </ul>
          <footer>
            <p>{formatMoney(calcTotalPrice(me.cart))}</p>
            <SickButton>checkout</SickButton>
          </footer>
        </CartStyles>
      )
    }}
  </Composed>
)

export default Cart
export { LOCAL_STATE_QUERY, TOGGLE_CART_MUTATION }
