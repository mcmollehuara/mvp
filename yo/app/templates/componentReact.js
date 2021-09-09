import { MapTo } from '@adobe/aem-react-editable-components'
import React from 'react'
import extractModelId from 'utils/extract-model-id'

const <%= jsObjectName %>Config = {
  emptyLabel: '<%= prettyName %>',
  isEmpty: props => !props || !props.type
}

const <%= jsObjectName %> = props => {
  return (
    <div
      id={extractModelId(props.cqPath)}
      data-<%= jsModuleName %>
      className='cmp-<%= sassFileName %>'
    >
      <p><%= prettyName %></p>
    </div>
  )
}

export default MapTo('<%= backendRelativePath %><%= folderName %>')(
  <%= jsObjectName %>,
  <%= jsObjectName %>Config
)
