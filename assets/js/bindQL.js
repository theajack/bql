
(function(){
  var _bind="b-bind";//单值
  var _loop="b-loop";//数组
  var _update="b-update";//input值改变 是否更新数据 默认为false oninput 更新数据
  var _refresh="b-refresh";//onchange 刷新页面
  var _init="b-init";//初始值 默认为null
  var _each="b-each";//下文中引用的变量名 默认为each
  var _each_def="each";
  var _s="{{";
  var _e="}}";
  var _bind_str=_s+"bind"+_e;
  var _reg=new RegExp("("+_s+")(.*?)("+_e+")","g");
  var _undefined="无";
  var _index="b-index";//哪一个数据
  var _attr="b-attr";//那一个属性
  J.ready(function(){
    BQL.init();
  });
  function _funsResult(get,data,i){
    var result=[];
    get.funs().each(function(item){
      var res=J.checkArg(item(data),_undefined);
      result.append(res);
    });
    var str=get.str().replaceAll(_bind_str,result);
    if(i!=undefined){
      str=str.replaceAll(_index+'="i"',_index+"="+i);
    }
    return str;
  }

  function _bqlRefresh(get,ref){
    var obj=get.obj();
    if(ref==true&&obj.run!=undefined){
      obj.run();
    }
    var html="";
    var d=obj.get();
    if(d==null){
      html=get.str().replaceAll(_bind_str,"undefined");
    }else{
      if(get.loop()){
        if(d!=null&&d.constructor==Array){
          d.each(function(dataItem,i){
            html+=_funsResult(get,dataItem,i);
          });
        }
      }else{
        html=_funsResult(get,d);
      }
    }
    var element=get.element();
    //var str=get.str();
    element.html(html);
    _bqlInitEvent(element,get.single());
    return d;
  }
  //只考虑了Array 
  function _bqlInitEvent(element,single){
    //element.findTag("input").on("input","J.show(this.val())",true)
    var refresh=element.attr(_refresh);
    if(element.attr(_update)=="true"){
      ["input","textarea"].each(function(tag){
        element.findTag(tag).each(function(item){
          if(item.hasAttr(_attr)){
            var name;
            if(single==true){
              var a=item.attr(_attr);
              item.removeAttr(_attr);
              name=element.attr(_bind);
              item.on("input",function(){
                if(this.attr("type")=="number"){
                  (new Function(name+".data()"+a+"="+this.val()+";"))();
                }else{
                  (new Function(name+".data()"+a+"='"+this.val()+"';"))();
                }
              },true);
            }else if(single==false){
              var i=item.attr(_index);
              var a=item.attr(_attr);
              item.removeAttr(_index);
              item.removeAttr(_attr);
              name=element.attr(_loop);
              item.on("input",function(){
                if(this.attr("type")=="number"){
                  (new Function(name+".data()["+i+"]"+a+"="+this.val()+";"))();
                }else{
                  (new Function(name+".data()["+i+"]"+a+"='"+this.val()+"';"))();//"+name+".refresh();
                }
              },true);
            }else{
              name=element.attr(_bind);
              item.removeAttr(_attr);
              item.on("input",function(){
                if(this.attr("type")=="number"){
                  (new Function(name+".set("+this.val()+",false);"))();
                }else{
                  (new Function(name+".set('"+this.val()+"',false);"))();
                }
              },true);
            }
            if(refresh=="true"){
              item.on("change",function(){
                (new Function(name+".refresh();"))();
              },true);
            }
          }
        });
      });
    }
  }
  function _bqlInit(get,set){
    var str=get.str();
    var element=get.element();
    var funs=new Array();
    if(get.loop()){
      set.varName((element.hasAttr(_each))?element.attr(_each):_each_def);
    }
    if(str.match(_reg)!=null){
      str.match(_reg).each(function(item){
        funs.append(new Function(get.varName(),"return "+item.substring(_s.length,item.length-_e.length)));
      });
      set.str(str.replaceAll(_reg,_bind_str));
      set.funs(funs);
    }
    element.empty();
    if(element.hasAttr(_init)){
      this.init((new Function("return "+element.attr(_init)))());
    }
  }
  function _bqlCheckRefresh(){
    if(_checkArg.apply(null,arguments)){
      return this.refresh();
    }
    return this;
  }
  function _bqlCheckResRefresh(get,res,args){
    if(_checkArg.apply(null,args)){
      if(get.needRefresh()){
        this.refresh();
      }
      return res;
    }
    return this;
  }
  function _checkArg(){
    if(arguments.length==1){
      return arguments[0];
    }else{
      for(var i=0;i<arguments.length;i++){
        if(arguments[i]==true){
          return true;
        }
      }
      return false;
    }
  }
  //
  function _bqlInitHtml(element,loop){//为oninput 给input (value) textArea (里面的内容)
    if(element.attr(_update)=="true"){
      ["input","textarea"].each(function(tag){
        var items=element.findTag(tag);
        if(items!=undefined){
          items.each(function(item){
            var val;
            if(tag=="input"){
              val=item.attr("value").trim();
            }else{
              val=item.html().trim();
            }
            item.attr("value",val);
            var arr=val.match(_reg);
            if(arr!=null){
              if(arr[0]==val){//只允许 value="{{item.attr}}"
                var attr=arr[0].substring(arr[0].indexOf("."),arr[0].length-_e.length);
                item.attr(_attr,attr);
                if(loop){
                  item.attr(_index,"i");
                }
              }
            }
          });
        };
      });
    }
    return element.html();
  }
  BQL=function(obj,loop){
    var _varName=obj.attr(_bind);
    var _obj=null;
    var _str=_bqlInitHtml(obj,loop);
    var _element=obj;
    var _loop=loop;
    var _single=null;
    var _funs=new Array();
    var _need_refresh=false;
    var get={
      varName:function(){
        return _varName;
      },element:function(){
        return _element;
      },obj:function(){
        return _obj;
      },str:function(){
        return _str;
      },loop:function(){
        return _loop;
      },funs:function(){
        return _funs;
      },single:function(){
        return _single;
      },needRefresh:function(){
        return _need_refresh;
      }
    };
    var set={
      varName:function(val){
        _varName=val;
      },element:function(val){
        _element=val;
      },obj:function(val){
        _obj=val;
      },str:function(val){
        _str=val;
      },loop:function(val){
        _loop=val;
      },funs:function(val){
        _funs=val;
      }
    };
    
    this.refresh=function(){
      _need_refresh=false;
      return _bqlRefresh(get,true);
    };
    this.init=function(data){
      if(data==undefined){
        data=[];
      }
      _obj=Jql(data);
      if(data.constructor==Object){
        this.add=function(attr,value){
          _obj.add(attr,value);
          return this.refresh();
        };
        this.remove=function(attr){
          _obj.remove(attr);
          return this.refresh();
        };
        this.select=function(attr){
          return _obj.select(attr);
        };
        this.update=function(attr,value){
          _obj.update(attr,value);
          return this.refresh();
        };
        _single=true;
      }else if(data.constructor==Array){
        this.add=function(attr,value,run){
          _obj.add(attr,value,run);
          _need_refresh=true;
          return _bqlCheckRefresh.call(this,value,run);
        };
        this.remove=function(attr,run){
          _obj.remove(attr,run);
          _need_refresh=true;
          return _bqlCheckRefresh.call(this,attr,run);
        };
        this.update=function(attr,value,run){
          _obj.update(attr,value,run);
          _need_refresh=true;
          return _bqlCheckRefresh.call(this,value,run);
        };
        this.delete=function(attr,run){
          _obj.delete(attr,run);
          _need_refresh=true;
          return _bqlCheckRefresh.call(this,attr,run);
        };
        this.insert=function(attr,value,index,run){
          _obj.insert(attr,value,index,run);
          _need_refresh=true;
          return _bqlCheckRefresh.call(this,value,index,run);
        };
        this.select=function(attr,run){
          return _bqlCheckResRefresh.call(this,get,_obj.select(attr,run),[attr,run]);
        };
        this.where=function(attr,value,run){
          return _bqlCheckResRefresh.call(this,get,_obj.where(attr,value,run),[value,run]);
        };
        this.orderBy=function(attr,order,type,run){
          return _bqlCheckResRefresh.call(this,get,_obj.orderBy(attr,order,type,run),[order,type,run]);
        };
        this.groupBy=function(attr,run){
          return _bqlCheckResRefresh.call(this,get,_obj.groupBy(attr,run),[run]);
        };
        _single=false;
      }
      this.set=function(data,ref){
        _obj.set(data);
        if(ref==undefined||ref==true){
          this.refresh();
        }
        return data;
      };
      this.get=function(){
        return _obj.get();
      };
      this.data=function(){
        return _obj.data();
      };
      this.clear=function(){
        _obj.clear();
        this.refresh();
        return null;
      }
      this.refresh();
      return this.get();
    }
    _bqlInit.call(this,get,set);
  };
  BQL.init=function(element){
    if(element==undefined){
      var list=J.attr(_bind);
      list.each(function(item){
        (new Function("obj","window."+item.attr(_bind)+"=new BQL(obj)"))(item);
      });
      var lista=J.attr(_loop);
      lista.each(function(item){
        (new Function("obj","window."+item.attr(_loop)+"=new BQL(obj,true)"))(item);
      });
    }else{
      if(element.hasAttr(_bind)){
        (new Function("obj","window."+element.attr(_bind)+"=new BQL(obj)"))(element);
      }else if(element.hasAttr(_loop)){
        (new Function("obj","window."+element.attr(_loop)+"=new BQL(obj,true)"))(element);
      }
    }
  };
  //input change
  
  //users.update().where().groupBy().desc().refresh();
})();
var BQL;











