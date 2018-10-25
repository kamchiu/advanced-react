import React, { Component } from 'react'
import styled, { ThemeProvider, injectGlobal } from 'styled-components'
import Header from '../components/Header'
import Meta from './Meta'

const theme = {
  red: '#f00',
  balck: '#393939',
  grey: '#3a3a3a',
  lightgrey: '#e1e1e1',
  maxWidth: '1000px',
  bs: '0 12px 24px 0 rgba(0, 0, 0, .09)'
}

injectGlobal`
  @font-face {
    font-family: 'radnika_next';
    src: url('/static/radnikanext-medium-webfont.woff2') format('woff2');
    font-weight: normal;
    font-style: normal;
  }
  html {
    box-sizing: border-box;
    font-size: 10px;
  }
  *, *:before, *:after {
    box-sizing: inherit;
  }
  body {
    margin: 0;
    padding: 0;
    font-size: 1.5rem;
    line-height: 2;
    font-family: 'radnika_next';
  }
  a {
    text-decoration: none;
    color: ${theme.balck};
  }
`

const StyledPage = styled.div`
  background: white;
  color: ${props => props.theme.balck};
`
const Inner = styled.div`
  max-width: ${props => props.theme.maxwidth};
  margin: 0 auto;
  padding: 2rem;
`

class Page extends Component {
  render() {
    return (
      <ThemeProvider theme={theme}>
        <StyledPage>
          <Meta />
          <Header />
          <Inner>{this.props.children}</Inner>
        </StyledPage>
      </ThemeProvider>
    )
  }
}

export default Page
