$.fn.trybro = function() {
    this.prop("contenteditable", true);
    this.wrap("<div class='bro_example'></div>")
    this.after("<button>Run</button> <pre class='bro_result'></pre>");
    $(".bro_example button").click(function() {
        var code = $(this).parent().find(".bro_source").text()
        var res = $(this).parent().find(".bro_result");
        res.text("running...");
        $.getJSON("http://try.bro.org/run_simple/2.3?callback=?", {code: code}, function(data) {
            var out = data.files['stdout.log'];
            var err = data.files['stderr.log'];
            if(err) {
                res.text(err + "\n" + out);
            } else {
                res.text(out);
            }
        });
    });
    return this;
};
