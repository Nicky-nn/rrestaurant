import React, { FunctionComponent } from 'react'
import Select, { Props } from 'react-select'

import { reactSelectStyle } from '../MySelect/ReactSelect'

type SelectProps = Props & {
  id?: string
  label?: string
}

/**
 * @author isi-template
 * @param props
 * @constructor
 */
const SimpleSelect: FunctionComponent<SelectProps> = (props: SelectProps) => {
  return <Select {...props} styles={reactSelectStyle(false)} menuPosition={'fixed'} />
}

export default SimpleSelect
