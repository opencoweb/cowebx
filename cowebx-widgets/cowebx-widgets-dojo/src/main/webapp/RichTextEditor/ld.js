define([], function() {
    var ld = function(args) {
		
    };
    var proto = ld.prototype;
    
    proto.permute = function(s, ops, t){
        for(var i=0; i<ops.length; i++){
            if(ops[i] == null){
                continue;
            }else if(ops[i].ty == 'insert'){
                s = s.substring(0,ops[i].pos) + ops[i].ch + s.substring(ops[i].pos,s.length);
            }else if(ops[i].ty == 'update'){
                s = s.substring(0,ops[i].pos) + ops[i].ch + s.substring(ops[i].pos+1,s.length);
            }else if(ops[i].ty == 'delete'){
                s = s.substring(0,ops[i].pos) + s.substring(ops[i].pos+1,s.length);
            }
        }
        if(t && (t != s))
            console.error("LD Error: s != t");
        return s;
    };
    
	proto.ld = function(a, b){
        // console.log('A: ',a);
        // console.log('B: ',b);
	    if(a == null){
	        var arr = [];
	        for(var i=0; i<b.length; i++)
	            arr.push({ty:'insert',ch:b[i],pos:i});
	        return arr;
	    }else if(b == null){
	        var arr = [];
	        for(var i=0; i<a.length; i++)
	            arr.push({ty:'delete',ch:null,pos:0});
	        return arr;
	    }
	    
	    //top left
	    var row_p = [{op:null,prev:null,length:0}];
	    
	    //seed first row, all inserts
	    for(var x=0; x<b.length; x++){
	        var op = {ty:'insert',ch:b[x],pos:x,cost:1};
	        var cell = {op:op,prev:row_p[x],length:row_p[x].length+op.cost};
	        row_p.push(cell);
	    }
	    
	    for(var y=0; y<a.length; y++){
	        var op = {ty:'delete',ch:null,pos:0,cost:1};
	        var row_c = [{op:op,prev:row_p[0],length:row_p[0].length+op.cost}];
	        
	        for(var x=0; x<b.length; x++){
	            var cell_o = row_p[x+1];
	            var m = cell_o.length;
	            var ty = 'delete';
	            var pos = x+1;
	            var ch = null;
	            if(row_c[x].length<m){
	                cell_o = row_c[x];
	                m = cell_o.length;
	                ty = 'insert';
	                pos = x;
	                ch = b[x];
	            }
	            if(row_p[x].length<m){
	                cell_o = row_p[x];
	                if(a[y] != b[x]){
	                    ty = 'update';
	                }else{
	                    ty = null;
	                }
	                pos = x;
	                ch = b[x];
	            }
	            if(ty == 'update'){
	                op = {ty:ty,ch:ch,pos:pos,cost:2};
	            }else{
	                op = {ty:ty,ch:ch,pos:pos,cost:1};
	            }
	            
	            row_c.push({op:op,prev:cell_o,length:cell_o.length+op.cost});
	        }
	        row_p = row_c;
	    }
	    
	    var ops = [];
	    var node = row_p[row_p.length-1];
	    while(node.prev != null){
	        if(node.op.ty != null)
	            ops.push(node.op);
	        node = node.prev;
	    }
	    ops.reverse();
	    return ops;
	};
	
	return ld;
});