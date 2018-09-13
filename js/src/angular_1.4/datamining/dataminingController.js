/*
 * Knowage, Open Source Business Intelligence suite
 * Copyright (C) 2016 Engineering Ingegneria Informatica S.p.A.
 *
 * Knowage is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Knowage is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

var app = angular.module('dataMiningApp', ['ngMaterial', 'sbiModule']);

app.controller('Controller', ['sbiModule_logger', 'sbiModule_config', 'datamining_template','sbiModule_translate','sbiModule_restServices', '$scope', '$q', '$timeout', '$mdDialog','$sce', dataMiningFunction ]);

function dataMiningFunction (sbiModule_logger, sbiModule_config, datamining_template,sbiModule_translate, sbiModule_restServices, $scope, $q, $timeout,  $mdDialog,$sce) {

	/*****************************/
	/** Initialization          **/
	/*****************************/
	$scope.pathRest = {
			contextPath : datamining_template.urlSettings.contextPathDatamining,
			vers: '1.0',
			command : 'command',
			output : 'output',
			dataset : 'dataset',
			result : 'result',
			getVariables : 'getVariables',
			setVariables : 'setVariables',
			setAutoMode : 'setAutoMode',
			confirm : 'true',
			loadDataset : 'loadDataset',
			updateDataset : 'updateDataset'
	}
	$scope.translate = sbiModule_translate;
	$scope.idx_output = 0;
	$scope.file = undefined;
	$scope.fileName = '';
	$scope.log = sbiModule_logger;
	$scope.visibleUploadButton = false;
	$scope.results = {};
	$scope.datasets = {};
	$scope.commands = [];
	$scope.visibilityRerunButton;
	$scope.variableForm = false;
	$scope.visibleOuputVariables = false;
	$scope.config = {};
	//$scope.imgWidth=480;
	//$scope.imgHeight=480;
	//$scope.zoomX=100;
	//$scope.zoomY=100;
	$scope.isChrome=!!window.chrome && !!window.chrome.webstore;




	$scope.pendingRequest = 0;
	$scope.htmlShow="HTMLSHOW";

	$scope.config.params = {
			'SBI_EXECUTION_ID' : datamining_template.ajaxBaseParams.SBI_EXECUTION_ID ,
			'DOC_LABEL' : datamining_template.ajaxBaseParams.DOC_LABEL
	};



	var restServices = sbiModule_restServices;

	/*****************************/
	/** Promise Functions       **/
	/*****************************/

	//GET the result of [commandName, output, variables]
	 //if succeed, save the result in the matrix result[commandName][output.outputName] and set some values
	 //if necessary, convert result in html (e.g. result is image base64)
	 $scope.createResultPromise = function(){
		 var promiseResult = $q.defer();
		 $scope.pendingRequest++;
		//promise resolve function -> begin GET to take the results
		 promiseResult.promise.then(function(data) {
			 var commandName = data.commandName;
			 var output = data.singleOutput;
			 var variables = data.variables;
			 if ($scope.results[commandName] === undefined ){
				 $scope.results[commandName] = {};
			 }
			 if ($scope.results[commandName][output.outputName] === undefined ){
				 $scope.results[commandName][output.outputName] = {};
			 }
			 var tmpConfig = angular.fromJson(angular.toJson($scope.config));
			 var urlResult = $scope.pathRest.result + '/'+commandName+'/'+output.outputName + '/' + $scope.pathRest.confirm;
			 restServices.get($scope.pathRest.vers, urlResult, null , tmpConfig) //Added $scope.config.params (null before)
				 .success(function(data){
					 $scope.results[commandName][output.outputName] = data;
					 if (data.result){
						 if ( $scope.results[commandName][output.outputName].outputType == 'image')
						 {
							 $scope.results[commandName][output.outputName].result = 'data:image/png;base64,' +data.result;
						 }else{
							 	$scope.results[commandName][output.outputName].result = data.result;
						 }
					 }else if (data.error){
						 $scope.results[commandName][output.outputName].error = data.error;
					 }
					 $scope.pendingRequest--;

					 //added
					 if($scope.results[commandName][output.outputName].zoomX==undefined)
					 {
						 $scope.results[commandName][output.outputName].zoomX=100;
//						 $scope.$watch('results['+commandName+']'+'['+output.outputName+'].zoomX',function(){
//
//							 $scope.results[commandName][output.outputName].backgroundImgStyle={ 'background-image' : "url(\'"+$scope.results[commandName][output.outputName].result+"\')", 'background-repeat':'no-repeat', 'background-size':""+$scope.results[commandName][output.outputName].zoomX+"% "+ $scope.results[commandName][output.outputName].zoomY+"%"};
//
//						 });
					 }
					 if($scope.results[commandName][output.outputName].zoomY==undefined)
					 {
						 $scope.results[commandName][output.outputName].zoomY=100;
//						 $scope.$watch('results['+commandName+']'+'['+output.outputName+'].zoomY',function(){
//							 $scope.results[commandName][output.outputName].backgroundImgStyle={ 'background-image' : "url(\'"+$scope.results[commandName][output.outputName].result+"\')", 'background-repeat':'no-repeat', 'background-size':""+$scope.results[commandName][output.outputName].zoomX+"% "+ $scope.results[commandName][output.outputName].zoomY+"%"};
//						 });

					 }

					 $scope.results[commandName][output.outputName].backgroundImgStyle={ 'background-image' : "url(\'"+$scope.results[commandName][output.outputName].result+"\')", 'background-repeat':'no-repeat', 'background-size':""+$scope.results[commandName][output.outputName].zoomX+"% "+ $scope.results[commandName][output.outputName].zoomY+"%"};

					 //$scope.backgroundImgStyle={ 'background-image' : "url(\'"+$scope.results[commandName][output.outputName].result+"\')", 'background-repeat':'no-repeat', 'background-size':""+$scope.results[commandName][output.outputName].zoomX+"% "+ $scope.results[commandName][output.outputName].zoomY+"%"};

					 //$scope.backgroundImgStyle={ 'background-image' : url(results[cmd.name][out.outputName].result), 'background-repeat':'no-repeat', 'background-size':'100% 100%'};
					 //$scope.backgroundImgStyle={ 'background-image' : url(imgDataBase64), 'background-repeat':'no-repeat', 'background-size':'100% 100%'};
				 })
				 .error(function(data, status){
					var error = 'GET RESULT error with status: ' + status;
					if (data){
						var idxBegin = data.indexOf("<body>") + "<body>".length;
						var idxEnd = data.indexOf("</body>");
						error = error  + ".\n Message: " + data.substring(idxBegin,idxEnd);
					}
					$scope.results[commandName][output.outputName].error = error;
					$scope.log.error(error);
					$scope.pendingRequest--;
				 });
		 },function(error) {
				promiseResult.reject();
				$scope.log.error('Promise Result error ' + error);
				$scope.pendingRequest--;
		 });

		 return promiseResult;
	 }
	//GET requests for getVariables and setAutoMode
	//if succeed, it creates a ResultPromise for [commandName, output, variables]
	$scope.createSingleOutputPromise = function (){
		var promiseSingleOutput = $q.defer();
		var promiseResult = $scope.createResultPromise();
		//promise resolve function -> begin GET requests to execute the output of the command
		promiseSingleOutput.promise.then(function(data) {
			//GET the variables
			var commandName = data.commandName;
			var output = data.singleOutput;
			var tmpConfig = angular.fromJson(angular.toJson($scope.config));
			var urlGetVariables =  $scope.pathRest.output+'/'+$scope.pathRest.getVariables+'/'+commandName+'/'+output.outputName;
			restServices.get($scope.pathRest.vers, urlGetVariables, null, tmpConfig)
				.success(function(data){
					var tmpConfig = angular.fromJson(angular.toJson($scope.config));
					output.variables = data;
					//Initialize currentVal with defaultVal, used for implementing updating and reset variables
					 for ( var i = 0 ; output.variables != null && i < output.variables.length && output.variables[i].currentVal === undefined ; i++){
						 output.variables[i].currentVal =  output.variables[i].defaultVal;
					 }
					//GET for set the autoMode of the command (autoMode = 'auto' is set for server purpose)
					var urlSetAutoMode = $scope.pathRest.output+'/'+$scope.pathRest.setAutoMode+'/'+output.outputName;
					restServices.get($scope.pathRest.vers, urlSetAutoMode, null, tmpConfig)
					.success(function(data){
						var parameters = {};
						parameters.commandName = commandName;
						parameters.singleOutput = output;

						promiseResult.resolve(parameters);



					})
					.error(function(data, status){
						promiseResult.reject();
						$scope.log.error('GET SINGLE OUTPUT error of ' + data + ' with status :' + status);
					});
				})
				.error(function(data, status){
					promiseResult.reject();
					$scope.log.error('GET SINGLE OUTPUT error of ' + data + ' with status :' + status);
				});

		}, function(error) {
			promiseResult.reject();
			$scope.log.error('Promise SingleOutput error ' + error);
		});
		return promiseSingleOutput ;
	}

	//GET requests for dataset and preparing the server
	//if succeed, for each output of the array creates a SingleOutputPromise [commandName, output]
	$scope.createOutputsPromise = function (){
		var promiseOutput = $q.defer();
		//promise resolve function -> begin GET requests to prepare the server
		promiseOutput.promise.then(function(data) {
			var commandName = data.commandName;
			var outputs = data.outputs;
			//GET to set the dataset of the command in the server side
			var tmpConfig = angular.fromJson(angular.toJson($scope.config));
			var urlDataset = $scope.pathRest.dataset+'/'+commandName;
			restServices.get($scope.pathRest.vers, urlDataset, null, tmpConfig)
			.success(function(data){
				if (data.length > 0){
					$scope.datasets[commandName] = data;
				}
				//update the button visibility if the dataset is a file with upload enable
				$scope.visibilityUploadButton(commandName);
				//if success, GET the outputs of the 'commandName', the server prepare the execution
				var tmpConfig = angular.fromJson(angular.toJson($scope.config));
				var urlOutput = $scope.pathRest.output+'/'+commandName;
				restServices.get($scope.pathRest.vers, urlOutput, null, tmpConfig)
				.success(function(data){
					//if success GET the command of 'commandName', the server executes the command
					var tmpConfig = angular.fromJson(angular.toJson($scope.config));
					var urlCommand =  $scope.pathRest.command+'/'+commandName;
					restServices.get($scope.pathRest.vers, urlCommand, null, tmpConfig)
					.success(function(data){
						for (var i = 0; i < outputs.length; i++){
							if (outputs[i].outputMode == "auto" || (outputs[i].outputMode == "manual" && outputs.length == 1)){
								$scope.idx_output = i;
								var singleOutputPromise = $scope.createSingleOutputPromise();
								var parameters = {};
								parameters.singleOutput = outputs[i];
								parameters.commandName =  commandName;
								singleOutputPromise.resolve(parameters);

								break;
							}

						}
					})
					.error(function(data, status){
						$scope.log.error('GET COMMAND error of ' + data + ' with status :' + status);
					});
				})
				.error(function(data, status){
					$scope.log.error('GET OUTPUT error of ' + data + ' with status :' + status);
				});

			})
			.error(function(data, status){
				$scope.log.error('GET DATASET error of ' + data + ' with status :' + status);
			});

		}, function(error) {
			$scope.log.error('Promise Output error ' + error);
		});
		return promiseOutput;
	}

	//Create a promise for outputs array
	$scope.createCommandPromise = function (){
		var promiseCommands = $q.defer();
		var outputsPromise = $scope.createOutputsPromise();
		promiseCommands.promise.then(function(data) {
			//Initialize currentVal with defaultVal, used for implementing updating and reset variables
			var cmd = data;
			for ( var i = 0 ; cmd.variables != null && i < cmd.variables.length && cmd.variables[i].currentVal === undefined ; i++){
				cmd.variables[i].currentVal =  cmd.variables[i].defaultVal;
				for (var key in analyticalDriverString) {
				  if (analyticalDriverString.hasOwnProperty(key)) {
					  if(cmd.variables[i].name==key)
					  {
						  cmd.variables[i].currentVal =  analyticalDriverString[key];
					  }
				  }
				}

//				cmd.variables[i].currentVal =  cmd.variables[i].defaultVal;
//				var analyticalDriverString2=analyticalDriverString;
//				for (var key in analyticalDriverString) {
//					  if (analyticalDriverString.hasOwnProperty(key)) {
//						  if()
//					  }
//					}
			}
			var parameters = {};
			parameters.outputs = cmd.outputs;
			parameters.commandName =  cmd.name;
			outputsPromise.resolve(parameters);
		}, function(error) {
			outputsPromise.reject();
			$scope.log.error('Promise Command error ' + error);
		});
		return promiseCommands;
	}


	/*****************************/
	/** START                   **/
	/*****************************/
	$scope.commandPromise = $scope.createCommandPromise();
	var tmpConfig = angular.copy($scope.config);
	//STARTING the chain of promise, is promise is a restService command
	// GET command -> GET datasets -> GET ouputs -> GET results
	restServices.get($scope.pathRest.vers, $scope.pathRest.command, null, tmpConfig)
	.success(
			function(data) {
				$scope.commands = data;
				//Find the mode = 'auto' in commands, the first with this mode will be executed. If not present, take the first [autoIdx=0]
				var autoIdx = 0;
				for (var i = 0; i < $scope.commands.length; i++) {
					if ($scope.commands[i].mode == "auto") {
						autoIdx = i;
					}
				}
				//select the tab with auto and solve the command;
				$scope.idx_command = autoIdx;
				$scope.commands[autoIdx].results = {};
				$scope.cmd = $scope.commands[autoIdx];
				$scope.commandPromise.resolve($scope.commands[autoIdx]);
			})
			.error(function(data, status) {
				$scope.commandPromise.reject();
			});

	/*****************************/
	/** Support Function        **/
	/*****************************/

	//When tab is selected, if not present the command result, calculate result
	$scope.calculateResult = function(cmd){
		commandName = cmd.name;
		if ($scope.results[commandName] === undefined ){
			 $scope.createCommandPromise().resolve(cmd);
		}
	};

	//When an output tab is selected, get the result if not already present in results
	$scope.getOutputResultFromTabClick = function (cmd,output){
		if ($scope.results[cmd.name] == undefined || $scope.results[cmd.name][output.outputName] == undefined){
			var singleOutputPromise = $scope.createSingleOutputPromise();
			var parameters = {};
			parameters.commandName =  cmd.name;
			parameters.singleOutput = output;
			singleOutputPromise.resolve(parameters);

		}
		else{
			 $scope.results[cmd.name][output.outputName].backgroundImgStyle={ 'background-image' : "url(\'"+$scope.results[cmd.name][output.outputName].result+"\')", 'background-repeat':'no-repeat', 'background-size':""+$scope.results[cmd.name][output.outputName].zoomX+"% "+ $scope.results[cmd.name][output.outputName].zoomY+"%"};

		}
	}

	//If the command has files, show buttons to upload file
	$scope.visibilityUploadButton = function (commandName){
		var datasets = $scope.datasets[commandName];
		var enable = false;
		for (var i = 0 ; datasets !== undefined && i < datasets.length ; i++){
			if (datasets[i] !== undefined && datasets[i].type == 'file' && datasets[i].canUpload == true){
				enable= true;
			}
		}
		$scope.visibleUploadButton = enable;
	};

	$scope.chooseFile = function (){
		var input = angular.element(document).find('#uploadFile');
		input.triggerHandler('click');
	};

	$scope.setFileName = function (element){
		$scope.file = element.files[0];
		$timeout(function(){
			$scope.fileName = element.files[0].name;
		},0,true);
	};

	$scope.uploadFile = function(cmd,dataset){
		var commandName = cmd.name;
		if ($scope.file !== undefined  && $scope.file.name !== undefined && $scope.file.name.length > 0){
			if (dataset !== undefined && dataset.type == 'file' && dataset.canUpload == true){
				$scope.dialog = $scope.showDialogUpdating(); //show updating bar
				var urlUpload = $scope.pathRest.vers + '/' + $scope.pathRest.dataset+'/'+$scope.pathRest.loadDataset;
				var tmpConfig = angular.fromJson(angular.toJson($scope.config));
				var fd = new FormData();
		        fd.append(dataset.name, $scope.file);
				var tmpPromise = restServices.postMultiPart(urlUpload, dataset.name, fd, tmpConfig);
				//if loadDataset is correct start to update the dataset in the server using a promise
				$scope.createPromiseUpload(tmpPromise,dataset.name, $scope.file, tmpConfig);
			}
		}
	};

	$scope.createPromiseUpload = function(promiseUpload, datasetName, file, conf){
		var that = {};
		that.datasetName = datasetName;
		that.file = file;
		that.conf = conf;
		promiseUpload.success(function(data){
			if (data.success == true){
				var urlUpdate =  $scope.pathRest.vers + '/' + $scope.pathRest.dataset+'/'+ $scope.pathRest.updateDataset;
				var tmpConfig = angular.fromJson(angular.toJson(that.conf));
				var promiseUpdate = restServices.get(urlUpdate, that.file.name +'/'+ that.datasetName, null, tmpConfig);
				promiseUpdate.success(function(data){
					$mdDialog.hide($scope.dialog);
					$scope.showAlert('INFO', 'Update Successful');
					$scope.toogleRerunButton();
				})
				.error(function(data, status){
					$mdDialog.hide($scope.dialog);
					$scope.showAlert('ERROR', 'Error during the updating');
					$scope.log.error('GET UpdateDataset error of ' + data + ' with status :' + status);
				 });
			}
			else{
				$mdDialog.hide($scope.dialog);
				$scope.showAlert('ERROR', 'Error during the updating');
			}
		})
		.error(function(data, status){
			$mdDialog.hide($scope.dialog);
			$scope.showAlert('ERROR', 'Error during the updating');
			$scope.log.error('POST LoadDataset error of ' + data + ' with status :' + status);
		 });
	};

	//after dataset upload, rerun the script of the selected command
	$scope.rerunScript = function (cmd){
		 var commandPromise = $scope.createCommandPromise();
		 commandPromise.resolve(cmd);
		 //force to delete the selected dataset
		 if (this.$parent && this.$parent.$parent){
			 this.$parent.$parent.dataset = undefined;
		 }
		 $scope.toogleRerunButton();
		 $scope.file = undefined;
		 $scope.fileName='';
	};

	$scope.setVariable= function(cmd, output, variable, action, type){

		 //find commandName and outputName from the tabs selected
		 var commandName = cmd.name;
		 var variables = type == 'command' ?  cmd.variables : output.variables;
		 var tmpConfig = angular.fromJson(angular.toJson($scope.config));
		 variable.currentVal = action == 'reset' ? variable.defaultVal : variable.currentVal;
		 tmpConfig.params[variable.name] = variable.currentVal;
		 //path for modify command variable or output variable
		 var path = type == 'command' ?
				 $scope.pathRest.command +'/'+$scope.pathRest.setVariables+'/'+commandName :
				 $scope.pathRest.output+'/'+$scope.pathRest.setVariables+'/'+commandName+'/'+output.outputName;

		 restServices.post($scope.pathRest.vers, path, null, tmpConfig)
		 	.success(function(data){
		 		//if success resolve the command promise, rerun the command
		 		var parameters = {};
		 		//$scope.results[commandName]
				parameters.commandName = commandName;
				parameters.variables = variables;
				if (output !== undefined){
					var promiseResult = $scope.createResultPromise();
					parameters.singleOutput = output ;
					promiseResult.resolve(parameters);
				}else{
					$scope.results[commandName] = {};
					var promiseOutputs = $scope.createOutputsPromise();
					parameters.outputs = cmd.outputs;
					promiseOutputs.resolve(parameters)
				}
				})
			.error(function(data, status){
				promiseResult.reject();
				$scope.log.error('SET VARIABLE ' + variable + ' with status :' + status);
			});

	};

	//Create an alert dialog with a message
	$scope.showAlert = function (title, message){
		$mdDialog.show(
			$mdDialog.alert()
		        .parent(angular.element(document.querySelector('#popupContainer')))
		        .clickOutsideToClose(true)
		        .title(title)
		        .textContent(message) //FROM angular material 1.0
		        .ok('Ok')
			);
	};

	//debugger;
	//Create a dialog containing an updating bar
	$scope.showDialogUpdating = function (){
		var parentEl = angular.element(document.body);
		var dialog = $mdDialog.show({
//			templateUrl: '/knowagedataminingengine/js/src/angular_1.4/datamining/templates/dataminingDialog.html',
			templateUrl: sbiModule_config.contextName + '/js/src/angular_1.4/datamining/templates/dataminingDialog.html',
			parent: parentEl,
			locals : {
				translate : $scope.translate
				},
			scope: $scope,
			preserveScope : true,
			clickOutsideToClose:false,
			controller: $scope.dialogController
		});
		return dialog;
	};

	$scope.toogleVariableForm = function (cmd){
		$scope.variableForm=!$scope.variableForm;
	};

	$scope.dialogController = function ($scope, $mdDialog, translate) {
		$scope.translate = translate;
		$scope.closeDialog = function() {
		    $mdDialog.hide();
		};
	};

	$scope.toogleRerunButton = function(){
		$scope.visibilityRerunButton = !$scope.visibilityRerunButton;
	};

	$scope.toogleOuputVariables = function(){
		$scope.visibleOuputVariables = !$scope.visibleOuputVariables;
	};

	$scope.toogleCommandVariables = function(){
		$scope.visibleCommandVariables = !$scope.visibleCommandVariables ;
	};


	$scope.putSafeHtml = function(html){
		return $sce.trustAsHtml(html);
	};



	$scope.b64toBlob=function(b64Data, contentType, sliceSize) {
		  contentType = contentType || '';
		  sliceSize = sliceSize || 512;
		  var b64WithoutHead=b64Data.substring(22)
		  var byteCharacters = atob(b64WithoutHead);
		  var byteArrays = [];

		  for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
		    var slice = byteCharacters.slice(offset, offset + sliceSize);

		    var byteNumbers = new Array(slice.length);
		    for (var i = 0; i < slice.length; i++) {
		      byteNumbers[i] = slice.charCodeAt(i);
		    }

		    var byteArray = new Uint8Array(byteNumbers);

		    byteArrays.push(byteArray);
		  }

		  var blob = new Blob(byteArrays, {type: contentType});
		  return blob;
		}








	$scope.downloadImage=function(imgDataBase64)
	{

		var fileName="img";
	    var a = document.createElement("a");
	    document.body.appendChild(a);
	    a.style = "display: none";

	    //blob = new Blob([imgDataBase64], {type: "image/png"});
	    var blob=$scope.b64toBlob(imgDataBase64, "image/png")
	    url = window.URL.createObjectURL(blob);
	    a.href = url;
	    a.download = fileName;
	    a.click();
	    window.URL.revokeObjectURL(url);

    }

}

