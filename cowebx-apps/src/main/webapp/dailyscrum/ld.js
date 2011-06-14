define([], function() {
    var ld = function(args) {
		
    };
    var proto = ld.prototype;
    
	proto.permute = function(s, ops, t){
		for(var i=0; i<ops.length; i++){
			if(ops[i][0] == 'insert'){
				s = s.slice(0, ops[i][1]) + ops[i][2] + s.slice(ops[i][1],s.length);
			}else if(ops[i][0] == 'update'){
				s = s.slice(0, ops[i][1]) + ops[i][2] + s.slice(ops[i][1]+1,s.length);
			}else if(ops[i][0] == 'delete'){
				s = s.slice(0, ops[i][1]) + s.slice(ops[i][1]+1,s.length);
			}
		}
		if(t && (t != s)){
			console.error('LD ERROR: s != t');
		}
		return s;
	};
	
	proto.ld = function(s, t){
		if(s.length == 0){
			var c = {'size':t.length};
			var ops = [];
			for(var i=0; i<t.length; i++){
				ops.push(['insert', i, t[i]]);
			}
			c.ops = ops;
			return c;
		}else if(t.length == 0){
			var c = {'size':s.length};
			var ops = [];
			for(var i=0; i<s.length; i++){
				ops.push(['delete', 0, null]);
			}
			c.ops = ops;
			return c;
		}
		
		var d = { "-1,-1" : {'size':0} };
		var m = s.length;
		var n = t.length;
		
		for(var i=0; i<m+1; i++){
			var string = i+",-1";
			d[string] = {'size':i+1};
		}
		for(var j=0; j<n+1; j++){
			var string = "-1,"+j;
			d[string] = {'size':j+1};
		}
		
		for(var j=0; j<n; j++){
			for(var i=0; i<m; i++){
				var cell = d[(i-1)+","+j];
				var ty = 'delete';
				var pos = j+1;
				var ch = null;
				if(d[i+','+(j-1)].size < cell.size){
					cell = d[i+','+(j-1)];
					ty = 'insert';
					pos = j;
					ch = t[j];
				}
				if(d[(i-1)+","+(j-1)].size < cell.size){
					cell = d[(i-1)+','+(j-1)];
					ty = 'update';
					pos = j;
					ch = t[j];
				}
				if((s[i] == t[j]) && (ty=='update')){
				    var op = null;
				}else{
				    var op = [ty, pos, ch];
				}
				
				if(cell.ops){			
                	var x = cell.ops.slice();
                	x.push(op);
                	d[i+","+j] = {'size':cell.size+1, 'cell': cell, 'ops':x};
                }else{
                    if(op!=null){
                	    d[i+","+j] = {'size':cell.size+1, 'cell': cell, 'ops':[op]};
                	}else{
                	    d[i+","+j] = {'size':cell.size+1, 'cell': cell};
                	}
                }
			}
		}
		return d[(m-1)+","+(n-1)];
	};
	
	proto.xrange = function(b0, b1, quantum) {
		if (!quantum) { quantum = 1; }
		if (!b1) { b1 = b0; b0 = 0; }
		out = [];
		for (var i = b0, idx = 0; i < b1; i += quantum, idx++) {
			out[idx] = i;
		}
		return out;
	};
	
	
    return ld;
});