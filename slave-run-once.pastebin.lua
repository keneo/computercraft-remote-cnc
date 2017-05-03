function slave()
	local url = 'http://127.0.0.1:8080/'
		 
	server_on = http.get(url..'hello/')
	 
	if server_on == nil then
	  print('C&C master is off')
	  return
	else
	  print('C&C master ready')
	end
	
	state = ''
	while true do	  
	  src = http.post(url.."?"..tostring(state))
	  if not src then
	  	--state = 'nocmd'
	  	os.sleep(1)
	  else
	  	local cmd = src.readAll();
	  	print('cmd: '..cmd);
		state = loadstring(cmd)(state)
	    print('state: '..tostring(state));
	    --print(state);
	  end
	end
end

slave();
