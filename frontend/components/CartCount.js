import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { TransitionGroup, CSSTransition } from 'react-transition-group'

const AnimationStyle = styled.span`
  position: relative;
  .count {
    position: relative;
    display: block;
    transition: all 0.3s;
    backface-visibility: hidden;
  }
  .count-enter {
    transform: rotateX(0.5turn);
  }
  .count-active {
    transform: rotateX(0);
  }
  .count-exit {
    top: 0;
    position: absolute;
    transform: rotateX(0);
  }
  .count-exit-active {
    transform: rotateX(0.5turn);
  }
`
const Dot = styled.div`
  background: ${props => props.theme.red};
  color: white;
  border-radius: 50%;
  padding: 0.5rem;
  line-height: 2rem;
  min-width: 3rem;
  margin-left: 1rem;
  font-weight: 100;
  font-feature-settings: 'tnum';
  font-variant-numeric: tabular-nums;
`
const CartCount = ({ count }) => (
  <AnimationStyle>
    <TransitionGroup>
      <CSSTransition
        unmountOnExit
        classNames="count"
        className="count"
        key={count}
        timeout={{ enter: 300, exit: 300 }}
      >
        <Dot>{count}</Dot>
      </CSSTransition>
    </TransitionGroup>
  </AnimationStyle>
)

export default CartCount
