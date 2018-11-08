import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import Router from 'next/router'
import gql from 'graphql-tag'
import Form from './styles/Form'
import formatMoney from '../lib/formatMoney'
import Error from './ErrorMessage'

const CREATE_ITEM_MUTATION = gql`
  mutation CREATE_ITEM_MUTATION(
    $title: String!
    $description: String!
    $image: String
    $largeImage: String
    $price: Int!
  ) {
    createItem(
      title: $title
      description: $description
      image: $image
      largeImage: $largeImage
      price: $price
    ) {
      id
    }
  }
`
class CreateItem extends Component {
  state = {
    title: '',
    description: '',
    largeImage: '',
    price: 0,
    image: ''
  }
  handleChange = e => {
    const { value, name, type } = e.target
    const val = type === 'number' ? parseFloat(value) : value

    this.setState({
      [name]: val
    })
  }
  uploadFile = async e => {
    const files = e.target.files
    const data = new FormData()
    data.append('file', files[0])
    data.append('upload_preset', 'sickfits')

    const res = await fetch(
      'https://api.cloudinary.com/v1_1/daqpyuoai/image/upload',
      {
        method: 'post',
        body: data
      }
    )
    const file = await res.json()
    console.log(file)

    this.setState({
      image: file.secure_url,
      largeImage: file.eager[0].secure_url
    })
  }
  render() {
    return (
      <Mutation mutation={CREATE_ITEM_MUTATION} variables={this.state}>
        {(createItem, { loading, error }) => (
          <Form
            onSubmit={async e => {
              e.preventDefault()
              const res = await createItem()
              console.log(res)
              Router.push({
                pathname: '/item',
                query: { id: res.data.createItem.id }
              })
            }}
          >
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
                  value={this.state.title}
                />
              </label>
              <label htmlFor="file">
                Image
                <input
                  type="file"
                  id="file"
                  name="file"
                  placeholder="upload image"
                  required
                  onChange={this.uploadFile}
                />
                {this.state.image && (
                  <img src={this.state.image} alt="upload image" />
                )}
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
                  value={this.state.price}
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
                  value={this.state.description}
                />
              </label>
            </fieldset>
            <button type="submit">Submit</button>
          </Form>
        )}
      </Mutation>
    )
  }
}

export default CreateItem
export { CREATE_ITEM_MUTATION }
