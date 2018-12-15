import React from 'react'
import formatMoney from '../lib/formatMoney'
import styled from 'styled-components'
import RemoveFromCart from '../components/RemoveFromCart'

const CartItemStyles = styled.li`
  padding: 1rem 0;
  border: 1px solid ${props => props.theme.lightgrey};
  display: grid;
  align-items: center;
  grid-template-columns: auto 1fr auto;
  img {
    margin-right: 10px;
  }
  h3,
  p {
    margin: 0;
  }
`

const CartItem = ({ cartItem: { item, quantity, id } }) => (
  <CartItemStyles>
    <img width="100" src={item.image} alt={item.title} />
    <div className="cart-item-details">
      <h3>{item.title}</h3>
      <p>
        {formatMoney(item.price * quantity)}
        {' - '} <em>{quantity}</em>
      </p>
    </div>
    <RemoveFromCart id={id} />
  </CartItemStyles>
)

export default CartItem
