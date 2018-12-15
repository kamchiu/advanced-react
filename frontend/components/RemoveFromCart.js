import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { CURRENT_USER_QUERY } from './User'

const REMOVE_CART_ITEM_MUTATION = gql`
  mutation removeFromCart($id: ID!) {
    removeFromCart(id: $id) {
      id
    }
  }
`

const BigButton = styled.button`
  font-size: 3rem;
  background: none;
  border: 0;
  &:hover {
    background: ${props => props.theme.red};
    cursor: pointer;
  }
`

export default class RemoveFromCart extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired
  }
  render() {
    return (
      <Mutation
        mutation={REMOVE_CART_ITEM_MUTATION}
        variables={{ id: this.props.id }}
      >
        {(removeFromCart, { loading, error }) => (
          <BigButton
            title="delete item"
            disabled={loading}
            onClick={() => {
              removeFromCart().catch(err => {
                alert(err.message)
              })
            }}
          >
            &times;
          </BigButton>
        )}
      </Mutation>
    )
  }
}
