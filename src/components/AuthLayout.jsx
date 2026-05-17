import {useSelector} from 'react-redux'
import {Navigate} from 'react-router-dom'

// Route protection wrapper: decide karta hai user ko page dikhana hai ya redirect karna hai.
export default function Protected({children, authentication = true}) {

    // Redux se current login status le rahe hain.
    const authStatus = useSelector(state => state.auth.status)

    if(authentication && authStatus !== authentication){
        return <Navigate to="/login" replace />
    }

    if(!authentication && authStatus !== authentication){
        return <Navigate to="/" replace />
    }

  // Auth check complete hone tak loading dikhate hain, phir actual page render hota hai.
  return <>{children}</>
}
