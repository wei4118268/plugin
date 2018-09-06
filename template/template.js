Template = {
    render: function(tmpl, obj){
        var fn = this.format(tmpl);
        var content = fn(obj);
        return content;
    },

    format: function(tmpl){
        tmpl = tmpl.replace(/<%=(.*?)%>/g, "',$1,'")
            .replace(/<%/g, "');")
            .replace(/%>/g, "p.push('");
        var body = "var p = []; with(obj){ p.push('" + tmpl + "') } return p.join(\"\")";
        return new Function('obj', body);
    }
}
