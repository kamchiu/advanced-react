import Link from 'next/link'
import PleaseSignIn from '../components/PleaseSignIn'
import CreateItem from '../components/CreateItem'

const Sell = props => (
  <div>
    <PleaseSignIn>
      <CreateItem />
    </PleaseSignIn>
  </div>
)

export default Sell
