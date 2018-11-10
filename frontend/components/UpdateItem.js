import React, { Component } from 'react'
import { Mutation, Query } from 'react-apollo'
import Router from 'next/router'
import gql from 'graphql-tag'
import Form from './styles/Form'
import formatMoney from '../lib/formatMoney'
import Error from './ErrorMessage'

const QUERY_SINGLE_ITEM = gql`
  query QUERY_SINGLE_ITEM($id: ID!) {
    item(where: { id: $id }) {
      id
      title
      price
      description
    }
  }
`
const UPDATE_ITEM_MUTATION = gql`
  mutation UPDATE_ITEM_MUTATION(
    $id: ID!
    $title: String
    $description: String
    $price: Int
  ) {
    updateItem(
      id: $id
      title: $title
      description: $description
      price: $price
    ) {
      id
    }
  }
`
class UpdateItem extends Component {
  state = {}
  handleChange = e => {
    const { value, name, type } = e.target
    const val = type === 'number' ? parseFloat(value) : value

    this.setState({
      [name]: val
    })
  }
  updateItem = async (e, updateMutation) => {
    e.preventDefault()

    const res = await updateMutation({
      variables: {
        id: this.props.id,
        ...this.state
      }
    })
    console.log(res)
  }
  render() {
    return (
      <Query
        query={QUERY_SINGLE_ITEM}
        variables={{
          id: this.props.id
        }}
      >
        {({ data, loading }) => {
          if (loading) return <p>Loading...</p>
          if (!data.item) return <p>No data Found for id</p>
          return (
            <Mutation mutation={UPDATE_ITEM_MUTATION} variables={this.state}>
              {(updateItem, { loading, error }) => (
                <Form onSubmit={e => this.updateItem(e, updateItem)}>
                  <Error error={error} />
                  <fieldset disabled={loading} aria-busy={loading}>
                    <label htmlFor="title">
                      Title
                      <input
                        type="text"
                        id="title"
                        name="title"
                        placeholder="title"
                        required
                        onChange={this.handleChange}
                        defaultValue={data.item.title}
                      />
                    </label>
                    <label htmlFor="price">
                      Price
                      <input
                        type="number"
                        id="price"
                        name="price"
                        placeholder="price"
                        required
                        onChange={this.handleChange}
                        defaultValue={data.item.price}
                      />
                    </label>
                    <label htmlFor="description">
                      Description
                      <textarea
                        type="text"
                        id="description"
                        name="description"
                        placeholder="description"
                        required
                        onChange={this.handleChange}
                        defaultValue={data.item.description}
                      />
                    </label>
                  </fieldset>
                  <button type="submit" disabled={loading}>
                    Sav
                    {loading ? 'ing' : 'e'} Changes
                  </button>
                </Form>
              )}
            </Mutation>
          )
        }}
      </Query>
    )
  }
}

export default UpdateItem
export { UPDATE_ITEM_MUTATION }
