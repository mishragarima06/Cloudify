const [focusedField, setFocusedField] = useState('')

const validatePassword = (pass) => {
  // At least 1 uppercase, 1 number, 1 special char
  const strongRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/
  return strongRegex.test(pass)
}

// Then in validateForm:
if (!password) {
  newErrors.password = 'Password zaroori hai'
} else if (password.length < 6) {
  newErrors.password = 'Password 6 characters se bada hona chahiye'
} else if (!validatePassword(password)) {
  newErrors.password = 'Uppercase, number, aur symbol zaroori hai'
}

// Then update inputs:
<input
  style={{
    ...s.input,
    borderColor: focusedField === 'name' ? 'var(--blue-mid)' :
                 errors.name ? 'var(--red)' : 'var(--gray-border)'
  }}
  onFocus={() => setFocusedField('name')}
  onBlur={() => setFocusedField('')}
  // ...rest
/>

useEffect(() => {
  return () => {
    // Cleanup on unmount
    if (!navigate.state?.pathname?.includes('/verify')) {
      sessionStorage.removeItem('tempToken')
    }
  }
}, [navigate])

catch (err) {
  console.error('RegisterPage: Registration error:', err)
  
  let errorMsg = 'Registration failed. Dobara try karo.'
  
  if (!err.response) {
    errorMsg = 'Network error - internet check karo'
  } else if (err.response.status === 409) {
    errorMsg = 'Email pehle se exist karta hai'
  } else if (err.response.status === 400) {
    errorMsg = err.response.data?.msg || 'Invalid data'
  } else if (err.response.status >= 500) {
    errorMsg = 'Server error - baad mein try karo'
  } else {
    errorMsg = err.response.data?.msg || err.message
  }
  
  setError(errorMsg)
}