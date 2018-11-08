import App, { Container } from 'next/app'
import Page from '../components/Page'
import withData from '../lib/withData'
import { ApolloProvider } from 'react-apollo'

class MyApp extends App {
  static async getInitialProps({ Component, ctx }) {
    let pageProps = {}
    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx)
    }
    // expose the query to the users
    pageProps.query = ctx.query
    return { pageProps }
  }
  render() {
    const { Component, apollo, pageProps } = this.props

    return (
      <Container>
        <ApolloProvider client={apollo}>
          <Page>
            <Component {...pageProps} />
          </Page>
        </ApolloProvider>
      </Container>
    )
  }
}

export default withData(MyApp)
