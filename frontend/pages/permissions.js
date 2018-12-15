import PleaseSignIn from '../components/PleaseSignIn'
import Permission from '../components/Permission'

const pagePermission = props => (
  <div>
    <PleaseSignIn>
      <Permission />
    </PleaseSignIn>
  </div>
)

export default pagePermission
