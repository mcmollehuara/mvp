import { MapTo } from '@adobe/aem-react-editable-components'
import React from 'react'
import extractModelId from 'utils/extract-model-id'

const TestConfig = {
  emptyLabel: 'Test',
  isEmpty: props => !props || !props.type
}

const Test = props => {
  return (
    <div
      id={extractModelId(props.cqPath)}
      data-test
      className='cmp-test'
    >
      <p>Test</p>
    </div>
  )
}

export default MapTo('mvp/components/content/atoms/test')(
  Test,
  TestConfig
)
