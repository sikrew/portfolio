var app=angular.module("ng-portfolio",["ui.router","ui.bootstrap","ngFileUpload","ngTable","hc.marked","ngTagsInput","ui.tree"]);app.config(function($httpProvider){$httpProvider.defaults.headers.common["X-Requested-With"]="XMLHttpRequest",$httpProvider.interceptors.push("HttpInterceptor")}),app.config(function(tagsInputConfigProvider){tagsInputConfigProvider.setDefaults("tagsInput",{replaceSpacesWithDashes:!1})}),app.config(["markedProvider",function(markedProvider){markedProvider.setOptions({gfm:!0,tables:!0})}]),app.config(function($stateProvider,$urlRouterProvider){$urlRouterProvider.otherwise("/dashboard"),$stateProvider.state("dashboard",{url:"/dashboard",templateUrl:"/vendor/portfolio/admin/views/dashboard.html",controller:"DashboardController"}).state("project",{url:"/project",templateUrl:"/vendor/portfolio/admin/views/project/project.html"}).state("project.index",{url:"/index",templateUrl:"/vendor/portfolio/admin/views/project/project.index.html",controller:"ProjectController"}).state("project.create",{url:"/create",templateUrl:"/vendor/portfolio/admin/views/project/project.edit.html",controller:"ProjectCreateController"}).state("project.edit",{url:"/:id/edit",templateUrl:"/vendor/portfolio/admin/views/project/project.edit.html",controller:"ProjectEditController"}).state("project.edit.assets",{url:"/assets/:type",templateUrl:"/vendor/portfolio/admin/views/assets/assets.html",controller:"AssetsController"}).state("project.edit.assets.files",{url:"/files/:folder",templateUrl:"/vendor/portfolio/admin/views/assets/files.html",controller:"AssetsFileController"}).state("assets",{url:"/assets/:type/:id",templateUrl:"/vendor/portfolio/admin/views/assets/assets.html",controller:"AssetsController"}).state("tag",{url:"/tag",templateUrl:"/vendor/portfolio/admin/views/tag/tag.html"}).state("tag.index",{url:"/index",templateUrl:"/vendor/portfolio/admin/views/tag/tag.index.html",controller:"TagController"}).state("tag.create",{url:"/create",templateUrl:"/vendor/portfolio/admin/views/tag/tag.edit.html",controller:"TagCreateController"}).state("tag.edit",{url:"/:id/edit",templateUrl:"/vendor/portfolio/admin/views/tag/tag.edit.html",controller:"TagEditController"}).state("page",{url:"/page",templateUrl:"/vendor/portfolio/admin/views/page/page.html"}).state("page.index",{url:"/index",templateUrl:"/vendor/portfolio/admin/views/page/page.index.html",controller:"PageController"}).state("page.edit",{url:"/:id/edit",templateUrl:"/vendor/portfolio/admin/views/page/page.edit.html",controller:"PageEditController"})}),app.factory("RestfulApi",function(){return{getRoute:function(resource,method,id){"undefined"==typeof id&&(id="0");var prefix="/api",routes={project:{index:prefix+"/project",show:prefix+"/project/"+id,store:prefix+"/project",update:prefix+"/project/"+id,destroy:prefix+"/project/"+id},section:{index:prefix+"/section",show:prefix+"/section/"+id,store:prefix+"/section",update:prefix+"/section/"+id,destroy:prefix+"/section/"+id},projectSection:{store:prefix+"/project/"+id+"/section"},projectPage:{store:prefix+"/project/"+id+"/page"},tag:{index:prefix+"/tag",show:prefix+"/tag/"+id,store:prefix+"/tag",update:prefix+"/tag/"+id,destroy:prefix+"/tag/"+id},page:{index:prefix+"/page",show:prefix+"/page/"+id,store:prefix+"/page",update:prefix+"/page/"+id,destroy:prefix+"/page/"+id},pageSection:{store:prefix+"/page/"+id+"/section"}};return routes[resource][method]}}}),app.factory("HttpInterceptor",function($q,notificationService){var checkResponseCode=function(data,status){switch(status){case 422:notificationService.clear();var msg=[];angular.forEach(data,function(value,key){msg=msg.concat(value)}),notificationService.add("Validation failed, please correct the following issues:","danger",msg);break;case 401:notificationService.add("You have been logged out","warning");break;case 500:notificationService.add("API error","danger");break;default:console.log("Some other problem!"),console.log(data)}};return{request:function(config){return config},requestError:function(rejection){return $q.reject(rejection)},response:function(response){return notificationService.removeByType("danger"),response},responseError:function(rejection){return checkResponseCode(rejection.data,rejection.status),console.log(rejection),$q.reject(rejection)}}}),app.service("notificationService",function($timeout){var notifications=[];this.get=function(){return notifications},this.add=function(message,type,messages){"success"==type&&this.removeByType("success");var notification={type:type,message:message,messages:messages};notifications.push(notification),console.log("added "+type+" message"),"danger"!=type&&$timeout(function(){notifications.splice(notifications.indexOf(notification),1)},6e3)},this.removeByIndex=function(index){console.log("removing one message: "+index),notifications.splice(index,1)},this.removeByType=function(type){for(console.log("clearing "+type+" messages"),i=0;i<notifications.length;i++)notifications[i].type==type&&notifications.splice(i,1)},this.clear=function(){console.log("clearing all messages"),notifications=[]}}),app.controller("NotificationController",function($scope,notificationService,$timeout){$scope.notifier=notificationService,$scope.$watch("notifier.get()",function(notifications){angular.isDefined(notifications)&&($scope.notifications=notifications)},!0),$scope.closeNotification=function(index){notificationService.removeByIndex(index)}}),app.controller("DashboardController",function($scope,$http,$stateParams){}),app.controller("ProjectController",function($scope,$filter,ngTableParams,$http,RestfulApi,notificationService){$scope.data=[],$scope.tableParams=new ngTableParams({page:1,count:10,sorting:{updated_at:"desc"}},{filterDelay:10,total:$scope.data.length,getData:function($defer,params){var filteredData=params.filter()?$filter("filter")($scope.data,params.filter()):$scope.data,orderedData=params.sorting()?$filter("orderBy")(filteredData,params.orderBy()):$scope.data;params.total(orderedData.length),$defer.resolve(orderedData.slice((params.page()-1)*params.count(),params.page()*params.count()))}}),$scope.init=function(){$http.get(RestfulApi.getRoute("project","index")).success(function(data){$scope.data=data,$scope.tableParams.reload()})},$scope["delete"]=function(id,title){confirm("Are you sure you wish to delete "+title+"?")&&$http["delete"]("/api/project/"+id).success(function(data){notificationService.add("Project '"+data.title+"' deleted successfully","info"),$scope.init()}).error(function(data){$scope.errors=data})},$scope.init()}),app.controller("ProjectCreateController",function($scope,$http,$stateParams,$state,RestfulApi,notificationService){$scope.data={},$scope.create=!0,$scope.save=function(apply){$http.post(RestfulApi.getRoute("project","store"),$scope.data).success(function(data){notificationService.add("Project '"+data.title+"' added successfully","success"),$scope.errors=[],apply?$state.go("project.edit",{id:data.id}):$state.go("project.index")}).error(function(data){$scope.errors=data})}}),app.controller("ProjectEditController",function($scope,$http,$stateParams,$state,RestfulApi,notificationService,ngTableParams,$filter,$modal){$scope.data={sections:[],pages:[]},$scope.tableParams=new ngTableParams({page:1,count:10,sorting:{updated_at:"desc"}},{filterDelay:10,total:$scope.data.pages.length,getData:function($defer,params){var filteredData=params.filter()?$filter("filter")($scope.data.pages,params.filter()):$scope.data.pages,orderedData=params.sorting()?$filter("orderBy")(filteredData,params.orderBy()):$scope.data.pages;params.total(orderedData.length),$defer.resolve(orderedData.slice((params.page()-1)*params.count(),params.page()*params.count()))}}),$http.get(RestfulApi.getRoute("project","show",$stateParams.id)).success(function(data){$scope.data=data,$scope.slug=$scope.data.slug,$scope.tableParams.reload()}).error(function(data,status,headers,config){$scope.errors=data}),$scope.options={dragStop:function(scope){for(console.log("stopped dragging"),console.log(scope),i=0;i<scope.dest.nodesScope.$modelValue.length;i++)scope.dest.nodesScope.$modelValue[i].rank=i},accept:function(sourceNodeScope,destNodesScope,destIndex){return!0}};$scope.alertMe=function(){},$scope.editSection=function(create,sectionId){sectionId="undefined"!=typeof sectionId?sectionId:!1,modalData={create:create,projectId:$scope.data.id,sectionId:sectionId},console.log(modalData);var modalInstance=$modal.open({animation:!0,templateUrl:"sectionEdit.html",controller:"editSectionController",size:"lg",resolve:{modalData:function(){return modalData}}});modalInstance.result.then(function(section){console.log("modal closed"),console.log(section),create?$scope.data.sections.push(section):angular.forEach($scope.data.sections,function(value,key){value.id==sectionId&&(console.log("updated section: "+value.id),$scope.data.sections[key]=section)}),console.log($scope.data.sections)})},$scope.deleteSection=function(sectionId){confirm("Are you sure you wish to delete this section?.")&&$http["delete"]("/api/section/"+sectionId).success(function(data){angular.forEach($scope.data.sections,function(value,key){value.id==sectionId&&(console.log(key),$scope.data.sections.splice(key,1))}),notificationService.add("Section '"+sectionId+"' deleted successfully","info")}).error(function(data){$scope.errors=data})},$scope.editPage=function(create,pageId){pageId="undefined"!=typeof pageId?pageId:!1,modalData={create:create,projectId:$scope.data.id,pageId:pageId},console.log(modalData);var modalInstance=$modal.open({animation:!0,templateUrl:"pageEdit.html",controller:"editPageController",size:"lg",resolve:{modalData:function(){return modalData}}});modalInstance.result.then(function(page){console.log("modal closed"),console.log(page),create?$scope.data.pages.push(page):angular.forEach($scope.data.pages,function(value,key){value.id==pageId&&(console.log("updated section: "+value.id),$scope.data.pages[key]=page)}),console.log($scope.data.pages),$scope.tableParams.reload()})},$scope.deletePage=function(pageId){confirm("Are you sure you wish to delete this page?.")&&$http["delete"]("/api/page/"+pageId).success(function(data){angular.forEach($scope.data.pages,function(value,key){value.id==pageId&&(console.log(key),$scope.data.pages.splice(key,1))}),notificationService.add("Page '"+pageId+"' deleted successfully","info"),$scope.tableParams.reload()}).error(function(data){$scope.errors=data})},$scope.slugWarning=function(){notificationService.removeByType("warning"),$scope.slug!=$scope.data.slug&&notificationService.add("You have modified the project slug. Please be aware that this may break hyperlinks to this project.","warning")},$scope.save=function(apply){apply="undefined"!=typeof apply?apply:!1,$scope.slug!=$scope.data.slug?confirm("Are you sure you wish to change the slug?")?$scope.put(apply):($scope.data.slug=$scope.slug,notificationService.removeByType("warning"),notificationService.add("Slug reset","info")):$scope.put(apply)},$scope.put=function(apply){$http.put(RestfulApi.getRoute("project","update",$stateParams.id),$scope.data).success(function(data){notificationService.add("Project '"+data.title+"' updated successfully","success"),$scope.errors=[],$scope.data.updated_at_human="Just now",apply||$state.go("project.index")}).error(function(data){$scope.errors=data})}}),app.controller("editSectionController",function($scope,$http,$modalInstance,RestfulApi,notificationService,modalData){modalData.create||$http.get(RestfulApi.getRoute("section","show",modalData.sectionId)).success(function(data){$scope.section=data}).error(function(data){$scope.errors=data}),$scope.save=function(){console.log(modalData.create),modalData.create?(console.log("creating"),$http.post(RestfulApi.getRoute("projectSection","store",modalData.projectId),$scope.section).success(function(data){notificationService.add("Section (ID:"+data.id+") created successfully","success"),$scope.errors=[],$modalInstance.close(data)}).error(function(data){$scope.errors=data})):(console.log("editing"),$http.put(RestfulApi.getRoute("section","update",$scope.section.id),$scope.section).success(function(data){notificationService.add("Section (ID:"+data.id+") updated successfully","success"),$scope.errors=[],$modalInstance.close(data)}).error(function(data){$scope.errors=data}))},$scope.cancel=function(){$modalInstance.dismiss("cancel")}}),app.controller("editPageController",function($scope,$http,$modalInstance,RestfulApi,notificationService,modalData){modalData.create||$http.get(RestfulApi.getRoute("page","show",modalData.pageId)).success(function(data){$scope.page=data}).error(function(data){$scope.errors=data}),$scope.save=function(){console.log(modalData.create),modalData.create?(console.log("creating"),$http.post(RestfulApi.getRoute("projectPage","store",modalData.projectId),$scope.page).success(function(data){notificationService.add("Page '"+data.title+"' created successfully","success"),$scope.errors=[],$modalInstance.close(data)}).error(function(data){$scope.errors=data})):(console.log("editing"),$http.put(RestfulApi.getRoute("page","update",$scope.page.id),$scope.page).success(function(data){notificationService.add("Page '"+data.title+"' updated successfully","success"),$scope.errors=[],$modalInstance.close(data)}).error(function(data){$scope.errors=data}))},$scope.cancel=function(){$modalInstance.dismiss("cancel")}}),app.controller("TagController",function($scope,$filter,ngTableParams,$http,notificationService){$scope.data=[],$scope.tableParams=new ngTableParams({page:1,count:10,sorting:{updated_at:"desc"}},{filterDelay:10,total:$scope.data.length,getData:function($defer,params){var filteredData=params.filter()?$filter("filter")($scope.data,params.filter()):$scope.data,orderedData=params.sorting()?$filter("orderBy")(filteredData,params.orderBy()):$scope.data;params.total(orderedData.length),$defer.resolve(orderedData.slice((params.page()-1)*params.count(),params.page()*params.count()))}}),$scope.init=function(){$http.get("/api/tag").success(function(data){$scope.data=data,$scope.tableParams.reload()})},$scope["delete"]=function(id,title){confirm("Are you sure you wish to delete "+title+"?")&&$http["delete"]("/api/tag/"+id).success(function(data){notificationService.add("Project '"+data.title+"' deleted successfully","info"),$scope.init()}).error(function(data){$scope.errors=data})},$scope.init()}),app.controller("TagCreateController",function($scope,$http,$stateParams,$state,notificationService){$scope.data={},$scope.save=function(apply){$http.post("/api/tag",$scope.data).success(function(data){notificationService.add("Tag '"+data.title+"' added successfully","success"),$scope.errors=[],apply?$state.go("tag.edit",{id:data.id}):$state.go("tag.index")}).error(function(data){$scope.errors=data})}}),app.controller("TagEditController",function($scope,$http,$stateParams,$state,notificationService,ngTableParams,$filter,$modal){$scope.data={projects:[]},$scope.tableParams=new ngTableParams({page:1,count:10,sorting:{updated_at:"desc"}},{filterDelay:10,total:$scope.data.projects.length,getData:function($defer,params){var filteredData=params.filter()?$filter("filter")($scope.data.projects,params.filter()):$scope.data.projects,orderedData=params.sorting()?$filter("orderBy")(filteredData,params.orderBy()):$scope.data.projects;params.total(orderedData.length),$defer.resolve(orderedData.slice((params.page()-1)*params.count(),params.page()*params.count()))}}),$http.get("/api/tag/"+$stateParams.id).success(function(data){$scope.data=data,$scope.tableParams.reload()}).error(function(data){$scope.errors=data}),$scope.save=function(apply){apply="undefined"!=typeof apply?apply:!1,$http.put("/api/tag/"+$stateParams.id,$scope.data).success(function(data){notificationService.add("Tag '"+data.title+"' updated successfully","success"),$scope.errors=[],apply||$state.go("tag.index")}).error(function(data){$scope.errors=data})}}),app.controller("PageController",function($scope,$filter,ngTableParams,$http,RestfulApi,notificationService){$scope.model=[],$scope.tableParams=new ngTableParams({page:1,count:10,sorting:{updated_at:"desc"}},{filterDelay:10,total:$scope.model.length,getData:function($defer,params){var filteredData=params.filter()?$filter("filter")($scope.model,params.filter()):$scope.model,orderedData=params.sorting()?$filter("orderBy")(filteredData,params.orderBy()):$scope.model;params.total(orderedData.length),$defer.resolve(orderedData.slice((params.page()-1)*params.count(),params.page()*params.count()))}}),$scope.init=function(){$http.get(RestfulApi.getRoute("page","index")).success(function(data){$scope.model=data,$scope.tableParams.reload()})},$scope["delete"]=function(id,title){confirm("Are you sure you wish to delete "+title+"?")&&$http["delete"]("/api/page/"+id).success(function(data){notificationService.add("Page '"+data.title+"' deleted successfully","info"),$scope.init()}).error(function(data){$scope.errors=data})},$scope.init()}),app.controller("PageEditController",function($scope,$http,$stateParams,$state,RestfulApi,notificationService,ngTableParams,$filter,$modal){$scope.model={sections:[]},$http.get(RestfulApi.getRoute("page","show",$stateParams.id)).success(function(data){$scope.model=data,$scope.slug=$scope.model.slug}).error(function(data,status,headers,config){$scope.errors=data}),$scope.options={dragStop:function(scope){for(console.log("stopped dragging"),console.log(scope),i=0;i<scope.dest.nodesScope.$modelValue.length;i++)scope.dest.nodesScope.$modelValue[i].rank=i},accept:function(sourceNodeScope,destNodesScope,destIndex){return!0}};$scope.editSection=function(create,sectionId){sectionId="undefined"!=typeof sectionId?sectionId:!1,modalData={create:create,pageId:$scope.model.id,sectionId:sectionId},console.log(modalData);var modalInstance=$modal.open({animation:!0,templateUrl:"pageSectionEdit.html",controller:"editPageSectionController",size:"lg",resolve:{modalData:function(){return modalData}}});modalInstance.result.then(function(section){console.log("modal closed"),console.log(section),create?$scope.model.sections.push(section):angular.forEach($scope.model.sections,function(value,key){value.id==sectionId&&(console.log("updated section: "+value.id),$scope.model.sections[key]=section)}),console.log($scope.model.sections)})},$scope.deleteSection=function(sectionId){confirm("Are you sure you wish to delete this section?.")&&$http["delete"]("/api/section/"+sectionId).success(function(data){angular.forEach($scope.model.sections,function(value,key){value.id==sectionId&&(console.log(key),$scope.model.sections.splice(key,1))}),notificationService.add("Section '"+sectionId+"' deleted successfully","info")}).error(function(data){$scope.errors=data})},$scope.slugWarning=function(){notificationService.removeByType("warning"),$scope.slug!=$scope.model.slug&&notificationService.add("You have modified the project slug. Please be aware that this may break hyperlinks to this project.","warning")},$scope.save=function(apply){apply="undefined"!=typeof apply?apply:!1,$scope.slug!=$scope.model.slug?confirm("Are you sure you wish to change the slug?")?$scope.put(apply):($scope.model.slug=$scope.slug,notificationService.removeByType("warning"),notificationService.add("Slug reset","info")):$scope.put(apply)},$scope.put=function(apply){$http.put(RestfulApi.getRoute("page","update",$stateParams.id),$scope.model).success(function(data){notificationService.add("Page '"+data.title+"' updated successfully","success"),$scope.errors=[],$scope.model.updated_at_human="Just now",apply||$state.go("page.index")}).error(function(data){$scope.errors=data})}}),app.controller("editPageSectionController",function($scope,$http,$modalInstance,RestfulApi,notificationService,modalData){modalData.create||$http.get(RestfulApi.getRoute("section","show",modalData.sectionId)).success(function(data){$scope.section=data}).error(function(data){$scope.errors=data}),$scope.save=function(){console.log(modalData.create),modalData.create?(console.log("creating"),$http.post(RestfulApi.getRoute("pageSection","store",modalData.pageId),$scope.section).success(function(data){notificationService.add("Section (ID:"+data.id+") created successfully","success"),$scope.errors=[],$modalInstance.close(data)}).error(function(data){$scope.errors=data})):(console.log("editing"),$http.put(RestfulApi.getRoute("section","update",$scope.section.id),$scope.section).success(function(data){notificationService.add("Section (ID:"+data.id+") updated successfully","success"),$scope.errors=[],$modalInstance.close(data)}).error(function(data){$scope.errors=data}))},$scope.cancel=function(){$modalInstance.dismiss("cancel")}}),app.controller("AssetsController",function($scope,$http,$stateParams,$state,notificationService,$modal){$scope.model=[],$scope.init=function(){$http.get("/api/assets?path="+$stateParams.type+"/"+$stateParams.id).success(function(data){$scope.model=data})},$scope.init()}),app.controller("AssetsFileController",function($scope,$http,$stateParams,$state,notificationService,$modal,Upload){$scope.model=[],$scope.init=function(){$http.get("/api/assets?path="+unescape($stateParams.folder)).success(function(data){$scope.model=data}),$scope.dynamic=0},$scope.uploadFile=function(){$scope.dynamic=0,console.log($stateParams.folder),Upload.upload({url:"/api/assets",fields:{path:unescape($stateParams.folder),name:$scope.name},file:$scope.file}).progress(function(evt){var progressPercentage=parseInt(100*evt.loaded/evt.total);$scope.dynamic=progressPercentage,console.log("progress: "+progressPercentage+"% "+evt.config.file.name)}).success(function(data,status,headers,config){console.log("file "+config.file.name+"uploaded. Response: "+data)}).error(function(data,status,headers,config){console.log("error status: "+status)})},$scope.init()});
//# sourceMappingURL=main.js.map