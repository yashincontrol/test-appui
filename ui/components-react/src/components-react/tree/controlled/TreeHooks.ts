/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
/** @packageDocumentation
 * @module Tree
 */

import { useCallback, useEffect, useMemo } from "react";
import { useDisposable } from "@itwin/core-react";
import { useRerender } from "../../common/UseRerender";
import { TreeDataProvider } from "../TreeDataProvider";
import { TreeEventHandler, TreeEventHandlerParams } from "./TreeEventHandler";
import { TreeModel } from "./TreeModel";
import { TreeModelSource } from "./TreeModelSource";
import { PagedTreeNodeLoader, TreeNodeLoader } from "./TreeNodeLoader";

/**
 * React hook that returns an immutable `TreeModel` whenever it changes in the given
 * `TreeModelSource`.
 *
 * @public
 */
export function useTreeModel(modelSource: TreeModelSource): TreeModel {
  const { rerender } = useRerender();
  useEffect(() => {
    return modelSource.onModelChanged.addListener(rerender);
  }, [modelSource, rerender]);
  return modelSource.getModel();
}

/**
 * Custom hook which creates a nodes' loader using the supplied data provider and model source. The
 * loader pulls nodes from the data provider and puts them into the model source.
 *
 * @public
 */
export function useTreeNodeLoader<TDataProvider extends TreeDataProvider>(dataProvider: TDataProvider, modelSource: TreeModelSource) {
  return useMemo(() => new TreeNodeLoader(dataProvider, modelSource), [dataProvider, modelSource]);
}

/**
 * Custom hook which creates a paging nodes' loader using the supplied data provider and model source. The loader pulls
 * nodes from the data provider and puts them into the model source.
 * @public
 */
export function usePagedTreeNodeLoader<TDataProvider extends TreeDataProvider>(dataProvider: TDataProvider, pageSize: number, modelSource: TreeModelSource) {
  return useMemo(() => new PagedTreeNodeLoader(dataProvider, modelSource, pageSize), [dataProvider, modelSource, pageSize]);
}

/**
 * Custom hook which creates a `TreeModelSource`.
 *
 * @note The model source has no direct dependency on the data provider, but we want a fresh model
 * source whenever the data provider changes - that's the reason the hook takes a data provider.
 *
 * @public
 */
export function useTreeModelSource(dataProvider: TreeDataProvider) {
  // need to create new model source every time data provider changes although it does not need data provider to be created.
  return useMemo(() => new TreeModelSource(), [dataProvider]); // eslint-disable-line react-hooks/exhaustive-deps
}

/**
 * Custom hook which creates and takes care of disposing a TreeEventsHandler. The input is either a factory method
 * for a custom `TreeEventHandler` implementation or parameters for the default implementation.
 *
 * @note Caller must ensure `factoryOrParams` changes only when a new handler needs to be created. `useCallback` or `useMemo` can
 * be used for that purpose based on whether the input is a factory function or params object.
 *
 * @public
 */
export function useTreeEventsHandler<TEventsHandler extends TreeEventHandler>(factoryOrParams: (() => TEventsHandler) | TreeEventHandlerParams) {
  const factory = useCallback((): TreeEventHandler => {
    if (typeof factoryOrParams === "function")
      return factoryOrParams();
    return new TreeEventHandler(factoryOrParams);
  }, [factoryOrParams]);
  return useDisposable(factory);
}
