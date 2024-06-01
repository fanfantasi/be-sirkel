(function () {
	
	var ffmpeg = require('fluent-ffmpeg');
	function baseName(str) {
		var base = new String(str).substring(str.lastIndexOf('/') + 1); 
		if(base.lastIndexOf(".") != -1) {
			base = base.substring(0, base.lastIndexOf("."));
		}     
		return base;
	}

    var args = process.argv.slice(2);
    args.forEach(function (val, index, array) {
        var filename = val;
        var basename = baseName(filename);
        console.log(index + ': Input File ... ' + filename);
        const dirVid = './uploads/videos/';

        ffmpeg(filename)
            // Generate 480 video
            .save(dirVid + basename+'-320.mp4')
            .videoCodec('libx264')
            .size('480x?')
        
		    .save(dirVid + basename+'-720.mp4')
            .videoCodec('libx264')
            .size('720x?')

            .on('error', function(err) {
                console.log('An error occurred: ' + err.message);
            })	
            .on('progress', function(progress) { 
                console.log('... frames: ' + progress.frames);
                
            })
            .on('end', function() { 
                console.log('Finished processing'); 
                
            })
            .run();
        
    });	
    
})();