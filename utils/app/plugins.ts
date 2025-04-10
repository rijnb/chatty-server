/*
 * Copyright (C) 2024, Rijn Buve.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions
 * of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 * THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import {PluginKey} from "@/types/plugin"
import {localStorageSafeGetItem, localStorageSafeRemoveItem, localStorageSafeSetItem} from "@/utils/app/storage"

export const STORAGE_KEY_PLUGIN_KEYS = "pluginKeys"

export const getPluginKeys = (): PluginKey[] => {
  const PluginKeyAsString = localStorageSafeGetItem(STORAGE_KEY_PLUGIN_KEYS)
  try {
    return PluginKeyAsString ? (JSON.parse(PluginKeyAsString) as PluginKey[]) : []
  } catch (error) {
    console.error(`Local storage error:${error}`)
    return []
  }
}

export const savePluginKeys = (pluginKeys: PluginKey[]) =>
  localStorageSafeSetItem(STORAGE_KEY_PLUGIN_KEYS, JSON.stringify(pluginKeys))

export const removePluginKeys = () => {
  localStorageSafeRemoveItem(STORAGE_KEY_PLUGIN_KEYS)
}
