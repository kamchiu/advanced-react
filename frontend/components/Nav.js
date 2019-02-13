import Link from 'next/link'

import { TOGGLE_CART_MUTATION } from '../components/Cart'
import { Mutation } from 'react-apollo'
import User from './User'
import NavStyles from './styles/NavStyles'
import Signout from './Signout'
import CartCount from './CartCount'

const Nav = () => (
  <User>
    {({ data: { me } }) => (
      <NavStyles>
        <Link href="/">
          <a>Shop</a>
        </Link>
        {me && (
          <>
            <Link href="/sell">
              <a>Sell</a>
            </Link>
            <Link href="/signup">
              <a>Signup</a>
            </Link>
            <Link href="/orders">
              <a>Orders</a>
            </Link>
            <Link href="/me">
              <a>Account</a>
            </Link>
            <Signout />
            <Mutation mutation={TOGGLE_CART_MUTATION}>
              {toggleCart => (
                <button onClick={toggleCart}>
                  my cart{' '}
                  <CartCount
                    count={me.cart.reduce((ex, x) => ex + x.quantity, 0)}
                  />
                </button>
              )}
            </Mutation>
          </>
        )}
        {!me && (
          <Link href="/signup">
            <a>Sign In</a>
          </Link>
        )}
      </NavStyles>
    )}
  </User>
)
export default Nav
