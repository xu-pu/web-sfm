Ember.TEMPLATES["application"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var stack1;


  stack1 = helpers._triageMustache.call(depth0, "outlet", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  else { data.buffer.push(''); }
  
});

Ember.TEMPLATES["controllpanel"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n        <div class=\"controll-panel__l1-body\">\n            <div id=\"controll-panel__images\" class=\"controll-panel__l2\">\n                <div class=\"controll-panel__l2-tab\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "enter", "workspace.images", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push(">Import Images</div>\n            </div>\n            <div id=\"controll-panel__parameters\" class=\"controll-panel__l2\">\n                <div class=\"controll-panel__l2-tab\">\n                    <div>Use ");
  stack1 = helpers._triageMustache.call(depth0, "threadPoolSize", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(" CPU Cores</div>\n                    ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "App.CpuSettingView", {hash:{
    'controller': ("controller")
  },hashTypes:{'controller': "ID"},hashContexts:{'controller': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n                </div>\n            </div>\n        </div>\n        ");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n        <div class=\"controll-panel__l1-body\">\n\n            <div id=\"controll-panel__extractor\" class=\"controll-panel__l2\">\n                <div class=\"controll-panel__l2-tab\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "enter", "workspace.extractor", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push(">Feature Extraction</div>\n            </div>\n\n            <div id=\"controll-panel__register\" class=\"controll-panel__l2\">\n                <div class=\"controll-panel__l2-tab\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "toggleMenu", "register", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push(">Camera Registration</div>\n                ");
  stack1 = helpers['if'].call(depth0, "expandRegister", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            </div>\n\n            <div id=\"controll-panel__stereo\" class=\"controll-panel__l2\">\n                <div class=\"controll-panel__l2-tab\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "toggleMenu", "stereo", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push(">Stereopsis</div>\n                ");
  stack1 = helpers['if'].call(depth0, "expandStereo", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(6, program6, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            </div>\n        </div>\n        ");
  return buffer;
  }
function program4(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n                <div class=\"controll-panel__l2-body\">\n                    <div id=\"controll-panel__matching\" class=\"controll-panel__l3-tab\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "enter", "matches", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push(">Feature Matching</div>\n                    <div id=\"controll-panel__tracking\" class=\"controll-panel__l3-tab\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "enter", "tracks", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push(">Key Point Tracking</div>\n                    <div id=\"controll-panel__recovery\" class=\"controll-panel__l3-tab\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "enter", "workspace.register", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push(">Camera Parameter Recovery</div>\n                </div>\n                ");
  return buffer;
  }

function program6(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n                <div class=\"controll-panel__l2-body\">\n                    <div id=\"controll-panel__two-view-stereo\" class=\"controll-panel__l3-tab\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "enter", "workspace.mvs", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push(">Two-View Stereo</div>\n                    <div id=\"controll-panel__mvs\" class=\"controll-panel__l3-tab\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "enter", "workspace.mvs", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push(">Multi-View Stereo</div>\n                </div>\n                ");
  return buffer;
  }

  data.buffer.push("<div id=\"controll-panel__header\" class=\"floating-window__header\">\n    <span>WebSFM</span>\n    <div class=\"exit-icon\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "back", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("></div>\n</div>\n<div id=\"controll-panel__body\">\n\n    <div id=\"controll-panel__input\" class=\"controll-panel__l1\">\n        <div class=\"controll-panel__l1-tab\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "toggleMenu", "input", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push(">\n            <span>INPUTS</span>\n        </div>\n        ");
  stack1 = helpers['if'].call(depth0, "expandInput", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </div>\n\n    <div id=\"controll-panel__progress\" class=\"controll-panel__l1\">\n        <div class=\"controll-panel__l1-tab\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "toggleMenu", "progress", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push(">\n            <span>PROGRESS</span>\n        </div>\n        ");
  stack1 = helpers['if'].call(depth0, "expandProgress", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </div>\n\n    <div id=\"controll-panel__output\" class=\"controll-panel__l1\">\n        <div class=\"controll-panel__l1-tab\">\n            <span>Output</span>\n        </div>\n    </div>\n\n</div>\n\n\n<div id=\"controll-panel__footer\">\n    ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "App.StateBarView", {hash:{
    'controller': ("controller")
  },hashTypes:{'controller': "ID"},hashContexts:{'controller': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n</div>");
  return buffer;
  
});

Ember.TEMPLATES["matches"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression;


  data.buffer.push("<div class=\"floating-window__matching-table\">\n    <div class=\"floating-window__header\"></div>\n    ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "App.TwoViewGridView", {hash:{
    'controller': ("controller")
  },hashTypes:{'controller': "ID"},hashContexts:{'controller': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n</div>\n");
  stack1 = helpers._triageMustache.call(depth0, "outlet", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  return buffer;
  
});

Ember.TEMPLATES["matches/pair"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', escapeExpression=this.escapeExpression;


  data.buffer.push("<div class=\"floating-window__matching-pair\">\n    <div class=\"floating-window__header\"></div>\n    ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "App.TwoViewMatchingView", {hash:{
    'controller': ("controller")
  },hashTypes:{'controller': "ID"},hashContexts:{'controller': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n</div>");
  return buffer;
  
});

Ember.TEMPLATES["welcome"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


  data.buffer.push("<div class=\"welcome-screen__header\">Welcome to WebSFM</div>\n<div class=\"welcome-screen__projects-container\">");
  data.buffer.push(escapeExpression((helper = helpers.outlet || (depth0 && depth0.outlet),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "projects", options) : helperMissing.call(depth0, "outlet", "projects", options))));
  data.buffer.push("</div>\n<div class=\"welcome-screen__demos-container\">");
  data.buffer.push(escapeExpression((helper = helpers.outlet || (depth0 && depth0.outlet),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "demos", options) : helperMissing.call(depth0, "outlet", "demos", options))));
  data.buffer.push("</div>");
  return buffer;
  
});

Ember.TEMPLATES["welcome/demos"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n            <li class=\"welcome-screen__demos__item\">\n                ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "App.DemoThumbnailView", {hash:{
    'controller': ("demo")
  },hashTypes:{'controller': "ID"},hashContexts:{'controller': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n            </li>\n        ");
  return buffer;
  }

  data.buffer.push("<div class=\"welcome-screen__demos\">\n    <ul>\n        <li class=\"welcome-screen__demos__item\">\n            <div class=\"welcome-screen__demos__header\">\n                <span>DEMOS</span>\n            </div>\n        </li>\n        ");
  stack1 = helpers.each.call(depth0, "demo", "in", "controller", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </ul>\n</div>");
  return buffer;
  
});

Ember.TEMPLATES["welcome/projects"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n            <li class=\"welcome-screen__projects__item\">\n                ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "App.ProjectThumbnailView", {hash:{
    'controller': ("project")
  },hashTypes:{'controller': "ID"},hashContexts:{'controller': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n            </li>\n        ");
  return buffer;
  }

  data.buffer.push("<div class=\"welcome-screen__projects\">\n    <ul>\n\n        <li class=\"welcome-screen__projects__item\">\n            <div class=\"welcome-screen__projects__header\">\n                <span>Projects</span>\n            </div>\n        </li>\n\n        ");
  stack1 = helpers.each.call(depth0, "project", "in", "controller", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n        <li class=\"welcome-screen__projects__item\">\n            ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "App.ProjectCreatorView", {hash:{
    'controller': ("controller")
  },hashTypes:{'controller': "ID"},hashContexts:{'controller': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n        </li>\n\n    </ul>\n</div>");
  return buffer;
  
});

Ember.TEMPLATES["widgets/cpu-node"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', escapeExpression=this.escapeExpression;


  data.buffer.push("<div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("view.isEnabled view.willEnable view.willDisable")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("></div>");
  return buffer;
  
});

Ember.TEMPLATES["widgets/cpu-setting"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', escapeExpression=this.escapeExpression;


  data.buffer.push(escapeExpression(helpers.view.call(depth0, "view.NodeView", {hash:{
    'index': (0)
  },hashTypes:{'index': "INTEGER"},hashContexts:{'index': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "view.NodeView", {hash:{
    'index': (1)
  },hashTypes:{'index': "INTEGER"},hashContexts:{'index': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "view.NodeView", {hash:{
    'index': (2)
  },hashTypes:{'index': "INTEGER"},hashContexts:{'index': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "view.NodeView", {hash:{
    'index': (3)
  },hashTypes:{'index': "INTEGER"},hashContexts:{'index': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "view.NodeView", {hash:{
    'index': (4)
  },hashTypes:{'index': "INTEGER"},hashContexts:{'index': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "view.NodeView", {hash:{
    'index': (5)
  },hashTypes:{'index': "INTEGER"},hashContexts:{'index': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "view.NodeView", {hash:{
    'index': (6)
  },hashTypes:{'index': "INTEGER"},hashContexts:{'index': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "view.NodeView", {hash:{
    'index': (7)
  },hashTypes:{'index': "INTEGER"},hashContexts:{'index': depth0},contexts:[depth0],types:["ID"],data:data})));
  return buffer;
  
});

Ember.TEMPLATES["widgets/demo-thumbnail"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n            <div ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "enter", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Enter</div>\n        ");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n            ");
  stack1 = helpers['if'].call(depth0, "isInprogress", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(6, program6, data),fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        ");
  return buffer;
  }
function program4(depth0,data) {
  
  
  data.buffer.push("\n                <div>Downloading</div>\n            ");
  }

function program6(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n                <div ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "download", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">Click to download</div>\n            ");
  return buffer;
  }

function program8(depth0,data) {
  
  
  data.buffer.push("\n            finished\n        ");
  }

function program10(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n            ");
  stack1 = helpers['if'].call(depth0, "hasBundler", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(13, program13, data),fn:self.program(11, program11, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        ");
  return buffer;
  }
function program11(depth0,data) {
  
  
  data.buffer.push("\n                avaliable\n            ");
  }

function program13(depth0,data) {
  
  
  data.buffer.push("\n                not avaliable\n            ");
  }

function program15(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n            ");
  stack1 = helpers['if'].call(depth0, "hasMVS", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(13, program13, data),fn:self.program(11, program11, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        ");
  return buffer;
  }

  data.buffer.push("<div class=\"demo-thumbnail__header\">\n    <span>");
  stack1 = helpers._triageMustache.call(depth0, "name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</span>\n    <div class=\"exit-icon\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "delete", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("></div>\n</div>\n\n<div class=\"demo-thumbnail__body\">\n\n    <div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":demo-thumbnail__state-bar isDownloaded isInprogress")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n        ");
  stack1 = helpers['if'].call(depth0, "isDownloaded", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </div>\n\n    <div id=\"demo-thumbnail__details__images\" class=\"demo-thumbnail__detail\">\n        IMAGES ");
  stack1 = helpers._triageMustache.call(depth0, "finishedImages.length", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("/");
  stack1 = helpers._triageMustache.call(depth0, "images.length", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </div>\n\n    <div id=\"demo-thumbnail__details__sift\" class=\"demo-thumbnail__detail\">\n        FEATURES ");
  stack1 = helpers._triageMustache.call(depth0, "finishedSIFT.length", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("/");
  stack1 = helpers._triageMustache.call(depth0, "images.length", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </div>\n\n    <div id=\"demo-thumbnail__details__bundler\" class=\"demo-thumbnail__detail\">\n        BUNDLER\n        ");
  stack1 = helpers['if'].call(depth0, "bundlerFinished", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(10, program10, data),fn:self.program(8, program8, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </div>\n\n    <div id=\"demo-thumbnail__details__mvs\" class=\"demo-thumbnail__detail\">\n        MVS\n        ");
  stack1 = helpers['if'].call(depth0, "mvsFinished", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(15, program15, data),fn:self.program(8, program8, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </div>\n\n</div>");
  return buffer;
  
});

Ember.TEMPLATES["widgets/project-creator"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', escapeExpression=this.escapeExpression;


  data.buffer.push("<div class=\"project-creator__input\">\n    ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "view.InputView", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n</div>\n\n<div ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "createProject", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":project-creator__submit view.isInvalid")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("></div>\n");
  return buffer;
  
});

Ember.TEMPLATES["widgets/project-thumbnail"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  data.buffer.push("\n        <div >Deleting</div>\n    ");
  }

function program3(depth0,data) {
  
  
  data.buffer.push("\n        <div >Enter</div>\n    ");
  }

  data.buffer.push("<div class=\"project-thumbnail__header\">\n    <span>");
  stack1 = helpers._triageMustache.call(depth0, "name", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</span>\n    <div class=\"exit-icon\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "deleteProject", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("></div>\n</div>\n\n<div class=\"project-thumbnail__body\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "enter", "controller.model", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(">\n    ");
  stack1 = helpers['if'].call(depth0, "controller.isDeleting", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n</div>");
  return buffer;
  
});

Ember.TEMPLATES["widgets/state-bar"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, self=this, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n\n<div class=\"controll-panel__state-body__container\">\n    <div class=\"controll-panel__state-body\">\n        <div>");
  stack1 = helpers._triageMustache.call(depth0, "threadPoolSize", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(" cores can be used</div>\n        ");
  stack1 = helpers.each.call(depth0, "thread", "in", "threads", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </div>\n</div>\n\n");
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n            <div class=\"controll-panel__state-body__thread\">\n                thread\n                ");
  stack1 = helpers['if'].call(depth0, "thread.isActive", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(5, program5, data),fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            </div>\n        ");
  return buffer;
  }
function program3(depth0,data) {
  
  
  data.buffer.push("\n                    is active\n                ");
  }

function program5(depth0,data) {
  
  
  data.buffer.push("\n                    is not active\n                ");
  }

function program7(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n            <div class=\"is_running\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "stop", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">\n                <span class=\"icon-pause\"></span>\n            </div>\n        ");
  return buffer;
  }

function program9(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n            <div class=\"is_stopped\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "run", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">\n                <span class=\"icon-play\"></span>\n            </div>\n        ");
  return buffer;
  }

function program11(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n        ");
  stack1 = helpers._triageMustache.call(depth0, "view.description", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    ");
  return buffer;
  }

  stack1 = helpers['if'].call(depth0, "view.expand", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n<div class=\"controll-panel__state-bar\">\n    <div class=\"controll-panel__state-bar__toggle\">\n        ");
  stack1 = helpers['if'].call(depth0, "isRunning", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(9, program9, data),fn:self.program(7, program7, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </div>\n    ");
  stack1 = helpers.view.call(depth0, "view.InfoView", {hash:{
    'controller': ("controller")
  },hashTypes:{'controller': "ID"},hashContexts:{'controller': depth0},inverse:self.noop,fn:self.program(11, program11, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n</div>");
  return buffer;
  
});

Ember.TEMPLATES["widgets/twoviewgrid"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n        <th>\n            <div class=\"main-container__match-table__thumbnail\">\n                <img ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'src': ("imgX.thumbnail")
  },hashTypes:{'src': "ID"},hashContexts:{'src': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n            </div>\n        </th>\n    ");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n    <tr>\n        <th>\n            <div class=\"main-container__match-table__thumbnail\">\n                <img ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'src': ("imgY.thumbnail")
  },hashTypes:{'src': "ID"},hashContexts:{'src': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n            </div>\n        </th>\n\n        ");
  stack1 = helpers.each.call(depth0, "imgX", "in", "controller.images", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(4, program4, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </tr>\n");
  return buffer;
  }
function program4(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n            ");
  stack1 = helpers.view.call(depth0, "view.NodeView", {hash:{
    'viewX': ("imgX"),
    'viewY': ("imgY"),
    'controller': ("controller")
  },hashTypes:{'viewX': "ID",'viewY': "ID",'controller': "ID"},hashContexts:{'viewX': depth0,'viewY': depth0,'controller': depth0},inverse:self.noop,fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        ");
  return buffer;
  }
function program5(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n                <div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":main-container__match-table__pair view.isFinished view.isDiag view.isInprogress view.isHorizontal view.isVertical")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("></div>\n            ");
  return buffer;
  }

  data.buffer.push("<tbody>\n<tr>\n    <th></th>\n    ");
  stack1 = helpers.each.call(depth0, "imgX", "in", "controller.images", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n</tr>\n");
  stack1 = helpers.each.call(depth0, "imgY", "in", "controller.images", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n</tbody>\n");
  return buffer;
  
});

Ember.TEMPLATES["workspace"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


  data.buffer.push("<div id=\"main-container\">");
  stack1 = helpers._triageMustache.call(depth0, "outlet", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div>\n<aside id=\"controll-panel\">");
  data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "controllpanel", options) : helperMissing.call(depth0, "partial", "controllpanel", options))));
  data.buffer.push("</aside>");
  return buffer;
  
});

Ember.TEMPLATES["workspace/extractor"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n            <div class=\"main-container__input-gallery__item\">\n                <div class=\"main-container__input-gallery__image\">\n                    ");
  stack1 = helpers['if'].call(depth0, "thumbnail", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                </div>\n            </div>\n        ");
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n                        <img ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'src': ("thumbnail")
  },hashTypes:{'src': "ID"},hashContexts:{'src': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "expand", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">\n                    ");
  return buffer;
  }

  data.buffer.push("<div id=\"main-container__input-gallery-container\">\n    <ul id=\"main-container__input-gallery\">\n\n        ");
  stack1 = helpers.each.call(depth0, "controller", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n        ");
  stack1 = helpers._triageMustache.call(depth0, "outlet", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n    </ul>\n</div>");
  return buffer;
  
});

Ember.TEMPLATES["workspace/extractor/image"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  data.buffer.push("\n        <canvas></canvas>\n    ");
  }

  data.buffer.push("<div class=\"floating-window__extractor-image\">\n    <div class=\"floating-window__header\">\n        <span class=\"floating-window__header__h1\">FEATURES&nbsp;</span>\n        <span class=\"floating-window__header__h2\">");
  stack1 = helpers._triageMustache.call(depth0, "filename", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</span>\n        <div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":load-indicator isLoading")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("></div>\n        <div class=\"exit-icon\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "back", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("></div>\n    </div>\n    ");
  stack1 = helpers.view.call(depth0, "App.SiftView", {hash:{
    'controller': ("controller")
  },hashTypes:{'controller': "ID"},hashContexts:{'controller': depth0},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n</div>");
  return buffer;
  
});

Ember.TEMPLATES["workspace/images"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, self=this, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n\n                ");
  stack1 = helpers['if'].call(depth0, "view.isActive", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(4, program4, data),fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n                ");
  stack1 = helpers['if'].call(depth0, "controller.inProgress", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(6, program6, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            ");
  return buffer;
  }
function program2(depth0,data) {
  
  
  data.buffer.push("\n                    <h1>Drop</h1>\n                ");
  }

function program4(depth0,data) {
  
  
  data.buffer.push("\n                    <h1>Drag</h1>\n                ");
  }

function program6(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                    <span>Processing ");
  stack1 = helpers._triageMustache.call(depth0, "controller.queue.length", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(" images.</span>\n                ");
  return buffer;
  }

function program8(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n            <div class=\"main-container__input-gallery__item\">\n                <div class=\" main-container__input-gallery__image\">\n                    ");
  stack1 = helpers['if'].call(depth0, "thumbnail", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(9, program9, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                </div>\n            </div>\n        ");
  return buffer;
  }
function program9(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n                        <img ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'src': ("thumbnail")
  },hashTypes:{'src': "ID"},hashContexts:{'src': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "expand", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">\n                    ");
  return buffer;
  }

  data.buffer.push("<div id=\"main-container__input-gallery-container\">\n\n    <ul id=\"main-container__input-gallery\">\n\n        <div class=\"main-container__input-gallery__item\">\n            ");
  stack1 = helpers.view.call(depth0, "App.ImageLoaderView", {hash:{
    'controller': ("controller")
  },hashTypes:{'controller': "ID"},hashContexts:{'controller': depth0},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </div>\n\n        ");
  stack1 = helpers.each.call(depth0, "controller", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(8, program8, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n        ");
  stack1 = helpers._triageMustache.call(depth0, "outlet", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </ul>\n\n</div>");
  return buffer;
  
});

Ember.TEMPLATES["workspace/images/detail"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n            <img ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'src': ("dataurl")
  },hashTypes:{'src': "ID"},hashContexts:{'src': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n        ");
  return buffer;
  }

  data.buffer.push("<div class=\"floating-window__input-image\">\n    <div class=\"floating-window__header\">\n        <span class=\"floating-window__header__h1\">IMAGE&nbsp;</span>\n        <span class=\"floating-window__header__h2\">");
  stack1 = helpers._triageMustache.call(depth0, "filename", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</span>\n        <div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":load-indicator isLoading")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("></div>\n        <div class=\"exit-icon\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "back", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("></div>\n    </div>\n\n    <div ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":floating-window__image-detail__fullimage isloading")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n        ");
  stack1 = helpers['if'].call(depth0, "dataurl", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </div>\n\n    <div class=\"floating-window__image-detail__info\"></div>\n\n</div>");
  return buffer;
  
});

Ember.TEMPLATES["workspace/mvs"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var escapeExpression=this.escapeExpression;


  data.buffer.push(escapeExpression(helpers.view.call(depth0, "App.StereoView", {hash:{
    'controller': ("controller")
  },hashTypes:{'controller': "ID"},hashContexts:{'controller': depth0},contexts:[depth0],types:["ID"],data:data})));
  
});

Ember.TEMPLATES["workspace/register"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n            <div class=\"floating-window__register__view-list__item\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "focus", "cam", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(">\n                <span>Camera</span>\n            </div>\n        ");
  return buffer;
  }

  data.buffer.push(escapeExpression(helpers.view.call(depth0, "App.RegisterView", {hash:{
    'controller': ("controller")
  },hashTypes:{'controller': "ID"},hashContexts:{'controller': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n<div class=\"floating-window__register\">\n    <div class=\"floating-window__register__view-list\">\n        ");
  stack1 = helpers.each.call(depth0, "cam", "in", "cameras", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </div>\n</div>");
  return buffer;
  
});