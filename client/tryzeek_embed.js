$.fn.tryzeek = function() {
    this.prop("contenteditable", true);
    this.wrap("<div class='zeek_example'></div>")
    this.after("<button>Run</button> <pre class='zeek_result'></pre>");
    $(".zeek_example button").click(function() {
        var code = $(this).parent().find(".zeek_source").text()
        var res = $(this).parent().find(".zeek_result");
        res.text("running...");
        $.post("https://try.zeek.org/run_simple", {code: code}, function(data) {
            var out = data.files['stdout.log'];
            var err = data.files['stderr.log'];
            if(err) {
                res.text(err + "\n" + out);
            } else {
                res.text(out);
            }
        }, 'json');
    });
    return this;
};
