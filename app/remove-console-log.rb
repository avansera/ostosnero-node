directory = "./dist/scripts"

Dir.foreach(directory) do |f|
	# If the filename is anything with  legal characters and doesnt start with a period, hyphen or underscore, continue
	if f.match(/^[a-z0-9][a-zA-Z0-9-_.]*\.js/)
		# set the filename to include the directory from root
		file_name = directory + "/" + f
		
		# add the contents of the file, after processing, to a variable 
		# this acts as a kind of temp thing
		out = File.open(file_name).read.gsub(/(console\.[log|warn]*\([\w]*\);)/, '//#{$1}')#.gsub(/\.\.\/\.\.\/api/, 'http://demoostosnero.avansera.epte.fi/api')
		
		#debugging shit
		puts "\nprocessing " + file_name
		
		#create a new file with the same name and add the cached stuff to it.
		file = File.open(file_name, "w")
		file << out
		
		puts file_name + " done"
	end
end