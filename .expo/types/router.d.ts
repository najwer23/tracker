/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string | object = string> {
      hrefInputParams: { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | { pathname: `/auth/login`; params?: Router.UnknownInputParams; } | { pathname: `/auth/logout`; params?: Router.UnknownInputParams; } | { pathname: `/map-tracker/form/blt`; params?: Router.UnknownInputParams; } | { pathname: `/map-tracker/form/form`; params?: Router.UnknownInputParams; } | { pathname: `/map-tracker/form/save`; params?: Router.UnknownInputParams; };
      hrefOutputParams: { pathname: Router.RelativePathString, params?: Router.UnknownOutputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownOutputParams } | { pathname: `/`; params?: Router.UnknownOutputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownOutputParams; } | { pathname: `/auth/login`; params?: Router.UnknownOutputParams; } | { pathname: `/auth/logout`; params?: Router.UnknownOutputParams; } | { pathname: `/map-tracker/form/blt`; params?: Router.UnknownOutputParams; } | { pathname: `/map-tracker/form/form`; params?: Router.UnknownOutputParams; } | { pathname: `/map-tracker/form/save`; params?: Router.UnknownOutputParams; };
      href: Router.RelativePathString | Router.ExternalPathString | `/${`?${string}` | `#${string}` | ''}` | `/_sitemap${`?${string}` | `#${string}` | ''}` | `/auth/login${`?${string}` | `#${string}` | ''}` | `/auth/logout${`?${string}` | `#${string}` | ''}` | `/map-tracker/form/blt${`?${string}` | `#${string}` | ''}` | `/map-tracker/form/form${`?${string}` | `#${string}` | ''}` | `/map-tracker/form/save${`?${string}` | `#${string}` | ''}` | { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | { pathname: `/auth/login`; params?: Router.UnknownInputParams; } | { pathname: `/auth/logout`; params?: Router.UnknownInputParams; } | { pathname: `/map-tracker/form/blt`; params?: Router.UnknownInputParams; } | { pathname: `/map-tracker/form/form`; params?: Router.UnknownInputParams; } | { pathname: `/map-tracker/form/save`; params?: Router.UnknownInputParams; };
    }
  }
}
