import React from 'react'
import { WrapperInputStyle } from './style'

const InputForm = ({ placeholder = 'Nhập Text', value, onChange, ...rest }) => {
  const handleOnchangeInput = (e) => {
    if (typeof onChange === 'function') {
      onChange(e.target.value)
    }
  }

  return (
    <WrapperInputStyle 
      placeholder={placeholder} 
      value={value} 
      onChange={handleOnchangeInput} 
      {...rest} 
    />
  )
}

export default InputForm
