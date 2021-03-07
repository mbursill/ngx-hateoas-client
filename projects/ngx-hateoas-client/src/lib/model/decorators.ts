/* tslint:disable:no-string-literal */
import { ResourceUtils } from '../util/resource.utils';
import { isArray, isEmpty, isNull, isUndefined } from 'lodash-es';
import { Resource } from './resource/resource';
import { EmbeddedResource } from './resource/embedded-resource';
import { BaseResource } from './resource/base-resource';

/**
 * Decorator used to classes that extend {@link Resource} class to register 'resourceName' and 'resourceType'
 * information about this resource.
 *
 * @param resourceName resource name which will be used to build a resource URL.
 */
export function HateoasResource(resourceName: string) {
  return <T extends new(...args: any[]) => any>(constructor: T) => {
    if (isNull(resourceName) || isUndefined(resourceName) || !resourceName) {
      throw new Error(`Init resource '${ constructor.name }' error. @HateoasResource decorator param resourceName can not be null/undefined/empty, please pass a valid resourceName.`);
    }

    if (!isInstanceOfParent(constructor, Resource)) {
      throw new Error(`Init resource '${ constructor.name }' error. @HateoasResource decorator applied only to 'Resource' type, you used it with ${ Object.getPrototypeOf(constructor) } type.`);
    }
    constructor['__resourceName__'] = resourceName;
    ResourceUtils.RESOURCE_NAME_TYPE_MAP.set(resourceName, constructor);

    return constructor;
  };
}

/**
 * Decorator used to classes that extend {@link EmbeddedResource} class to register 'resourcePropertiesNames' and 'resourceType'
 * information about this resource.
 *
 * @param resourcePropertiesNames names of the properties that using to hold this embedded resource in resource objects.
 */
export function HateoasEmbeddedResource(resourcePropertiesNames: Array<string>) {
  return <T extends new(...args: any[]) => any>(constructor: T) => {
    if (isNull(resourcePropertiesNames)
      || isUndefined(resourcePropertiesNames)
      || (isArray(resourcePropertiesNames) && isEmpty(resourcePropertiesNames))) {
      throw new Error(`Init resource '${ constructor.name }' error. @HateoasEmbeddedResource decorator param resourcePropertiesNames can not be null/undefined/empty, please pass a valid resourcePropertiesNames.`);
    }

    if (!isInstanceOfParent(constructor, EmbeddedResource)) {
      throw new Error(`Init resource '${ constructor.name }' error. @HateoasEmbeddedResource decorator applied only to 'EmbeddedResource' type, you used it with ${ Object.getPrototypeOf(constructor) } type.`);
    }
    resourcePropertiesNames.forEach(resourceName => {
      ResourceUtils.EMBEDDED_RESOURCE_TYPE_MAP.set(resourceName, constructor);
    });
  };
}

/**
 * Decorator used to create a projection representation of {@link Resource} heirs.
 *
 * @param resourceType type of resource that using for projection.
 * @param projectionName name of projection, will be used as projection request param.
 */
export function HateoasProjectionResource(resourceType: new() => Resource, projectionName: string) {
  return <T extends new(...args: any[]) => any>(constructor: T) => {
    if (isNull(resourceType) || isUndefined(resourceType)) {
      throw new Error(`Init resource projection '${ constructor.name }' error. @HateoasProjectionResource decorator param resourceType can not be null/undefined, please pass a valid resourceType.`);
    }
    if (isNull(projectionName) || isUndefined(projectionName) || !projectionName) {
      throw new Error(`Init resource projection '${ constructor.name }' error. @HateoasProjectionResource decorator param projectionName can not be null/undefined/empty, please pass a valid projectionName.`);
    }

    if (!isInstanceOfParent(constructor, Resource)) {
      throw new Error(`Init resource projection '${ constructor.name }' error. @HateoasProjectionResource decorator applied only to 'Resource' type, you used it with ${ Object.getPrototypeOf(constructor) } type.`);
    }
    constructor['__resourceName__'] = resourceType['__resourceName__'];
    constructor['__projectionName__'] = projectionName;
    return class extends constructor {
    };
  };
}

/**
 * Decorator used to mark projection class properties that are resources.
 * This decorator used with class marked as {@link HateoasProjectionResource}.
 *
 * @param relationType resource relation type that will be used to create resource with this type when parsed server response.
 */
export function HateoasProjectionRelation(relationType: new() => BaseResource) {
  return (target: object, propertyKey: string) => {
    if (isNull(relationType) || isUndefined(relationType)) {
      throw new Error(`Init resource projection '${ target.constructor.name }' relation type error. @HateoasProjectionRelation decorator param relationType can not be null/undefined, please pass a valid relationType.`);
    }

    ResourceUtils.RESOURCE_PROJECTION_REL_NAME_TYPE_MAP.set(propertyKey, relationType);
  };
}


function isInstanceOfParent(constructor: new (...args: any[]) => any, parentClass: any) {
  if (Object.getPrototypeOf(constructor).name === '') {
    return false;
  }
  if (Object.getPrototypeOf(constructor) === parentClass) {
    return true;
  }

  return isInstanceOfParent(Object.getPrototypeOf(constructor), parentClass);
}
