/*
 * Copyright 2021 Larder Software Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import { ErrorComponent } from './ErrorComponent';
import {
  IFrameProps,
  IFrameComponentProps,
  IFrameFromAnnotationProps,
} from './types';
import { Content, ContentHeader } from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { determineError } from './utils/helpers';
import { useEntity } from '@backstage/plugin-catalog-react';

type IFrameComponentContentProps = {
  src: string;
  title: string;
  height?: string;
  width?: string;
};

const IFrameComponentContent = (props: IFrameComponentContentProps) => {
  const { title, src, height, width } = props;

  return (
    <Content>
      <ContentHeader title={title} />
      <iframe
        src={src}
        height={height || '100%'}
        width={width || '100%'}
        title={title}
      />
    </Content>
  );
};

const IFrameFromAnnotation = (props: IFrameFromAnnotationProps) => {
  const { srcFromAnnotation, height, width } = props;
  const title =
    props.title || 'Backstage IFrame (Note you can modify this with the props)';
  const configApi = useApi(configApiRef);
  const allowList = configApi.getOptionalStringArray('iframe.allowList');
  const { entity } = useEntity();
  let errorMessage = '';

  const src = entity.metadata.annotations?.[srcFromAnnotation];

  if (!src) {
    return (
      <ErrorComponent
        errorMessage={`Failed to get url src from the entity annotation ${srcFromAnnotation}`}
      />
    );
  }

  errorMessage = determineError(src, allowList);

  if (errorMessage) {
    return <ErrorComponent errorMessage={errorMessage} />;
  }

  return (
    <IFrameComponentContent
      src={src}
      title={title}
      height={height}
      width={width}
    />
  );
};

const IFrameFromSrc = (props: IFrameProps) => {
  const { src, height, width } = props;
  const title =
    props.title || 'Backstage IFrame (Note you can modify this with the props)';
  const configApi = useApi(configApiRef);
  const allowList = configApi.getOptionalStringArray('iframe.allowList');
  const errorMessage = determineError(src, allowList);

  if (errorMessage !== '') {
    return <ErrorComponent errorMessage={errorMessage} />;
  }

  return (
    <IFrameComponentContent
      src={src}
      title={title}
      height={height}
      width={width}
    />
  );
};

/**
 * A component to render a IFrame
 *
 * @public
 */
export const IFrameCard = (props: IFrameComponentProps) => {
  const { src, srcFromAnnotation, height, width, title } = props;
  if (src) {
    return (
      <IFrameFromSrc src={src} height={height} width={width} title={title} />
    );
  } else if (srcFromAnnotation) {
    return (
      <IFrameFromAnnotation
        srcFromAnnotation={srcFromAnnotation}
        height={height}
        width={width}
        title={title}
      />
    );
  }
  return (
    <ErrorComponent errorMessage="You must provide `src` or `srcFromAnnotation`" />
  );
};
