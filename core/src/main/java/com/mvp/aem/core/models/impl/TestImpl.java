package com.mvp.aem.core.models.impl;

import com.adobe.cq.export.json.ComponentExporter;
import com.adobe.cq.export.json.ExporterConstants;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.models.annotations.DefaultInjectionStrategy;
import org.apache.sling.models.annotations.Exporter;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.ValueMapValue;
import com.mvp.aem.core.models.Test;

@Model(adaptables = { SlingHttpServletRequest.class,
    Resource.class }, resourceType = TestImpl.RESOURCE_TYPE, adapters = { TestImpl.class,
        ComponentExporter.class }, defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL)
@Exporter(name = ExporterConstants.SLING_MODEL_EXPORTER_NAME, extensions = ExporterConstants.SLING_MODEL_EXTENSION)

public class TestImpl implements Test {
  protected static final String RESOURCE_TYPE = "mvp/components/content/atoms/test";

  @ValueMapValue
  private String dummyValue;

  @Override
  public String getDummyValue() {
    return dummyValue;
  }

  @Override
  public String getExportedType() {
    return RESOURCE_TYPE;
  }
}
