/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import _ from 'lodash';
import { i18n } from '@kbn/i18n';
import extendedMetricVisParamsTemplate from './extended_metric_vis_params.html';

export function ExtendedMetricVisParams() {
  return {
    restrict: 'E',
    template: extendedMetricVisParamsTemplate,
    replace: true,
    link: function ($scope) {
      $scope.collections = $scope.vis.type.editorConfig.collections;
      $scope.showColorRange = true;

      // Init input field for custom calculation
      $scope.$watch('editorState.params.metric', metric => {
          if (metric && (!metric.formulas || metric.formulas.length === 0)) {
              metric.formulas = [{
                label: "Calculated Value",
                formula: "metrics['value1'] * metrics['value2']"
              }];
          }
      });

      $scope.$watch('editorState.params.metric.metricColorMode', newValue => {
        switch (newValue) {
          case 'Labels':
            $scope.editorState.params.metric.style.labelColor = true;
            $scope.editorState.params.metric.style.bgColor = false;
            break;
          case 'Background':
            $scope.editorState.params.metric.style.labelColor = false;
            $scope.editorState.params.metric.style.bgColor = true;
            break;
          case 'None':
            $scope.editorState.params.metric.style.labelColor = false;
            $scope.editorState.params.metric.style.bgColor = false;
            break;
        }
      });

      $scope.resetColors = function () {
        $scope.uiState.set('vis.colors', null);
        $scope.customColors = false;
      };

      $scope.getGreaterThan = function (index) {
        if (index === 0) return -Infinity;
        return $scope.editorState.params.metric.colorsRange[index - 1].to;
      };

      $scope.addRange = function () {
        const previousRange = _.last($scope.editorState.params.metric.colorsRange);
        const from = previousRange ? previousRange.to : 0;
        const to = previousRange ? from + (previousRange.to - previousRange.from) : 100;
        $scope.editorState.params.metric.colorsRange.push({ from: from, to: to });
      };

      $scope.removeRange = function (index) {
        $scope.editorState.params.metric.colorsRange.splice(index, 1);
      };

      $scope.getColor = function (index) {
        const defaultColors = this.uiState.get('vis.defaultColors');
        const overwriteColors = this.uiState.get('vis.colors');
        const colors = defaultColors ? _.defaults({}, overwriteColors, defaultColors) : overwriteColors;
        return colors ? Object.values(colors)[index] : 'transparent';
      };

      $scope.uiState.on('colorChanged', () => {
        $scope.customColors = true;
      });

      $scope.editorState.requiredDescription = i18n.translate(
        'visTypeMetric.params.ranges.warning.requiredDescription', { defaultMessage: 'Required:' });
    },
  };
}
